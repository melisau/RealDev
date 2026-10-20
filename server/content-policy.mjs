// Reference licenses describe linked documents, never the license of RealDev's original questions.
// No provider in this registry authorizes automatic import of third-party question text or code.
export const referencePolicies = {
 mdn:{label:'MDN Web Docs · Mozilla Contributors',hosts:['developer.mozilla.org'],license:'CC-BY-SA-2.5-or-later (documentation; exceptions apply)',licenseUrl:'https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license'},
 react:{label:'React documentation contributors',hosts:['react.dev'],license:'CC-BY-4.0 (documentation)',licenseUrl:'https://github.com/reactjs/react.dev/blob/main/LICENSE-DOCS.md'},
 dotnet:{label:'Microsoft .NET documentation contributors',hosts:['learn.microsoft.com'],license:'CC-BY-4.0 (dotnet/docs; check page-specific terms)',licenseUrl:'https://github.com/dotnet/docs/blob/main/LICENSE'},
 git:{label:'Git project · manual reference',hosts:['git-scm.com'],license:'GPL-2.0 (Git project; reference only)',licenseUrl:'https://github.com/git/git/blob/master/COPYING'},
 postgres:{label:'PostgreSQL Global Development Group',hosts:['www.postgresql.org'],license:'PostgreSQL License',licenseUrl:'https://www.postgresql.org/about/licence/'},
 unity:{label:'Unity 6 documentation · reference only',hosts:['docs.unity3d.com'],license:'No redistribution permission assumed',licenseUrl:'https://unity.com/legal/terms-of-service'},
 kubernetes:{label:'Kubernetes documentation contributors',hosts:['kubernetes.io'],license:'CC-BY-4.0 (website documentation)',licenseUrl:'https://github.com/kubernetes/website/blob/main/LICENSE'},
 docker:{label:'Docker documentation contributors',hosts:['docs.docker.com'],license:'Apache-2.0 (docs repository; exceptions apply)',licenseUrl:'https://github.com/docker/docs/blob/main/LICENSE'},
 python:{label:'Python Software Foundation · documentation',hosts:['docs.python.org'],license:'PSF License Version 2; examples have separate terms',licenseUrl:'https://docs.python.org/3/license.html'},
 sklearn:{label:'scikit-learn contributors',hosts:['scikit-learn.org'],license:'BSD-3-Clause (repository; exceptions apply)',licenseUrl:'https://github.com/scikit-learn/scikit-learn/blob/main/COPYING'},
 arrow:{label:'Apache Arrow contributors',hosts:['arrow.apache.org'],license:'Apache-2.0; third-party notices apply',licenseUrl:'https://github.com/apache/arrow/blob/main/LICENSE.txt'},
 kafka:{label:'Apache Kafka contributors',hosts:['kafka.apache.org'],license:'Apache-2.0; third-party notices apply',licenseUrl:'https://github.com/apache/kafka/blob/trunk/LICENSE'},
 airflow:{label:'Apache Airflow contributors',hosts:['airflow.apache.org'],license:'Apache-2.0; third-party notices apply',licenseUrl:'https://github.com/apache/airflow/blob/main/LICENSE'},
 android:{label:'Google · Android Developers',hosts:['developer.android.com'],license:'CC-BY-4.0 where stated; code samples Apache-2.0; exceptions apply',licenseUrl:'https://developers.google.com/terms/site-policies'},
 godot:{label:'Godot documentation contributors',hosts:['docs.godotengine.org'],license:'CC-BY-3.0 (documentation)',licenseUrl:'https://github.com/godotengine/godot-docs/blob/master/LICENSE.txt'},
 github:{label:'GitHub Docs contributors',hosts:['docs.github.com'],license:'CC-BY-4.0 (github/docs content; code samples MIT)',licenseUrl:'https://github.com/github/docs/blob/main/LICENSE'},
 pytest:{label:'pytest documentation · Holger Krekel and others',hosts:['docs.pytest.org'],license:'MIT (pytest project; reference only)',licenseUrl:'https://github.com/pytest-dev/pytest/blob/main/LICENSE'},
 rfc:{label:'IETF RFC Editor',hosts:['www.rfc-editor.org'],license:'IETF Trust Legal Provisions (reference only)',licenseUrl:'https://trustee.ietf.org/documents/trust-legal-provisions/'},
 openai:{label:'OpenAI API documentation · reference only',hosts:['developers.openai.com'],license:'No redistribution permission assumed',licenseUrl:'https://openai.com/policies/terms-of-use/'},
 owasp:{label:'OWASP Cheat Sheet Series contributors',hosts:['cheatsheetseries.owasp.org'],license:'CC-BY-SA-4.0',licenseUrl:'https://github.com/OWASP/CheatSheetSeries/blob/master/LICENSE.md'},
 kotlin:{label:'Kotlin documentation contributors',hosts:['kotlinlang.org'],license:'Apache-2.0 (kotlin-web-site repository; reference only)',licenseUrl:'https://github.com/JetBrains/kotlin-web-site/blob/master/LICENSE'},
 pywiki:{label:'Python Wiki contributors · reference only',hosts:['wiki.python.org'],license:'No redistribution permission assumed',licenseUrl:'https://wiki.python.org/moin/'},
 hashicorp:{label:'HashiCorp developer documentation · reference only',hosts:['developer.hashicorp.com'],license:'No redistribution permission assumed',licenseUrl:'https://www.hashicorp.com/terms-of-service'},
 sre:{label:'Google SRE books · reference only',hosts:['sre.google'],license:'No redistribution permission assumed',licenseUrl:'https://sre.google/books/'},
 otel:{label:'OpenTelemetry documentation contributors',hosts:['opentelemetry.io'],license:'CC-BY-4.0 (documentation)',licenseUrl:'https://github.com/open-telemetry/opentelemetry.io/blob/main/LICENSE'},
 systemd:{label:'systemd project · manual pages',hosts:['www.freedesktop.org'],license:'LGPL-2.1-or-later (systemd project; reference only)',licenseUrl:'https://github.com/systemd/systemd/blob/main/LICENSES/README.md'},
 nginx:{label:'nginx documentation · reference only',hosts:['nginx.org'],license:'BSD-2-Clause (nginx project; reference only)',licenseUrl:'https://nginx.org/LICENSE'},
 openapi:{label:'OpenAPI Initiative · specification',hosts:['spec.openapis.org'],license:'Apache-2.0 (specification repository)',licenseUrl:'https://github.com/OAI/OpenAPI-Specification/blob/main/LICENSE'},
 hypothesis:{label:'Hypothesis documentation contributors',hosts:['hypothesis.readthedocs.io'],license:'MPL-2.0 (Hypothesis project; reference only)',licenseUrl:'https://github.com/HypothesisWorks/hypothesis/blob/master/LICENSE.txt'},
 googleml:{label:'Google for Developers · Machine Learning',hosts:['developers.google.com'],license:'CC-BY-4.0 where stated; code samples Apache-2.0',licenseUrl:'https://developers.google.com/terms/site-policies'},
 kimball:{label:'Kimball Group · reference only',hosts:['www.kimballgroup.com'],license:'No redistribution permission assumed',licenseUrl:'https://www.kimballgroup.com/'},
 spark:{label:'Apache Spark contributors',hosts:['spark.apache.org'],license:'Apache-2.0; third-party notices apply',licenseUrl:'https://github.com/apache/spark/blob/master/LICENSE'}
};
export function originalReference(provider, url, checkedAt='2026-10-08') {
 const policy=referencePolicies[provider];
 if(!policy)throw new Error('Unknown reference policy');
 const parsed=new URL(url);
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||!policy.hosts.includes(parsed.hostname))throw new Error('Unapproved reference URL');
 return {label:policy.label,url,checkedAt,referenceLicense:policy.license,referenceLicenseUrl:provider==='dotnet'&&parsed.pathname.startsWith('/en-us/dotnet/api/')?'https://github.com/dotnet/dotnet-api-docs/blob/main/LICENSE':policy.licenseUrl,licenseCheckedAt:checkedAt,
   authorship:'RealDev original',use:'technical-reference-only',copiedText:false,copiedCode:false,
   note:'Question, options, explanation and example code were independently authored. The linked license describes the reference, not a license grant for RealDev content. No external quiz was imported.'};
}
