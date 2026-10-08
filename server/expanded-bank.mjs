// Original bilingual scenarios grounded in primary documentation, not imported quizzes.
import {originalReference} from './content-policy.mjs';
const bi=(tr,en)=>({tr,en});
const roots={mdn:'https://developer.mozilla.org/en-US/docs/',react:'https://react.dev/learn/',dotnet:'https://learn.microsoft.com/en-us/dotnet/',git:'https://git-scm.com/docs/',postgres:'https://www.postgresql.org/docs/current/',unity:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/',kubernetes:'https://kubernetes.io/docs/concepts/',docker:'https://docs.docker.com/',python:'https://docs.python.org/3/',sklearn:'https://scikit-learn.org/stable/',arrow:'https://arrow.apache.org/docs/',kafka:'https://kafka.apache.org/',airflow:'https://airflow.apache.org/docs/',android:'https://developer.android.com/',godot:'https://docs.godotengine.org/en/stable/'};
const rows=[];
function q(id,area,provider,path,title,prompt,code,options,explain,format='scenario'){
 rows.push({id,area,provider,path,title,prompt,code,options,explain,format});
}
q('js-shallow-copy','frontend','mdn','Glossary/Shallow_copy',
 ['Kopya hangi nesneyi paylaşıyor?','Which object does the copy share?'],
 ['Bu koddan sonra original.profile.level kaç olur?','After this code, what is original.profile.level?'],
 'const original = { profile: { level: 1 } };\nconst copy = { ...original };\ncopy.profile.level = 2;',
 [['2; içteki profile nesnesi ortaktır.','2; the nested profile object is shared.'],['1; spread tüm derinlikleri kopyalar.','1; spread copies every depth.'],['undefined; copy orijinali siler.','undefined; copy deletes the original.'],['TypeError; spread ile oluşan nesne donmuştur.','TypeError; spreading freezes the copy.']],
 ['Spread burada sığ kopya üretir. Dış nesneler farklıdır, ancak profile aynı referanstır. İç alanı değiştirmek her iki dış nesneden de görülür.','Spread makes a shallow copy here. The outer objects differ, but profile is the same reference. Mutating its field is visible through both outer objects.'],'code-reading');
q('js-numeric-sort','frontend','mdn','Web/JavaScript/Reference/Global_Objects/Array/sort',
 ['Sıralama kaynak diziyi değiştirmesin','Sort without changing the source array'],
 ['values sayısal artan sıralanacak ama orijinal dizi korunacak. Hangi kod iki koşulu da sağlar?','Sort values numerically ascending while preserving the original array. Which code meets both conditions?'],
 'const values = [12, 3, 40];',
 [['const sorted = [...values].sort((a, b) => a - b);','const sorted = [...values].sort((a, b) => a - b);'],['const sorted = values.sort();','const sorted = values.sort();'],['const sorted = values.sort((a, b) => a - b);','const sorted = values.sort((a, b) => a - b);'],['const sorted = [...values].sort();','const sorted = [...values].sort();']],
 ['sort diziyi değiştirir; karşılaştırıcı verilmezse değerleri metin olarak sıralar. Önce sığ dizi kopyası almak ve sayısal karşılaştırıcı kullanmak iki gereksinimi karşılar.','sort mutates the array and defaults to string ordering. Copying the array first and supplying a numeric comparator meets both requirements.'],'code-reading');
q('react-derived-cost','frontend','react','you-might-not-need-an-effect',
 ['Teklif toplamını mevcut state’ten üret','Derive a quote total from existing state'],
 ['Teklif ekranında quantity ve unitCents state içinde. totalCents yalnız bunların çarpımı; bağımsız düzenlenmiyor ve dış sistemle senkronize edilmiyor. Nasıl üretirsin?','A quote screen stores quantity and unitCents in state. totalCents is only their product, never independently edited or synchronized with an external system. How should it be produced?'],
 '',
 [['Render sırasında quantity * unitCents hesapla.','Compute quantity * unitCents during render.'],['Üçüncü state ve onu güncelleyen effect zorunludur.','A third state field and an effect updating it are required.'],['Fiyat ve adedi React dışında global değişkene taşı.','Move price and quantity to a global variable outside React.'],['totalCents değerini sadece ilk render’da hesaplayıp sabitle.','Compute totalCents on the first render and keep it fixed.']],
 ['Bu değer mevcut state’ten hesaplanabilir. Ayrı state/effect eklemek gereksiz ikinci güncelleme ve tutarsızlık riski doğurur; bu örnekte render hesabı yeterlidir.','This value is derivable from existing state. Separate state and an effect add an unnecessary update and risk inconsistency; a render calculation suffices here.']);
q('html-cancel-submit','frontend','mdn','Web/HTML/Reference/Elements/button',
 ['İptal düğmesi formu gönderiyor','The cancel button submits the form'],
 ['Formdaki İptal düğmesi yalnız paneli kapatmalı. Tıklanınca submit de tetikleniyor. Doğrudan düzeltme hangisi?','The Cancel button in a form should only close the panel, but clicking it also submits. What is the direct fix?'],
 '<form>\n  <button onClick={closePanel}>İptal</button>\n  <button type="submit">Kaydet</button>\n</form>',
 [['İptal düğmesine type="button" ekle.','Add type="button" to Cancel.'],['İptal düğmesine type="submit" ekle.','Add type="submit" to Cancel.'],['İptal yazısını İngilizce yap.','Translate the Cancel label into English.'],['Kaydet düğmesinin type niteliğini kaldır.','Remove the type attribute from Save.']],
 ['Formla ilişkili, type belirtilmemiş bir button normalde submit davranışı taşır. type="button" panel kapatma eylemini form gönderiminden ayırır.','A form-associated button without an explicit type normally submits. type="button" separates closing the panel from submitting the form.'],'diagnosis');
q('cs-string-immutable','dotnet','dotnet','csharp/language-reference/builtin-types/reference-types#the-string-type',
 ['Metin değişimi diğer değişkeni etkiler mi?','Does changing a string affect another variable?'],
 ['Koddan sonra b hangi metni tutar?','After the code, which string does b hold?'],
 'string a = "cat";\nstring b = a;\na += "s";',
 [['cat; a yeni bir string değerine bağlanır.','cat; a is assigned a new string value.'],['cats; string yerinde büyütülür.','cats; the string grows in place.'],['null; eski referans geçersiz olur.','null; the old reference becomes invalid.'],['Derleme hatası; string birleştirilemez.','Compile error; strings cannot be concatenated.']],
 ['C# string değerleri değiştirilemez. Birleştirme yeni değer oluşturup a’ya atar; b önceki cat değerini tutar.','C# strings are immutable. Concatenation creates a new value assigned to a; b retains the previous cat value.'],'code-reading');
q('linq-deferred-list','dotnet','dotnet','standard/linq/deferred-execution-lazy-evaluation',
 ['Sorgu ne zaman listeyi okuyor?','When does the query read the list?'],
 ['Tek thread’de aşağıdaki kod çalışıyor. ToArray sonucu hangisidir?','This code runs on one thread. What does ToArray return?'],
 'var values = new List<int> { 1, 2 };\nvar query = values.Where(n => n > 1);\nvalues.Add(3);\nvar result = query.ToArray();',
 [['[2, 3]; Where daha sonra enumerate edilir.','[2, 3]; Where is enumerated later.'],['[2]; sorgu tanımı otomatik snapshot alır.','[2]; defining the query takes a snapshot.'],['[1, 2, 3]; Where koşulu uygulanmaz.','[1, 2, 3]; Where is ignored.'],['Her zaman exception; sorgu tanımından sonra liste değişemez.','Always an exception; the list cannot change after defining a query.']],
 ['Where ertelenmiş yürütülür; bu örnekte enumerate eden ToArray güncel listeyi okur. Tanım anında snapshot istenirse o noktada ToList/ToArray gerekir. Enumerasyon sırasında değişiklik yapmak ayrı bir sorundur.','Where uses deferred execution; ToArray enumerates the current list here. For a snapshot at definition time, materialize there with ToList/ToArray. Mutation during enumeration is a different issue.'],'code-reading');
q('cs-tryparse-result','dotnet','dotnet','api/system.int32.tryparse',
 ['Geçersiz sayı girişini yakala','Handle invalid numeric input'],
 ['Kullanıcı abc giriyor. TryParse kullanırken doğru kontrol hangisidir?','The user enters abc. What is the correct check when using TryParse?'],
 'bool ok = int.TryParse(input, out int quantity);',
 [['ok false ise geçerli sayı istenmeli; quantity geçerli kullanıcı girdisi sayılmamalı.','If ok is false, request a valid number; do not treat quantity as valid user input.'],['quantity 0 ise parse mutlaka başarılıdır.','If quantity is 0, parsing necessarily succeeded.'],['TryParse her hatalı metinde FormatException atar.','TryParse throws FormatException for every malformed string.'],['ok değerini yok sayıp siparişi quantity ile kaydet.','Ignore ok and save the order with quantity.']],
 ['TryParse başarısını bool ile bildirir. Bu geçersiz girişte false ve 0 döner; 0 aynı zamanda geçerli bir giriş de olabileceği için sonucu bool üzerinden kontrol et.','TryParse reports success as a bool. This invalid input produces false and 0; since 0 can also be a valid input, check the bool.'],'diagnosis');
q('dotnet-whenall','dotnet','dotnet','api/system.threading.tasks.task.whenall',
 ['Bağımsız iki I/O işlemini bekle','Await two independent I/O operations'],
 ['İki bağımsız HTTP isteği Task olarak zaten başlatıldı. İkisi de tamamlanmadan sonucu üretmemek için ne kullanırsın?','Two independent HTTP requests have already been started as Tasks. How do you wait for both before producing the result?'],
 'Task<User> userTask = LoadUserAsync();\nTask<Order[]> ordersTask = LoadOrdersAsync();',
 [['await Task.WhenAll(userTask, ordersTask); ardından sonuçları ve hata durumunu yönet.','await Task.WhenAll(userTask, ordersTask); then handle results and errors.'],['Thread.Sleep(100); iki isteğin tamamlanması garanti olur.','Thread.Sleep(100); both requests are guaranteed complete.'],['Task.WhenAny kullan; ilk tamamlanma ikisini de bekler.','Use Task.WhenAny; the first completion waits for both.'],['WhenAll ağ işlemlerini atomik transaction’a dönüştürür.','WhenAll converts the requests into an atomic transaction.']],
 ['WhenAll verilen görevlerin tamamlanmasını temsil eden Task üretir; hata/iptal sonucunu da ele almak gerekir. Yeni thread, işlem sırası veya yan etkiler için rollback garantisi vermez.','WhenAll returns a Task representing completion of all supplied tasks; faults and cancellation still need handling. It does not guarantee new threads, ordering or rollback of side effects.']);

q('git-unstage-keep','git','git','git-restore',
 ['Stage’den çıkar, düzenlemeyi koru','Unstage while retaining the edit'],
 ['Tracked file.txt değiştirildi ve git add yapıldı. Düzenlemeyi diskte tutup yalnız stage’den çıkarmak için hangi komut uygundur?','Tracked file.txt was edited and added. Which command unstages it while keeping the edit on disk?'],
 '',
 [['git restore --staged file.txt','git restore --staged file.txt'],['git restore --worktree file.txt','git restore --worktree file.txt'],['git reset --hard HEAD','git reset --hard HEAD'],['git clean -fd','git clean -fd']],
 ['--staged varsayılan olarak index’i HEAD’den geri yükler, çalışma ağacını değiştirmez. Diğer seçenekler bu gereksinimi karşılamaz ve bazıları çalışmayı silebilir.','--staged restores the index from HEAD by default without changing the working tree. The other options do not meet this requirement and some can discard work.']);
q('git-stash-untracked','git','git','git-stash',
 ['Yeni dosya stash’e dahil olsun','Include a new file in a stash'],
 ['Tracked düzenlemelerin yanında henüz git add yapılmamış, ignore edilmeyen notes.txt var. İkisini de geçici saklamak için ne gerekir?','Alongside tracked edits, notes.txt is untracked and not ignored. How do you temporarily stash both?'],
 '',
 [['git stash push -u','git stash push -u'],['git stash push; untracked dosyalar her zaman dahildir.','git stash push; untracked files are always included.'],['git fetch --all','git fetch --all'],['git restore --staged notes.txt','git restore --staged notes.txt']],
 ['-u/--include-untracked, izlenmeyen dosyaları da stash’e dahil eder. Ignore edilen dosyalar bu seçeneğe dahil değildir; senaryoda dosya ignore edilmiyor.','-u/--include-untracked includes untracked files. Ignored files are excluded by this option; this scenario explicitly uses a non-ignored file.']);
q('git-conflict-resolve','git','git','git-merge',
 ['Çakışma işaretlerini çöz','Resolve conflict markers'],
 ['Merge aynı fonksiyonda conflict üretti. Her iki dalın gereksinimi korunmalı. Sonraki güvenli adım hangisi?','A merge conflicts in one function. Both branches contain requirements that must be preserved. What is the next safe step?'],
 '<<<<<<< HEAD\nreturn price;\n=======\nreturn discountedPrice;\n>>>>>>> feature',
 [['İki değişikliğin amacını incele, ortak çözümü yazıp işaretleri kaldır, test et ve git add sonrası merge’i tamamla.','Inspect both changes, implement a combined resolution, remove markers, test and git add before completing the merge.'],['İşaretlerle birlikte commit et; Git çalışırken bir tarafı seçer.','Commit the markers; Git chooses a side at runtime.'],['Her conflict’te koşulsuz theirs seç.','Always choose theirs for every conflict.'],['Dosyayı sil; conflict çözüldüğü için davranış korunur.','Delete the file; resolving the conflict preserves behavior.']],
 ['Git metinsel çakışmayı işaretler; iş gereksinimlerini uzlaştıramaz. Çözümü geliştirici doğrular ve stage’e alır. İşaretlerin silinmesi tek başına davranışın doğru olduğunu kanıtlamaz.','Git marks textual conflicts but cannot reconcile business requirements. The developer validates and stages a resolution. Removing markers alone does not prove correct behavior.'],'diagnosis');
q('git-rebase-ids','git','git','git-rebase',
 ['Rebase sonrası commit kimliği','Commit identity after a rebase'],
 ['Yalnız sende bulunan feature commit’lerini güncel main üzerine rebase edeceksin. Kimlikler ve ekip açısından doğru beklenti hangisi?','You will rebase unpublished feature commits onto updated main. What should you expect about commit identities and collaboration?'],
 '',
 [['Commit’ler yeni ebeveynle yeniden üretilebilir ve SHA’ları değişir; paylaşılan geçmişte ekip koordinasyonu gerekir.','Commits can be recreated with a new parent and new SHAs; shared history requires team coordination.'],['İçerik aynıysa ebeveyn değişse de SHA kesinlikle aynı kalır.','Identical content guarantees the same SHA even with a different parent.'],['Rebase uzak dalı otomatik ve koşulsuz force push eder.','Rebase automatically force pushes the remote branch.'],['Rebase yalnız dosya adlarını değiştirir.','Rebase only renames files.']],
 ['Commit kimliği ebeveyn dahil metadata’ya bağlıdır. Rebase commit’leri yeni tabanda yeniden oynatır; bu nedenle başkalarının kullandığı geçmişi değiştirmek ayrıca koordinasyon gerektirir.','A commit identity depends on metadata including its parent. Rebase replays commits on a new base, so rewriting history used by others requires coordination.']);
q('sql-having-groups','sql','postgres','tutorial-agg.html',
 ['Grupları toplamlarına göre süz','Filter groups by their aggregate'],
 ['Her customer_id için en az üç siparişi olan müşterileri bulacaksın. Hangi sorgu uygundur?','Find customers with at least three orders per customer_id. Which query is appropriate?'],
 '',
 [['SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3;','SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3;'],['SELECT customer_id FROM orders WHERE COUNT(*) >= 3 GROUP BY customer_id;','SELECT customer_id FROM orders WHERE COUNT(*) >= 3 GROUP BY customer_id;'],['SELECT customer_id FROM orders LIMIT 3;','SELECT customer_id FROM orders LIMIT 3;'],['SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) = 1;','SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) = 1;']],
 ['WHERE gruplamadan önce satırları, HAVING gruplama sonrası grupları süzer. En az üç için COUNT(*) >= 3 koşulu gerekir.','WHERE filters rows before grouping; HAVING filters groups after grouping. At least three requires COUNT(*) >= 3.']);
q('sql-count-null','sql','postgres','functions-aggregate.html',
 ['Satır sayısı ile dolu değer sayısı','Row count versus non-null count'],
 ['Üç satırın nickname değerleri sırasıyla Ada, NULL, Lin. COUNT(*) ve COUNT(nickname) ne döner?','Three rows have nickname values Ada, NULL and Lin. What do COUNT(*) and COUNT(nickname) return?'],
 'SELECT COUNT(*), COUNT(nickname) FROM users;',
 [['3 ve 2','3 and 2'],['2 ve 2','2 and 2'],['3 ve 3','3 and 3'],['NULL ve 2','NULL and 2']],
 ['COUNT(*) tüm satırları; COUNT(ifade) yalnız NULL olmayan ifade değerlerini sayar. Boş metin ile NULL aynı değer değildir.','COUNT(*) counts all rows; COUNT(expression) counts non-null expression values. An empty string is not the same as NULL.'],'code-reading');
q('postgres-unique-null','sql','postgres','ddl-constraints.html',
 ['PostgreSQL UNIQUE ve NULL','PostgreSQL UNIQUE and NULL'],
 ['PostgreSQL 18’de email TEXT UNIQUE var; NOT NULL veya NULLS NOT DISTINCT belirtilmedi. İki ayrı satırda email NULL olabilir mi?','In PostgreSQL 18, email is TEXT UNIQUE without NOT NULL or NULLS NOT DISTINCT. Can two different rows have NULL email?'],
 '',
 [['Evet; varsayılan UNIQUE denetimi NULL değerleri farklı sayar.','Yes; default UNIQUE checks treat null values as distinct.'],['Hayır; UNIQUE aynı zamanda NOT NULL demektir.','No; UNIQUE also means NOT NULL.'],['İkinci NULL otomatik boş metne çevrilir.','The second NULL automatically becomes an empty string.'],['UNIQUE yalnız SELECT sırasında uygulanır.','UNIQUE is enforced only during SELECT.']],
 ['PostgreSQL varsayılan UNIQUE davranışında birden fazla NULL kabul edilebilir. İstenen sözleşmeye göre NOT NULL veya NULLS NOT DISTINCT ayrıca seçilir; diğer veritabanlarının davranışı varsayılmamalıdır.','Default PostgreSQL UNIQUE behavior permits multiple nulls. Choose NOT NULL or NULLS NOT DISTINCT separately according to the contract; do not assume other databases behave identically.']);
q('sql-order-identifier','sql','postgres','libpq-exec.html#LIBPQ-PQEXECPARAMS',
 ['Sıralama sütununu güvenle seç','Select a sort column safely'],
 ['API sort=name veya sort=created_at kabul ediyor. PostgreSQL parametreleri değerler içindir. ORDER BY sütununu nasıl seçersin?','An API accepts sort=name or sort=created_at. PostgreSQL parameters represent values. How do you choose the ORDER BY column?'],
 '',
 [['İzinli anahtarları sabit SQL sütunlarına eşleştir; diğer değerleri reddet ve veri değerlerini parametreleştir.','Map allowlisted keys to fixed SQL columns; reject others and parameterize data values.'],['ORDER BY $1 ile kullanıcı metni otomatik identifier olur.','ORDER BY $1 automatically turns user text into an identifier.'],['Kullanıcı metnini doğrudan SQL sonuna ekle.','Append user text directly to SQL.'],['Sadece tarayıcıdaki dropdown seçeneklerine güven.','Trust only the options in the browser dropdown.']],
 ['Değer parametresi SQL söz dizimi veya sütun adı yerine geçmez. Sunucudaki sabit allowlist, kullanıcı metnini SQL kodu olarak birleştirmeden sütun seçimini sağlar.','A value parameter does not substitute SQL syntax or a column identifier. A fixed server-side allowlist chooses the column without concatenating user text as SQL code.']);

q('unity-rigidbody-interpolation','unity','unity','Rigidbody-interpolation.html',
 ['Fizik nesnesi ekranda titriyor','A physics object jitters on screen'],
 ['Unity 6’da Rigidbody fizik adımları doğru ama yüksek render hızında hareket basamaklı görünüyor. Interpolation hangi amaca hizmet eder?','In Unity 6, Rigidbody physics steps are correct but motion looks stepped at a higher render rate. What does interpolation do?'],
 '',
 [['Fizik adımları arasındaki görüntülenen pozu yumuşatır; fizik simülasyon hızını artırmaz.','Smooths the displayed pose between physics steps; it does not increase simulation frequency.'],['Her render karesinde ek fizik adımı garanti eder.','Guarantees an extra physics step per rendered frame.'],['Tüm collision hatalarını ortadan kaldırır.','Eliminates all collision errors.'],['Rigidbody’yi otomatik kinematic yapar.','Automatically makes the Rigidbody kinematic.']],
 ['Interpolation görsel hareketi fizik pozlarından tahmin ederek yumuşatır; fizik hesabının sıklığı ayrı ayardır. Görsel iyileştirme, collision doğruluğunun kanıtı değildir.','Interpolation smooths visual motion using physics poses; simulation frequency is configured separately. Visual improvement does not prove collision correctness.'],'diagnosis');
q('unity-unscaled-wait','unity','unity','WaitForSecondsRealtime.html',
 ['Duraklatılmış oyunda UI zamanlayıcısı','A UI timer while the game is paused'],
 ['Unity 6’da Time.timeScale = 0. Duraklatma menüsünde iki gerçek saniye sonra mesaj kaybolmalı. Coroutine ne beklemeli?','In Unity 6, Time.timeScale = 0. A pause-menu message must disappear after two real seconds. What should the coroutine yield?'],
 '',
 [['new WaitForSecondsRealtime(2)','new WaitForSecondsRealtime(2)'],['new WaitForSeconds(2)','new WaitForSeconds(2)'],['Time.deltaTime ikiye eşit olana kadar bekle.','Wait until Time.deltaTime equals two.'],['Zamanlayıcı için her kare timeScale’i iki katına çıkar.','Double timeScale every frame for the timer.']],
 ['WaitForSecondsRealtime ölçeklenmemiş zamanı kullanır. WaitForSeconds ölçeklenmiş zamana bağlı olduğu için timeScale sıfırken bekleme ilerlemez.','WaitForSecondsRealtime uses unscaled time. WaitForSeconds depends on scaled time, so its wait does not progress while timeScale is zero.']);
q('unity-shared-material','unity','unity','Renderer-sharedMaterial.html',
 ['Bir düşmanın rengi hepsini değiştirdi','Recoloring one enemy changes all of them'],
 ['Unity 6’da aynı materyali kullanan düşmanlardan birinde sharedMaterial.color değiştirildi. Diğerleri de değişti. Neden?','In Unity 6, sharedMaterial.color is changed on one of several enemies sharing a material. The others change too. Why?'],
 'renderer.sharedMaterial.color = Color.red;',
 [['Paylaşılan materyal değiştirildi; tek nesne için uygun instance veya desteklenen bir property override kullanmalısın.','The shared material was modified; use a suitable instance or supported property override for one object.'],['Her Renderer materyali otomatik derin kopyalar.','Every Renderer automatically deep-copies materials.'],['Bu yalnız bir kamera hatasıdır.','This is only a camera error.'],['sharedMaterial sadece local değişkeni etkiler.','sharedMaterial affects only a local variable.']],
 ['sharedMaterial ortak materyal referansıdır. Nesneye özel görünümde materyal instance ömrünü veya shader/render pipeline ile uyumlu property override yaklaşımını yönetmek gerekir.','sharedMaterial references a shared material. For per-object appearance, manage a material instance lifetime or a property override supported by the shader and render pipeline.'],'diagnosis');
q('unity-raycast-hit','unity','unity','Physics.Raycast.html',
 ['Raycast hiçbir şeye çarpmadı','The raycast hit nothing'],
 ['Unity 6 kodu boş alana bakarken NullReferenceException üretiyor. İlk düzeltme hangisi?','This Unity 6 code throws NullReferenceException when looking at empty space. What should be fixed first?'],
 'Physics.Raycast(origin, direction, out RaycastHit hit, 10f);\nDebug.Log(hit.collider.name);',
 [['Raycast bool sonucunu kontrol et; collider’a yalnız başarılı vuruşta eriş.','Check the Raycast bool result; access the collider only after a successful hit.'],['Menzili sonsuz yap; her ışın mutlaka çarpar.','Use infinite range; every ray must hit.'],['hit değişkenini her kare static yap.','Make hit static every frame.'],['Exception’ı yut ve hit.collider.name okumaya devam et.','Swallow the exception and continue reading hit.collider.name.']],
 ['Raycast false döndüğünde geçerli bir collider vuruşu yoktur. out değişkeninin var olması, içindeki referansın geçerli olduğunu kanıtlamaz.','A false Raycast result means no valid collider hit. Having an out variable does not prove its reference is valid.'],'diagnosis');
q('k8s-secret-base64','devops','kubernetes','configuration/secret/',
 ['Base64 bir şifreleme mi?','Is base64 encryption?'],
 ['Kubernetes Secret içindeki data alanı base64 metin. Bu tek başına gizliliği sağlar mı?','The data field in a Kubernetes Secret contains base64 text. Does that alone provide confidentiality?'],
 '',
 [['Hayır; base64 kodlamadır. Erişimi RBAC ile sınırla ve depolamada şifreleme gibi korumaları ayrıca yapılandır.','No; base64 is encoding. Restrict access with RBAC and configure protections such as encryption at rest separately.'],['Evet; base64 anahtarsız çözülemez.','Yes; base64 cannot be decoded without a key.'],['Secret adı kullanan tüm kullanıcılardan veriyi otomatik gizler.','Naming it Secret automatically hides the data from every user.'],['Gizlilik için Secret’ı loga basmak gerekir.','Print the Secret in logs to ensure confidentiality.']],
 ['Base64 kolayca geri çevrilebilir. Secret nesne türü erişim ve depolama güvenliğinin yerine geçmez; en az yetki ve cluster güvenlik ayarları gerekir.','Base64 is easily reversible. The Secret object type does not replace access and storage security; least privilege and cluster security configuration are required.']);
q('docker-layer-cache','devops','docker','build/cache/optimize/',
 ['Kod değişince bağımlılık kurulumu tekrarlanıyor','A code edit reinstalls dependencies'],
 ['Node imajında her kaynak kodu değişikliği npm ci katmanını bozuyor. Hangi Dockerfile sırası cache kullanımını iyileştirir?','Every source edit invalidates npm ci in a Node image. Which Dockerfile order improves cache reuse?'],
 'COPY . .\nRUN npm ci\nRUN npm run build',
 [['Önce package.json ve lock dosyasını kopyala, npm ci çalıştır, sonra kaynak dosyalarını kopyala.','Copy package.json and the lockfile first, run npm ci, then copy source files.'],['Lock dosyasını sil; her build aynı bağımlılıkları seçer.','Delete the lockfile; every build selects identical dependencies.'],['Her build’de --no-cache kullan.','Use --no-cache for every build.'],['npm ci komutunu iki kez arka arkaya çalıştır.','Run npm ci twice in a row.']],
 ['Katman girdisi değişirse o katman ve sonraki katmanların cache’i geçersiz olur. Bağımlılık manifestlerini önce ayırmak, yalnız uygulama kodu değiştiğinde kurulum katmanını koruyabilir.','Changing a layer input invalidates that layer and later cached layers. Separating dependency manifests first can preserve the installation layer when only app code changes.'],'diagnosis');
q('k8s-service-selector','devops','kubernetes','services-networking/service/',
 ['Service çalışan Pod’u bulamıyor','A Service cannot find a running Pod'],
 ['Pod Ready ve app=api etiketli. Service selector app=web. Yönetilen EndpointSlice içinde bu Pod görünmüyor. Önce neyi düzeltirsin?','A Ready Pod has app=api. The Service selector is app=web. The managed EndpointSlice does not include this Pod. What should you fix first?'],
 '',
 [['Service selector ile hedef Pod etiketini eşleştir ve endpoint oluştuğunu doğrula.','Match the Service selector to the intended Pod labels and verify endpoints appear.'],['Pod Ready olduğu için DNS kaydını rastgele değiştir.','Change DNS randomly because the Pod is Ready.'],['Tüm cluster Secret’larını sil.','Delete every cluster Secret.'],['Deployment replicas değerini artır; etiket uyuşmazlığı çözülür.','Increase Deployment replicas; that fixes the label mismatch.']],
 ['Selector hedef Pod kümesini belirler. Çalışan Pod’un etiketi eşleşmiyorsa replica sayısını artırmak seçim hatasını çözmez; eşleşmeden sonra port ve ağ kontrolleri de yapılır.','The selector identifies target Pods. Adding replicas does not fix a label mismatch; after matching labels, also verify ports and networking.'],'diagnosis');
q('k8s-rollout-capacity','devops','kubernetes','workloads/controllers/deployment/',
 ['Rolling update için boş kapasite','Spare capacity for a rolling update'],
 ['Deployment maxUnavailable=0, maxSurge=1. Cluster’da ek Pod’a kaynak yok. Eski Pod’lar Ready. Rollout neden bekleyebilir?','A Deployment has maxUnavailable=0 and maxSurge=1. The cluster has no capacity for another Pod; old Pods are Ready. Why might rollout wait?'],
 '',
 [['Yeni Pod schedule edilemez; kullanılabilirliği düşürmeden ilerlemek için ek kapasite veya uygun rollout ayarı gerekir.','The new Pod cannot be scheduled; progress without reducing availability needs spare capacity or appropriate rollout settings.'],['maxSurge ücretsiz CPU/RAM üretir.','maxSurge creates free CPU and memory.'],['maxUnavailable=0 bütün arızalarda sıfır kesinti garantiler.','maxUnavailable=0 guarantees zero downtime for all failures.'],['Eski Ready Pod’lar mutlaka aynı anda silinir.','All old Ready Pods must be deleted simultaneously.']],
 ['maxSurge üst sınırı kaynak sağlamaz. maxUnavailable=0 eski kapasiteyi korumaya çalışırken yeni Pod için yer gerekebilir; readiness ve kaynak planlaması birlikte değerlendirilir.','maxSurge is a limit, not a source of resources. With maxUnavailable=0 preserving old availability, a new Pod may need additional capacity; consider readiness and capacity together.']);

q('http-204-body','api','mdn','Web/HTTP/Reference/Status/204',
 ['Başarılı silme sonrası JSON hatası','JSON error after a successful delete'],
 ['DELETE yanıtı 204 No Content. response.json() boş gövdede parse hatası veriyor. İstemci ne yapmalı?','DELETE returns 204 No Content. response.json() fails on the empty body. What should the client do?'],
 '',
 [['204 durumunu gövdesiz başarı olarak ele al; JSON bekleme.','Handle 204 as success without a body; do not expect JSON.'],['204 her zaman JSON hata gövdesi taşır.','204 always carries a JSON error body.'],['Parse hatası silmenin kesin başarısız olduğunu kanıtlar; tekrar sil.','The parse error proves deletion failed; delete again.'],['204 yanıtını 404 diye göster.','Display the 204 response as 404.']],
 ['204 başarılı isteğin ek içerik taşımadığını belirtir. İstemci durum kodu ve API sözleşmesine göre gövde okumalıdır; gövdesiz yanıtta JSON parse edilmez.','204 indicates success without additional content. Read the body according to status and the API contract; do not parse JSON from a bodyless response.'],'diagnosis');
q('http-etag-304','api','mdn','Web/HTTP/Reference/Headers/If-None-Match',
 ['Değişmeyen kaynağı yeniden kullan','Reuse an unchanged resource'],
 ['İstemcinin geçerli cache gövdesi ve ETag değeri var. GET isteğine If-None-Match ekliyor; sunucu 304 dönüyor. Ne anlama gelir?','The client has a valid cached body and its ETag. A GET with If-None-Match receives 304. What does this mean?'],
 '',
 [['Temsil değişmemiştir; cache kurallarına uygun mevcut gövde yeniden kullanılır.','The representation is unchanged; reuse the existing body according to cache rules.'],['Kaynak silinmiştir; cache’i boş 404 ile değiştir.','The resource was deleted; replace the cache with an empty 404.'],['304 gövdesinde tam yeni JSON bulunur.','The 304 body contains the full new JSON.'],['ETag kullanıcı parolasının şifreli halidir.','An ETag is the encrypted user password.']],
 ['Koşullu GET’te eşleşen validator 304 ile mevcut temsilin kullanılmasına izin verir. ETag kimlik doğrulama değildir; kişisel cache ve yetki kuralları ayrıca geçerlidir.','For a conditional GET, a matching validator allows reuse through 304. ETag is not authentication; private-cache and authorization rules still apply.']);
q('http-415-type','api','mdn','Web/HTTP/Reference/Status/415',
 ['Desteklenmeyen içerik türü','Unsupported content type'],
 ['Endpoint yalnız application/json kabul ediyor. İstemci text/plain gönderiyor; sunucu bu medya türünü işlemiyor. En uygun durum kodu hangisi?','An endpoint accepts only application/json. The client sends text/plain, which the server does not process. Which status fits best?'],
 '',
 [['415 Unsupported Media Type','415 Unsupported Media Type'],['200 OK','200 OK'],['301 Moved Permanently','301 Moved Permanently'],['204 No Content','204 No Content']],
 ['415 desteklenmeyen içerik biçimini belirtir. Kabul edilen JSON türünde bozuk JSON söz dizimi ise farklı bir hata durumudur; genellikle 400 ile ele alınır.','415 indicates an unsupported content format. Malformed JSON with an accepted JSON content type is a different failure, commonly handled as 400.']);
q('http-405-allow','api','mdn','Web/HTTP/Reference/Status/405',
 ['Kaynak var ama yöntem desteklenmiyor','The resource exists but the method is unsupported'],
 ['Kaynak GET destekliyor. Sunucu DELETE yöntemini tanıyor ama bu kaynak için izin vermiyor. Nasıl yanıt verilmeli?','The resource supports GET. The server recognizes DELETE but does not allow it on this resource. How should it respond?'],
 '',
 [['405 ve desteklenen yöntemleri belirten Allow başlığı.','405 with an Allow header listing supported methods.'],['501; sunucu DELETE yöntemini hiç tanımıyor demektir.','501; it means the server does not recognize DELETE at all.'],['200; gövdeye hata yazmak yeterli.','200; an error in the body is enough.'],['Her durumda 301 ile ana sayfaya yönlendir.','Always redirect to the homepage with 301.']],
 ['405 bilinen yöntemin hedef kaynakta desteklenmediğini bildirir ve Allow başlığı gerekir. Yöntemin sunucuda uygulanmamış olmasıyla aynı durum değildir.','405 reports that a known method is unsupported for the target resource and requires Allow. This differs from a method not implemented by the server.']);
q('test-await-failure','testing','dotnet','core/testing/unit-testing-mstest-writing-tests',
 ['Async test işini bekliyor mu?','Does the async test await its work?'],
 ['MSTest testi SaveAsync görevini başlatıp hemen dönüyor. Sonraki exception test sonucu dışında kalabiliyor. Ne değişmeli?','An MSTest test starts SaveAsync and immediately returns. A later exception may escape the test result. What should change?'],
 '[TestMethod]\npublic void Saves() { _ = SaveAsync(); }',
 [['Test Task dönsün ve SaveAsync’i await etsin; beklenen hata varsa async assertion da await edilsin.','Return Task from the test and await SaveAsync; also await an async assertion for an expected exception.'],['Thread.Sleep(1) ekle; tamamlanma garanti olur.','Add Thread.Sleep(1); completion is guaranteed.'],['Testi async void yap ve görevi yine bekleme.','Use async void and still do not await the task.'],['Exception’ları tamamen yut.','Swallow all exceptions.']],
 ['Test runner tamamlanmayı ve hatayı izleyebilmelidir. Await edilmemiş görev, test bittiğinde hâlâ çalışıyor olabilir; Task döndüren ve işi bekleyen test gerekir.','The runner must observe completion and failure. An unawaited task can still run after the test finishes; return Task and await the operation.'],'diagnosis');
q('test-db-constraint','testing','dotnet','core/testing/unit-testing-best-practices',
 ['Mock testi foreign key’i doğrular mı?','Does a mock test verify a foreign key?'],
 ['Repository mock’u her zaman başarı dönüyor. Test geçiyor ama PostgreSQL’de var olmayan user_id sipariş ekleyebiliyor. Hangi doğrulama eksik?','A repository mock always succeeds. Tests pass, yet PostgreSQL accepts orders with missing user_id. Which verification is missing?'],
 '',
 [['Gerçek veritabanı şemasıyla entegrasyon testi; geçersiz foreign key yazmasının reddedildiğini doğrula.','An integration test against the actual database schema; verify invalid foreign-key writes are rejected.'],['Aynı mock başarı sonucunu daha çok kez assert et.','Assert the same mock success more times.'],['Mock geçtiği için veritabanı kısıtı kanıtlanmıştır.','The passing mock proves the database constraint.'],['Yalnız SQL metninin uzunluğunu test et.','Test only the SQL string length.']],
 ['Mock, ayarlanan davranışı temsil eder; gerçek şema ve motor kısıtlarını çalıştırmaz. Birim testini koruyup ayrıca izole test veritabanında constraint davranışını doğrula.','A mock represents configured behavior, not real schema and engine constraints. Keep the unit test and separately verify constraints in an isolated test database.']);
q('test-boundary-mutation','testing','dotnet','core/testing/unit-testing-best-practices',
 ['Tek karakterlik hatayı yakala','Catch a one-character defect'],
 ['Gereksinim yaş >= 18. Kod yanlışlıkla age > 18 olmuş. 17 ve 19 testleri geçiyor. Hangi yeni test bu farkı yakalar?','The rule is age >= 18, but the code became age > 18. Tests for 17 and 19 pass. Which new test detects the difference?'],
 '',
 [['18 yaşın kabul edildiğini doğrula.','Assert that age 18 is accepted.'],['19 yaşın kabul edildiğini tekrar doğrula.','Assert again that age 19 is accepted.'],['0 yaşın reddini doğrula.','Assert that age 0 is rejected.'],['20 yaşın kabulünü doğrula.','Assert that age 20 is accepted.']],
 ['İki ifade yalnız eşik değerinde farklı davranır. 18 testi gereksinimdeki dahil sınırı korur; yalnız sınırın uzağındaki testler bu değişikliği yakalayamaz.','The expressions differ at the threshold. Testing 18 protects the inclusive boundary; tests away from it cannot detect this change.']);
q('test-public-contract','testing','dotnet','core/testing/unit-testing-best-practices',
 ['Refactor sonrası gereksiz test kırılması','Unnecessary test failures after a refactor'],
 ['İndirim hesabının çıktısı aynı, ama private helper iki kez yerine bir kez çağrılıyor. Test yalnız çağrı sayısını kontrol ettiği için kırıldı. Çağrı sayısı iş gereksinimi değil. Ne iyileştirilmeli?','Discount outputs are unchanged, but a private helper is now called once instead of twice. A test fails only on call count, which is not a business requirement. What should improve?'],
 '',
 [['Gözlemlenebilir fiyat ve iş kurallarını assert et; iç çağrı sayısını sözleşmeymiş gibi sabitleme.','Assert observable prices and business rules; do not freeze an internal call count as a contract.'],['Tüm testleri kaldır.','Delete every test.'],['Private helper adlarını kullanıcıya göster.','Expose private helper names to users.'],['Refactor’ı her zaman hatalı say.','Treat every refactor as a defect.']],
 ['İç uygulama ayrıntısına bağlanan test davranış değişmeden kırılabilir. İş sözleşmesinin çıktısını ve gerekli yan etkilerini doğrulamak, refactor’a dayanıklı daha anlamlı kanıt üretir.','Tests tied to internals can fail without a behavior change. Verify contract outputs and required side effects to provide meaningful evidence that survives refactoring.']);

q('python-heap-min','structures','python','library/heapq.html',
 ['Min-heap hangi işi seçer?','Which job does a min-heap select?'],
 ['Küçük sayı daha yüksek öncelik demek. Bu Python kodunda heappop ne döner?','A smaller number means higher priority. What does heappop return in this Python code?'],
 'import heapq\njobs = [7, 2, 5]\nheapq.heapify(jobs)\nnext_job = heapq.heappop(jobs)',
 [['2; min-heap en küçük öğeyi çıkarır.','2; a min-heap removes the smallest item.'],['5; son eklenen her zaman önce çıkar.','5; the last inserted item always comes out first.'],['7; heapq varsayılan olarak max-heap’tir.','7; heapq defaults to a max-heap.'],['[2, 5, 7]; heappop tüm listeyi döndürür.','[2, 5, 7]; heappop returns the whole list.']],
 ['heapify bu listeden min-heap oluşturur; heappop en küçük öğeyi çıkarıp kalan heap düzenini korur. Heap’in tüm listesi tamamen sıralı olmak zorunda değildir.','heapify makes a min-heap; heappop removes the smallest item and preserves the remaining heap invariant. The entire heap list need not be fully sorted.'],'code-reading');
q('python-bounded-deque','structures','python','library/collections.html#collections.deque',
 ['Son üç olayı sakla','Retain the last three events'],
 ['Bu Python deque içinde hangi değerler kalır?','Which values remain in this Python deque?'],
 'from collections import deque\nevents = deque([1, 2, 3], maxlen=3)\nevents.append(4)',
 [['[2, 3, 4]','[2, 3, 4]'],['[1, 2, 3, 4]','[1, 2, 3, 4]'],['[1, 2, 4]','[1, 2, 4]'],['OverflowError atılır.','OverflowError is raised.']],
 ['Sınırlı deque doluyken sağa append, karşı uçtan öğe atar. Burada 1 çıkarılır; son üç olay kalır. insert gibi başka işlemlerin davranışını bu örnekten genelleme.','Appending on the right of a full bounded deque discards an item at the opposite end. Here 1 is removed, leaving the last three events. Do not generalize this to other operations such as insert.'],'code-reading');
q('python-dict-key','structures','python','library/stdtypes.html#mapping-types-dict',
 ['Aynı anahtara ikinci atama','Assigning the same key again'],
 ['Python sözlüğünün uzunluğu ve Ada değeri nedir?','What are the dictionary length and the value for Ada?'],
 'scores = {}\nscores["Ada"] = 10\nscores["Ada"] = 20',
 [['Uzunluk 1, Ada değeri 20.','Length 1, value for Ada 20.'],['Uzunluk 2, Ada değeri 10.','Length 2, value for Ada 10.'],['Uzunluk 2, Ada değeri [10, 20].','Length 2, value for Ada [10, 20].'],['Aynı anahtara ikinci atama SyntaxError üretir.','Assigning a key twice produces SyntaxError.']],
 ['dict aynı anahtar için tek eşleme tutar; ikinci atama mevcut değeri değiştirir. Bir anahtara birden çok değer isteniyorsa liste gibi bir değer modeli ayrıca tasarlanır.','A dict stores one mapping per key; the second assignment replaces its value. Multiple values per key require an explicit value model such as a list.'],'code-reading');
q('python-deep-copy','structures','python','library/copy.html',
 ['İç içe listede bağımsız kopya','An independent copy of a nested list'],
 ['Python’da a = [[1], [2]]. b içindeki listeye append yapmak a’yı değiştirmemeli. Hangi seçenek bunu sağlar?','In Python, a = [[1], [2]]. Appending to a list inside b must not change a. Which option provides this?'],
 '',
 [['import copy; b = copy.deepcopy(a)','import copy; b = copy.deepcopy(a)'],['b = a','b = a'],['b = a[:]','b = a[:]'],['b = list(a)','b = list(a)']],
 ['Bu basit iç içe listede deepcopy iç listeleri de kopyalar. Dilim ve list(a) yalnız dış listeyi kopyalar; iç referanslar paylaşılır.','For this simple nested list, deepcopy also copies inner lists. Slicing and list(a) copy only the outer list, sharing inner references.']);
q('ai-precision-count','ai','sklearn','modules/generated/sklearn.metrics.precision_score.html',
 ['Pozitif tahminlerin ne kadarı doğru?','How many positive predictions are correct?'],
 ['Pozitif sınıf için TP=6, FP=2, FN=4. Precision kaçtır?','For the positive class, TP=6, FP=2, FN=4. What is precision?'],
 '',
 [['0.75; 6 / (6 + 2)','0.75; 6 / (6 + 2)'],['0.60; 6 / (6 + 4)','0.60; 6 / (6 + 4)'],['0.50; 6 / (6 + 2 + 4)','0.50; 6 / (6 + 2 + 4)'],['1.00; false positive hesaba katılmaz.','1.00; false positives are excluded.']],
 ['Precision pozitif tahminlerin doğruluğudur: TP/(TP+FP). FN recall hesabında yer alır; hangi yanlışın ürün açısından pahalı olduğu metrik seçiminde önemlidir.','Precision measures correctness among positive predictions: TP/(TP+FP). FN contributes to recall; product costs of different errors influence metric choice.']);
q('ai-recall-count','ai','sklearn','modules/generated/sklearn.metrics.recall_score.html',
 ['Gerçek pozitiflerin ne kadarı yakalandı?','How many actual positives were found?'],
 ['Pozitif sınıf için TP=6, FP=2, FN=4. Recall kaçtır?','For the positive class, TP=6, FP=2, FN=4. What is recall?'],
 '',
 [['0.60; 6 / (6 + 4)','0.60; 6 / (6 + 4)'],['0.75; 6 / (6 + 2)','0.75; 6 / (6 + 2)'],['0.40; 4 / (6 + 4)','0.40; 4 / (6 + 4)'],['1.00; yalnız TP olduğu sürece tamdır.','1.00; any TP makes recall perfect.']],
 ['Recall gerçek pozitiflerin yakalanan oranıdır: TP/(TP+FN). Bu model 10 gerçek pozitifin 6’sını bulmuştur; 4’ünü kaçırır.','Recall is the fraction of actual positives found: TP/(TP+FN). This model finds 6 of 10 actual positives and misses 4.']);
q('ai-imbalanced-accuracy','ai','sklearn','modules/model_evaluation.html#balanced-accuracy-score',
 ['Yüzde 99 doğruluk yeterli mi?','Is 99 percent accuracy enough?'],
 ['1000 örneğin 990’ı negatif, 10’u pozitif. Model hepsine negatif diyor ve %99 accuracy alıyor. Pozitif bulma becerisi hakkında ne dersin?','Of 1000 samples, 990 are negative and 10 positive. The model predicts negative for all and gets 99% accuracy. What does this say about finding positives?'],
 '',
 [['Pozitif recall 0; sınıf bazlı metrik ve basit baseline ile değerlendirmek gerekir.','Positive recall is 0; evaluate per-class metrics and compare with a simple baseline.'],['%99 accuracy tüm sınıflarda %99 başarı demektir.','99% accuracy means 99% success in every class.'],['Pozitif recall 1’dir.','Positive recall is 1.'],['Sınıf dağılımı metrik yorumunu etkilemez.','Class distribution cannot affect metric interpretation.']],
 ['Çoğunluk sınıfını sürekli seçmek yüksek toplam accuracy verebilir. Hiç pozitif bulunmadığı için recall 0’dır; balanced accuracy burada (1+0)/2 = 0.5 olur.','Always choosing the majority class can yield high overall accuracy. Finding no positives gives recall 0; balanced accuracy here is (1+0)/2 = 0.5.']);
q('ai-user-group-split','ai','sklearn','modules/cross_validation.html#group-k-fold',
 ['Yeni kullanıcıya genellemeyi ölç','Measure generalization to a new user'],
 ['Aynı kullanıcının çok sayıda kaydı var. Amaç görülmemiş kullanıcı performansı. Rastgele satır bölünmesi aynı kullanıcıyı train ve test’e koyuyor. Ne değişmeli?','Each user has many records. The goal is performance on unseen users. A random row split puts the same users in train and test. What should change?'],
 '',
 [['Kullanıcı kimliğini grup olarak kullanıp train ve test kullanıcılarını ayır; preprocessing’i yalnız train’e fit et.','Split by user groups so train and test users are disjoint; fit preprocessing only on training data.'],['Test kullanıcılarının etiketlerini train’e ekle.','Add test users’ labels to training.'],['Satırları karıştırmak kullanıcı ayrımını kesin sağlar.','Shuffling rows guarantees user separation.'],['Kullanıcı kimliğini sütunlardan silmek tek başına grup sızıntısını giderir.','Removing the user ID column alone removes group leakage.']],
 ['Aynı kullanıcıya ait ilişkili kayıtlar test sonucunu iyimserleştirebilir. GroupKFold gibi grup farkındalığı olan bölme, görülmemiş kullanıcı hedefiyle uyumludur; diğer sızıntılar ayrıca denetlenir.','Related records from the same user can inflate test performance. A group-aware split such as GroupKFold matches the unseen-user goal; other leakage still needs checking.']);

q('data-parquet-columns','data','arrow','python/parquet.html',
 ['Yüz sütundan yalnız ikisini oku','Read only two of a hundred columns'],
 ['Parquet dosyasında 100 sütun var. Rapor yalnız order_id ve total kullanıyor. Okuma maliyetini azaltmak için ne yaparsın?','A Parquet file has 100 columns; a report needs only order_id and total. How can you reduce read cost?'],
 '',
 [['Okuyucuda columns=["order_id", "total"] seç; gereksiz sütunları okumadan çalış.','Select columns=["order_id", "total"] in the reader; avoid reading unnecessary columns.'],['Her sütunu önce CSV’ye çevir.','Convert every column to CSV first.'],['Önce tüm sütunları belleğe al, sonra sil; I/O aynı ölçüde azalır.','Load all columns then drop them; I/O decreases just as much.'],['Parquet satır tabanlı olduğu için sütun seçimi imkânsızdır.','Parquet is row-oriented, so column selection is impossible.']],
 ['Parquet sütunlu bir biçimdir; Arrow okuyucusu seçilen sütunları okuyabilir. Sonradan DataFrame sütunu silmek, gereksiz veriyi baştan okumamakla aynı değildir.','Parquet is columnar; the Arrow reader can read selected columns. Dropping DataFrame columns afterward differs from avoiding their reads initially.']);
q('data-kafka-offset-crash','data','kafka','41/design/design/#design_deliverysemantics',
 ['İşlendi ama offset kaydedilemedi','Processed, but the offset was not committed'],
 ['Kafka tüketicisi dış veritabanına yazdı; offset commit etmeden çöktü. Aynı mesaj yeniden gelebilir. Ne gerekir?','A Kafka consumer writes to an external database and crashes before committing its offset. The message can be delivered again. What is needed?'],
 '',
 [['Kararlı olay anahtarıyla idempotent yazma/duplicate denetimi; offset ve yan etki sınırını açık yönetmek.','Idempotent writes or deduplication with a stable event key; explicitly manage the offset and side-effect boundary.'],['At-least-once teslimat tekrar ihtimalini sıfırlar.','At-least-once delivery eliminates duplicates.'],['Her retry’da rastgele yeni event_id üret.','Generate a random new event_id on every retry.'],['Offset’i işleme öncesi kaydetmek hiçbir veri kaybı riski taşımaz.','Committing the offset before processing has no loss risk.']],
 ['Yazma ile offset commit aynı atomik sınırda değilse çökme tekrar işlemeye yol açabilir. Kafka ayarları dış veritabanı yan etkisini kendiliğinden exactly-once yapmaz.','If the write and offset commit are not in the same atomic boundary, a crash can cause reprocessing. Kafka settings do not automatically make external database effects exactly-once.'],'diagnosis');
q('data-airflow-parse-io','data','airflow','apache-airflow/stable/best-practices.html#top-level-python-code',
 ['DAG yüklenirken API tekrar çağrılıyor','An API is called repeatedly while loading a DAG'],
 ['Airflow DAG dosyasının en üstünde requests.get var. Scheduler parsing sırasında sıkça çağrılıyor ve yavaşlıyor. Ne yapmalısın?','An Airflow DAG file calls requests.get at top level. Scheduler parsing repeatedly calls it and slows down. What should change?'],
 '',
 [['Ağ işini görev yürütme gövdesine taşı; DAG tanımını hafif tut.','Move network work into task execution; keep the DAG definition lightweight.'],['Top-level çağrı yalnız kurulumda bir kez çalışır; sorun olamaz.','Top-level calls run once only during installation; this cannot be a problem.'],['Scheduler sayısını artırıp her parser’a aynı API çağrısını yaptır.','Add schedulers so every parser calls the same API.'],['HTTP timeout’u sonsuz yap.','Set an infinite HTTP timeout.']],
 ['DAG dosyaları tekrar parse edilebilir. Ağ ve pahalı işlemleri top-level’da yapmak parsing maliyetini artırır; çalışma zamanına ait işi task içine taşı ve hata/retry politikasını orada yönet.','DAG files can be parsed repeatedly. Top-level network or expensive work increases parsing cost; move runtime work into a task and handle errors and retries there.'],'diagnosis');
q('data-not-null-migration','data','postgres','ddl-alter.html#DDL-ALTER-ADDING-A-CONSTRAINT',
 ['Mevcut tabloda NOT NULL geçişi','Migrating an existing table to NOT NULL'],
 ['PostgreSQL users tablosunda mevcut NULL email değerleri var. ALTER COLUMN email SET NOT NULL başarısız. Doğru geçiş yaklaşımı hangisi?','Existing PostgreSQL users have NULL email values. ALTER COLUMN email SET NOT NULL fails. What is the correct migration approach?'],
 '',
 [['Geçerli backfill/temizlik politikasını belirle, yeni NULL yazımını önle, veriyi doğrula ve kilit etkisini planlayarak kısıtı ekle.','Define valid backfill/cleanup, prevent new null writes, validate the data and add the constraint with lock impact planned.'],['Kısıt komutu eski NULL değerlerini otomatik gerçek e-postaya çevirir.','The constraint command automatically turns old nulls into real email addresses.'],['Tüm NULL satırlarını iş gereksinimini incelemeden sil.','Delete all null rows without checking requirements.'],['Kısıt sadece yeni satırları kontrol eder; mevcut NULL önemsizdir.','The constraint only checks new rows; existing nulls do not matter.']],
 ['NOT NULL mevcut verilerle de uyumlu olmalıdır. Backfill tek başına yetmez: eşzamanlı yeni NULL yazımları ve DDL kilit etkisi de geçiş planına dahildir.','NOT NULL must also be compatible with existing data. Backfill alone is insufficient: new concurrent null writes and DDL locking also belong in the migration plan.'],'diagnosis');
q('mobile-compose-observable','mobile','android','develop/ui/compose/state',
 ['Liste değişti ama ekran yenilenmedi','The list changed but the UI did not update'],
 ['Compose ekranında remember { mutableListOf<String>() } tutuluyor ve listeye add yapılıyor. UI güncellenmiyor. Neden?','A Compose screen uses remember { mutableListOf<String>() } and adds an item. The UI does not update. Why?'],
 '',
 [['Sıradan mutable list değişimi gözlemlenen state değildir; SnapshotStateList veya yeni immutable listeyi tutan MutableState kullan.','Ordinary mutable-list changes are not observable state; use SnapshotStateList or MutableState holding a new immutable list.'],['remember her iç nesne değişimini otomatik izler.','remember automatically observes every nested mutation.'],['UI’ı yenilemek için Activity’yi her eklemede yeniden başlat.','Restart the Activity on every addition.'],['Listeyi global değişkene taşımak recomposition garantiler.','Moving the list to a global guarantees recomposition.']],
 ['remember değeri saklar; sıradan koleksiyonun mutasyonlarını gözlemlenebilir yapmaz. Compose’un izlediği state üzerinden değişimi bildirmek gerekir.','remember retains a value but does not make mutations of an ordinary collection observable. Changes must be expressed through state observed by Compose.'],'diagnosis');
q('mobile-saveable-size','mobile','android','develop/ui/compose/state',
 ['Ekran state’ine ne kaydedilmeli?','What should be saved as screen state?'],
 ['Compose ekranında büyük bir görsel, ürün verisi ve seçili ürün kimliği var. rememberSaveable için en uygun yaklaşım hangisi?','A Compose screen has a large image, product data and the selected product ID. What is the best rememberSaveable approach?'],
 '',
 [['Küçük kimlik/UI state’ini sakla; büyük veriyi uygun veri katmanından kimlikle yeniden yükle.','Save the small ID/UI state; reload large data by ID from an appropriate data layer.'],['Tüm görselleri Base64 yapıp saved state içine koy.','Put all images into saved state as Base64.'],['rememberSaveable sınırsız ve kalıcı bir veritabanıdır.','rememberSaveable is an unlimited durable database.'],['Sadece remember kullan; process ölse de her veri korunur.','Use only remember; every value survives process death.']],
 ['Saved state alanı sınırlıdır ve tam veri deposu değildir. Küçük yeniden kurma bilgisi saklamak, büyük veriyi repository/persistent storage üzerinden almak daha uygundur.','Saved state is limited and is not a complete data store. Save small reconstruction information and obtain large data through a repository or persistent storage.']);
q('mobile-offline-conflict','mobile','android','topic/architecture/data-layer/offline-first',
 ['Çevrimdışı değişiklik yenisini eziyor','An offline edit overwrites a newer one'],
 ['Aynı kayıt telefonda offline ve web’de online değiştirildi. Telefonun eski kopyası bağlantı gelince yeni web verisini eziyor. Ne tasarlanmalı?','The same record is edited offline on a phone and online on the web. On reconnect, the phone overwrites newer web data. What should be designed?'],
 '',
 [['Sürüm/çatışma tespiti ve ürüne uygun uzlaştırma politikası; sessiz veri kaybını önle.','Version/conflict detection and a product-appropriate reconciliation policy; avoid silent data loss.'],['Son gelen ağ isteğini her durumda doğru kabul et.','Always treat the last arriving request as correct.'],['Offline kayıtları kontrolsüzce sil.','Delete offline records without checking.'],['Retry sayısını artırmak çatışmayı çözer.','Increasing retries resolves conflicts.']],
 ['Teslim sırası, kullanıcı değişikliklerinin zamanını veya niyetini kanıtlamaz. Sürümleme ve açık merge/çatışma politikası gerekir; last-write-wins seçilirse sonuçları bilinçli kabul edilmelidir.','Arrival order does not prove edit time or user intent. Versioning and an explicit merge/conflict policy are needed; choosing last-write-wins requires accepting its consequences.'],'diagnosis');
q('mobile-deeplink-authority','mobile','android','privacy-and-security/risks/unsafe-use-of-deeplinks',
 ['Deep link bir yetki belgesi mi?','Is a deep link an authorization credential?'],
 ['orders/42 deep link’i özel sipariş ekranını açıyor. Kullanıcı URL’deki ID’yi değiştirebilir. Sipariş verisini göstermeden önce ne gerekir?','An orders/42 deep link opens a private order screen. The user can change the ID in the URL. What is needed before displaying order data?'],
 '',
 [['Oturumu doğrula ve sunucuda o sipariş için erişim yetkisini kontrol et; URL girdisini güvenilir sayma.','Verify authentication and server-side access to that order; do not trust URL input.'],['Deep link uygulamaya ulaştığı için kullanıcı siparişin sahibidir.','Receiving the deep link proves the user owns the order.'],['Sadece ID’nin sayı olmasını kontrol etmek yeterli.','Checking that the ID is numeric is sufficient.'],['Butonu gizlemek sunucu yetki kontrolünün yerini alır.','Hiding the button replaces server-side authorization.']],
 ['Deep link yönlendirme girdisidir, erişim yetkisi değildir. Özel içeriğe girmeden kimlik ve kaynak bazlı yetki doğrulanmalı; geçersiz ve yetkisiz bağlantılar güvenle ele alınmalıdır.','A deep link is routing input, not authorization. Verify identity and resource-level access before private content; handle invalid and unauthorized links safely.']);
q('godot-move-toward','game','godot','classes/class_vector2.html',
 ['Hedefi aşmadan hareket et','Move without overshooting a target'],
 ['Godot Vector2.move_toward ile (0,0) konumundan (3,0) hedefine 5 birimlik adım atılıyor. Sonuç nedir?','In Godot, Vector2.move_toward takes a step of 5 from (0,0) toward (3,0). What is the result?'],
 'var next = Vector2(0, 0).move_toward(Vector2(3, 0), 5)',
 [['(3, 0); hedefin ötesine geçmez.','(3, 0); it does not overshoot the target.'],['(5, 0); hedefi her zaman aşar.','(5, 0); it always overshoots.'],['(15, 0); koordinatları çarpar.','(15, 0); it multiplies coordinates.'],['(0, 0); hedef uzaklığı adımdan kısa olamaz.','(0, 0); the target distance cannot be shorter than the step.']],
 ['move_toward verilen mesafe kadar yaklaşır ve hedefi aşmaz. Hedef 3 birim uzakta, adım 5 olduğu için sonuç tam hedeftir. Kare hızından bağımsız hız için adım hesabında delta ayrıca kullanılır.','move_toward approaches by the specified distance without overshooting. The target is 3 units away and the step is 5, so it stops at the target. Use delta separately when calculating a frame-independent step.'],'code-reading');
q('godot-single-press','game','godot','classes/class_input.html',
 ['Basılı tutmak her kare zıplatmasın','Holding the button must not jump every frame'],
 ['Godot’ta jump tuşu basılı tutulunca her process karesinde komut üretiliyor. Yalnız yeni basış anında tetiklemek için ne kullanırsın?','In Godot, holding jump emits a command every process frame. How do you trigger only on a new press?'],
 '',
 [['Input.is_action_just_pressed("jump"); zıplama iznini ayrıca kontrol et.','Input.is_action_just_pressed("jump"); also check whether jumping is allowed.'],['Input.is_action_pressed("jump"); her basışta yalnız bir kez true olur.','Input.is_action_pressed("jump"); it is true only once per press.'],['Her frame tuş eşlemesini sil.','Delete the input mapping every frame.'],['Tuş bırakılana kadar ana thread’i blokla.','Block the main thread until release.']],
 ['is_action_pressed basılı olduğu süreyi; is_action_just_pressed yeni basışın frame/physics tick’ini bildirir. Grounded/cooldown gibi oyun kuralları ayrı denetlenir.','is_action_pressed reports the held state; is_action_just_pressed reports the new-press frame or physics tick. Game rules such as grounded state and cooldown are checked separately.'],'diagnosis');
q('godot-user-save','game','godot','tutorials/io/data_paths.html',
 ['Yayımlanmış oyunda kayıt dosyası','A save file in an exported game'],
 ['Godot oyunu export edildi. Oyuncu ayarlarını yazmak için hangi yol amaçlanmıştır?','A Godot game has been exported. Which path is intended for writing player settings?'],
 '',
 [['user://settings.json','user://settings.json'],['res://settings.json; her export’ta yazılabilirlik garantilidir.','res://settings.json; it is guaranteed writable in every export.'],['Motor kurulum klasöründeki herhangi bir dosya.','Any file in the engine installation directory.'],['Tüm oyuncular için geliştiricinin sabit masaüstü yolu.','The developer’s fixed desktop path for all players.']],
 ['user:// kullanıcıya ait yazılabilir veri konumunu temsil eder. res:// proje kaynakları içindir ve export içinde yazılabilir kabul edilmez; kayıt hata durumları yine ele alınmalıdır.','user:// represents a writable user-data location. res:// is for project resources and must not be assumed writable in an export; save failures still need handling.']);
q('godot-deferred-free','game','godot','classes/class_node.html',
 ['queue_free hemen mi siler?','Does queue_free delete immediately?'],
 ['Godot Node için queue_free çağrıldı. Aynı frame’de ne beklenmeli?','queue_free was called on a Godot Node. What should be expected in the same frame?'],
 '',
 [['Silme frame sonuna kuyruğa alınır; hemen yok olduğunu varsayma ve silinme sonrası referans kullanımını yönet.','Deletion is queued for the end of the frame; do not assume immediate destruction and manage references after deletion.'],['Node her durumda çağrıdan önce yok edilmiştir.','The Node has always been destroyed before the call.'],['queue_free yalnız görünürlüğü değiştirir, hiç silmez.','queue_free only changes visibility and never deletes.'],['Silinen Node referansı sonraki framelerde sınırsız güvenle kullanılır.','The deleted Node reference remains safe to use forever in later frames.']],
 ['queue_free ertelenmiş silme planlar; Node ve çocukları silindiğinde referansları geçerli nesne sayılmaz. Yaşam döngüsünü is_queued_for_deletion/is_instance_valid gibi uygun kontrollerle yönet.','queue_free schedules deferred deletion; after the Node and its children are deleted, references no longer represent valid objects. Manage lifecycle with appropriate checks such as is_queued_for_deletion/is_instance_valid.']);
export function createExpandedTasks(){
 return rows.map((row,index)=>{
  const answer=index%4;
  const options=row.options.map((_,i)=>bi(...row.options[(i-answer+4)%4]));
  return {
   id:'expanded-'+row.id+'-20261008',version:'2026-10-08.2',area:row.area,
   kind:row.format==='diagnosis'?'error-diagnostic':'multiple-choice',
   format:row.format,difficulty:row.format==='code-reading'?'foundation':'intermediate',
   minutes:3,topic:bi(...row.title),tags:[...row.title,row.area],
   title:bi(...row.title),prompt:bi(...row.prompt),code:row.code,options,answer,
   explain:bi(...row.explain),
   hint:bi('Gözlenen davranışı ve sorudaki koşulları ayrı ayrı izle; kaynağın hangi kuralının geçerli olduğunu düşün.','Trace the observed behavior and each stated condition; identify which documented rule applies.'),
   checks:[bi('Seçimimi sorudaki somut davranışla gerekçelendirdim.','I justified my choice using the concrete behavior in the question.'),bi('Hangi koşul değişirse cevabımın değişeceğini düşündüm.','I considered which changed condition would change my answer.')],
   source:originalReference(row.provider,roots[row.provider]+row.path)
  };
 });
}
