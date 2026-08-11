# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from lms.lms.utils import get_course_progress


class CourseChapter(Document):
	def after_insert(self):
		"""Automatically create Chapter Reference entry in the course's chapters table."""
		if self.course:
			# Check if Chapter Reference already exists
			existing_ref = frappe.db.exists(
				"Chapter Reference",
				{"parent": self.course, "chapter": self.name}
			)
			if not existing_ref:
				# Get the max idx from existing chapters to append at the end
				max_idx_result = frappe.db.sql(
					"SELECT MAX(idx) as max_idx FROM `tabChapter Reference` WHERE parent = %s",
					(self.course,),
					as_dict=True
				)
				max_idx = (max_idx_result[0].get("max_idx") or 0) if max_idx_result else 0
				
				chapter_ref = frappe.new_doc("Chapter Reference")
				chapter_ref.update({
					"chapter": self.name,
					"parent": self.course,
					"parenttype": "LMS Course",
					"parentfield": "chapters",
					"idx": max_idx + 1
				})
				chapter_ref.insert(ignore_permissions=True)

		# Update course statistics after adding new chapter (lazy import to avoid circular dependency)
		from lms.lms.api import update_course_statistics
		update_course_statistics()

	def on_update(self):
		self.recalculate_course_progress()
		from lms.lms.api import update_course_statistics
		update_course_statistics()

	def recalculate_course_progress(self):
		previous_lessons = (
			self.get_doc_before_save() and self.get_doc_before_save().as_dict().lessons
		)
		current_lessons = self.lessons

		if previous_lessons and previous_lessons != current_lessons:
			enrolled_members = frappe.get_all(
				"LMS Enrollment", {"course": self.course}, ["member", "name"]
			)
			for enrollment in enrolled_members:
				new_progress = get_course_progress(self.course, enrollment.member)
				frappe.db.set_value("LMS Enrollment", enrollment.name, "progress", new_progress)
