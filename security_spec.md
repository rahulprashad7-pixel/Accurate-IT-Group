# Security Specification & Threat Model

## 1. Data Invariants
- **Company Integrity**: Companies can only be created or modified by Super Admins. Company codes must be one of `AGIPL`, `ASSPL`, or `ONYX`.
- **Role Invariant**: Users cannot elevate their own role to `SUPER_ADMIN` or modify their company assignment without authorized admin privileges.
- **Asset Invariant**: An asset must belong to one of the authorized company codes (`AGIPL`, `ASSPL`, `ONYX`), have a unique assetTag, and cannot have unbound memory or malicious payloads.
- **Ticket Invariant**: A ticket must be tied to a companyCode and requester. Status progression and resolution fields are restricted. Employees can only create tickets and update their own feedback/satisfaction. IT staff and Admins can update status, assignees, and resolution notes.
- **Audit Logs**: Immutable once created.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Self-Escalation Attack**: An Employee user trying to write `{ role: "SUPER_ADMIN" }` into `/users/{uid}`.
2. **Cross-Company Asset Injection**: An unauthorized user injecting assets into another company without valid authentication.
3. **Ghost Field Poisoning**: Inserting `{ isVerified: true, backdoor: true, __proto__: 1 }` into `/assets/` or `/tickets/`.
4. **Denial-of-Wallet Long String**: Injecting a 2MB string into `description` or `specifications`.
5. **Path ID Traversal / Junk Character**: Attempting to write document with path ID `../../secret` or containing non-alphanumeric special characters.
6. **Ticket State Skip / Outcome Forgery**: An unauthorized regular employee marking a ticket as `RESOLVED` with forged `closedAt` without IT staff/admin role.
7. **Asset Deletion By Unauthorized User**: Regular employee attempting to call `delete` on an `/assets/{assetId}` document.
8. **Impersonated Requester ID**: Submitting a ticket where `requesterId` does not match `request.auth.uid`.
9. **Blanket Query Scraping**: Attempting an unrestricted `get` or list dump of private users without proper role credentials.
10. **Tampered Creation Timestamp**: Overriding `createdAt` with arbitrary past or future dates instead of valid string or system time.
11. **Negative or Overflow Purchase Cost**: Injecting negative or NaN values for asset `purchaseCost`.
12. **Unauthenticated Public Write**: Anonymous write attempt to `/companies/{companyId}` or `/activity_logs/{logId}` without login.
