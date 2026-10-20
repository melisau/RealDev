## 15 Ekim 2026 güncellemesi

- Şablonlu Python HTTP/SQLite ve .NET HTTP/SQLite proje teslimleri: ayrı test kapsayıcısı, sekiz kabul testi, kaynak hash/sürüm kontrolü, kalıcı teslim geçmişi ve hesap izolasyonu. Gerçek referanslar 8/8; eksik şablonlar 0/8.
- Python ve .NET proje test servisi kimlik doğrulamalı geçici HTTPS tüneliyle canlı Site ortamına bağlandı. Yetkisiz istek 401; yetkili kapasite kontrolünde iki ortam hazır. Bu bilgisayar/Docker/runner/tünel açıkken çalışır; 7/24 hizmet değildir.
- Unity için dört EditMode/dört PlayMode testi gerçek yerel Editor ile doğrulandı. Canlı öğrenci kodu için lisanslı izole Unity imajı henüz bağlı değil. Yerel referans çalışması canlı doğrulama diye sunulmaz.
- Giriş ve ilk profil kaydından sonra hedef sayfaya dönüş düzeltildi. Kayıt/doğrulama/şifre kurtarma akışlarına sağlayıcı sözleşmesi testleri eklendi; gerçek e-posta teslimatı ayrıca kabul kontrolü gerektirir.
- Başlangıç niyeti ve rol açıklamaları, sonraki adım yönlendirmesi, ipucusuz tekrar gözlemleri eklendi. Kullanıcı çalışması planı FIRST-USE.md içinde; nüfus üzerinde etkinlik kanıtlandığı iddia edilmez.
- /learn ve /en/learn altında toplam 24 kaynaklı özgün makale, ayrı kanonik adresler, dil alternatifleri ve sitemap. Özel sayfalar noindex; veriler sunucu kimlik/hesap denetimiyle korunur.
- Canlı hatırlatıcı servis gönderimi ve veritabanından durum okuması 200 döndü; mevcut bulut görevi kapalı. Etkinleştirilmeden günlük teslimat aktif gösterilmez.

Ayrıntılar: [PROJECT-DELIVERY.md](PROJECT-DELIVERY.md), [FIRST-USE.md](FIRST-USE.md), [REMINDERS.md](REMINDERS.md). Aşağıdaki 8 Ekim envanteri tarihsel durumdur; proje teslimi ve rota eksiklerinin güncel kapsamı yukarıdadır.

# RealDev: doğrulanmış durum ve öncelikler
Kontrol: 8 Ekim 2026. Bu kayıt içerik/kod incelemesi ve testleri ayırır; bağımsız güvenlik denetimi veya uzmanlık sertifikasyonu değildir.

## Bu sürümde
- Hesaba bağlı aktif çalışma süresi ve /calendar takvimi: günlük/aylık süreler, renk skalası, saat dilimi, arka plan/boşta duraklama, dışa aktarma ve silme.
- Üç yeni uygulama projesinde altı özgün görev: .NET sürüm/idempotency, Unity geç yanıt/ödül ledger, SQLite atomik checkout/ödeme olayı. Yerel Piston’da referanslar 5/5, başlangıçlar 0/5 test geçti.
- Giriş ekranında Firebase e-postasıyla şifre kurtarma: e-posta formu, Türkçe/İngilizce mesajlar, tekrar gönderim beklemesi ve girişe dönüş. Gerçek posta kutusuna teslimat ayrıca doğrulanmalı.
- Ana tarama kataloğunda 1.312 soru: 1.059 seçenekli senaryo, 251 hata teşhisi ve 2 güvenli ifade görevi. Ayrı kod/proje katalogları bu toplama dahil değildir.
- 20 Ekim 2026: 1.120 soruluk özgün konu bankası (`server/topic-bank/`) eklendi; 13 alanın her birinde en az 100 soru var (frontend 100, .NET 103, Git 101, SQL 102, Unity 100, DevOps 100, API 100, test 100, veri yapıları 100, AI 100, veri 100, mobil 100, oyun 106). Her soru TR/EN metin, dört seçenek, açıklama ve konuyla eşleşen bir teknik kaynak içerir; kaynak yalnız arka plan referansıdır, metin kopyalanmamıştır.
- Konu bankası denetimi: hesaplamalı/kod okuma cevapları (JavaScript, SQL, Python) çalıştırılarak doğrulandı; kaynak sayfası konuyla uyuşmayan sorular yeniden bağlandı. Kaynak URL'lerinin canlı erişimi bu ortamdan doğrulanamadı; yayından önce link kontrolü yapılmalı.
- Son eklenen 52 özgün sorunun her biri Türkçe/İngilizce metin, dört seçenek, açıklama, ipucu, konu, başlangıç/orta seviye etiketi, biçim ve kontrol tarihli birincil teknik kaynak içerir.
- Yeni sorular mevcut konu araması, kişisel rota, cevap geçmişi, notlar ve kütüphane akışlarını kullanır. Konu etiketleri de aranır.
- Eski soru kimlikleri ve ilk sekiz soruluk tarama korunur. Yeni yanıtlar kendi soru sürümüyle kaydedilir.
- Cevap anahtarı ve açıklama genel soru payload'ına gönderilmez; değerlendirme sunucuda yapılır.
- Ayrı kataloglarda 9 Python/C#/Java görevi, 18 ileri proje görevi, 11 kod incelemesi, 6 ev ödevi, 8 teknik mülakat sorusu ve 7 uzun mülakat rotası bulunur. Sayılar farklı katalogları ifade eder; hepsini bağımsız uzmanlık kanıtı olarak toplamak doğru değildir.

- Hata laboratuvarında 24 yeni özgün senaryo: anlam, kanıt, güvenli düzeltme ve doğrulama geri bildirimi; iki dilde hata araması, alan/seviye filtresi.
- Mülakat ve projelerde tür/alan filtresi; süre kutulu teslim koşulları, gerçek test çıktısı raporu ve değişiklik turu. Yazılı taslaklar AI kullanılmadan hesapta saklanır, beceri kanıtına katılmaz.
- Konu aramasında çözülmemiş sorular önce; son gerçek yanıt doğru/tekrar çalış metni ve renk ile gösterilir. Bilmiyorum olarak geçilen sorular çözülmemiş kalır.
- Mobil üst bar tek satırdır; dil/tema özgün düğmeleri menüye taşınır, çıkış bağlantısı küçülür.

## Soru dağılımı
| Alan | 168 soruluk sürüm | Şimdi |
| --- | ---: | ---: |
| JavaScript / React | 13 | 16 |
| C# / .NET | 13 | 16 |
| Git ve ekip çalışması | 11 | 13 |
| SQL ve veri modeli | 10 | 13 |
| Unity / C# | 14 | 17 |
| DevOps temelleri | 13 | 16 |
| API / HTTP | 10 | 13 |
| Test ve doğrulama | 10 | 11 |
| Veri yapıları | 10 | 10 |
| AI mühendisliği | 16 | 17 |
| Veri mühendisliği | 16 | 17 |
| Mobil geliştirme | 16 | 17 |
| Oyun geliştirme | 16 | 16 |

## Kalan işler
1. **Kalıcı kod çalıştırma hizmeti:** Canlı Piston bağlantısı yerel bilgisayar ve geçici HTTPS tüneli üzerinden denendi. Bilgisayar, Docker, gateway ve tünel açık kalmalı. 7/24 yayın için kalıcı sunucu/adres, sağlık kontrolü ve kapasite planı gerekiyor. Alan adı tek başına bu hizmeti sağlamaz.
2. **Günlük hatırlatıcıların işletimi:** Sites üzerinde “RealDev günlük bildirim gönderimi” zamanlanmış görevi tanımlı fakat kontrol anında kapalı. Bildirim izinleri, abonelikler, sunucu ayarları ve gönderim testinden sonra etkinleştirilmeli; düğmenin varlığı tek başına günlük teslimatı kanıtlamaz.
3. **Ölçüm derinliği:** Son 24 teşhis sorusu da seçenekli biçimdedir; kod okuma ve teşhis içerir ama kullanıcının gerçekten düzeltme yazdığını kanıtlamaz. Gerçek .NET/Unity proje teslimleri, bağımsız testler, farklı uygulamalara aktarım ve açık uçlu yanıtlara uzman incelemesi artırılmalı. Mevcut AI değerlendirmesi geçici kanıt olarak kalmalı.
4. **İçerik yönetimi:** Banka hâlâ kaynak dosyalarından yönetiliyor. Editör onayı, soru hatası bildirimi, sürüm/geçerlilik kuyruğu, pedagojik zorluk kalibrasyonu ve toplu içerik yönetimi için panel gerekiyor. difficulty etiketleri yazar sınıflandırmasıdır; kullanıcı performansından kalibre edilmiş ölçek değildir.
5. **Yayın işletimi doğrulaması:** CI test/build akışı mevcut. Yük testi, yedekten geri yükleme tatbikatı, kesinti uyarıları, Firebase e-posta teslimatı ve gerçek cihaz erişilebilirlik kontrolleri için ayrıca üretim kabul kanıtı toplanmalı. Bu içerik güncellemesi bunların tamamlandığını iddia etmez.
6. **Derin bağlantı geri yükleme (19 Ekim 2026):** Firebase oturumu gecikmeli açıldığında /code-history, /lab, /calendar, /notes ve /account yenilemede kendi adresinde kalıyor; geri/ileri gezinme doğru. Asıl hata /code-history sayfasının doğrudan açılış ve yenilemede kayıtları hiç yüklememesiydi ("Kayıtlı kod denemesi yok"); düzeltildi. Oturum kontrolü sürerken özel sayfalarda genel tanıtım yerine "Oturum kontrol ediliyor…" görünür; oturumu olmayan ziyaretçi özel bağlantıdan returnTo ile girişe yönlendirilir, giriş yapılandırılmamışsa veya ayarlar alınamazsa yönlendirilmez. Doğrulama: yerel önizleme ve sahte gecikmeli Firebase oturumuyla tarayıcı testleri; canlı Firebase hesabıyla uçtan uca kontrol ayrıca yapılmalı.

## Doğrulama
Yeni bankanın iki dilde alan bütünlüğü, kimlik çakışmaları, cevap konumları, kaynak metadatası ve sunucuda değerlendirilmesi test edilir. SQL NULL/LEFT JOIN sonuçları bağımsız SQLite verisiyle; JavaScript varsayılan değer sonucu doğrudan kod çalıştırılarak kontrol edilir. Rota, kaydedilen sürüm/notlar ve kullanıcılar arası veri izolasyonu için entegrasyon testleri vardır. Bu kontroller her açıklamanın pedagojik kalitesini otomatik kanıtlamaz.

Son 52 soruda kaynak lisansı, lisans URL’si, kontrol tarihi ve “özgün içerik / yalnız teknik referans” ayrımı saklanır. Lisans kaydı içeriğin hukuki veya pedagojik uygunluğunu kendiliğinden kanıtlamaz. İnsan editör incelemesi ve teknoloji sürümü değiştikçe yeniden kontrol gerekir.

Kaynak politikası ve lisans ayrımı: [CONTENT-SOURCES.md](CONTENT-SOURCES.md). Yeni özgün bankanın tam kaynak URL'leri her soruda saklanır.
