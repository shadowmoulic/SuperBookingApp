# SuperBookingApp

A modern booking platform built with Django REST Framework and React, with Razorpay payments and Firebase authentication.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Running the Application](#running-the-application)
4. [Deployment](#deployment)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)

## Quick Start

**For Development:**
```bash
# Backend
cd backend
python manage.py migrate --settings=backend.settings.dev
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

**For Deployment:**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete production deployment instructions.

## Development Setup

### Prerequisites

Ensure you have the following installed on your system:

- Python 3.10 or higher
- Node.js 18.x or higher
- Git
- PostgreSQL (for testing production settings locally)

### Backend Setup

1. **Create Python Virtual Environment:**

```bash
python -m venv env
```

2. **Activate Virtual Environment:**

- Windows:
```bash
.\env\Scripts\activate
```

- macOS/Linux:
```bash
source env/bin/activate
```

3. **Install Dependencies:**

```bash
cd backend
pip install -r requirements.txt
```

4. **Set Up Environment Variables:**

```bash
# Copy template
cp .env.example .env

# Edit .env with your values:
# - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
# - FIREBASE_CREDENTIALS_PATH
```

5. **Run Migrations:**

```bash
python manage.py migrate --settings=backend.settings.dev
```

6. **Create Superuser (Admin):**

```bash
python manage.py createsuperuser --settings=backend.settings.dev
```

### Frontend Setup

1. **Install Dependencies:**

```bash
cd frontend
npm install
```

2. **Set Up Environment Variables:**

```bash
# Copy template
cp .env.example .env

# Edit .env with your values:
# - VITE_API_URL=http://localhost:8000
# - VITE_FIREBASE_* (from Firebase Console)
```

3. **Verify Configuration:**

```bash
npm run dev  # Opens http://localhost:5173
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver --settings=backend.settings.dev
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Mode (Local Testing)

Test production settings locally before deploying:

```bash
# Backend with production settings
export DJANGO_SETTINGS_MODULE=backend.settings.prod
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn backend.wsgi:application --bind 0.0.0.0:8000

# Frontend build
cd frontend
npm run build  # Creates dist/ folder
```

## Deployment

Complete deployment instructions are in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

**Quick Deploy Summary:**
- **Frontend:** Vercel (auto-deploys from GitHub)
- **Backend:** Render (auto-deploys from GitHub)
- **Database:** PostgreSQL (Render free tier)
- **Domain:** GoDaddy (point DNS to Vercel + Render)

**Deployment Branches:**
- `main` → Production (Vercel + Render)
- `develop` → Staging (Vercel Preview + Render)

**See Also:**
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
