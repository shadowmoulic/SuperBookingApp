# Contributing Guidelines

Welcome to the SuperBookingApp development team! Since this is a proprietary, closed-source project, contribution is restricted to authorized employees, contractors, and partners. 

## 1. Getting Started
Before making changes, ensure you have:
- Access to the internal issue tracker (e.g., Jira, GitHub Issues).
- Cloned the repository and set up the local development environments for both `frontend` and `backend`.
- Checked out the project documentation in the `docs/` folder to align on architecture and database schemas.

## 2. Branching Strategy
We follow a variation of **GitHub Flow**:
- Always create a new branch from `main` for your work.
- Use a descriptive branch naming convention:
  - Feature branch: `feature/ticket-ID-short-description` (e.g., `feature/SBA-101-user-login`)
  - Bugfix branch: `bugfix/ticket-ID-short-description` (e.g., `bugfix/SBA-202-fix-booking-overlap`)
  - Hotfix branch: `hotfix/ticket-ID-short-description` (e.g., `hotfix/SBA-303-api-crash`)

## 3. Development Workflow
1. **Pull Latest Changes:** Keep your local `main` branch updated and rebase your working branch regularly.
2. **Implement Changes:** Follow our established architectural guidelines.
3. **Commit Messages:** Use semantic, descriptive commit messages:
   - Example: `feat(api): add booking creation endpoint (SBA-101)`
   - Example: `fix(frontend): resolve memory leak on dashboard page`
4. **Testing:** Write unit/integration tests for any new features or bug fixes. Run existing tests before pushing code.
5. **Linting & Formatting:** Ensure your code matches the workspace styles. Run standard formatters/linters before committing.

## 4. Submitting Pull Requests
- Push your branch to the origin repository.
- Open a Pull Request (PR) against `main`.
- Fill out the PR template completely, referencing the corresponding issue/ticket.
- Request review from at least one peer developer.
- Ensure all CI/CD pipelines (build, test, lint) pass successfully before merging.

## 5. Security & Credentials
- **NEVER** commit secrets, passwords, API keys, or private configuration files to the repository.
- Use environment variables (`.env` files or system environment variables) for local secrets, and secure vault systems in staging/production.