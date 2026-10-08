# RealDev learning content and attribution

Last checked: 2026-10-06. The app’s concepts are original RealDev explanations grounded in linked documentation. Practice questions, code, logs and expected outputs are independently authored; external question text has not been copied. Sources below inform technical contracts and answer review, not a copied answer key. Each published task links a technical source and should be rechecked against the referenced version. Executable tasks include independent server-side cases; open-ended code reviews use transparent criteria and are not represented as automatic proof of correctness.

## Sources in the app

| Resource | Use | Reuse decision |
| --- | --- | --- |
| [JavaScript Questions](https://github.com/lydiahallie/javascript-questions) | Optional JS question inspiration | MIT; retain notices if adapting. The README warns that some content reflects 2019 behavior, so check current language behavior. |
| [React Learn](https://react.dev/learn) | React state and component concepts | Documentation CC BY 4.0; attribute. The React library’s license is separate. |
| [MDN Web Docs](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license) | JavaScript, Fetch, HTTP concepts | Docs CC BY-SA 2.5+ unless noted; attribution and ShareAlike apply to adaptations. Code samples have separate terms. |
| [.NET Docs](https://github.com/dotnet/docs) | CLR and C# concepts | Documentation CC BY 4.0; check file-specific notices. |
| [GitHub Skills](https://github.com/skills/introduction-to-github) | Beginner teamwork / PR practice | That repository’s MIT license; do not generalize to other Skills repositories. |
| [Chinook](https://github.com/lerocha/chinook-database) | SQL and relational schema practice | MIT. Schema/data practice, not a prepared question bank. |
| [SQLBolt](https://sqlbolt.com/) | Optional learning link | Free lessons; redistribution permission not verified. Link out; do not copy lesson text. |
| [Unity Learn](https://learn.unity.com/) | Optional Unity reference | Free access; blanket reuse permission for course content not verified. Write original tasks and check Unity documentation. |
| [Kubernetes Docs](https://github.com/kubernetes/website) | Kubernetes and DevOps concepts | CC BY 4.0; attribute and mark changes. This is only part of broad DevOps training. |
| [DevOps Exercises](https://github.com/bregman-arie/devops-exercises) | External DevOps practice reference | Restrictions include adaptations and primarily commercial use. Do not translate or import its exercises to this bank without separate permission. |
| [.NET testing docs](https://learn.microsoft.com/en-us/dotnet/core/testing/) | Testing concepts | Documentation repo CC BY 4.0, subject to file-specific notices. |
| [AI Engineering Course](https://github.com/amitshekhariitbhu/ai-engineering-course) | RAG, evaluation, embeddings | Apache 2.0; preserve license and notices. Linked videos and blogs may have separate rights. |
| [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners) | Generative AI concepts | MIT; preserve copyright and license notice. A free course does not make hosted API calls free. |
| [Apache Airflow core concepts](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html) | Pipeline orchestration and DAGs | Apache 2.0; check NOTICE and file-specific notices. |
| [Data Engineering Zoomcamp](https://github.com/DataTalksClub/data-engineering-zoomcamp) | Optional course link | Free course; repository-wide redistribution license not verified. Link out; check individual file terms. |
| [Android Compose samples](https://github.com/android/compose-samples) | Android examples and review practice | Apache 2.0; preserve license and notices. |
| [Godot docs](https://docs.godotengine.org/en/stable/tutorials/index.html) | General game-development concepts | CC BY 3.0; attribute and indicate modifications. Godot APIs are not Unity APIs. |
| [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html) | Original schema-migration task: constraints and unique keys | Official SQLite reference; task text and schema scenario are authored by RealDev. |
| [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html) | Schema evolution and migration review | Official SQLite reference; task is original and does not reproduce documentation examples. |
| [SQLite SELECT](https://www.sqlite.org/lang_select.html) | Original pagination incident and expected/actual debugging | Official SQLite reference; code and incident logs are authored by RealDev. |
| [Python sqlite3](https://docs.python.org/3/library/sqlite3.html) | Python database API contracts and transaction behavior | Official Python documentation; task code and tests are original. |
| [PostgreSQL DDL](https://www.postgresql.org/docs/current/ddl.html) | Production schema/migration review principles | Official PostgreSQL documentation; reviewed against the target database and version before release. |
| [PostgreSQL LIMIT/OFFSET](https://www.postgresql.org/docs/17/queries-limit.html) | Stable ordering and page-boundary review | Official PostgreSQL documentation; pagination exercise is original. |
| [AWS Builders’ Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | API retry/idempotency review criteria | Official AWS engineering article; RealDev authors its own buggy example, prompts and tests. |

## Content record

For each card or question keep: permanent ID, area/topic, format, difficulty, Turkish and English text, answer key, explanation, source URL and revision, license and license URL, attribution, technology version, review date, publication status, and (for code tasks) an independent test-suite ID.

Use stable categories such as concept, flashcard, multiple-choice, debugging, coding, and explanation. Review translations, wrong-answer choices, answer keys, and code tests before publishing. Source updates enter a review queue rather than silently changing a learner’s saved result.

When reusing material, follow its actual terms: preserve MIT/Apache notices where applicable; attribute CC BY material and mark changes; keep CC BY-SA adaptations under the required share-alike terms. This registry is a practical content record, not a blanket license grant for linked assets or external media.

## Original bank expansion — 8 October 2026

`server/bank-tasks.mjs` adds 39 original bilingual scenarios, three per area. It stores topic, author-assigned difficulty, format, source URL and review date per question. These are new RealDev scenarios referencing technical behavior, not imported or translated source quizzes. Existing question IDs remain unchanged. Sources include MDN/React, Microsoft .NET, Git, PostgreSQL, Unity 6, Kubernetes, Docker, npm, Python, scikit-learn, OpenAI, Apache Airflow/Beam/Avro, Android and Godot. Every exact reference is linked in the corresponding answer feedback.

No DevOps Exercises, SQLBolt, Medium, Stack Overflow, Unity Learn quiz or course question text was imported. Access without charge does not imply permission to redistribute. Source licenses are still relevant for any future quotation, translation, copied code or imported dataset; this update grants no rights over third-party assets. The new bank contains no such imported material.

The new rows intentionally remain formative multiple-choice evidence, including code reading and diagnosis. They are not independently executed learner solutions. Content quality tests, executable reference checks for selected JavaScript/SQL scenarios and account-isolation integration tests accompany this expansion. A human editorial review and learner-based difficulty calibration remain future work.
