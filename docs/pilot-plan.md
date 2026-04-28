# Pilot Plan

## Phase 1: Internal Testing
- **Goal:** Validate basic RAG capability and document ingestion.
- **Users:** Internal development team.
- **Actions:** Upload sample dummy banking policies, test query accuracy, refine chunking strategy (e.g., overlapping).

## Phase 2: Limited Bank Admin Trial
- **Goal:** Validate UI/UX and RBAC logic.
- **Users:** 1-2 designated "Bank Admins".
- **Actions:** Provide access to the Dashboard. Have admins create dummy users, upload test documents, and verify that isolation holds.

## Phase 3: Staff Mock Scenarios
- **Goal:** Evaluate the AI's response quality and safety guardrails.
- **Users:** Select group of staff members acting as end-users.
- **Actions:** Run simulated loan or policy queries. Monitor the `AuditLog` to ensure all actions are captured. Evaluate the LLM's adherence to "I don't know" rules.

## Phase 4: Production Go-Live
- **Goal:** Full deployment.
- **Actions:** Transition to production infrastructure, final security audit, clear all mock data, and begin live document ingestion.
