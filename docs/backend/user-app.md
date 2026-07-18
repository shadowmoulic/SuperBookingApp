# Backend Modules - User App

The `user` application handles user profile extensions, administrative roles, and organization accounts for corporate booking systems.

---

## 1. Directory Structure

```
backend/user/
├── admin.py                # Admin register for user profiles and enterprise memberships
├── apps.py                 # App configuration
├── migrations/             # Database migration folders
├── models.py               # User_Data, Enterprise, and EnterpriseMember models
└── tests.py
```

---

## 2. Model Specifications

### 2.1 User Profile Extension (`User_Data`)
Django's default `User` model lacks custom profiles. The `User_Data` model links to the Django User via a `OneToOneField` to add additional columns:
- **`user`**: Reference to the parent Django `User` object.
- **`mobile`**: User phone contact number.
- **`role`**: Character field setting permissions. Roles include:
  - `customer`: Default role for standard visitors booking tickets.
  - `official`: Gate staff or monument officers validating scanned ticket QR codes.
  - `provider`: Organization admins managing their monument catalogs.
  - `admin`: Superusers with system administration privileges.
  - `enterprise_admin` / `enterprise_member`: Corporate booking user accounts.

### 2.2 Corporate Settings (`Enterprise` & `EnterpriseMember`)
- **`Enterprise`**: Stores details of registered organizations (Billing Address, domain codes, website URLs, and unique public IDs).
- **`EnterpriseMember`**: Associates a `User_Data` profile with an `Enterprise` instance. Defines membership permissions (admin or regular member) and tracks the date they joined.
- **Domain Verification Constraint**: Built-in verification logic ensures that users who link their accounts to a corporate enterprise must match the enterprise's registered domain (e.g. `user@google.com` matches `google.com`).
