# Pull Request Template & Guidelines - ZeQue

Use this document as a guide and template when submitting Pull Requests (PRs) to the repository.

---

## 📋 Pull Request Template

```markdown
## 🎯 Description of Changes
Briefly describe what changed, highlighting major edits, class additions, or endpoint configurations.

## ❓ Rationale & Context
- Why is this change necessary?
- Does it link to an open issue or a task document (e.g., [Tasks.md](../agent-tasks/Tasks.md))?

## 🗄️ Database & Schema Changes
- [ ] No database changes
- [ ] Schema changes introduced (Describe new models, columns, unique constraints, or indexes below)

## 📦 Migrations
- [ ] No migrations required
- [ ] Migrations created (List new files under `migrations/` directory)
*Note: Ensure migrations are fully non-interactive for smooth CI/CD parsing.*

## ⚠️ Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes introduced (Detail changes below and provide backward-compatibility strategies)

## 🧪 Testing & Verification
### Automated Tests
- Command executed: [e.g. python manage.py test]
- Outcome: [Pass/Fail]

### Manual Verification
Describe manual testing scenarios (e.g. "Simulated mobile payment and confirmed QR ticket generation on local Vite browser").
```

---

## ⚙️ Pull Request Checklist

Before submitting a PR for review, ensure the following checklist is completed:
1. **Migrations**: All model changes are backed by auto-generated migration files.
2. **Linting & Formatting**: Codes comply with lint checks (`Black` on backend, `ESLint` on frontend).
3. **Environment Sync**: Any new configuration variables have been added to backend `.env.example` and frontend `.env.example`.
4. **Links Validation**: Double check that all markdown links inside the documentation folder use absolute file schemes (`file:///`) and resolve properly.