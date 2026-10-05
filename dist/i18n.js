(function () {
  const translations = {
    'ÇALIŞMA ALANIN': 'YOUR WORKSPACE',
    'Bugün': 'Today',
    'Beceri haritam': 'Skill map',
    'Hata laboratuvarı': 'Error lab',
    'Kavramlar': 'Concepts',
    'Yazılım haberleri': 'Software updates',
    'GitHub pratiği': 'GitHub practice',
    'Geliştirici profili': 'Developer profile',
    'Öğrenme yolun sana göre şekillenir': 'Your learning path adapts to you',
    'Çalışma alanı': 'Workspace',
    '5 Ekim 2026': 'October 5, 2026',
    'Hatırlatıcı ayarla': 'Set a reminder',
    'Koyu temayı aç': 'Switch to dark theme',
    'Açık temayı aç': 'Switch to light theme',
    'Profil': 'Profile',
    'Merhaba, geliştirici': 'Hello, developer',
    'Bugün küçük bir adım atalım. Önce düşün, sonra dene, en son açıkla.': 'Take one small step today. Think first, then try, and explain it last.',
    'çalışma tamamlandı': 'sessions completed',
    'BUGÜNÜN ÇALIŞMASI · 15 DK': "TODAY'S PRACTICE · 15 MIN",
    'Kodu yalnızca çalıştırma. Ne yaptığını da bil.': 'Don’t just run the code. Understand what it does.',
    'React’te state güncellemesini tahmin et, ardından C# runtime’ının rolünü kendi cümlelerinle anlat.': 'Predict a React state update, then explain the role of the C# runtime in your own words.',
    'Kod okuma': 'Code reading',
    'Kavram açıklama': 'Concept explanation',
    '4 kısa adım': '4 short steps',
    'Çalışmaya başla': 'Start practice',
    'Bugünkü rota': 'Today’s path',
    'Tüm beceriler →': 'All skills →',
    'Kod davranışını tahmin et': 'Predict what the code does',
    'React · state ve yeniden render': 'React · state and re-rendering',
    'Bir Git hatasını çöz': 'Diagnose a Git error',
    'non-fast-forward · güvenli inceleme': 'non-fast-forward · safe inspection',
    'Bir kavramı kendi cümlenle açıkla': 'Explain a concept in your own words',
    'C# · Common Language Runtime': 'C# · Common Language Runtime',
    'İlerleme bu cihazda kaydedilir': 'Progress is saved on this device',
    'rota': 'path',
    'Beceri haritandan': 'From your skill map',
    'KEŞİF AŞAMASI': 'DISCOVERY PHASE',
    'ölçülmedi': 'not assessed',
    'İlk kısa tarama ile başlangıç seviyesi oluşur.': 'Your baseline starts with a short skill check.',
    'Çalışma ipucu': 'Practice tip',
    'AI’ın ürettiği bir kodu kullanmadan önce kendine sor: Girdi ne? Çıktı ne? Hata olursa ilk hangi kanıta bakarım?': 'Before using AI-generated code, ask: What goes in? What comes out? If it fails, what evidence should I check first?',
    'KAYNAĞI BELLİ, GÜNCEL GELİŞMELER': 'LATEST UPDATES',
    'GÜNCEL GELİŞMELER': 'LATEST UPDATES',
    'Güncel gelişmeler': 'Latest updates',
    'Haberleri gör →': 'View updates →',
    'SENİN ÖĞRENME YOLUN': 'YOUR LEARNING PATH',
    'Geliştirici profilin': 'Your developer profile',
    'Çalıştığın alanlar öğrenme örneklerini kişiselleştirir. Seviyeni görevlerde verdiğin cevaplara göre birlikte keşfedeceğiz.': 'Your fields help personalize practice. We’ll discover your level from your answers to exercises.',
    'Öğrenme hedeflerin': 'Learning goals',
    '(birden fazla seçebilirsin)': '(choose more than one)',
    'AI mühendisliği': 'AI engineering',
    'Veri ve veritabanı': 'Data and databases',
    'Mobil geliştirme': 'Mobile development',
    'Oyun geliştirme': 'Game development',
    'Günlük çalışma süresi': 'Daily practice time',
    '10 dakika': '10 minutes',
    '15 dakika': '15 minutes',
    '25 dakika': '25 minutes',
    'Profili kaydet': 'Save profile',
    'Kapat': 'Close',
    'GELİŞİMİN': 'YOUR PROGRESS',
    'Çalışma alanları': 'Skill areas',
    'HEDEF: GENEL EKSİKLERİ KAPAT': 'GOAL: CLOSE SKILL GAPS',
    'Frontend': 'Frontend',
    'Backend': 'Backend',
    'Veritabanı': 'Database',
    'Git ve ekip çalışması': 'Git and collaboration',
    'Test ve kalite': 'Testing and quality',
    'DevOps ve cloud': 'DevOps and cloud',
    'Unity ve mobil oyun': 'Unity and mobile games',
    'AI ile üretim': 'Building with AI',
    'Henüz ölçülmedi': 'Not assessed yet',
    'Ölçüm nasıl işler?': 'How does assessment work?',
    'Bir doğru cevap tek başına “uzman” anlamına gelmez. Kod yazma, açıklama, hata ayıklama ve yeni senaryoya aktarım farklı görevlerle gözlemlenir.': 'One correct answer does not make you an expert. Coding, explaining, debugging, and applying knowledge to new scenarios are assessed separately.',
    'Önce bağımsız dene': 'Try it independently first',
    'İpucu almadan ne yapabildiğin görünür.': 'See what you can do without hints.',
    'Gerekince ipucu al': 'Use a hint when needed',
    'Hangi yardımın gerektiği de ilerlemeni açıklar.': 'The help you need is part of your progress.',
    'Başka örnekte tekrar et': 'Try a different example',
    'Bilgiyi yeni duruma uygulamanı kontrol ederiz.': 'Check whether you can apply the idea in a new situation.',
    'Kısa taramayı başlat →': 'Start the skill check →',
    'BECERİ TARAMASI': 'SKILL CHECK',
    'Bilgiyi doğrula': 'Check your understanding',
    'Beceri taraması': 'Skill check',
    'Başla': 'Start',
    'Sayı: 0': 'Count: 0',
    'Her durumda git push --force çalıştırmak.': 'Always run git push --force.',
    'GIT · PUSH HATASI · BAŞLANGIÇ': 'GIT · PUSH ERROR · BEGINNER',
    'HATA LABORATUVARI': 'ERROR LAB',
    'Hata mesajını okuyup çözüm yolunu bul': 'Read an error message and find a path to a fix',
    'Gerçekçi çıktıları incele: mesaj ne söylüyor, neyi henüz bilmiyorsun ve hangi kanıtı toplarsın?': 'Inspect realistic output: what does the message say, what is still unknown, and what evidence would you collect?',
    'Uzak branch ileride görünüyor': 'The remote branch is ahead',
    'Güvenli teşhis': 'Safe diagnosis',
    'Şu an main branch’indesin. Ekip arkadaşın uzak branch’e commit gönderdi; sende henüz fetch edilmemiş. İlk ne yaparsın?': 'You are on the main branch. A teammate pushed a commit that you have not fetched yet. What do you do first?',
    'Sesli açıkla': 'Explain aloud',
    'Önce şunu kontrol ederim… çünkü…': 'First, I would check this… because…',
    'Bunu başka bir geliştiriciye şöyle anlatırdım…': 'I would explain this to another developer like this…',
    'Yanıtımı kaydet →': 'Save my response →',
    'İpucu': 'Hint',
    'gösterildi': 'shown',
    'Önce yerel çalışma ağacını ve branch’in uzakla ilişkisini incele. git fetch uzak bilgileri indirir ama dosyalarını birleştirmez. Ardından commit farkını görüp ekip akışına uygun merge veya rebase planla.': 'First inspect your working tree and how your branch relates to the remote. git fetch downloads remote information without merging files. Then review the commit differences and choose a merge or rebase that fits your team workflow.',
    'Yanıtın bu cihazda saklandı; otomatik doğruluk puanı yok.': 'Your response is saved on this device; it is not automatically graded.',
    'Force push paylaşılan geçmişi değiştirebilir; ekip akışını ve remote geçmişini incelemeden kullanma.': 'A force push can rewrite shared history. Don’t use it before checking the remote history and your team workflow.',
    'Güvenli bir teşhis yolu; önce git status/git fetch ile uzak farkı incele, sonra ekip akışına uygun merge veya rebase seç, test et ve pushla.': 'A safe diagnosis: inspect the remote changes with git status and git fetch, choose a team-approved merge or rebase, test, then push.',
    'Hata ayıklama sırası': 'Debugging checklist',
    'Mesajı gördüğünde kendine şu soruları sor:': 'When you see an error, ask yourself:',
    'Ne başarısız oldu?': 'What failed?',
    'Komut ve hata türünü mesajdan ayır.': 'Identify the command and error type in the message.',
    'Hangi kanıt eksik?': 'What evidence is missing?',
    'Önce durumu ve commit farkını incele.': 'First inspect the status and commit differences.',
    'Güvenli sonraki adım ne?': 'What is a safe next step?',
    'Uzak geçmişi görmeden force push yapma.': 'Do not force push before reviewing remote history.',
    'Hata laboratuvarında': 'In the error lab',
    'KAVRAM ATÖLYESİ': 'CONCEPT WORKSHOP',
    'Adını duydun. Şimdi gerçekten anla.': 'You’ve heard the term. Now understand it.',
    'Önce kısa anlatım, sonra kendi cümlenle açıklama ve yeni örnekte uygulama. Teknik içerik güvenilir dokümantasyona bağlanır.': 'Start with a short explanation, restate it in your own words, then apply it to a new example. Technical content links to documentation.',
    'Kaynaklı anlatım': 'Grounded in sources',
    'Öğren →': 'Learn →',
    'Bir örnekle düşün:': 'Think of an example:',
    'Kontrol edilebilir kaynak:': 'Check the source:',
    'Şimdi kendi cümlenle açıkla': 'Now explain it in your own words',
    'Açıklamamı gözden geçir →': 'Review my explanation →',
    'Bu prototipte otomatik yapay zekâ değerlendirmesi yok.': 'This prototype does not provide automated AI grading.',
    'Bilgi disiplini: Temel açıklamalar birincil/resmi kaynaklara dayanır. Medium ve Stack Overflow gibi topluluk yazıları ayrı etiketlenir; sürüm ve haber iddiaları mümkün olduğunda asıl duyurudan doğrulanır.': 'Source policy: Core explanations use primary and official sources. Community posts such as Medium and Stack Overflow are labeled separately; release and news claims are checked against the original announcement where possible.',
    'YAZILIM HABERLERİ': 'SOFTWARE UPDATES',
    'Gündemi takip et, etkisini anla': 'Follow the news. Understand its impact.',
    'AI modelleri, geliştirici araçları ve altyapı gelişmeleri. Kaynağa git veya kısa özeti aç.': 'Updates on AI models, developer tools, and infrastructure. Open the source or read a short summary.',
    'Kontrol: 5 Ekim 2026': 'Checked: October 5, 2026',
    'Güvenilirlik kuralı: Bu akıştaki kartlar ilk sürüm için elle seçilmiş kaynaklı örneklerdir, canlı haber akışı değildir. Yayın tarihi kaynak sayfasından alınmıştır. Her kartta asıl kaynağa gidebilirsin.': 'Editorial note: These source-linked cards are curated examples, not a live news feed. Publication dates come from the source pages. Open the original source from each card.',
    'Kısa özet:': 'Summary:',
    'Özeti kapat': 'Hide summary',
    'Haberi özetle': 'Show summary',
    'Asıl kaynak:': 'Original source:',
    'Kaynak yaklaşımı': 'How sources are used',
    'Resmi kaynaklar': 'Official sources',
    'Sürüm, API davranışı ve yeni model özellikleri için önce ürün dokümantasyonu, changelog veya resmi proje blogu.': 'For releases, API behavior, and new model features, start with product documentation, changelogs, or official project blogs.',
    'Üçüncü taraf açıklamalar, kaynağa göreli yorumlarıyla sunulur.': 'Third-party explanations are labeled as commentary on the source.',
    'Topluluk kaynakları': 'Community sources',
    'Medium ve Stack Overflow fikir, deneyim ve hata örnekleri bulmaya yardım eder. İçerikler yayımlanmadan önce birincil kaynaklarla doğrulanmalı; kişisel görüş, resmi bilgi gibi işaretlenmemeli.': 'Medium and Stack Overflow can offer ideas, experience, and error examples. Verify claims against primary sources before publishing; never present personal opinion as official guidance.',
    'GITHUB PRATİĞİ': 'GITHUB PRACTICE',
    'Ekipte kodu nasıl güvenle teslim edersin?': 'How do you ship code safely with a team?',
    'Commit ve branch’ten GitHub Actions’a: kavramı oku, senaryoda uygula, sonra kendi repo akışına taşı.': 'From commits and branches to GitHub Actions: learn the idea, try the scenario, then apply it to your repository.',
    'Kaynak: Git’in resmi dokümantasyonu ve GitHub Docs/Changelog. Workflow davranışları değişebileceği için güncel sözdizimi kaynak sayfasından kontrol edilir.': 'Sources: official Git documentation and GitHub Docs/Changelog. Workflow behavior can change, so check the current syntax in the source.',
    'Branch ve commit': 'Branches and commits',
    'Değişiklikleri küçük, anlamlı parçalara ayır.': 'Split changes into small, meaningful commits.',
    'Pull request': 'Pull request',
    'Değişikliği incelet, tartış ve test sonuçlarını kontrol et.': 'Request review, discuss the change, and check test results.',
    'Merge conflict': 'Merge conflict',
    'İki değişiklik aynı satırları etkileyince kanıtla çöz.': 'Resolve conflicts by inspecting both changes.',
    'GitHub Actions': 'GitHub Actions',
    'Workflow YAML ile build ve test adımlarını otomatikleştir.': 'Automate build and test steps with workflow YAML.',
    'Kırmızı workflow': 'Failed workflow',
    '01 · GIT': '01 · GIT',
    '02 · COLLABORATION': '02 · COLLABORATION',
    '03 · HATA': '03 · ERROR',
    '04 · AUTOMATION': '04 · AUTOMATION',
    '05 · SECURITY': '05 · SECURITY',
    '06 · DEBUG': '06 · DEBUG',
    'Başarısız job, step, log ve artefact’ı sırasıyla incele.': 'Inspect the failed job, step, logs, and artifacts in order.',
    'Örnek: Actions güncellemesi': 'Example: Actions update',
    'Resmi changelog': 'Official changelog',
    'Runner sürüm sonunu izleme ve vulnerability-alerts token izni': 'Runner deprecation tracking and a vulnerability-alerts token permission',
    'Bu changelog kaydı, runner sürüm deprecations bilgisi için API ve GITHUB_TOKEN’a yeni salt okunur izin eklenmesini anlatıyor.': 'This changelog describes an API for runner deprecation information and a new read-only GITHUB_TOKEN permission.',
    'GitHub Changelog kaynağı': 'GitHub Changelog source',
    'Geliştirici yolculuğu': 'Developer journey',
    'Profili kaydet': 'Save profile',
    'En az bir öğrenme hedefi seç.': 'Choose at least one learning goal.',
    'Hedeflerin ve günlük süren bu cihazda kaydedildi.': 'Your goals and daily practice time are saved on this device.',
    'Önce teşhis düşünceni yaz veya sesli anlat.': 'Write or say your diagnosis first.',
    'Bu tarayıcı sesli yazmayı desteklemiyor. Yazılı yanıtı kullanabilirsin.': 'This browser does not support speech input. You can type your response instead.',
    'Ses tanınamadı. İstersen yazılı yanıt verebilirsin.': 'Speech was not recognized. You can type your response instead.',
    'Dinliyorum… Türkçe açıklamanı yap.': 'Listening… explain in English.',
    'Önce kendi cümlenle kısa bir açıklama yaz.': 'First, write a short explanation in your own words.',
    'Biraz daha açmayı dene.': 'Try to explain a little more.',
    'İyi bir başlangıç.': 'Good start.',
    'Açıklamana ne işe yaradığını ve nerede kullanıldığını ekle.': 'Add what it does and where it is used.',
    'Açıklamanı kendin oluşturdun. Şimdi kaynak anlatımıyla karşılaştır: hangi noktayı eklerdin?': 'You explained it in your own words. Compare it with the source: what would you add?',
    'Açıklamana ne işe yaradığını ve nerede kullanıldığını ekle. Otomatik teknik doğruluk puanı vermiyoruz; bu prototip yanıtını sunucuya göndermiyor.': 'Add what it does and where it is used. We do not automatically grade technical accuracy; this prototype does not send your response to a server.',
    'CLR nedir?': 'What is the CLR?',
    '.NET çalışma zamanı': '.NET runtime',
    'C# kodunun çalıştırılmasına ve yönetilen bellek gibi hizmetlere aracılık eden .NET çalışma zamanı.': 'The .NET runtime that executes C# code and provides services such as managed memory.',
    'CLR (Common Language Runtime), .NET için kodu çalıştıran ve yönetilen yürütme hizmetleri sağlayan çalışma ortamıdır. C# derleyicisi genellikle kaynak kodu IL ve metadata içeren bir assembly’ye dönüştürür; runtime bunu yükleyip çalıştırır. CLR, garbage collection gibi hizmetlere de katkı verir.': 'The Common Language Runtime (CLR) executes .NET code and provides managed execution services. A C# compiler typically turns source code into an assembly containing IL and metadata; the runtime loads and executes it. The CLR also provides services such as garbage collection.',
    'Bir benzetme: C# derleyicisi tarifini ortak bir ara dile çevirir; CLR bu tarifi makinede çalıştırıp yürütme sırasında gerekli hizmetleri sağlar. Benzetme yalnızca akışı anlatır; teknik ayrıntıların tamamı değildir.': 'Think of the C# compiler as translating a recipe into a common intermediate language. The CLR runs it on the machine and provides services during execution. This analogy describes the flow, not every technical detail.',
    'Yazılım tasarımı': 'Software design',
    'Karmaşık iş alanını anlamayı ve modelini yazılım tasarımının merkezine koymayı öneren yaklaşım.': 'An approach that puts understanding a complex business domain and modeling it at the center of software design.',
    'Domain-Driven Design (DDD), yazılım tasarımında iş alanını (domain) anlamaya ve alan uzmanlarıyla ortak bir dil kurmaya odaklanır. Bounded context gibi araçlar, aynı terimin farklı alt alanlarda farklı anlam taşıyabileceğini görünür kılar. Her projeye DDD uygulamak gerekmez; karmaşık iş kurallarında daha yararlıdır.': 'Domain-Driven Design (DDD) focuses on understanding the business domain and building a shared language with domain experts. Tools such as bounded contexts make it clear that a term can mean different things in different areas. DDD is not needed for every project; it is more useful when business rules are complex.',
    'E-ticarette “sipariş” ödeme, depo ve kargo ekipleri için farklı kurallara sahip olabilir. Her bağlamın modelini ayrı ve açık tutmak, tek bir dev modelde anlamların karışmasını önler.': 'In e-commerce, an “order” may follow different rules for payments, warehouse, and shipping. Keeping each context’s model clear helps avoid mixing meanings in one oversized model.',
    'Operasyon': 'Operations',
    'Konteynerleştirilmiş iş yüklerini küme üzerinde tanımlı istenen duruma göre yönetir.': 'Manages containerized workloads in a cluster toward a declared desired state.',
    'Kubernetes, konteynerleştirilmiş uygulamaları küme üzerinde dağıtmak ve yönetmek için bir platformdur. Kullanıcı nesnelerle istenen durumu bildirir; kontrol döngüleri bu duruma yaklaşmaya çalışır. Pod temel çalıştırma birimidir. Kubernetes, uygulama kodunun yerine geçmez ve tek başına her altyapı sorununu çözmez.': 'Kubernetes is a platform for deploying and managing containerized applications in a cluster. Users declare a desired state through objects; control loops work to move the cluster toward it. A Pod is the basic execution unit. Kubernetes does not replace application code or solve every infrastructure problem by itself.',
    'Bir orkestratör gibi düşünebilirsin: kaç uygulama kopyası istediğini söylersin; küme denetleyicileri uygun düğümlerde çalışır durumda tutmaya çalışır.': 'Think of it as an orchestrator: you declare how many copies of an application you want, and cluster controllers try to keep them running on suitable nodes.',
    'Tablo ve şema gibi veritabanı nesnelerinin yapısını tanımlayan SQL komutları.': 'SQL commands that define the structure of database objects such as tables and schemas.',
    'DDL (Data Definition Language), veritabanı nesnelerinin yapısını tanımlayan SQL komutları için kullanılan terimdir. PostgreSQL dokümantasyonundaki CREATE, ALTER ve DROP komutları tablo ve diğer nesneleri oluşturur, değiştirir veya kaldırır. DDL sınıflandırmalarının sınırları veritabanına göre değişebilir.': 'Data Definition Language (DDL) refers to SQL commands that define database object structures. In PostgreSQL documentation, CREATE, ALTER, and DROP create, change, or remove tables and other objects. The boundaries of DDL classifications can vary by database.',
    'Bir uygulamanın içindeki kayıtları doldurmadan önce hangi tablo ve sütunların var olacağını tanımlamak, DDL’nin tipik kullanım alanıdır.': 'Defining which tables and columns exist before filling them with application records is a typical use of DDL.',
    '.NET araçları': '.NET tools',
    'Dağıtık uygulamaların servislerini, bağımlılıklarını ve yerel gözlemlenebilirliğini kodla modellemeye yarar.': 'Models distributed application services, dependencies, and local observability in code.',
    '.NET Aspire, dağıtık uygulamalar için kodla tanımlanan orkestrasyon ve gözlemlenebilirlik katmanıdır. AppHost içinde servisler, veritabanları ve diğer kaynaklar modellenebilir; geliştirme sırasında bunları birlikte başlatıp Aspire Dashboard’da izlemeye yardımcı olur. Aspire bir uygulama framework’ünün veya üretim ortamının kendisi değildir.': '.NET Aspire is a code-first orchestration and observability layer for distributed applications. The AppHost can model services, databases, and other resources, helping you start and observe them together during development. Aspire is not an application framework or a production environment itself.',
    'API, web arayüzü, veritabanı ve önbelleği her seferinde ayrı terminallerden başlatmak yerine, geliştirme ortamındaki bu kaynakları tek bir uygulama modeli içinde ifade etmeye yardım eder.': 'Instead of starting an API, web UI, database, and cache from separate terminals every time, Aspire helps describe these development resources in one application model.',
    'Bir C# projesini derleyip çalıştırdığında kaynak kod ile çalışan program arasında neler olduğunu düşün.': 'Think about what happens between source code and a running program when you build and run a C# project.',
    'C# kodunu bilgisayarın çalıştırdığı makine koduna dönüştürme ve çalışma zamanı hizmetlerini sağlama sürecinde CLR’nin rolü hangisidir?': 'What role does the CLR play in executing C# code and providing runtime services?',
    'CLR yalnızca kodu yazdığın editördür.': 'The CLR is just the editor you use to write code.',
    'CLR, .NET managed kodunu çalıştıran runtime’dır; yükleme, yürütme ve runtime hizmetlerinde rol alır.': 'The CLR is the runtime that executes .NET managed code and participates in loading, execution, and runtime services.',
    'CLR, C# projesindeki tüm SQL tablolarını oluşturur.': 'The CLR creates all SQL tables in a C# project.',
    'Doğru. C# derleyicisi IL ve metadata içeren çıktılar üretir; CLR bu managed kodu yükleyip çalıştırır ve garbage collection gibi runtime hizmetleri sağlar. Detaylar için Microsoft Learn kaynağına bakabilirsin.': 'Correct. The C# compiler produces output containing IL and metadata. The CLR loads and executes this managed code and provides runtime services such as garbage collection. See Microsoft Learn for details.',
    'React · kod okuma': 'React · code reading',
    'Bu bileşen ekranda ilk çizildiğinde hangi mesaj görünür?': 'Which message appears on the first render of this component?',
    'State güncellemesinin render üzerindeki etkisini tahmin et.': 'Predict how a state update affects rendering.',
    'Ekran boş kalır; state başlangıcı sayılmaz.': 'The screen stays blank; the initial state does not count.',
    'İlk render’da count değeri 0’dır, bu yüzden koşul “Başla” metnini seçer. Tıklama setCount ile state’i günceller ve React yeni değere göre tekrar render eder.': 'On the first render, count is 0, so the condition selects “Start.” Clicking updates state with setCount, and React renders again with the new value.',
    'Git · hata teşhisi': 'Git · error diagnosis',
    'Push sırasında “non-fast-forward” uyarısı aldın. İlk güvenli adım ne olmalı?': 'You get a “non-fast-forward” warning while pushing. What is the first safe step?',
    'Uzak branch’te sende olmayan commitler olabilir. Geçmişi anlamadan zorla göndermek ekip arkadaşının commitlerini kaybettirebilir.': 'The remote branch may contain commits you do not have. Forcing a push without understanding the history could lose a teammate’s commits.',
    'Durumu ve uzak değişiklikleri inceleyip branch’i güvenli biçimde güncellemek.': 'Inspect the status and remote changes, then update the branch safely.',
    'Yerel branch’i silip aynı dosyaları tekrar yazmak.': 'Delete the local branch and rewrite the same files.',
    'Önce git status ve git fetch ile durumu incele; ortak geçmişteki uzak commitleri gör. Sonra ekip akışına göre merge veya rebase et ve test ederek pushla. Force push paylaşılan geçmişi değiştirebilir.': 'First inspect the state with git status and git fetch to see remote commits. Then merge or rebase according to your team workflow, test, and push. A force push can rewrite shared history.',
    'API · kavram': 'API · concepts',
    'Bir tarayıcı isteği CORS hatası veriyor. Bu mesaj en doğru şekilde ne anlatır?': 'A browser request reports a CORS error. What does this message most accurately mean?',
    'Tarayıcı konsolundaki hata, çoğu zaman API’nin sunucu tarafında hiç çalışmadığı anlamına gelmez.': 'A browser console error does not necessarily mean that the API failed to run on the server.',
    'Tarayıcı, sunucudan gelen CORS izin başlıkları nedeniyle yanıtı web sayfasının JavaScript koduna açmıyor olabilir.': 'The browser may be blocking page JavaScript from reading the response because of the server’s CORS permission headers.',
    'Şifre kesinlikle yanlış demektir.': 'It definitely means the password is wrong.',
    'Veritabanı kesinlikle kapalı demektir.': 'It definitely means the database is down.',
    'CORS, tarayıcının farklı origin isteklerine uyguladığı erişim politikasıdır. Sunucu uygun Access-Control-Allow-Origin yanıtını vermelidir. Bu, API’nin ağda hiç yanıt vermediği anlamına gelmeyebilir.': 'CORS is a browser access policy for cross-origin requests. The server must return an appropriate Access-Control-Allow-Origin header. This does not necessarily mean the API failed to respond over the network.',
    'Domain-Driven Design': 'Domain-Driven Design',
    'Kubernetes ne yapar?': 'What does Kubernetes do?',
    'DDL nedir?': 'What is DDL?',
    '.NET Aspire': '.NET Aspire',
    'OpenAI, GPT‑6.1 Sol modelini duyurdu': 'OpenAI announces the GPT‑6.1 Sol model',
    'Kubernetes v1.37: Memory QoS Beta aşamasına geçti': 'Kubernetes v1.37: Memory QoS reaches Beta',
    'Actions için runner API ve token izinleri güncellendi': 'Runner API and token permissions updated for Actions',
    'AI modelleri': 'AI models',
    'Proje blogu': 'Project blog',
    'Resmi duyuru': 'Official announcement',
    'Haberler': 'Updates',
    'Full stack · Oyun geliştirme': 'Full stack · Game development',
    'Full stack · Unity': 'Full stack · Unity',
    'Unity · mobil oyun': 'Unity · mobile game development',
    '29 Eylül 2026 · AI modelleri': 'September 29, 2026 · AI models',
    '14 Eylül 2026 · Kubernetes': 'September 14, 2026 · Kubernetes',
    '3 Eylül 2026 · GitHub Actions': 'September 3, 2026 · GitHub Actions',
    'CORS hatası': 'CORS error',
    '29 Eylül 2026': 'September 29, 2026',
    '14 Eylül 2026': 'September 14, 2026',
    '3 Eylül 2026': 'September 3, 2026',
    'OpenAI’nin model ailesindeki yeni sürüm ve önceki GPT‑6 duyurusuna eklenen güncellemeler. Modelin kodlama kullanımındaki etkisini kaynak duyurudaki kapsam ve erişilebilirlik ayrıntılarıyla değerlendirin.': 'A new release in OpenAI’s model family, with updates to the earlier GPT‑6 announcement. Review the original announcement for scope, availability, and implications for coding workflows.',
    'Kaynak, GPT‑6 ailesinin Sol ve Luna modellerinin tanıtımını ve 29 Eylül tarihli güncelleme notunu içeriyor. Bu kart duyuruyu özetler; yetenek ve erişim ayrıntıları için kaynak metni kontrol edin.': 'The source introduces the GPT‑6 family’s Sol and Luna models and includes a September 29 update. This card summarizes the announcement; check the source for capabilities and access details.',
    'Kubernetes blogu Memory QoS özelliğinin v1.37 ile Beta’ya alındığını ve Linux cgroup v2 sistemlerinde varsayılan olarak etkinleştiğini açıklıyor.': 'The Kubernetes blog says Memory QoS moved to Beta in v1.37 and is enabled by default on Linux cgroup v2 systems.',
    'Pod düzeyindeki bellek hizmet kalitesi desteği Beta aşamasında. v1.37 kubelet’lerinde özellik varsayılan açık olsa da varsayılan yapılandırma throttling veya reservation değerlerini kendiliğinden yazmıyor. Mevcut kümelerde davranışı sürüm notları ve yapılandırma üzerinden doğrulayın.': 'Pod-level memory QoS support is in Beta. Although enabled by default in v1.37 kubelets, the default configuration does not automatically set throttling or reservation values. Verify behavior in your cluster’s release notes and configuration.',
    'GitHub, runner sürüm sonu bilgilerini sorgulayan REST API’yi ve GITHUB_TOKEN için salt okunur vulnerability-alerts iznini duyurdu.': 'GitHub announced a REST API for runner deprecation information and a read-only vulnerability-alerts permission for GITHUB_TOKEN.',
    'Runner yaşam döngüsünü önceden planlamak ve workflow token’ına Dependabot uyarıları için gereken en az izni vermek kolaylaşıyor. Kullanırken güncel API ve izin dokümanına bakın.': 'This helps teams plan runner lifecycles and grant workflow tokens the minimum permission needed for Dependabot alerts. Check current API and permission documentation before use.'
  };

  const reverse = Object.fromEntries(Object.entries(translations).map(([tr, en]) => [en, tr]));
  let locale = 'tr';
  try { locale = localStorage.getItem('realdev-language') === 'en' ? 'en' : 'tr'; } catch (_) {}

  function translate(root) {
    if (!root) return;
    const dict = locale === 'en' ? translations : reverse;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const trimmed = node.nodeValue.trim();
      if (!trimmed) continue;
      let translated = dict[trimmed];
      const progressMatch = trimmed.match(/^(\d+%) (rota|path)$/);
      if (!translated && progressMatch && dict[progressMatch[2]]) translated = `${progressMatch[1]} ${dict[progressMatch[2]]}`;
      if (!translated && trimmed.includes(' · ')) {
        translated = trimmed.split(' · ').map(part => dict[part] || part).join(' · ');
        if (translated === trimmed) translated = null;
      }
      if (!translated || translated === trimmed) continue;
      const leading = node.nodeValue.match(/^\s*/)[0];
      const trailing = node.nodeValue.match(/\s*$/)[0];
      node.nodeValue = leading + translated + trailing;
    }
    if (root.nodeType === Node.ELEMENT_NODE) {
      const elements = [root, ...root.querySelectorAll('[aria-label],[title],input[placeholder],textarea[placeholder]')];
      for (const element of elements) {
        for (const attr of ['aria-label', 'title', 'placeholder']) {
          const value = element.getAttribute?.(attr);
          if (value && dict[value]) element.setAttribute(attr, dict[value]);
        }
      }
    }
  }

  function updateLanguageButton() {
    const button = document.getElementById('languageToggle');
    if (!button) return;
    button.textContent = locale === 'tr' ? 'EN' : 'TR';
    button.title = locale === 'tr' ? 'Switch language to English' : 'Dili Türkçe yap';
    button.setAttribute('aria-label', locale === 'tr' ? 'Switch language to English' : 'Dili Türkçe yap');
  }

  function setLocale(nextLocale) {
    locale = nextLocale;
    window.realdevLocale = locale;
    document.documentElement.lang = locale;
    const title = document.querySelector('title');
    if (title) title.textContent = locale === 'tr' ? 'Real Developer · Yazılım çalışma alanı' : 'Real Developer · Developer workspace';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = locale === 'tr'
      ? 'Kod yazma, hata çözme ve teknik kavramları açıklama becerilerini geliştir.'
      : 'Build your coding, debugging, and technical explanation skills.';
    translate(document.body);
    updateLanguageButton();
    try { localStorage.setItem('realdev-language', locale); } catch (_) {}
  }

  window.realdevLocale = locale;
  window.translateApp = () => translate(document.getElementById('viewRoot'));
  document.addEventListener('DOMContentLoaded', function () {
    setLocale(locale);
    document.getElementById('languageToggle')?.addEventListener('click', function () {
      setLocale(locale === 'tr' ? 'en' : 'tr');
      window.translateApp();
    });
    const observer = new MutationObserver(() => translate(document.body));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  });
})();
