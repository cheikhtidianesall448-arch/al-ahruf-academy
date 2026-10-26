// Multilingual paraphrase bank for smoother Academy chatbot conversations.
// The combinations are generated from intent aliases and sentence frames at runtime.
type Intent = { canonical: string; aliases: string[] };
const intents: Intent[] = [
{canonical:"academy courses Quran reading Tajwid Hifz revision Fiqh",aliases:["courses","classes","what do you teach","what can I learn","programs","subjects","Quran reading","tajwid","tajweed","memorization","hifz","revision","fiqh","Islamic studies","cours","formations","matières","lecture du Coran","mémorisation","révision","فقه","تحفيظ القرآن","ماذا تدرسون","الدورات"]},
{canonical:"registration enrollment admission",aliases:["register","registration","enroll","join the academy","become a student","sign up","admission","inscription","m'inscrire","rejoindre l'académie","التسجيل","كيف أسجل","أريد الانضمام"]},
{canonical:"fees tuition payment invoice due date",aliases:["fees","tuition","price","cost","how much","payment","pay tuition","invoice","bill","due date","paid","frais","tarif","prix","payer","facture","échéance","رسوم","كم السعر","الدفع","الفاتورة"]},
{canonical:"class timetable schedule next class time",aliases:["timetable","schedule","class time","next class","when is my class","what time do we meet","calendar","planning","emploi du temps","horaire","prochain cours","وقت الحصة","متى درسي","جدول الحصص"]},
{canonical:"online class Google Meet joining link",aliases:["join class","open class","class link","google meet","meeting link","can't join","link not working","rejoindre le cours","lien du cours","رابط الحصة","جوجل ميت"]},
{canonical:"attendance present absent late history",aliases:["attendance","present","absent","late","marked absent","attendance record","attendance history","présence","absence","en retard","سجل الحضور","غياب","حاضر","متأخر"]},
{canonical:"assignments homework task due date completion",aliases:["assignment","assignments","homework","task","what is my homework","deadline","devoir","travail à faire","الواجب","واجباتي","المهمة"]},
{canonical:"Quran surah progress memorized surahs leaderboard",aliases:["surah","surahs","surah progress","memorized surahs","how many surahs","my progress","catch up","ahead of me","behind me","sourate","sourates","سورة","السور التي حفظتها","تقدمي"]},
{canonical:"Quran Mushaf reader page navigation",aliases:["mushaf","quran reader","read Quran","open surah","page number","Quran page","recitation","lire le Coran","المصحف","صفحة القرآن","اقرأ القرآن"]},
{canonical:"Tajwid pronunciation recitation rules",aliases:["tajwid","tajweed rules","pronunciation","makharij","recitation rules","correct my recitation","règles de récitation","أحكام التجويد","مخارج الحروف","التلاوة"]},
{canonical:"Hifz memorization revision retention",aliases:["memorize","memorization plan","hifz plan","revise Quran","revision plan","mémoriser","réviser","خطة الحفظ","المراجعة","كيف أحفظ"]},
{canonical:"Fiqh Islamic jurisprudence questions",aliases:["fiqh","Islamic jurisprudence","religious ruling","halal","haram","worship question","jurisprudence islamique","فقه","حلال","حرام","حكم شرعي"]},
{canonical:"teacher assigned teacher contact",aliases:["my teacher","assigned teacher","who teaches me","teacher name","contact my teacher","professeur","mon enseignant","oustaz","أستاذي","من أستاذي"]},
{canonical:"messages communication reply conversation",aliases:["message","messages","send a message","reply","conversation","chat","contact academy","messagerie","répondre","envoyer un message","رسالة","أرسل رسالة"]},
{canonical:"account login password username sign in",aliases:["login","log in","sign in","can't log in","password","forgot password","username","student id","account access","connexion","mot de passe","identifiant","تسجيل الدخول","نسيت كلمة المرور"]},
{canonical:"language selection English French Arabic",aliases:["language","change language","English","French","Arabic","switch to French","langue","العربية","اللغة","غيّر اللغة"]},
{canonical:"technical issue loading error connection",aliases:["error","not working","broken","doesn't load","cannot reach server","server down","technical issue","bug","problème technique","ça ne marche pas","erreur","لا يعمل","مشكلة تقنية"]},
{canonical:"student profile personal information",aliases:["my profile","profile picture","change my photo","student details","account information","profil","photo de profil","معلومات حسابي","الملف الشخصي"]},
{canonical:"teacher dashboard student management",aliases:["teacher dashboard","manage students","my students","student list","teacher tools","mes élèves","قائمة الطلاب","طلابي"]},
{canonical:"administrator academy management",aliases:["admin","administrator","admin dashboard","manage academy","overview","manage teachers","الإدارة","مدير الأكاديمية"]},
{canonical:"privacy security account data",aliases:["privacy","is my data safe","security","who can see my information","confidentiality","confidentialité","sécurité","الخصوصية","هل بياناتي آمنة"]},
{canonical:"class ratings feedback review",aliases:["rate class","rating","review my class","give feedback","class feedback","évaluer le cours","avis","تقييم الحصة"]},
{canonical:"notifications reminders alerts",aliases:["notification","notifications","reminder","remind me","alert","class reminder","rappel","تنبيه","تذكير"]},
{canonical:"academy founder history identity",aliases:["who created you","who founded the academy","academy founder","who made this assistant","who are you","creator","qui a créé","من أنشأ الأكاديمية","من أنت"]},
{canonical:"learning help explanation support",aliases:["help me","can you explain","I don't understand","explain this","teach me","I need help","aide-moi","explique-moi","je ne comprends pas","ساعدني","اشرح لي"]},
{canonical:"greetings polite conversation",aliases:["hello","hi","hey","good morning","good afternoon","good evening","how are you","thanks","thank you","goodbye","bonjour","salut","bonsoir","merci","السلام عليكم","مرحبا","شكرا","كيف حالك"]},
{canonical:"learning level course placement",aliases:["beginner","intermediate","advanced","my level","learning level","niveau","débutant","intermédiaire","مستواي","مبتدئ"]},
{canonical:"class cancellation reschedule absence",aliases:["cancel class","reschedule class","missed class","can't attend","change class time","annuler le cours","reporter le cours","je serai absent","إلغاء الحصة","تغيير موعد الحصة"]},
{canonical:"learning advice study routine",aliases:["study plan","learning tips","how to improve","practice every day","study routine","conseils","plan d'étude","كيف أتحسن","خطة الدراسة"]},
{canonical:"technical support contact emergency line",aliases:["support","contact support","emergency line","phone number","help desk","call the academy","assistance","numéro de téléphone","رقم الهاتف","الدعم الفني"]},
{canonical:"parent child student enrollment",aliases:["my child","my son","my daughter","parent","guardian","register my child","mon enfant","mon fils","ma fille","ولي الأمر","ابني","ابنتي"]},
{canonical:"course materials resources files",aliases:["learning materials","resources","download file","course document","study material","documents","supports de cours","fichiers","المواد التعليمية","الملفات"]},
{canonical:"student goals target progress planning",aliases:["my goal","learning target","memorization target","progress target","objectif","mon objectif","هدفي","هدف الحفظ"]},
{canonical:"clarification follow-up conversation",aliases:["what do you mean","can you repeat","say that another way","I mean","actually","more details","clarify","répète","précise","ماذا تقصد","أعد الشرح"]}
];

const synonymSets: string[][] = [["Quran lessons","Quran studies","learn to recite","Quran course","Islamic lessons","cours de Coran","études coraniques","apprendre la récitation","cours religieux","matières islamiques","دروس القرآن","تعليم القرآن","دراسة القرآن","تعلم التلاوة","الدروس الإسلامية"],["create an account","apply to join","student sign-up","enrollment process","new student admission","créer un compte","demande d'inscription","inscrire un élève","devenir étudiant","procédure d'admission","إنشاء حساب","طلب التسجيل","تسجيل طالب","الالتحاق بالأكاديمية","قبول الطلاب"],["monthly fee","lesson price","tuition amount","payment status","payment deadline","frais mensuels","prix des cours","montant à payer","état du paiement","date limite de paiement","الرسوم الشهرية","سعر الدروس","المبلغ المستحق","حالة الدفع","موعد الدفع"],["weekly class plan","lesson timetable","upcoming lesson","class calendar","scheduled lesson","planning hebdomadaire","horaire des cours","prochaine leçon","calendrier des cours","cours programmé","جدول أسبوعي","مواعيد الدروس","الحصة القادمة","تقويم الحصص","موعد الدرس"],["enter the online lesson","video lesson URL","meeting invitation","connect to the lesson","lesson access link","entrer dans le cours en ligne","lien de visioconférence","invitation à la réunion","se connecter au cours","lien d'accès au cours","الدخول إلى الدرس","رابط الدرس المرئي","دعوة الاجتماع","الاتصال بالدرس","رابط الدخول للحصة"],["attendance status","class presence record","absence record","late arrival","attendance report","statut de présence","registre des présences","historique des absences","retard au cours","rapport de présence","حالة الحضور","سجل الغياب","تأخر عن الحصة","تقرير الحضور","تاريخ الحضور"],["homework task","work to complete","assigned exercise","homework deadline","unfinished assignment","devoir à faire","travail à terminer","exercice assigné","date limite du devoir","travail non terminé","الواجب المدرسي","المهمة المطلوبة","التمرين المكلّف به","موعد تسليم الواجب","واجب لم يكتمل"],["memorization progress","surah count","Quran learning progress","surahs completed","memorization ranking","progrès de mémorisation","nombre de sourates","progression coranique","sourates terminées","classement de mémorisation","تقدم الحفظ","عدد السور","تقدم تعلم القرآن","السور المكتملة","ترتيب الحفظ"],["Quran manuscript","Mushaf pages","browse Quran pages","open Quran reader","read a Quran page","moushaf","pages du Coran","naviguer dans le Coran","ouvrir le lecteur coranique","lire une page du Coran","المصحف الشريف","صفحات المصحف","تصفح صفحات القرآن","فتح قارئ القرآن","قراءة صفحة قرآنية"],["recitation pronunciation","Tajweed guidance","articulation points","Quran recitation technique","pronunciation correction","prononciation de la récitation","conseils de tajwid","points d'articulation","technique de récitation","corriger la prononciation","نطق التلاوة","إرشادات التجويد","مخارج الأصوات","طريقة التلاوة","تصحيح النطق"],["Quran memorizing routine","retention practice","daily Hifz","memorization schedule","review what I learned","routine de mémorisation","exercice de rétention","hifz quotidien","planning de mémorisation","réviser mes acquis","روتين حفظ القرآن","تثبيت الحفظ","الحفظ اليومي","جدول الحفظ","مراجعة ما تعلمته"],["Islamic law","rules of worship","religious practice questions","Islamic rulings","understanding Fiqh","droit islamique","règles du culte","questions de pratique religieuse","avis juridiques islamiques","comprendre le fiqh","الشريعة الإسلامية","أحكام العبادات","أسئلة دينية","الأحكام الشرعية","فهم الفقه"],["my assigned ustadh","teacher allocation","name of my instructor","who is my Quran teacher","teacher details","mon oustaz","enseignant attribué","nom de mon professeur","qui enseigne mon Coran","coordonnées de l'enseignant","الأستاذ المعيّن لي","تعيين المعلم","اسم المدرس","من يعلمني القرآن","بيانات المعلم"],["inbox","chat with teacher","send a reply","message thread","academy communication","boîte de réception","discuter avec l'enseignant","envoyer une réponse","fil de discussion","communication avec l'académie","صندوق الرسائل","محادثة الأستاذ","إرسال رد","سلسلة الرسائل","التواصل مع الأكاديمية"],["access my account","username recovery","reset password","sign-in trouble","student login details","accéder à mon compte","retrouver mon identifiant","réinitialiser le mot de passe","problème de connexion","identifiants étudiant","الدخول إلى حسابي","استعادة اسم المستخدم","إعادة تعيين كلمة المرور","مشكلة تسجيل الدخول","بيانات دخول الطالب"],["preferred language","change interface language","display language","use Arabic","switch interface to French","langue préférée","changer la langue de l'interface","langue d'affichage","utiliser l'arabe","passer l'interface en français","اللغة المفضلة","تغيير لغة الواجهة","لغة العرض","استخدام العربية","تحويل الواجهة إلى الفرنسية"],["connection failure","page won't load","server connection problem","unexpected error","site malfunction","échec de connexion","la page ne charge pas","problème de connexion au serveur","erreur inattendue","dysfonctionnement du site","فشل الاتصال","الصفحة لا تفتح","مشكلة اتصال بالخادم","خطأ غير متوقع","خلل في الموقع"],["account profile","personal details","update profile photo","my student information","edit my information","profil du compte","informations personnelles","modifier ma photo","mes informations d'élève","mettre à jour mes données","ملف الحساب","البيانات الشخصية","تغيير صورة الملف","معلومات الطالب","تحديث بياناتي"],["teacher control panel","class roster","students under my care","manage my class","teacher workspace","espace enseignant","liste de classe","mes élèves inscrits","gérer ma classe","espace de travail du professeur","لوحة المعلم","قائمة الطلاب","طلابي المسجلون","إدارة صفي","مساحة عمل المعلم"],["academy control panel","manage academy records","administrator tools","academy overview","manage academy users","espace administrateur","gérer les dossiers de l'académie","outils d'administration","vue d'ensemble de l'académie","gérer les utilisateurs","لوحة الإدارة","إدارة سجلات الأكاديمية","أدوات المدير","نظرة عامة على الأكاديمية","إدارة المستخدمين"],["data confidentiality","account protection","private student records","data access permissions","secure personal information","confidentialité des données","protection du compte","dossiers privés des élèves","droits d'accès aux données","sécuriser les informations","سرية البيانات","حماية الحساب","سجلات الطلاب الخاصة","صلاحيات الوصول للبيانات","تأمين المعلومات الشخصية"],["class evaluation","score my lesson","teacher feedback","lesson review","rate the session","évaluation du cours","noter ma leçon","avis sur l'enseignant","commentaire sur le cours","évaluer la séance","تقييم الدرس","تقييم الحصة","ملاحظات للمعلم","مراجعة الدرس","تقييم الجلسة"],["class alerts","upcoming lesson reminder","new notification","reminder message","alert settings","alertes de cours","rappel du prochain cours","nouvelle notification","message de rappel","paramètres des alertes","تنبيهات الحصص","تذكير بالدرس القادم","إشعار جديد","رسالة تذكير","إعدادات التنبيه"],["academy creator","who started this academy","assistant creator","academy background","founding person","créateur de l'académie","qui a fondé cette académie","créateur de l'assistant","histoire de l'académie","fondateur","مؤسس الأكاديمية","من بدأ الأكاديمية","مبتكر المساعد","تاريخ الأكاديمية","الشخص المؤسس"],["explain it simply","walk me through this","clarify the lesson","help me understand","give me guidance","explique simplement","guide-moi étape par étape","clarifie la leçon","aide-moi à comprendre","donne-moi des conseils","اشرح ببساطة","وضح لي خطوة بخطوة","فسّر الدرس","ساعدني على الفهم","أرشدني"],["greetings and salutations","good to see you","I appreciate it","many thanks","talk to you later","salutations","ravi de vous retrouver","je vous remercie","un grand merci","à bientôt","تحياتي","سعيد بلقائك","أقدّر مساعدتك","شكراً جزيلاً","إلى اللقاء"],["my current proficiency","course difficulty level","learning stage","beginner course","advanced study level","mon niveau actuel","niveau de difficulté","étape d'apprentissage","cours pour débutant","niveau avancé","مستواي الحالي","مستوى صعوبة الدرس","مرحلة التعلم","دورة للمبتدئين","المستوى المتقدم"],["change the lesson date","move my class","I will miss the lesson","request a new time","class date change","changer la date du cours","déplacer ma séance","je manquerai le cours","demander un nouvel horaire","modifier la date du cours","تغيير تاريخ الحصة","نقل موعد الدرس","سأتغيب عن الحصة","طلب موعد جديد","تعديل موعد الدرس"],["effective study methods","improve my recitation","daily learning habits","practice recommendations","build a study routine","méthodes d'étude efficaces","améliorer ma récitation","habitudes d'apprentissage","conseils d'entraînement","créer une routine d'étude","طرق دراسة فعالة","تحسين تلاوتي","عادات التعلم اليومية","نصائح للتدرب","إنشاء روتين للدراسة"],["get technical assistance","academy help contact","support phone","report a problem","contact the support team","obtenir une assistance technique","contacter l'aide de l'académie","téléphone du support","signaler un problème","contacter l'équipe d'assistance","الحصول على مساعدة تقنية","التواصل مع دعم الأكاديمية","هاتف الدعم","الإبلاغ عن مشكلة","الاتصال بفريق المساعدة"],["parent account","my child's lessons","enroll my son","enroll my daughter","guardian information","compte parent","cours de mon enfant","inscrire mon fils","inscrire ma fille","informations du tuteur","حساب ولي الأمر","دروس طفلي","تسجيل ابني","تسجيل ابنتي","بيانات ولي الأمر"],["course handouts","lesson documents","study files","download learning resources","class notes","supports pédagogiques","documents de cours","fichiers d'étude","télécharger les ressources","notes de cours","أوراق الدروس","وثائق الحصة","ملفات الدراسة","تحميل مصادر التعلم","ملاحظات الدرس"],["learning objective","memorization goal","target for this month","progress milestone","personal learning plan","objectif d'apprentissage","objectif de mémorisation","objectif du mois","étape de progression","plan personnel d'apprentissage","هدف التعلم","هدف الحفظ","هدف هذا الشهر","مرحلة التقدم","خطة تعلم شخصية"],["please rephrase that","I need more context","can you be more specific","let me clarify","I meant something else","reformulez s'il vous plaît","j'ai besoin de précisions","pouvez-vous préciser","laissez-moi clarifier","je voulais dire autre chose","أعد صياغة ذلك","أحتاج إلى مزيد من السياق","هل يمكنك التحديد أكثر","دعني أوضح","كنت أقصد شيئاً آخر"]];
const typoPairs: Array<[string,string]> = [
 ["tajweed","tajwid"],["quraan","quran"],["koran","quran"],["quran","quran"],["sourat","surah"],
 ["mushaf","mushaf"],["hifdh","hifz"],["hifz","hifz"],["tajwid","tajwid"],["oustaz","oustadh"],
 ["ouztaz","oustadh"],["ustaz","oustadh"],["ustadh","oustadh"],["scedule","schedule"],["shedule","schedule"],
 ["timetable","timetable"],["assigment","assignment"],["assignement","assignment"],["attendence","attendance"],
 ["presense","presence"],["absense","absence"],["connexion","connection"],["conection","connection"],
 ["pasword","password"],["pasword","password"],["recieve","receive"],["techer","teacher"],["teatcher","teacher"],
 ["payement","payment"],["paiment","payment"],["insciption","inscription"],["inscription","inscription"],
 ["francais","français"],["frensh","french"],["arabic","arabic"],["englis","english"]
];

const frames = [
"please help me with","I have a question about","could you explain","tell me more about","I would like to know about","can you help me understand","how can I manage","where can I find","I need information about","I want to ask about","what should I do about","can you guide me on","please tell me how to","I am asking about","I need help regarding","could you clarify","je voudrais savoir","aidez-moi avec","j'ai une question sur","expliquez-moi","comment faire pour","où trouver","j'aimerais comprendre","pouvez-vous m'aider avec","أريد أن أعرف عن","ساعدني في","لدي سؤال عن","اشرح لي","كيف يمكنني","أحتاج مساعدة في","هل يمكنك توضيح","أريد معلومات عن","من فضلك أخبرني عن","ماذا أفعل بخصوص","can you tell me","I am not sure about","I am confused about","what about","is there a way to","please guide me through"
];
const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[ًٌٍَُِّْـٰ]/g,"").replace(/[^a-z0-9\u0600-\u06ff]+/g," ").replace(/\s+/g," ").trim();
const stop=new Set(["please","could","would","help","with","about","the","for","and","what","how","where","tell","more","question","je","de","la","le","les","une","des","du","dans","sur","avec","pour","comment","vous","mon","ma","mes","من","في","عن","هل","كيف","أريد","أحتاج","مع","لي"]);
const tokens=(s:string)=>normalize(s).split(" ").filter(t=>t.length>1&&!stop.has(t));
const examples:Array<{text:string;canonical:string}>=[];
const baseAliases:Array<{text:string;canonical:string}>=[];
for(const [i,intent] of intents.entries()) {
 const aliases=[...intent.aliases,...(synonymSets[i]||[])];
 for(const alias of aliases) {
  baseAliases.push({text:alias,canonical:intent.canonical});
  examples.push({text:alias,canonical:intent.canonical});
  for(const frame of frames) examples.push({text:frame+" "+alias,canonical:intent.canonical});
 }
}

/*
 * Language-balanced natural query paraphrases.
 * These are separate from the shared sentence-frame combinations above:
 * 34 topics × 30 localized formulations = 1,020 query variants per language.
 */
const localizedTopics = {
 en: [
  "Academy courses","registration","fees and tuition","class timetable","online class link","attendance record","homework assignment","surah progress","Quran reader","Tajwid rules","Hifz memorization","Fiqh lessons","my assigned teacher","messages","account login","language settings","technical problem","student profile","teacher dashboard","administrator dashboard","privacy and security","class feedback","notifications","Academy founder","learning help","greetings","learning level","rescheduling a class","study advice","technical support","parent registration","course materials","learning goals","clarifying a previous answer"
 ],
 fr: [
  "les cours de l’Académie","l’inscription","les frais de scolarité","l’emploi du temps","le lien du cours en ligne","le relevé de présence","les devoirs","ma progression dans les sourates","le lecteur du Coran","les règles du tajwid","la mémorisation du hifz","les cours de fiqh","mon professeur attitré","les messages","la connexion au compte","les paramètres de langue","un problème technique","le profil de l’élève","le tableau de bord enseignant","le tableau de bord administrateur","la confidentialité et la sécurité","l’avis sur un cours","les notifications","le fondateur de l’Académie","l’aide à l’apprentissage","les salutations","le niveau d’apprentissage","le changement d’horaire d’un cours","les conseils d’étude","l’assistance technique","l’inscription d’un enfant","les supports de cours","les objectifs d’apprentissage","la clarification d’une réponse précédente"
 ],
 ar: [
  "دورات الأكاديمية","التسجيل","الرسوم الدراسية","جدول الحصص","رابط الحصة عبر الإنترنت","سجل الحضور","الواجبات","تقدمي في السور","قارئ القرآن","أحكام التجويد","حفظ القرآن","دروس الفقه","المعلم المخصص لي","الرسائل","تسجيل الدخول إلى الحساب","إعدادات اللغة","مشكلة تقنية","ملف الطالب","لوحة المعلم","لوحة المسؤول","الخصوصية والأمان","تقييم الحصة","الإشعارات","مؤسس الأكاديمية","المساعدة في التعلم","التحية","مستوى التعلم","تغيير موعد الحصة","نصائح الدراسة","الدعم الفني","تسجيل طفل","المواد التعليمية","أهداف التعلم","توضيح إجابة سابقة"
 ]
};
const localizedFrames = {
 en: [
  "Tell me about {x}.","I need help with {x}.","Can you explain {x}?","I have a question about {x}.","Where can I find information about {x}?","How do I use {x}?","Please help me understand {x}.","I would like details about {x}.","Could you give me information on {x}?","I want to ask about {x}.","What should I know about {x}?","Can you guide me regarding {x}?","I am looking for help with {x}.","Please clarify {x} for me.","How can I manage {x}?","I would like to know more about {x}.","Could you tell me how {x} works?","I am confused about {x}.","I need an explanation of {x}.","Where do I go for {x}?","Can you assist me with {x}?","Please give me more details on {x}.","I want to understand {x} better.","What are my options for {x}?","Can you help me with a question on {x}?","I would appreciate guidance about {x}.","Could you explain how to access {x}?","I need support related to {x}.","Let me ask you about {x}.","What can you tell me regarding {x}?"
 ],
 fr: [
  "Parlez-moi de {x}.","J’ai besoin d’aide concernant {x}.","Pouvez-vous expliquer {x} ?","J’ai une question sur {x}.","Où puis-je trouver des informations sur {x} ?","Comment utiliser {x} ?","Aidez-moi à comprendre {x}.","Je voudrais des détails sur {x}.","Pouvez-vous me renseigner sur {x} ?","Je souhaite poser une question sur {x}.","Que dois-je savoir sur {x} ?","Pouvez-vous me guider concernant {x} ?","Je cherche de l’aide pour {x}.","Pouvez-vous clarifier {x} pour moi ?","Comment puis-je gérer {x} ?","J’aimerais en savoir plus sur {x}.","Comment fonctionne {x} ?","Je ne comprends pas bien {x}.","J’ai besoin d’une explication sur {x}.","Où dois-je aller pour {x} ?","Pouvez-vous m’aider avec {x} ?","Donnez-moi plus de détails sur {x}, s’il vous plaît.","Je veux mieux comprendre {x}.","Quelles sont mes options pour {x} ?","Pouvez-vous répondre à une question sur {x} ?","J’aimerais recevoir des conseils sur {x}.","Comment accéder à {x} ?","J’ai besoin d’assistance concernant {x}.","Je voudrais vous interroger sur {x}.","Que pouvez-vous me dire au sujet de {x} ?"
 ],
 ar: [
  "أخبرني عن {x}.","أحتاج إلى مساعدة بشأن {x}.","هل يمكنك شرح {x}؟","لدي سؤال عن {x}.","أين أجد معلومات عن {x}؟","كيف أستخدم {x}؟","ساعدني على فهم {x}.","أريد تفاصيل عن {x}.","هل يمكنك تزويدي بمعلومات حول {x}؟","أريد أن أسأل عن {x}.","ماذا ينبغي أن أعرف عن {x}؟","هل يمكنك إرشادي بخصوص {x}؟","أبحث عن مساعدة في {x}.","من فضلك وضح لي {x}.","كيف يمكنني التعامل مع {x}؟","أريد معرفة المزيد عن {x}.","كيف يعمل {x}؟","لا أفهم {x} جيدًا.","أحتاج إلى تفسير {x}.","إلى أين أذهب بخصوص {x}؟","هل يمكنك مساعدتي في {x}؟","أعطني مزيدًا من التفاصيل عن {x}.","أريد فهم {x} بشكل أفضل.","ما الخيارات المتاحة لي بخصوص {x}؟","هل يمكنك الإجابة عن سؤال حول {x}؟","أحتاج إلى توجيه بشأن {x}.","كيف أصل إلى {x}؟","أحتاج إلى دعم يتعلق بـ{x}.","أود أن أسألك عن {x}.","ماذا يمكنك أن تخبرني عن {x}؟"
 ]
};
export const CHAT_LOCALIZED_VARIANTS: Record<"en" | "fr" | "ar", number> = { en: 0, fr: 0, ar: 0 };
for (const lang of ["en","fr","ar"] as const) {
 const topics=localizedTopics[lang], localized=localizedFrames[lang];
 let count=0;
 for (const topic of topics) for (const frame of localized) {
  const text=frame.replace("{x}",topic);
  const item={text,canonical:intents[topics.indexOf(topic)].canonical};
  examples.push(item);
  baseAliases.push(item);
  count++;
 }
 CHAT_LOCALIZED_VARIANTS[lang]=count;
}


/* Second bank: 34 topics × 30 new formulations = 1,020 additional combinations per language. */
const extraFrames = {
 en: ["Could I get guidance about {x}?","I am trying to figure out {x}.","I am having trouble with {x}.","Walk me through {x}, please.","What is the best way to handle {x}?","I have a question concerning {x}.","Point me in the right direction for {x}.","I need details regarding {x}.","How do I get started with {x}?","I am unsure how {x} works.","Give me a quick overview of {x}.","I need more clarity on {x}.","Help me sort out {x}.","I want to check something about {x}.","What should I do for {x}?","I cannot work out {x}.","Where do I go for {x}?","I have doubts about {x}.","Make {x} easier to understand, please.","What steps should I follow for {x}?","I need help because of {x}.","Would you explain {x} for me?","I do not know where to start with {x}.","Help me find the right option for {x}.","Explain {x} in simple words, please.","I need an answer about {x}.","What is the process for {x}?","I would appreciate help with {x}.","Clear up my confusion about {x}.","I want to check that I understand {x}."],
 fr: ["Pourriez-vous me conseiller au sujet de {x} ?","J’essaie de comprendre {x}.","J’ai des difficultés avec {x}.","Expliquez-moi {x} étape par étape.","Quelle est la meilleure façon de gérer {x} ?","J’ai une question concernant {x}.","Pouvez-vous m’orienter pour {x} ?","J’ai besoin de précisions sur {x}.","Comment commencer avec {x} ?","Je ne sais pas comment fonctionne {x}.","Donnez-moi un aperçu de {x}.","J’ai besoin d’éclaircissements sur {x}.","Aidez-moi à résoudre mon problème avec {x}.","Je voudrais vérifier quelque chose sur {x}.","Que dois-je faire pour {x} ?","Je ne comprends pas bien {x}.","Où dois-je aller pour {x} ?","J’ai des doutes concernant {x}.","Rendez {x} plus facile à comprendre.","Quelles étapes suivre pour {x} ?","J’ai besoin d’aide à propos de {x}.","Pourriez-vous m’expliquer {x} ?","Je ne sais pas par où commencer pour {x}.","Aidez-moi à choisir la bonne option pour {x}.","Expliquez {x} simplement, s’il vous plaît.","J’ai besoin d’une réponse sur {x}.","Quelle est la procédure pour {x} ?","Merci de m’aider concernant {x}.","Éclaircissez mes doutes sur {x}.","Je veux vérifier que j’ai bien compris {x}."],
 ar: ["هل يمكن إرشادي بشأن {x}؟","أحاول فهم {x}.","أواجه صعوبة في {x}.","اشرح لي {x} خطوة بخطوة.","ما أفضل طريقة للتعامل مع {x}؟","لدي سؤال بخصوص {x}.","أرشدني إلى الطريقة المناسبة لـ{x}.","أحتاج تفاصيل عن {x}.","كيف أبدأ في {x}؟","لا أعرف كيف يعمل {x}.","أعطني فكرة عامة عن {x}.","أحتاج إلى توضيح بشأن {x}.","ساعدني في حل مشكلة {x}.","أريد التأكد من أمر حول {x}.","ماذا أفعل بشأن {x}؟","لا أفهم {x} جيدًا.","أين أجد {x}؟","لدي شكوك حول {x}.","بسّط لي {x} من فضلك.","ما خطوات القيام بـ{x}؟","أحتاج مساعدة بخصوص {x}.","هل يمكنك شرح {x} لي؟","لا أعرف من أين أبدأ في {x}.","ساعدني في اختيار الخيار المناسب لـ{x}.","اشرح {x} بكلمات بسيطة.","أحتاج إجابة عن {x}.","ما الإجراءات الخاصة بـ{x}؟","ساعدني من فضلك في {x}.","وضّح ما التبس عليّ بشأن {x}.","أريد التأكد من فهم {x} بشكل صحيح."] };
for (const lang of ["en","fr","ar"] as const) {
 const topics=localizedTopics[lang], framesForLanguage=extraFrames[lang];
 for (let i=0;i<topics.length;i++) for (const frame of framesForLanguage) {
  const item={text:frame.replace("{x}",topics[i]),canonical:intents[i].canonical};
  examples.push(item); baseAliases.push(item);
 }
}


/*
 * Expanded multilingual coverage: 34 topics × 90 carefully composed follow-up
 * formulations = 3,060 additional variants in EACH language. Together with the
 * two existing 1,020-variant banks, this gives 5,100 localized examples per
 * language before the shared synonym and typo banks.
 */
const expandedFrames = {
 en: {
  starts: [
   "Please help me with {x}",
   "Could you explain {x}",
   "I would like some guidance about {x}",
   "Can you walk me through {x}",
   "I need to understand {x}",
   "Could you give me a clear answer about {x}",
   "Please show me how to handle {x}",
   "I have a question regarding {x}",
   "Would you help me figure out {x}",
   "I am looking for practical information about {x}"
  ],
  ends: [
   "so I know what to do next.",
   "in simple, clear language.",
   "with the steps in the right order.",
   "and tell me where to find it.",
   "so I can use the platform correctly.",
   "without leaving out the important details.",
   "with an example if that would help.",
   "and point out anything I should check.",
   "so I can make progress confidently."
  ]
 },
 fr: {
  starts: [
   "Aidez-moi à comprendre {x}",
   "Pourriez-vous m’expliquer {x}",
   "J’aimerais être guidé au sujet de {x}",
   "Pouvez-vous me montrer comment gérer {x}",
   "J’ai besoin de mieux comprendre {x}",
   "Pourriez-vous me donner une réponse claire sur {x}",
   "Montrez-moi comment procéder pour {x}",
   "J’ai une question concernant {x}",
   "Pourriez-vous m’aider à clarifier {x}",
   "Je cherche des informations pratiques sur {x}"
  ],
  ends: [
   "afin de savoir quoi faire ensuite.",
   "avec des mots simples et clairs.",
   "en présentant les étapes dans l’ordre.",
   "et indiquez-moi où trouver cette option.",
   "pour que je puisse bien utiliser la plateforme.",
   "sans oublier les détails importants.",
   "avec un exemple si nécessaire.",
   "en précisant les points à vérifier.",
   "afin que je puisse avancer sereinement."
  ]
 },
 ar: {
  starts: [
   "من فضلك ساعدني في فهم {x}",
   "هل يمكنك شرح {x} لي",
   "أود الحصول على إرشاد بشأن {x}",
   "هل يمكنك توضيح كيفية التعامل مع {x}",
   "أحتاج إلى فهم {x} بشكل أفضل",
   "هل يمكنك إعطائي إجابة واضحة عن {x}",
   "أرني كيف أتعامل مع {x}",
   "لدي سؤال بخصوص {x}",
   "هل يمكنك مساعدتي في توضيح {x}",
   "أبحث عن معلومات عملية حول {x}"
  ],
  ends: [
   "حتى أعرف ما ينبغي فعله بعد ذلك.",
   "بلغة بسيطة وواضحة.",
   "مع ترتيب الخطوات بشكل صحيح.",
   "وأخبرني أين أجد هذا الخيار.",
   "حتى أستخدم المنصة بطريقة صحيحة.",
   "مع عدم إغفال التفاصيل المهمة.",
   "مع مثال إذا كان ذلك مفيدًا.",
   "مع توضيح الأمور التي ينبغي التحقق منها.",
   "حتى أتمكن من المتابعة بثقة."
  ]
 }
};
export const CHAT_EXPANDED_VARIANTS: Record<"en" | "fr" | "ar", number> = { en: 0, fr: 0, ar: 0 };
for (const lang of ["en","fr","ar"] as const) {
 const topics=localizedTopics[lang];
 const {starts,ends}=expandedFrames[lang];
 let count=0;
 for(let i=0;i<topics.length;i++) {
  for(const start of starts) for(const end of ends) {
   const item={text:start.replace("{x}",topics[i])+" "+end,canonical:intents[i].canonical};
   examples.push(item);
   count++;
  }
 }
 CHAT_EXPANDED_VARIANTS[lang]=count;
}
export const CHAT_LOCALIZED_TOTAL: Record<"en" | "fr" | "ar", number> = {
 en: CHAT_LOCALIZED_VARIANTS.en + 1020 + CHAT_EXPANDED_VARIANTS.en,
 fr: CHAT_LOCALIZED_VARIANTS.fr + 1020 + CHAT_EXPANDED_VARIANTS.fr,
 ar: CHAT_LOCALIZED_VARIANTS.ar + 1020 + CHAT_EXPANDED_VARIANTS.ar
};

const compiledExamples=examples.map(e=>({...e,phrase:normalize(e.text),wanted:tokens(e.text)}));
export const CHAT_EXAMPLE_COUNT=examples.length;
export const CHAT_SYNONYM_COUNT=synonymSets.reduce((n,items)=>n+items.length,0);
function editDistance(a:string,b:string):number {
 if(Math.abs(a.length-b.length)>2)return 3;
 const prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++) {
  let diagonal=prev[0]; prev[0]=i;
  for(let j=1;j<=b.length;j++) {
   const above=prev[j];
   prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1));
   diagonal=above;
  }
 }
 return prev[b.length];
}
function phoneticFold(s:string):string {
 return normalize(s)
  .replace(/ph/g,"f").replace(/ck/g,"k").replace(/qu/g,"k")
  .replace(/th/g,"t").replace(/dh/g,"d").replace(/ou/g,"u")
  .replace(/oo/g,"u").replace(/ee/g,"i").replace(/ea/g,"i")
  .replace(/kh/g,"h").replace(/gh/g,"g").replace(/sh/g,"ch");
}
export function matchChatExample(query:string):{score:number;canonical:string}|null {
 const q=normalize(query); if(!q) return null;
 const qt=new Set(tokens(q)); if(!qt.size) return null;
 let best:{score:number;canonical:string}|null=null;
 for(const e of compiledExamples) {
  const phrase=e.phrase;
  if(q.includes(phrase)) { const score=Math.min(.99,.78+Math.min(.21,phrase.length/180)); if(!best||score>best.score)best={score,canonical:e.canonical}; continue; }
  const wanted=e.wanted; if(!wanted.length)continue;
  const overlap=wanted.filter(t=>qt.has(t)).length; if(!overlap)continue;
  const precision=overlap/wanted.length, recall=overlap/Math.max(1,qt.size);
  const score=Math.min(.88,precision*.58+recall*.42);
  if(score>=.56&&(!best||score>best.score))best={score,canonical:e.canonical};
 }
 if(best && best.score>=.72)return best;
 // A light phonetic/typo pass on the compact base vocabulary, not every generated
 // sentence frame. This keeps matching inexpensive while accepting common misspellings.
 const qWords=tokens(q);
 for(const e of baseAliases) {
  const alias=normalize(e.text);
  if(alias.length<4)continue;
  const aliasWords=tokens(alias);
  let matched=0;
  for(const aw of aliasWords) {
   if(qWords.some(qw=>qw===aw || phoneticFold(qw)===phoneticFold(aw) ||
     (Math.min(qw.length,aw.length)>=4 && editDistance(qw,aw)<= (Math.max(qw.length,aw.length)>=8?2:1)))) matched++;
  }
  if(!matched)continue;
  const precision=matched/Math.max(1,aliasWords.length);
  const recall=matched/Math.max(1,qWords.length);
  const score=Math.min(.79,.48+precision*.19+recall*.12);
  if(score>=.56&&(!best||score>best.score))best={score,canonical:e.canonical};
 }
 return best;
}


/**
 * Detect the language(s) actually used in a message, independently of the UI locale.
 * Returns mixed languages when there is meaningful evidence for more than one.
 * Very short or language-neutral messages return [] so callers can use conversation context.
 */
export function detectChatLanguages(value: unknown): string[] {
 const raw=String(value ?? "").normalize("NFC").toLowerCase();
 if(!raw.trim()) return [];
 const result:string[]=[];
 const arabicChars=(raw.match(/[\u0600-\u06ff]/g)||[]).length;
 const latinChars=(raw.match(/[a-zà-öø-ÿœæ]/g)||[]).length;
 if(arabicChars>=1) result.push("ar");
 const normalized=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 const words=new Set(normalized.match(/[a-z]+/g)||[]);
 const frenchWords=new Set(("bonjour bonsoir salut merci mercis oui non pourquoi comment combien quand ou où avec mais pour dans chez sans sur sous est sont suis sommes avez avez-vous vous votre vos nous je j'aime j'ai je veux je voudrais besoin aide aidez explique expliquez comprendre cours coran recitation récitation tajwid enseignant enseigants professeur professeurs eleve eleves élève élèves inscription paiement facture frais horaire emploi temps presence présence absence devoirs devoir prochaine prochain prochaine demain aujourd hui aujourd'hui academie académie langue francais français s'il vous plait plaît pouvez pouvez-vous quel quelle quels quelles mon ma mes ton ta tes role rôle mission fonction bienvenue bonnejour").split(/\s+/));
 const englishWords=new Set(("hello hi hey greetings thanks thankyou please yes yeah nope no why how what when where who which can could would should do does did is are am was were have has had my your yours our their me tell explain help need want looking find class classes student students teacher teachers course courses quran recitation tajweed hifz revision assignment homework attendance timetable schedule payment invoice fee fees price cost today tomorrow next account password login language english french arabic please platform academy howdy morning afternoon evening good").split(/\s+/));
 let fr=0,en=0;
 for(const w of words){if(frenchWords.has(w))fr+=1;if(englishWords.has(w))en+=1;}
 // Strong French orthography and common contractions are useful evidence, but
 // accents alone never force French for a single borrowed name.
 if(/[àâçéèêëîïôùûüÿœæ]/i.test(raw)) fr+=2;
 if(/\b(c'est|j'ai|j'en|j'étais|qu'est-ce|n'est|l'académie|s'il|j'aimerais|j'aimerais|j'ai besoin|est-ce que)\b/i.test(raw)) fr+=2;
 // English syntax markers help distinguish English from French when vocabulary overlaps.
 if(/\b(the|and|with|from|about|please|what|where|when|how|why|can|could|would|my|your|is|are|do|does|i am|i'm|i want|i need|tell me)\b/i.test(raw)) en+=1;
 if(fr>=1 && (fr>=en || fr>=2)) result.push("fr");
 if(en>=1 && (en>fr || en>=2)) result.push("en");
 // For a clearly Latin-script message with no recognized markers, leave language
 // unresolved so the caller can fall back to recent conversation context.
 if(!result.length && latinChars>0) return [];
 return result;
}
