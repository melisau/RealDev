const pathEntries = [
  ['/', 'today', 'RealDeveloper · Developer practice workspace', 'Practice coding, debugging and technical explanations. Explore public samples, then sign in to save your personal learning path.', true],
  ['/demo/questions', 'demoQuiz', 'Sample developer questions · RealDeveloper', 'Try sample programming, debugging and software engineering questions in a temporary, unsaved preview.', true],
  ['/demo/concepts', 'demoConcepts', 'Software concept glossary · RealDeveloper', 'Browse ten sourced software engineering concept cards with references to original documentation.', true],
  ['/today', 'today', 'Today · RealDeveloper', 'Your private daily developer practice and progress summary.', false],
  ['/quiz', 'quiz', 'Skill assessment · RealDeveloper', 'Assess your software development skills with practical questions and evidence-based feedback.', false],
  ['/map', 'map', 'Skill map · RealDeveloper', 'Review your developer skill evidence, practice areas and next learning steps.', false],
  ['/route', 'route', 'Learning route · RealDeveloper', 'Follow a personal developer learning route built from your practice evidence.', false],
  ['/calendar', 'calendar', 'Study calendar · RealDeveloper', 'Your private daily active study minutes and monthly learning calendar.', false],
  ['/history', 'history', 'Answer history · RealDeveloper', 'Review your saved answers and revisit questions from your account.', false],
  ['/topics', 'topics', 'Topic search · RealDeveloper', 'Search software topics and find related practice in your account.', false],
  ['/notes', 'notes', 'My notes · RealDeveloper', 'Review your private study notes and recorded learning gaps.', false],
  ['/library', 'library', 'Question library · RealDeveloper', 'Revisit questions saved to your personal developer practice library.', false],
  ['/lab', 'lab', 'Code lab · RealDeveloper', 'Write and run supported practice code in an isolated learning environment.', false],
  ['/interview', 'interview', 'Interview and project practice · RealDeveloper', 'Practice technical interviews, staged projects, debugging and code review.', false],
  ['/errors', 'errors', 'Error lab · RealDeveloper', 'Practice diagnosing Git, API, IDE, .NET, Unity and deployment errors.', false],
  ['/concepts', 'concepts', 'Software concepts · RealDeveloper', 'Study software engineering concepts with sourced explanations and examples.', false],
  ['/news', 'news', 'Software development news · RealDeveloper', 'Follow software development updates with dates and links to their original sources.', false],
  ['/github', 'github', 'GitHub practice · RealDeveloper', 'Practice Git, pull requests, collaboration and GitHub Actions workflows.', false],
  ['/code-history', 'codehistory', 'Code history · RealDeveloper', 'Review code submissions and test results saved to your account.', false],
  ['/review', 'review', 'Review a question · RealDeveloper', 'Return to questions saved for review and study their explanations.', false],
  ['/advanced', 'advanced', 'Advanced practice · RealDeveloper', 'Continue advanced software engineering projects and technical practice.', false],
  ['/account', 'account', 'Account and data · RealDeveloper', 'Manage your RealDeveloper profile, learning data and account settings.', false],
];
export const pageRoutes=Object.freeze(Object.fromEntries(pathEntries.map(([path,view,title,description,indexable])=>[path,{path,view,title,description,indexable}])));
export const viewPaths=Object.freeze(Object.fromEntries(pathEntries.filter(([path])=>path!=='/').map(([path,view])=>[view,path])));
export const indexablePaths=Object.freeze(pathEntries.filter(([, , , , indexable])=>indexable).map(([path])=>path));
const publicFallbackHtml=Object.freeze({
 '/':'<section class="public-hero"><div class="eyebrow">REALDEVELOPER · DEVELOPER PRACTICE STUDIO</div><h1>Kullandığın kodu açıklayarak gerçek becerini geliştir.</h1><p>Yazılımcılar için uygulamalı çalışma alanı: kodu oku, gerçekçi hataları teşhis et, teknik kavramları açıkla ve kanıta dayalı bir öğrenme rotası oluştur.</p><p><a href="/demo/questions">Örnek yazılım sorularını dene</a> · <a href="/demo/concepts">Kaynaklı kavram örneklerini incele</a></p><p>Örnekleri hesap açmadan görüntüle. Kişisel cevaplar, notlar ve ilerleme için giriş yap.</p></section>',
 '/demo/questions':'<section class="public-demo-card"><div class="eyebrow">REALDEVELOPER · AÇIK ÖNİZLEME</div><h1>Yazılım becerileri için örnek sorular</h1><p>JavaScript, React, API, Git, veritabanı, DevOps ve hata ayıklama konularındaki örnekleri çöz. Her cevap geçici tutulur; kişisel ilerleme hesabına giriş yaptıktan sonra kaydedilir.</p><p><a href="/demo/concepts">Kavram örneklerine göz at</a> · <a href="/">RealDeveloper tanıtımına dön</a></p></section>',
 '/demo/concepts':'<section class="public-demo-card"><div class="eyebrow">REALDEVELOPER · KAYNAKLI ÖRNEKLER</div><h1>Yazılım kavramları için açık önizleme</h1><p>On örnek kavram kartını özgün kaynaklarına bağlantılarla incele. Örnek başlıklar CLR, Domain-Driven Design, Kubernetes, Data Definition Language, .NET Aspire, CORS, REST API, React ve konteynerlerdir.</p><p><a href="/demo/questions">Örnek soruları çöz</a> · <a href="/">RealDeveloper tanıtımına dön</a></p></section>'
});
export function normalizePagePath(pathname){const decoded=decodeURIComponent(pathname||'/');return decoded.replace(/\/+$/,'')||'/';}
export function pageForPath(pathname){return pageRoutes[normalizePagePath(pathname)]??null;}
const htmlEscape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function upsertMeta(html,pattern,tag){return pattern.test(html)?html.replace(pattern,tag):html.replace('</head>','  '+tag+'\n</head>');}
export function renderPageDocument(html,pathname,origin,{allowIndexing=true}={}){
 const page=pageForPath(pathname);if(!page)return null;
 const canonical=new URL(page.path,origin).href,robots=page.indexable&&allowIndexing?'index, follow':'noindex, nofollow';
 let output=html.replace(/<title>[^<]*<\/title>/i,'<title>'+htmlEscape(page.title)+'</title>');
 output=upsertMeta(output,/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i,'<meta name="description" content="'+htmlEscape(page.description)+'">');
 output=upsertMeta(output,/<meta\s+name="robots"\s+content="[^"]*"\s*\/?\s*>/i,'<meta name="robots" content="'+robots+'">');
 output=upsertMeta(output,/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i,'<meta property="og:title" content="'+htmlEscape(page.title)+'">');
 output=upsertMeta(output,/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i,'<meta property="og:description" content="'+htmlEscape(page.description)+'">');
 output=upsertMeta(output,/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i,'<meta property="og:url" content="'+htmlEscape(canonical)+'">');
 const canonicalTag='<link rel="canonical" href="'+htmlEscape(canonical)+'">',canonicalPattern=/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i;
 output=canonicalPattern.test(output)?output.replace(canonicalPattern,canonicalTag):output.replace('</head>','  '+canonicalTag+'\n</head>');
 output=output.replace(/<body([^>]*)>/i,(match,attrs)=>'<body'+attrs.replace(/\sdata-realdev-initial-view="[^"]*"/i,'')+' data-realdev-initial-view="'+htmlEscape(page.view)+'">');
 const fallback=publicFallbackHtml[page.path];
 if(fallback)output=output.replace('<div class="content" id="viewRoot"></div>','<div class="content" id="viewRoot">'+fallback+'</div>');
 return {html:output,page,canonical,robots};
}
export function robotsText(origin){return ['User-agent: *','Allow: /','Disallow: /api/','Disallow: /auth.html','Sitemap: '+new URL('/sitemap.xml',origin).href,''].join('\n');}
export function sitemapXml(origin){const urls=indexablePaths.map(path=>'  <url><loc>'+xmlEscape(new URL(path,origin).href)+'</loc></url>').join('\n');return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n';}
function xmlEscape(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
