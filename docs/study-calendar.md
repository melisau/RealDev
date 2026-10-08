# Active study calendar

Signed-in users have a persistent monthly calendar at `/calendar` and a small daily-time badge. Question solving, answer review, concepts and an open advanced coding exercise count as study. Guests and public demos do not create study records.

The timer pauses when the tab is hidden, manually paused, or idle for two minutes. Pointer, keyboard, input, touch and scroll activity resume eligible study. Throttled/sleeping tabs and clock jumps do not earn a large gap. This measures active screen time for motivation; it is neither proof of attention nor skill evidence.

Colors use precise lower-inclusive boundaries: zero, positive time below 5 minutes, 5–under 10, 10–under 15, 15–under 20, and 20+ minutes. Every day also has a visible number and an accessible full duration. Month navigation and day selection work in Turkish and English in both themes.

The authenticated API stores bounded intervals and merges overlaps across tabs/devices. Repeated ids cannot change saved intervals. Calendar totals are computed in the device's IANA timezone, including midnight and daylight-saving changes. Changing timezone can move historical intervals to a neighboring day. No historical time is fabricated before this feature was enabled.

Pending intervals retry every 15 seconds, on reconnect and on returning to the tab. A tab-scoped, account-namespaced queue retries recent intervals for up to 24 hours. This is not a full offline mode; clearing/closing browser storage or abrupt device failure can lose unsent seconds. The API rejects intervals longer than 60 seconds, older than 24 hours, or substantially in the future. It does not certify the client-reported activity as skill.

Study intervals are included in account JSON exports and removed by both learning reset and RealDev account-data deletion. Other accounts and shared content are unaffected. Migration: `drizzle/0007_faithful_mentallo.sql`.