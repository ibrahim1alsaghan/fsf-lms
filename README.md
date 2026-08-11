# Custom LMS Application for Frappe/ERPNext

This repository contains the source code for the **Custom LMS App**, which extends [Frappe](https://frappeframework.com/) and [ERPNext](https://github.com/frappe/erpnext) with custom functionality and a modern Vue frontend. This guide provides full setup instructions for development and deployment.

---

## 🧭 Table of Contents

- [System Requirements](#️system-requirements)
- [System Setup](#system-setup)
- [Frappe + ERPNext + LMS Setup](#frappe--erpnext)
- [Frontend Development](#frontend-development)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ⚙️ System Requirements

- Ubuntu 20.04 / 22.04
- 2+ vCPUs
- 4 GB RAM (8 GB recommended)
- Node.js 18
- Python 3.10+
- MySQL (MariaDB)
- Frappe 15.61.0
---

## 🛠️ System Setup

### Step 1: Update & Timezone

```bash
sudo apt update -y && sudo apt upgrade -y
sudo timedatectl set-timezone Asia/Riyadh
```

### Step 2: Install System Dependencies

```bash
sudo apt install -y git build-essential libffi-dev libssl-dev python3 python3-setuptools \
python3-venv python3-dev python3-pip wkhtmltopdf supervisor \
fontconfig libxrender1 libxext6 libfreetype6 libx11-6 xfonts-75dpi xfonts-base \
zlib1g libfontconfig xvfb redis-server nginx mariadb-server mariadb-client libmysqlclient-dev
```

### Step 3: Node.js & Yarn (via NVM)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
npm install -g yarn
```

### Step 4: Configure MariaDB (UTF-8 Setup)

```bash
sudo tee /etc/mysql/mariadb.conf.d/50-server.cnf > /dev/null <<EOF
[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
EOF

sudo systemctl restart mariadb
```

> 🔐 (Optional) Secure MySQL:

```bash
sudo mysql -u root <<MYSQL_SCRIPT
DELETE FROM mysql.user WHERE User='';
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
UPDATE mysql.user SET plugin='mysql_native_password', authentication_string=PASSWORD('${MYSQL_PASS}') WHERE User='root';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
```

---

## 🧱 Frappe + ERPNext + LMS Setup

> ⚠️ Run the following as your current user

### Step 1: Install Frappe Bench

```bash
pip3 install frappe-bench
```

### Step 2: Create Frappe Bench

```bash
bench init --frappe-branch version-15 frappe-bench
cd frappe-bench
```

### Step 3: Create New Site

```bash
bench new-site fsf.local
bench --site fsf.local add-to-hosts
```

### Step 4: Get and Install ERPNext

```bash
bench get-app --branch version-15 erpnext https://github.com/frappe/erpnext
bench --site fsf.local install-app erpnext
```

### Step 5: Get and Install LMS

```bash
bench get-app --branch fsf-app https://{{ username }}:code.tamkeen.cloud/tamkeen-technologies/erp/fsf-lms.git
bench --site fsf.local install-app lms
```

---

## 🎨 Frontend Development

The Vue-based frontend lives at:

```
apps/custom_fsf/frontend/
```

### Run the Dev Server:

```bash
cd apps/custom_fsf/frontend
yarn install
yarn add frappe-ui
npm run dev
```

---

## ✅ Common Tasks

| Task                      | Command                                    |
|---------------------------|---------------------------------------------|
| Start development server  | `bench start`                               |
| Build frontend assets     | `npm run build` (inside `frontend/`)        |
| Apply DB migrations       | `bench --site fsf.local migrate`            |
| Create admin user         | `bench --site fsf.local set-admin-password` |
| Visit app in browser      | http://fsf.local:8000                       |

---

## 🧩 Troubleshooting

- **Database errors?** Ensure MariaDB is configured with `utf8mb4`.
- **Frontend not loading?** Make sure `npm run dev` is active in the frontend.
- **Module resolution issues (Vue)?** Confirm `frappe-ui` and Vite setup are clean.

---