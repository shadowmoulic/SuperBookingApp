# RFC-[Number]: [Title of Proposal]

* **Author**: [Name / Team]
* **Date**: [YYYY-MM-DD]
* **Status**: [Proposed / Discussion / Approved / Rejected]

---

## 1. Summary
A brief, high-level summary of the proposed feature, architectural change, or optimization.

---

## 2. Motivation
Explain why we should build this feature or make this change:
- What user problem or developer pain point are we solving?
- What are the business and operational incentives?
- Provide supporting metrics or logs if available.

---

## 3. Detailed Technical Design
Explain the technical implementation in detail:
- **Architecture**: How does it integrate with existing apps (e.g. content, booking, user)?
- **Database Schema**: New tables, field configurations, constraints, and migrations.
- **REST Endpoints**: HTTP methods, payload schemas, and response formats.
- **Frontend Changes**: Page UI adjustments, React state management, components additions.

---

## 4. Drawbacks & Trade-offs
Identify potential negative impacts of this design:
- Will it increase API response latency?
- Does it add maintenance complexity?
- Does it increase hosting costs?

---

## 5. Alternatives Considered
Describe other paths that were evaluated:
- Why were they rejected?
- What are their pros and cons relative to the proposed design?

---

## 6. Unresolved Questions
List open issues or questions that require discussions or stakeholder feedback before starting implementation.
- *e.g., Should we support offline gate scans for QR validations?*