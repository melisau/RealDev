# Deeper original practical exercises

Six new bilingual coding tasks add three two-stage projects, bringing advanced practice to 18 independently tested stages. The 168-question assessment remains a separate catalog; these tasks are not counted as more multiple-choice questions.

- .NET: optimistic version checks and idempotent purchase replay after a lost response.
- Unity: stale callbacks across enable/disable cycles and reward replay across a simulated restart.
- API/SQLite: atomic inventory/balance/order writes and reconciliation of duplicate, conflicting or out-of-order payment events.

Each task has five server-selected test sequences. Cases cover failure recovery and state across requests, not just a single happy-path output. Saved results use the existing account-owned, suite-versioned Piston grading and staged unlocks. The reference implementation and unfinished starter were executed against a real local Piston: each reference passed 5/5, each starter passed 0/5. Sources are linked within each task.

The Python exercises operate on real SQLite tables with transactions, constraints and parameterized queries. They do not host a public API or connect to a payment provider. C# exercises are engine-independent domain models; passing them does not verify ASP.NET/EF integration, Unity callback order, scene behavior, atomic files or performance. Project setup text gives concrete local integration acceptance tests. Existing production runner connectivity is unchanged; no fabricated verified result is saved when Piston is disconnected.

Source documents checked on 2026-10-08:
- [Microsoft EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)
- [Unity execution order](https://docs.unity3d.com/Manual/execution-order.html)
- [Python sqlite3 transaction control](https://docs.python.org/3/library/sqlite3.html#transaction-control)

Prompts, starter scaffolds and tests are original RealDev work. Official documents are factual references; no third-party quiz or answer key is copied. A few completed tasks still do not establish general expertise.