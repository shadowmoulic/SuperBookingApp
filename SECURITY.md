# Security Policy

## 1. Supported Versions
Since SuperBookingApp is a closed-source, proprietary project, only the latest deployed version is actively supported. Security updates and hotfixes are rolled out directly to our production environments.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## 2. Reporting a Vulnerability
As an internal project, we expect all team members, contractors, and partners to practice responsible disclosure. 

- **Do NOT open public issues/tickets:** If you find a security vulnerability, do not create a public issue, pull request, or ticket detailing it.
- **Reporting Method:** Email the internal security team directly at [Email ID](mailto:arnabdas.9039@gmail.com) or contact engineering leadership immediately.
- **Details to Include:** Provide a clear description of the vulnerability, steps to reproduce it, and any potential impact or proof of concept.

## 3. Secret Management
- **Local Credentials:** Never commit credentials, tokens, passwords, or SSH keys to git. Ensure your local `.env` files are in the `.gitignore`.
- **Production Secrets:** Secrets are managed via our central vault system and injected at runtime.
- **Credential Leakage:** If you accidentally commit a secret, notify the DevOps/Security team immediately so the credential can be revoked and rotated.