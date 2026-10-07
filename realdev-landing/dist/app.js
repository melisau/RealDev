const translations = {
  en: {
    signIn:'Sign in / Register', skip:'Skip to content', paths:'Learning paths', how:'How it works', start:'Start learning', headline1:'Build skills.', headline2:'Break things.', headline3:'Become a real<br>developer.',
    heroDescription:'Go beyond tutorials. Practice with quizzes, coding challenges, and debugging exercises that make it click.', free:'Start learning for free', explore:'Explore learning paths', pace:'Learn in English or Turkish. At your own pace.', quiz:'Quiz', code:'Code', debug:'Debug', panelNote:'Small challenges. Real understanding.',
    quizzes:'Quizzes', quizDesc:'Test your understanding with focused questions.', challenges:'Coding challenges', codeDesc:'Write real code and solve practical problems.', debugging:'Debugging exercises', debugDesc:'Find and fix issues like a real developer.', explanations:'Clear explanations', explainDesc:'Get simple, concise explanations that actually make sense.',
    nextChallenge:'Find your next challenge.', pathIntro:'Start with the fundamentals.<br>Build toward the work you want to do.', foundations:'Programming foundations', foundationDesc:'Variables, logic, functions, and problem solving.', web:'Web development', webDesc:'Build interfaces. Connect APIs. Understand the web.', interview:'Debugging & interview practice', interviewDesc:'Trace the bug. Explain your thinking. Solve with confidence.', debugTopics:'Debugging · Algorithms · Git', explorePath:'Explore path',
    makeStick:'Learn it. Try it. Make it stick.', choose:'Choose your path', chooseDesc:'Pick a skill you want to strengthen.', practice:'Practice, don’t just watch', practiceDesc:'Work through a quiz, a challenge, or a bug.', why:'Understand the why', whyDesc:'Get clear explanations. Try again with confidence.', chapter:'Your next chapter', oneChallenge:'starts with one challenge.', closingDesc:'You don’t need to know everything.<br>You just need a place to start.', closingPace:'English & Turkish · Learn at your own pace', backTop:'Back to top', curious:'Built for curious minds.',
    pathPreview:'Learning path preview', demoDisclaimer:'Try a sample activity. This preview doesn’t create an account.', trySample:'Try a sample challenge', quizTitle:'Think like a developer.', quizMeta:'JavaScript · Fundamentals', quizQuestion:'What does this expression return?', checkAnswer:'Check answer', correct:'You got it.', incorrect:'Not quite. Here’s why.', quizExplanation:'JavaScript returns "object" for null — a historical quirk. null represents an intentional absence of a value. Check value === null when you need to identify it.',
    codeTitle:'Make the function work.', codeMeta:'JavaScript · Coding challenge', codeQuestion:'Complete the return statement to add two numbers.', editorLabel:'Your code', runCheck:'Check solution', codeCorrect:'That’s a working solution.', codeExplanation:'return a + b adds both numbers and sends the result back to the caller. For example, add(2, 3) returns 5.', codeIncorrect:'Try returning a + b.', codeHint:'This sample checks the missing return statement. Replace the TODO with a + b, leaving the rest of the function in place.',
    debugTitle:'Find the hidden bug.', debugMeta:'JavaScript · Debugging', debugQuestion:'Why does this loop read one item too many?', debugA:'The array starts at index 1', debugB:'The condition should use <', debugC:'The increment should be removed', debugExplanation:'Arrays start at index 0. An array of length 3 has indices 0, 1, and 2. Use i < items.length so the loop stops before index 3.',
    foundationLessons:['Variables & types — understand your data','Conditions & loops — control the flow','Functions — break problems into steps','Practice — a JavaScript fundamentals quiz'], webLessons:['Semantic HTML — structure with meaning','CSS layouts — build responsive interfaces','JavaScript — make the page respond','Practice — complete a small function'], debuggingLessons:['Read the error — follow the evidence','Trace execution — inspect assumptions','Boundary cases — find the off-by-one bug','Practice — explain why the fix works']
  },
  tr: {
    signIn:'Giriş / Kayıt', skip:'İçeriğe geç', paths:'Öğrenme yolları', how:'Nasıl çalışır', start:'Öğrenmeye başla', headline1:'Becerilerini geliştir.', headline2:'Hataları keşfet.', headline3:'Gerçek bir<br>geliştirici ol.',
    heroDescription:'Eğitim videolarının ötesine geç. Quizler, kodlama görevleri ve hata ayıklama alıştırmalarıyla öğrendiklerini uygulamaya dök.', free:'Ücretsiz öğrenmeye başla', explore:'Öğrenme yollarını keşfet', pace:'Türkçe veya İngilizce öğren. Kendi hızında ilerle.', quiz:'Quiz', code:'Kod', debug:'Hata ayıkla', panelNote:'Küçük görevler. Gerçek kavrayış.',
    quizzes:'Quizler', quizDesc:'Odaklı sorularla bilgini sınayabilirsin.', challenges:'Kodlama görevleri', codeDesc:'Gerçek kod yaz ve somut problemler çöz.', debugging:'Hata ayıklama', debugDesc:'Bir geliştirici gibi hataları bul ve düzelt.', explanations:'Anlaşılır açıklamalar', explainDesc:'Kavramları sade ve net açıklamalarla öğren.',
    nextChallenge:'Sıradaki görevini bul.', pathIntro:'Temellerle başla.<br>Yapmak istediğin işe doğru ilerle.', foundations:'Programlama temelleri', foundationDesc:'Değişkenler, mantık, fonksiyonlar ve problem çözme.', web:'Web geliştirme', webDesc:'Arayüzler oluştur. API’lere bağlan. Web’i anla.', interview:'Hata ayıklama ve mülakat pratiği', interviewDesc:'Hatayı izle. Düşünceni açıkla. Güvenle çöz.', debugTopics:'Hata ayıklama · Algoritmalar · Git', explorePath:'Yolu keşfet',
    makeStick:'Öğren. Dene. Kalıcı hale getir.', choose:'Yolunu seç', chooseDesc:'Geliştirmek istediğin bir beceri seç.', practice:'Sadece izleme, uygula', practiceDesc:'Bir quiz, kodlama görevi veya hata üzerinde çalış.', why:'Nedenini anla', whyDesc:'Net açıklamalarla öğren. Güvenle yeniden dene.', chapter:'Yeni bir başlangıç,', oneChallenge:'tek bir görevle başlar.', closingDesc:'Her şeyi bilmen gerekmiyor.<br>Sadece bir başlangıç noktasına ihtiyacın var.', closingPace:'Türkçe ve İngilizce · Kendi hızında öğren', backTop:'Başa dön', curious:'Meraklı zihinler için.',
    pathPreview:'Öğrenme yolu önizlemesi', demoDisclaimer:'Örnek bir alıştırma dene. Bu önizleme hesap oluşturmaz.', trySample:'Örnek bir görev dene', quizTitle:'Bir geliştirici gibi düşün.', quizMeta:'JavaScript · Temeller', quizQuestion:'Bu ifade ne döndürür?', checkAnswer:'Cevabı kontrol et', correct:'Doğru cevap.', incorrect:'Tam değil. Nedenine bakalım.', quizExplanation:'JavaScript, tarihsel bir özellik nedeniyle null için "object" döndürür. null, bir değerin bilinçli olarak yokluğunu belirtir. Kontrol etmek için value === null kullanabilirsin.',
    codeTitle:'Fonksiyonu tamamla.', codeMeta:'JavaScript · Kodlama görevi', codeQuestion:'İki sayıyı toplamak için return ifadesini tamamla.', editorLabel:'Kodun', runCheck:'Çözümü kontrol et', codeCorrect:'Çalışan bir çözüm.', codeExplanation:'return a + b iki sayıyı toplar ve sonucu çağıran koda iletir. Örneğin, add(2, 3) sonucu 5 olur.', codeIncorrect:'a + b döndürmeyi dene.', codeHint:'Bu örnek, eksik return ifadesini kontrol eder. Fonksiyonun geri kalanını koruyarak TODO yerine a + b yaz.',
    debugTitle:'Gizli hatayı bul.', debugMeta:'JavaScript · Hata ayıklama', debugQuestion:'Bu döngü neden fazladan bir öğe okumaya çalışıyor?', debugA:'Dizi indeksi 1’den başlar', debugB:'Koşulda < kullanılmalı', debugC:'Artırma ifadesi kaldırılmalı', debugExplanation:'Dizi indeksleri 0’dan başlar. Uzunluğu 3 olan bir dizinin indeksleri 0, 1 ve 2’dir. i < items.length kullanarak döngüyü 3. indeksten önce durdur.',
    foundationLessons:['Değişkenler ve türler — verini anla','Koşullar ve döngüler — akışı yönet','Fonksiyonlar — problemi adımlara ayır','Pratik — JavaScript temelleri quizi'], webLessons:['Anlamlı HTML — yapıyı doğru kur','CSS düzenleri — uyumlu arayüzler oluştur','JavaScript — sayfanı etkileşimli yap','Pratik — küçük bir fonksiyonu tamamla'], debuggingLessons:['Hata mesajını oku — kanıtları izle','Çalışmayı takip et — varsayımları incele','Sınır durumları — döngü hatasını bul','Pratik — çözümün neden işe yaradığını açıkla']
  }
};
let language = 'tr';
try { const saved = localStorage.getItem('realdev-language'); if (saved === 'tr' || saved === 'en') language = saved; } catch {}
let activityType = 'quiz';
let selectedAnswer = 'object';
let checked = false;
let codeDraft = 'function add(a, b) {\n  return /* TODO */;\n}';
let activePath = 'foundations';
const activity = document.querySelector('#activity');
const dialog = document.querySelector('#path-dialog');
const arrow = '<svg class="icon"><use href="#arrow"/></svg>';
const t = key => translations[language][key];
function escapeText(value) { return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function radio(value, label) { return `<label class="answer"><input type="radio" name="answer" value="${value}" ${selectedAnswer === value ? 'checked' : ''}><span>${escapeText(label)}</span></label>`; }
function renderActivity() {
  const isCode = activityType === 'code';
  const isQuiz = activityType === 'quiz';
  const key = isQuiz ? 'quiz' : isCode ? 'code' : 'debug';
  activity.setAttribute('aria-labelledby', `tab-${activityType}`);
  document.querySelectorAll('[data-tab]').forEach(button => { const active = button.dataset.tab === activityType; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
  let body;
  if (isQuiz) body = `<pre class="code-block"><span class="line-no">1</span><code>typeof null</code></pre><div class="answers">${radio('null','"null"')}${radio('object','"object"')}${radio('undefined','"undefined"')}</div>`;
  else if (isCode) body = `<label for="code-input" class="editor-label">${t('editorLabel')}</label><textarea id="code-input" class="code-editor" spellcheck="false" aria-describedby="activity-question">${escapeText(codeDraft)}</textarea>`;
  else body = `<pre class="code-block"><code>for (let i = 0;\n     i &lt;= items.length; i++) {\n  console.log(items[i]);\n}</code></pre><div class="answers">${radio('index',t('debugA'))}${radio('condition',t('debugB'))}${radio('increment',t('debugC'))}</div>`;
  activity.innerHTML = `<h2>${t(key+'Title')}</h2><p class="meta">${t(key+'Meta')}</p><p class="question" id="activity-question">${t(key+'Question')}</p>${body}<button class="button primary" id="check-activity">${t(isCode ? 'runCheck' : 'checkAnswer')}</button><div id="activity-result" role="status" aria-live="polite"></div>`;
  activity.querySelectorAll('input[type=radio]').forEach(input => input.addEventListener('change', () => { selectedAnswer = input.value; checked = false; activity.querySelector('#activity-result').replaceChildren(); }));
  activity.querySelector('#code-input')?.addEventListener('input', event => { codeDraft = event.target.value; checked = false; activity.querySelector('#activity-result').replaceChildren(); });
  activity.querySelector('#check-activity').addEventListener('click', checkActivity);
  if (checked) showFeedback();
}
function checkActivity() { checked = true; showFeedback(); }
function showFeedback() {
  let correct, title, explanation;
  if (activityType === 'code') {
    // Validate a narrowly specified exercise without evaluating arbitrary visitor code.
    const normalized = codeDraft.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\s+/g,'');
    correct = /^functionadd\(a,b\)\{return(?:a\+b|b\+a|\(a\+b\)|\(b\+a\));?\}$/.test(normalized);
    title = t(correct ? 'codeCorrect' : 'codeIncorrect'); explanation = t(correct ? 'codeExplanation' : 'codeHint');
  } else { correct = selectedAnswer === (activityType === 'quiz' ? 'object' : 'condition'); title = t(correct ? 'correct' : 'incorrect'); explanation = t(activityType === 'quiz' ? 'quizExplanation' : 'debugExplanation'); }
  activity.querySelector('#activity-result').innerHTML = `<p class="feedback ${correct ? '' : 'error'}"><strong>${title}</strong>${escapeText(explanation)}</p>`;
}
function setActivity(type) { activityType = type; selectedAnswer = type === 'quiz' ? 'object' : ''; checked = false; renderActivity(); }
function setLanguage(value) {
  language = value;
  document.documentElement.lang = value;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.innerHTML = t(element.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === value)));
  document.querySelector('.close-dialog').setAttribute('aria-label', value === 'tr' ? 'Pencereyi kapat' : 'Close dialog');
  window.updateRealdevThemeLabel?.();
  try { localStorage.setItem('realdev-language', value); } catch {}
  renderActivity(); if (dialog.open) populatePath();
}
function populatePath() {
  const keys = {foundations:['foundations','foundationDesc','foundationLessons'],web:['web','webDesc','webLessons'],debugging:['interview','interviewDesc','debuggingLessons']}[activePath];
  document.querySelector('#dialog-title').textContent = t(keys[0]);
  document.querySelector('#dialog-desc').textContent = t(keys[1]);
  document.querySelector('#dialog-lessons').innerHTML = t(keys[2]).map(lesson => `<li>${escapeText(lesson)}</li>`).join('');
}
function openPath(path) { activePath = path; populatePath(); dialog.showModal(); }
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => setActivity(button.dataset.tab));
  button.addEventListener('keydown', event => {
    const tabs = [...document.querySelectorAll('[data-tab]')];
    const index = tabs.indexOf(button);
    if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (index+(event.key === 'ArrowRight' ? 1 : -1)+tabs.length)%tabs.length; setActivity(tabs[next].dataset.tab); tabs[next].focus(); }
  });
});
document.querySelectorAll('[data-path]').forEach(button => button.addEventListener('click', () => openPath(button.dataset.path)));
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => openPath('foundations')));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); });
document.querySelector('#try-path').addEventListener('click', () => {
  dialog.close(); setActivity({foundations:'quiz',web:'code',debugging:'debug'}[activePath]);
  document.querySelector('#practice').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'center'});
  document.querySelector(`#tab-${activityType}`).focus({preventScroll:true});
});
setLanguage(language);
