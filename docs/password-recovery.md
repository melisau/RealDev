# Password recovery

On the sign-in page, select **Şifremi unuttum / Forgot password?**, enter the account email and submit. The form does not ask for the current password. The existing Firebase Authentication Web SDK sends a password-reset request; it does not create an account, sign the user in or send a password to the RealDev API.

Firebase sends its password-reset email. The recipient opens Firebase's hosted secure action page, chooses a new password there, then returns to RealDev to sign in. The same-origin sign-in URL is supplied as the continue URL with `handleCodeInApp: false`; the exact live hostname must be authorized in Firebase Authentication. Keep the default Firebase-hosted password-reset action handler unless a separately reviewed custom handler is deployed. No password-reset token is stored or handled by RealDev.

The form and requested email language use the selected Turkish/English locale. A successful request and Firebase's user-not-found response share a conditional result message, avoiding an account-existence disclosure in this UI. Enable Firebase's project-level email enumeration protection as well: a generic client message does not prevent a caller from inspecting a provider's direct API response.

Pending requests lock the controls. Accepted requests apply a one-minute in-page cooldown that survives switching form modes. This is a UX guard, not a server-side abuse limit; Firebase's provider limits remain authoritative. Network, malformed-email and provider-limit failures have actionable messages. Raw provider error details are not displayed.

## Verification

`tests/auth-recovery.test.mjs` checks password clearing, email-only requests, hosted-handler continuation, unknown-account messaging, validation, network/limit errors, concurrent submissions, cooldown, return to sign-in, localization and unavailable configuration.

A separate temporary Playwright check uses the real Firebase browser SDK with intercepted test responses. It checks desktop/mobile rendering, the actual PASSWORD_RESET request and success/error UI without sending mail. These controlled tests do not prove real inbox delivery, sender reputation or the user's Firebase console template settings. Production acceptance requires an owner-controlled account to receive the email and complete the reset once. Never log a reset link, token or password.

Official reference: [Firebase password-reset email](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email).
