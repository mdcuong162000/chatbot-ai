# 🛡️ SECURITY & SYSTEM SAFETY RULES

> Mandatory application for all lines of code written in the entire project to counter the 10 most dangerous vulnerabilities (OWASP Top 10). Every Developer must pass this technical boundary.

## 1. Input Authentication & Authorization (Input Validation)
- All API Endpoints and Form Submits **MUST** be validated through a blocker Schema (Example: `Zod`, `Yup`).
- Forbid trusting user data (Client-side validation means nothing for security). Validation must always exist on Server-side.
- Absolutely block **SQL Injection** / **NoSQL Injection**: Always always use `Prepared Statements`, parameterize queries or ORM. Never string concatenate for DB query logic.

## 2. Display Security (XSS / CSRF)
- **Cross-Site Scripting (XSS):** When rendering HTML from user input, absolutely must escape/sanitize data (Use xss, dompurify libs). In React, ABSOLUTELY LIMIT AND STRICTLY CENSOR `dangerouslySetInnerHTML`.
- **Cross-Site Request Forgery (CSRF):** For all state-changing forms, must use CSRF tokens or check SameSite cookies, Header `Origin`/`Referer`.

## 3. Data & Password Protection
- Passwords must be Hashed using industry standard algorithms (Bcrypt, Argon2) accompanied by Salt. Never create Hash manually using SHA-256 or MD5.
- Tokens (JWT, API Keys) absolutely must not be printed via `console.log()` or returned in unrelated APIs.
- **Environment Variables (.env):** In frontend (React/NextJS), do not use public prefix (`NEXT_PUBLIC_`) for any secret API Key that risks being charged or exploited. Must be called through the internal API of the NextJS server itself (Route Handlers).

## 4. Authorization Control & Limitation
- IDOR Vulnerability (Insecure Direct Object Reference): When a user sends a request "Delete post ID=5", Server must not just delete post ID=5, Server **MUST CHECK** if post ID=5 belongs to the user calling the command.
- **Rate Limiting:** Anti-DDoS attack exhausting resources on all important Routers (especially: Login API, Reset Password API, Deposit/Withdraw API).

## 5. Security Headers
Set up full standard Headers when returning to Client:
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options (Anti-Clickjacking)
- X-Content-Type-Options: nosniff
