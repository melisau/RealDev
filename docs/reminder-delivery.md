# Reminder delivery and verification

The account preference, browser subscription and unattended dispatcher are separate steps. Saving a time or accepting a Web Push request does not prove that a notification appeared on a device.

## User flow

1. Sign in and open the header reminder button.
2. Choose a time and timezone; save the preference.
3. Choose **Enable on this device** and approve the browser prompt. Unsupported embedded browsers may require opening the Site in Chrome, Edge, Firefox or supported Safari. iPhone users must first install the Site on their home screen.
4. Send a test notification and check the device notification center. A push-service acceptance response is not a delivery receipt.
5. Check the background scheduling status and last server check. Device setup does not activate a paused cloud schedule.

Permission requests stop waiting after 30 seconds; service-worker operations, push subscription and API requests also have deadlines. Buttons recover after failure. Closing the dialog invalidates pending work so a late permission response cannot submit an old form. A timed-out API write may already have reached the server; reopen settings to confirm before retrying.

## Production scheduler (2026-10-19)

The public Site uses `.github/workflows/reminders.yml` in `melisau/RealDev`, with an hourly UTC check at minute 17 and a manual **Run workflow** option. Each run checks the opted-in accounts' own timezones and chosen times. GitHub can delay scheduled jobs or skip one; this is not an exact-minute delivery service. A reminder stays due for 135 minutes after the chosen local time, so the next hourly run still delivers it after one skipped run; the per-device daily claim keeps it to one reminder per local day. GitHub disables scheduled workflows in a public repository after 60 days without repository activity; if that happens, re-enable **Daily reminder dispatcher** in the Actions tab. For a temporary pause, disable this workflow in GitHub Actions. The old linked Sites cloud task stays paused: its owner-private service-access instructions do not authorize the public Site's dispatcher. Do not resume that task or create a second sender.

The dispatcher's strong bearer key is stored as `REMINDER_DISPATCH_TOKEN` in Sites and `REALDEV_REMINDER_DISPATCH_TOKEN` in GitHub Actions Secrets. No secret is committed or placed in an automation prompt. `scripts/dispatch-reminders.mjs` calls only `https://realdev.melisauyar.com`, refuses redirects, omits browser Origin headers, sends one POST and verifies the persisted aggregate report with a GET. It does not retry an uncertain POST response. Daily server-side claims deduplicate later runs.

Manual GitHub Actions run [39304432896](https://github.com/melisau/RealDev/actions/runs/39304432896) successfully authenticated, dispatched and read back its saved report on 2026-10-19. A device owner also confirmed receiving the separate test push. An accepted push-service response alone is still not a delivery receipt, and the first future scheduled occurrence is not claimed as already observed. Keep `REMINDER_SCHEDULE_ENABLED=1` only while the workflow and matching secret remain active; after changing this Sites environment value, deploy a saved version to apply it.

To rotate the dispatcher key, replace the GitHub Secret and the Sites secret together, deploy, manually run the workflow, and verify `verified: true`. Never print the key or use it in a command argument. VAPID keys are separate; rotating them can require device re-subscription.

The dispatcher accepts at most one daily push per device, leases concurrent attempts, limits retries and removes expired subscriptions. A 404/410 from the push service means the browser revoked the subscription: it is deleted and reported as `expired`, not `failed`. Automated tests cover these rules, encrypted payloads and the unattended caller's authentication, redirect rejection and readback checks. Real delivery failures or truncated batches fail the GitHub job; expired subscriptions do not. review aggregate counts in its logs. Do not log profiles, answers or push subscription endpoints.
