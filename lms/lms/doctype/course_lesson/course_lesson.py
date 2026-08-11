# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils.telemetry import capture
from lms.lms.utils import get_course_progress
from ...md import find_macros
import json


class CourseLesson(Document):
	def after_insert(self):
		"""Automatically create Lesson Reference entry in the chapter's lessons table."""
		if self.chapter:
			# Check if Lesson Reference already exists
			existing_ref = frappe.db.exists(
				"Lesson Reference",
				{"parent": self.chapter, "lesson": self.name}
			)
			if not existing_ref:
				# Get the max idx from existing lessons to append at the end
				max_idx_result = frappe.db.sql(
					"SELECT MAX(idx) as max_idx FROM `tabLesson Reference` WHERE parent = %s",
					(self.chapter,),
					as_dict=True
				)
				max_idx = (max_idx_result[0].get("max_idx") or 0) if max_idx_result else 0
				
				lesson_ref = frappe.new_doc("Lesson Reference")
				lesson_ref.update({
					"lesson": self.name,
					"parent": self.chapter,
					"parenttype": "Course Chapter",
					"parentfield": "lessons",
					"idx": max_idx + 1
				})
				lesson_ref.insert(ignore_permissions=True)

		# Update course statistics after adding new lesson (lazy import to avoid circular dependency)
		from lms.lms.api import update_course_statistics
		update_course_statistics()

	def validate(self):
		# self.check_and_create_folder()
		self.validate_quiz_id()
		self.validate_duplicate_lesson()
	
	def validate_duplicate_lesson(self):
		"""Prevent creating duplicate lessons with the same title in the same chapter."""
		if not self.title or not self.chapter:
			return
		
		# Check if another lesson with the same title exists in this chapter
		existing_lesson = frappe.db.exists(
			"Course Lesson",
			{
				"title": self.title,
				"chapter": self.chapter,
				"name": ["!=", self.name]  # Exclude current lesson if editing
			}
		)
		
		if existing_lesson:
			chapter_title = frappe.db.get_value("Course Chapter", self.chapter, "title")
			frappe.throw(
				_(
					"Lesson '{0}' already exists in chapter '{1}'. "
					"Please use a different title or edit the existing lesson."
				).format(
					self.title,
					chapter_title or self.chapter
				)
			)

	def validate_quiz_id(self):
		if self.quiz_id and not frappe.db.exists("LMS Quiz", self.quiz_id):
			frappe.throw(_("Invalid Quiz ID"))

	def on_update(self):
		dynamic_documents = ["Exercise", "Quiz"]
		for section in dynamic_documents:
			self.update_lesson_name_in_document(section)

	def update_lesson_name_in_document(self, section):
		doctype_map = {"Exercise": "LMS Exercise", "Quiz": "LMS Quiz"}
		macros = find_macros(self.body)
		documents = [value for name, value in macros if name == section]
		index = 1
		for name in documents:
			e = frappe.get_doc(doctype_map[section], name)
			e.lesson = self.name
			e.index_ = index
			e.course = self.course
			e.save(ignore_permissions=True)
			index += 1
		self.update_orphan_documents(doctype_map[section], documents)

	def update_orphan_documents(self, doctype, documents):
		"""Updates the documents that were previously part of this lesson,
		but not any more.
		"""
		linked_documents = {
			row["name"] for row in frappe.get_all(doctype, {"lesson": self.name})
		}
		active_documents = set(documents)
		orphan_documents = linked_documents - active_documents
		for name in orphan_documents:
			ex = frappe.get_doc(doctype, name)
			ex.lesson = None
			ex.course = None
			ex.index_ = 0
			ex.save(ignore_permissions=True)

	def check_and_create_folder(self):
		args = {
			"doctype": "File",
			"is_folder": True,
			"file_name": f"{self.name} {self.course}",
		}
		if not frappe.db.exists(args):
			folder = frappe.get_doc(args)
			folder.save(ignore_permissions=True)

	def get_exercises(self):
		if not self.body:
			return []

		macros = find_macros(self.body)
		exercises = [value for name, value in macros if name == "Exercise"]
		return [frappe.get_doc("LMS Exercise", name) for name in exercises]


@frappe.whitelist()
def save_progress(lesson, course):
	membership = frappe.db.exists(
		"LMS Enrollment", {"course": course, "member": frappe.session.user}
	)
	if not membership:
		return 0

	frappe.db.set_value("LMS Enrollment", membership, "current_lesson", lesson)
	already_completed = frappe.db.exists(
		"LMS Course Progress", {"lesson": lesson, "member": frappe.session.user}
	)

	quiz_completed = get_quiz_progress(lesson)
	assignment_completed = get_assignment_progress(lesson)

	if not already_completed and quiz_completed and assignment_completed:
		frappe.get_doc(
			{
				"doctype": "LMS Course Progress",
				"lesson": lesson,
				"status": "Complete",
				"member": frappe.session.user,
			}
		).save(ignore_permissions=True)

	progress = get_course_progress(course)
	capture_progress_for_analytics(progress, course)

	# Had to get doc, as on_change doesn't trigger when you use set_value. The trigger is necesary for badge to get assigned.
	enrollment = frappe.get_doc("LMS Enrollment", membership)
	enrollment.progress = progress
	enrollment.save()
	enrollment.run_method("on_change")

	return progress


def capture_progress_for_analytics(progress, course):
	if progress in [25, 50, 75, 100]:
		capture("course_progress", "lms", properties={"course": course, "progress": progress})


def get_quiz_progress(lesson):
	lesson_details = frappe.db.get_value(
		"Course Lesson", lesson, ["body", "content"], as_dict=1
	)
	quizzes = []

	if lesson_details.content:
		content = json.loads(lesson_details.content)

		for block in content.get("blocks"):
			if block.get("type") == "quiz":
				quizzes.append(block.get("data").get("quiz"))

	elif lesson_details.body:
		macros = find_macros(lesson_details.body)
		quizzes = [value for name, value in macros if name == "Quiz"]

	for quiz in quizzes:
		passing_percentage = frappe.db.get_value("LMS Quiz", quiz, "passing_percentage")
		if not frappe.db.exists(
			"LMS Quiz Submission",
			{
				"quiz": quiz,
				"member": frappe.session.user,
				"percentage": [">=", passing_percentage],
			},
		):
			return False
	return True


def get_assignment_progress(lesson):
	lesson_details = frappe.db.get_value(
		"Course Lesson", lesson, ["body", "content"], as_dict=1
	)
	assignments = []

	if lesson_details.content:
		content = json.loads(lesson_details.content)

		for block in content.get("blocks"):
			if block.get("type") == "assignment":
				assignments.append(block.get("data").get("assignment"))

	elif lesson_details.body:
		macros = find_macros(lesson_details.body)
		assignments = [value for name, value in macros if name == "Assignment"]

	for assignment in assignments:
		if not frappe.db.exists(
			"LMS Assignment Submission",
			{"assignment": assignment, "member": frappe.session.user},
		):
			return False
	return True


@frappe.whitelist()
def get_lesson_info(chapter):
	return frappe.db.get_value("Course Chapter", chapter, "course")
