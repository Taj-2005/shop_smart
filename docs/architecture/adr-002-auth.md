# ADR-002: Authentication using JWT with httpOnly cookies

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-03-29 |
| **Deciders** | Team (ShopSmart) |
| **Technical area** | Authentication, security, API–client integration |

---

## Context

ShopSmart must authenticate **customers**, **admins**, and **super-admins** for a **browser-based** Next.js client talking to a **separate-origin** Express API. The team needed a transport for **access** and **refresh** tokens that balances security, implementation cost, and coursework clarity.

Common options:

- Store JWTs in **`localStorage` or `sessionStorage`** and send them in an `Authorization` header.
- Store JWTs in **`httpOnly` cookies** set by the API on login/refresh and sent automatically by the browser on same-site or credentialed cross-site requests.

The existing implementation follows the **cookie-based** approach: short-lived **access** token and longer-lived **refresh** token, with refresh handled via a dedicated endpoint and client retry logic on **401**.

---

## Decision

Use **JWTs delivered and renewed via `httpOnly`, `Secure` (in production), and appropriately scoped `SameSite` cookies**, set by the **server** on login and refresh. The client does **not** read token values from JavaScript; it relies on **`credentials: "include"`** (fetch) or **`withCredentials: true`** (Axios) so cookies attach to API requests.

**Out of scope for this ADR (but implied):** token signing secrets, TTLs, refresh rotation details, and CORS `FRONTEND_URL`—documented in env/README and code comments.

---

## Why cookies instead of localStorage?

| Concern | `httpOnly` cookies | `localStorage` / `sessionStorage` |
|--------|-------------------|-------------------------------------|
| **XSS** | Token **not readable** by JS if `httpOnly` is set; attacker script cannot exfiltrate the token string as easily | Any script on the page can **read** the token and send it elsewhere |
| **Transmission** | Browser sends cookies on matching requests when credentials are enabled; server reads `req.cookies` | App code must manually attach `Authorization` on every call—easy to miss on one client |
| **Logout** | Server can **clear** cookies and revoke refresh server-side | Must clear storage in JS; stolen token in storage may still be valid until expiry |
| **Phishing / exfil** | Still vulnerable if attacker controls JS, but **stealing the cookie string from JS is blocked** by `httpOnly` | Stolen token is trivial to copy from devtools or malicious script |

**Summary:** For a classic SPA + API setup, **`httpOnly` cookies reduce the impact of cross-site scripting** on token theft compared to storing the same JWT in `localStorage`. ShopSmart therefore **does not** expose access/refresh tokens in API JSON bodies for normal browser flows.

---

## Security benefits

1. **Mitigates XSS token theft** — Malicious injected script cannot call `localStorage.getItem('token')` because the token is not in the DOM storage API.
2. **Server-controlled lifecycle** — Expiry, refresh, and revocation are enforced where secrets live; client only reacts to HTTP outcomes (e.g. 401 → refresh).
3. **Alignment with browser model** — Cookies are the native mechanism for **session-like** credentials on credentialed requests.
4. **Clear separation** — Public JSON responses can return **user profile** without embedding secrets.

*Note:* Cookies do **not** remove the need for **CSRF** awareness for **state-changing** cookie-auth from untrusted origins; ShopSmart’s API is primarily consumed by a **known frontend origin** with **CORS + credentials** locked to `FRONTEND_URL`. Additional CSRF tokens or `SameSite` tuning may be documented in hardening passes.

---

## Alternatives

### 1. Bearer token in `Authorization` from localStorage

- **Pros:** Simple mental model for mobile/third-party clients; no cookie `SameSite` complexity.
- **Cons:** **High XSS impact** if any script runs in the app; every client must attach headers consistently.
- **Outcome:** Rejected for **first-party browser** auth in ShopSmart.

### 2. Session ID in httpOnly cookie + server-side session store

- **Pros:** Revocation and server-side invalidation are straightforward; no JWT in cookie.
- **Cons:** Requires **session store** (Redis, DB) and stickiness/scaling decisions; more moving parts for a student-scale deployment.
- **Outcome:** Not chosen; **JWT + refresh in DB** (hashed refresh tokens) matches current Prisma model.

### 3. BFF (Backend-for-Frontend) proxying cookies only on same origin

- **Pros:** Browser sees **same-origin** API; cookie `SameSite` can be stricter.
- **Cons:** Extra service or Next route complexity; not required for current cross-origin setup with strict CORS.
- **Outcome:** Deferred unless deployment topology changes.

---

## Consequences

### Positive

- **Defense in depth** against **XSS stealing bearer tokens** from storage.
- **Consistent** attachment of credentials for same-user API calls when `credentials` are enabled.
- **Teachable** alignment with OWASP-style guidance to avoid sensitive tokens in `localStorage` for web apps.

### Trade-offs

| Trade-off | Detail |
|-----------|--------|
| **Cross-origin cookies** | Frontend and API on different origins require **`SameSite=None; Secure`** in production and **exact** CORS origin + `credentials: true`. Misconfiguration breaks login or refresh. |
| **No JS access to token** | Debugging is slightly harder (cannot log the JWT from the client); use server logs and network tab **without** relying on reading cookie values in JS. |
| **Mobile / native clients** | Cookie-first design is **browser-oriented**; native apps often use header-based tokens—would need a parallel auth path if added later. |
| **CSRF** | Cookie auth to a **state-changing** API from a random site is a class of issues; mitigated by **strict CORS**, **SameSite**, and same-site deployment options—not “free” security. |

### Follow-up

- Document **production cookie flags** and **CORS checklist** in deployment docs if not already centralized.
- Consider ADR or appendix on **refresh token rotation** and **logout** behavior for auditors.

---

## References

- ADR-001: [Monorepo](./adr-001-monorepo.md)
- Server: `server/src/modules/auth/`, middleware reading `req.cookies`
- Client: `client/api/axios.ts`, `client/lib/api.ts` (`credentials: "include"`)
