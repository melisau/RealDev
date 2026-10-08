# RealDev: doğrulanmış durum ve öncelikler
Kontrol: 8 Ekim 2026. Bu kayıt içerik/kod incelemesi ve testleri ayırır; bağımsız güvenlik denetimi veya uzmanlık sertifikasyonu değildir.

## Bu sürümde
- Hesaba bağlı aktif çalışma süresi ve /calendar takvimi: günlük/aylık süreler, renk skalası, saat dilimi, arka plan/boşta duraklama, dışa aktarma ve silme.
- Üç yeni uygulama projesinde altı özgün görev: .NET sürüm/idempotency, Unity geç yanıt/ödül ledger, SQLite atomik checkout/ödeme olayı. Yerel Piston’da referanslar 5/5, başlangıçlar 0/5 test geçti.
- Giriş ekranında Firebase e-postasıyla şifre kurtarma: e-posta formu, Türkçe/İngilizce mesajlar, tekrar gönderim beklemesi ve girişe dönüş. Gerçek posta kutusuna teslimat ayrıca doğrulanmalı.
- Ana tarama kataloğunda 192 soru: 134 seçenekli senaryo, 56 hata teşhisi ve 2 güvenli ifade görevi. Ayrı kod/proje katalogları bu toplama dahil değildir.
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
6. **Derin bağlantı geri yükleme:** Önceki canlı kontrolde /code-history yenilendiğinde kimlik doğrulama sonrasında Bugün görünümüne düşme gözlendi. Doğrudan URL, yenileme ve geri/ileri gezinme için giriş sonrası rota geri yüklemesi ayrıca düzeltilip uçtan uca doğrulanmalı.

## Doğrulama
Yeni bankanın iki dilde alan bütünlüğü, kimlik çakışmaları, cevap konumları, kaynak metadatası ve sunucuda değerlendirilmesi test edilir. SQL NULL/LEFT JOIN sonuçları bağımsız SQLite verisiyle; JavaScript varsayılan değer sonucu doğrudan kod çalıştırılarak kontrol edilir. Rota, kaydedilen sürüm/notlar ve kullanıcılar arası veri izolasyonu için entegrasyon testleri vardır. Bu kontroller her açıklamanın pedagojik kalitesini otomatik kanıtlamaz.

Son 52 soruda kaynak lisansı, lisans URL’si, kontrol tarihi ve “özgün içerik / yalnız teknik referans” ayrımı saklanır. Lisans kaydı içeriğin hukuki veya pedagojik uygunluğunu kendiliğinden kanıtlamaz. İnsan editör incelemesi ve teknoloji sürümü değiştikçe yeniden kontrol gerekir.

Kaynak politikası ve lisans ayrımı: [CONTENT-SOURCES.md](CONTENT-SOURCES.md). Yeni özgün bankanın tam kaynak URL'leri her soruda saklanır.
