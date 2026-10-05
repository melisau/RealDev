# Gerçek Geliştirici

Türkçe, web ve mobil ekrana uyumlu yazılım çalışma alanı. Ürün fikri; AI ile kod üretirken geliştiricinin kodu açıklama, hata ayıklama, teknik karar verme ve mülakat pratiği becerilerini de geliştirmesine yardımcı olmak.

## Ürün hedefi

Kullanıcı bir rol veya birden fazla öğrenme hedefi seçer. Uygulama önce kısa görevlerle başlangıç becerilerini keşfeder; sonra bağımsız çözme, açıklama, hata teşhisi ve yeni duruma aktarma görevleriyle kişisel çalışma planını günceller. Tek bir doğru cevap uzmanlık kanıtı sayılmaz. Henüz ölçülmemiş alanlar “ölçülmedi” olarak kalır.

## İlk çalışma alanları

- **Bugün:** Günlük kısa çalışma rotası ve ilerleme özeti.
- **Beceri haritası:** Frontend, backend, veritabanı, Git, test, DevOps/cloud, Unity ve AI ile çalışma alanları.
- **Hata laboratuvarı:** IDE/SDK, derleme, çalışma zamanı, API, veritabanı, Git, Unity, build ve deployment hata senaryoları.
- **Kavram atölyesi:** CLR, DDD, Kubernetes, DDL ve .NET Aspire için kaynaklı açıklama, örnek ve kullanıcının kendi cümlesiyle anlatma alanı.
- **GitHub pratiği:** Branch, commit, pull request, merge conflict, GitHub Actions ve workflow hata ayıklama.
- **Yazılım haberleri:** Yayın tarihi, türü, kaynak bağlantısı ve açılıp kapanabilen kısa özet.
- **Yazılı ve sesli anlatım:** Cevap yazma veya tarayıcı destekliyorsa Türkçe ses tanımayı kullanma.

İlk kullanıcı profili full stack geliştirici; JavaScript, TypeScript, React, Java, Python, C, C#/.NET ve Unity ile mobil oyun geliştirme deneyimine sahip. Öncelik genel eksikleri kapatmak.

## Bilginin doğruluğu ve güncelliği

1. Sürüm, API, platform davranışı ve haber iddialarında ilk kaynak resmi dokümantasyon, changelog veya proje duyurusudur.
2. Medium, Stack Overflow ve benzeri topluluk kaynakları deneyim ve örnek bulmak için kullanılabilir. Bunlar resmi bilgi gibi sunulmadan önce birincil kaynakla karşılaştırılır.
3. İçerik kartı kaynak bağlantısını ve kontrol/yayın tarihini gösterir. Kaynaktan doğrulanamayan ayrıntı kesin bilgi gibi yazılmaz.
4. Değişken bilgiler temel kavramlardan ayrılır. Haber kartları canlı akış değilse bu durum açıkça belirtilir.
5. AI değerlendirmesi gerekirse, kullanıcı yanıtına kanıta dayalı geribildirim verir; belirsiz durumda kesin puan uydurmaz. Kaynak ve teknik sürüm gösterilir.

## İlk sürümün teknik sınırları

Mevcut prototip statik HTML/CSS/JavaScript’tir ve telefon ekranına uyum sağlar. Gezinme, örnek görevler, seçenekli tarama, hata senaryosu, kaynak bağlantılı kavramlar, haber özeti aç/kapat, yerel ilerleme saklama ve tarayıcı desteklerse sesli yazma etkileşimlidir.

- İlerleme ve görev durumu bu tarayıcıdaki `localStorage` içinde tutulur.
- Haber listesi **5 Ekim 2026 tarihinde kontrol edilmiş sabit örnek içeriktir**, canlı olarak yenilenmez.
- Haber özeti editoryal örnektir; orijinal kaynağa bağlantı her zaman sunulur.
- Kavram açıklamalarındaki kullanıcı yanıtı sunucuya gönderilmez. Otomatik AI teknik değerlendirmesi henüz bağlı değildir.
- Hatırlatıcı, tam profil düzenleme/senkronizasyonu, gerçek ses kaydı ve mikrofon desteklemeyen tarayıcılar için STT servisi henüz bağlı değildir.
- Gerçek çok kullanıcılı beceri profili ve güvenilir haber güncelleme servisi için backend, kaynak güncelleme akışı, kaynak doğrulama ve erişilebilirlik çalışması gerekir.

## Prototipi çalıştırma

`dist/index.html` dosyasını yerel bir HTTP sunucusuyla aç. JavaScript sözdizimi `node --check dist/app.js` ile denetlenebilir.

## İlk örneklerde kullanılan kaynaklar

- [Microsoft Learn: CLR overview](https://learn.microsoft.com/en-us/dotnet/standard/clr)
- [Microsoft Learn: .NET Aspire overview](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview)
- [PostgreSQL: Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [Kubernetes: Concepts overview](https://kubernetes.io/docs/concepts/overview/)
- [Git: git-merge documentation](https://git-scm.com/docs/git-merge)
- [GitHub Changelog: September 2026 Actions updates](https://github.blog/changelog/2026-09-03-github-actions-early-september-2026-updates/)
- [Kubernetes Blog: Memory QoS Beta](https://kubernetes.io/blog/2026/09/14/kubernetes-v1-37-memory-qos-graduates-to-beta/)
- [OpenAI API Changelog](https://developers.openai.com/api/docs/changelog)
