# ISWCDN Institutional Website

Official institutional portal and administrative management system for the **Institute of Social Welfare and Community Development of Nigeria (ISWCDN)**.

## 🏛️ System Overview

The ISWCDN platform serves as the official national digital presence for the Institute, providing comprehensive information about professional certifications, membership cadres, and institutional leadership while managing student admissions, membership applications, photo galleries, and public communications.

---

## 🏗️ Architecture

```
         [ Public Users & Institute Members ]        [ Institutional Administrators ]
                           │                                         │
                           ▼                                         ▼
           Public Institutional Portal                     Secure Admin Portal
      (Home, About, Courses, Memberships, Forms)            (/admin/* Protected Layout)
                           │                                         │
                           └───────────────────┬─────────────────────┘
                                               │
                                               ▼
                                    Vite 7 + React 18 SPA
                        (Wouter Client Routing + Tailwind CSS v4)
                                               │
                                               ▼  (HTTPS / REST)
                           DirectAdmin Server (8GB RAM / Linux)
                   ┌──────────────────────────────────────────────────┐
                   │ • Apache / Nginx Web Server (mod_rewrite)        │
                   │ • PHP 8.3 REST API Front Controller (api/)       │
                   │ • Native JWT & Secure HttpOnly Auth Middleware   │
                   │ • MySQL 8 Database (10 Normalized Tables)        │
                   │ • Native Media Storage (/uploads/team, gallery)  │
                   └──────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend Client
- **Framework**: React 18.3, TypeScript 5.6, Vite 7.3
- **Routing**: Wouter (Lightweight client-side router)
- **Styling**: Tailwind CSS v4 with custom Institutional Theme (*Nigeria Green* `#008751`, Playfair Display serif, Inter sans)
- **Component Primitives**: Radix UI, Lucide Icons, Framer Motion, Recharts
- **Forms**: React Hook Form with Zod schema validation
- **HTTP Client**: `src/lib/api.ts` (custom fetch wrapper supporting Bearer tokens & HttpOnly credentials)

### Backend API (`api/`)
- **Runtime**: PHP 8.2+ / 8.3 (Zero-framework, high-speed modular architecture)
- **Database Engine**: MySQL 8.0+ / MariaDB 10.5+ via PDO with prepared statements and UTF-8mb4
- **Security & Auth**: Stateless HMAC-SHA256 JWT tokens with HttpOnly secure cookie and Bearer fallback
- **File Uploads**: Native MIME-validated image handler (`/api/uploads/team`, `/api/uploads/gallery`)
- **Hosting Target**: DirectAdmin Linux Server (8GB RAM)

---

## 📂 Database Schema Entities (`api/schema.sql`)

1. `admin_users`: Administrator credentials and roles.
2. `members`: Registered social work practitioners and cadres.
3. `courses`: Academic catalog (Diploma, Certificate, Advanced, Short Courses).
4. `applications`: Admission applications and professional membership submissions.
5. `team`: Governing Council and Secretariat leadership profiles with photos.
6. `gallery`: Institutional events, conference photos, and album categories.
7. `messages`: Public contact inquiries and response tracking.
8. `settings`: Singleton store for contact numbers, official emails, and secretariat address.
9. `subscribers`: Public newsletter opt-in registry.
10. `broadcasts`: Administrative newsletter dispatch archive.

---

## 🚀 DirectAdmin Deployment Guide

The deployment zip archive is pre-built and waiting on your Desktop:
📁 `~/Desktop/iswcdn_api_production.zip`
📁 `~/Desktop/extract.php`

### Step 1: Database Setup in DirectAdmin
1. Log in to DirectAdmin and open **MySQL Management**.
2. Click **Create New Database**:
   - Database Name: `iswcdn_db`
   - Database User: `iswcdn_user`
   - Database Password: *(save securely)*
3. Open **phpMyAdmin**, select `iswcdn_db`, and go to the **Import** tab:
   - Import `api/schema.sql`
   - Import `api/seed.sql`

### Step 2: Upload API Files
1. Open DirectAdmin **File Manager** and navigate to your API domain root (e.g. `public_html/api` or `domains/api.iswcdn.org.ng/public_html`).
2. Upload `iswcdn_api_production.zip` and `extract.php`.
3. In your browser, visit `https://api.iswcdn.org.ng/extract.php` (or use DirectAdmin's built-in "Extract" feature).
4. Edit the newly created `.env` file with your MySQL credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_NAME=iswcdn_db
   DB_USER=iswcdn_user
   DB_PASS=YourDatabasePassword
   JWT_SECRET=generate_a_random_64_character_hex_key
   ```
5. Delete `extract.php` and `iswcdn_api_production.zip` from your server.

### Step 3: Frontend Deployment
1. Set the production API URL in your build environment:
   ```env
   VITE_API_URL=https://api.iswcdn.org.ng
   ```
2. Build the static bundle:
   ```bash
   npm run build
   ```
3. Deploy the resulting `/dist` folder to your main domain web root (`public_html`).

---

## 🔑 Default Credentials (from `api/seed.sql`)

- **Admin Login**: `https://iswcdn.org.ng/admin/login`
- **Email**: `admin@iswcdn.org.ng`
- **Password**: `admin123456` *(Change immediately upon first login)*

---
© 2026 Institute of Social Welfare and Community Development of Nigeria (ISWCDN).
