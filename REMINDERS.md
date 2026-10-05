# Daily reminders

Daily reminders are opt-in Web Push. Each account stores its enabled flag, local time, IANA timezone and notification language. Each browser subscribes only after a user gesture and permission. Up to five devices can be connected. Removing a device or deleting a RealDev account stops its server-side deliveries. A learning reset preserves reminder preferences. Account export includes reminder data.

## Hosted dispatcher

The published owner-private Site exposes POST `/internal/reminders/dispatch` and GET `/internal/reminders/status`. Both require a strong bearer secret in `REMINDER_DISPATCH_TOKEN`, verified on the Worker in addition to the private Sites boundary; Origin-bearing requests are rejected. No browser code receives this secret. For this installation the dispatch secret is set to the Site's platform service credential obtained from Sites metadata, so a fresh linked cloud task can retrieve supported access independently of the authoring checkout. If that credential changes, update the secret through Sites environment tools before the next deployment. Never put credentials in prompts, source or GitHub.

An unattended task reopens this same Site through Sites tools and obtains its current live URL and service credential in memory. It sends POST with `OAI-Sites-Authorization: Bearer <credential>` and `Authorization: Bearer <credential>` to the exact Site origin, using manual/no redirects. It then reads GET `/internal/reminders/status` with the same headers and checks the saved timestamp. The task must not read users' answers, subscriptions or profiles. All consent and timing selection happens on the server; the response is aggregate delivery counts only. Do not rebuild or redeploy on routine dispatches. If service access is unavailable or the token does not match, report the failure; never weaken authentication or substitute a browser identity.

The linked dispatcher is intended to run every hour in Europe/Istanbul. User timezones are evaluated using Intl at dispatch time. Only reminders due in the preceding seventy-five minutes (hourly interval plus fifteen minutes of task-delay grace) are eligible, avoiding outdated catch-up notifications after outages. Delivery claims are atomic per device/local calendar day; failed claims can retry after ten minutes, up to three attempts. Accepted notifications are not repeated, and expired endpoints are removed. The device-visible notification tag also collapses a repeated daily message after ambiguous provider failures. A network acceptance response does not prove that an operating system displayed the notification.

Configure `VAPID_PUBLIC_KEY` (public raw P-256 base64url), `VAPID_PRIVATE_KEY` (secret JWK d), optional `VAPID_SUBJECT` HTTPS URL, secret `REMINDER_DISPATCH_TOKEN`, and `REMINDER_SCHEDULE_ENABLED=1` only after the native linked schedule is saved. Keys are generated once and kept stable so existing device subscriptions remain valid. Preserve existing Site runtime values when editing these keys. The UI displays schedule inactive until enabled and includes a test notification button with a cooldown. There is no local always-on server dependency.

The service worker handles push/click events and caches no account pages or responses. On iPhone/iPad, install the supported Safari web app on the home screen. Browser, OS, permission and network settings can still prevent or delay delivery. Unsupported browsers retain time preferences but cannot subscribe.

## Verification

Unit tests cover authenticated dispatch, endpoint allowlisting, encryption, calendar/DST timing, concurrent claims, opt-out, retry leases, expiry and account isolation/deletion. The hosted dispatcher must also be verified through unattended service access with saved-state readback before scheduling. Do not create a fake browser subscription or enable notifications on the owner's device just for verification.

