# Reminder delivery and verification

The account preference, browser subscription and unattended dispatcher are separate steps. Saving a time or accepting a Web Push request does not prove that a notification appeared on a device.

## User flow

1. Sign in and open the header reminder button.
2. Choose a time and timezone; save the preference.
3. Choose **Enable on this device** and approve the browser prompt. Unsupported embedded browsers may require opening the Site in Chrome, Edge, Firefox or supported Safari. iPhone users must first install the Site on their home screen.
4. Send a test notification and check the device notification center. A push-service acceptance response is not a delivery receipt.
5. Check the background scheduling status and last server check. Device setup does not activate a paused cloud schedule.

Permission requests stop waiting after 30 seconds; service-worker operations, push subscription and API requests also have deadlines. Buttons recover after failure. Closing the dialog invalidates pending work so a late permission response cannot submit an old form. A timed-out API write may already have reached the server; reopen settings to confirm before retrying.

## Current rollout status (2026-10-08)

VAPID configuration is present. The linked cloud automation is paused, with an old daily 20:00 schedule. Hourly checks require the owner's pending explicit approval. Keep `REMINDER_SCHEDULE_ENABLED=0` until the intended unattended caller has been authenticated, exercised and its persisted last-check timestamp read back.

The application dispatcher requires its own strong bearer secret, no browser Origin header, and a server-side caller. A Sites service-access credential does not satisfy this application authorization. Never put dispatcher secrets in browser code, Git, automation prose or logs. Provision them through a supported secure secret mechanism available to the actual unattended runner before activation.

The dispatcher checks each account's time and timezone, accepts at most one daily push per device, leases concurrent attempts, limits retries and removes expired subscriptions. Automated tests cover these rules and encrypted payloads. Actual device delivery and a fresh unattended cloud invocation have not yet been verified; do not advertise closed-site reminders as operational until both pass.