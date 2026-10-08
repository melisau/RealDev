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
 godot:{label:'Godot documentation contributors',hosts:['docs.godotengine.org'],license:'CC-BY-3.0 (documentation)',licenseUrl:'https://github.com/godotengine/godot-docs/blob/master/LICENSE.txt'}
};
export function originalReference(provider, url) {
 const policy=referencePolicies[provider];
 if(!policy)throw new Error('Unknown reference policy');
 const parsed=new URL(url);
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||!policy.hosts.includes(parsed.hostname))throw new Error('Unapproved reference URL');
 return {label:policy.label,url,checkedAt:'2026-10-08',referenceLicense:policy.license,referenceLicenseUrl:provider==='dotnet'&&parsed.pathname.startsWith('/en-us/dotnet/api/')?'https://github.com/dotnet/dotnet-api-docs/blob/main/LICENSE':policy.licenseUrl,licenseCheckedAt:'2026-10-08',
   authorship:'RealDev original',use:'technical-reference-only',copiedText:false,copiedCode:false,
   note:'Question, options, explanation and example code were independently authored. The linked license describes the reference, not a license grant for RealDev content. No external quiz was imported.'};
}
