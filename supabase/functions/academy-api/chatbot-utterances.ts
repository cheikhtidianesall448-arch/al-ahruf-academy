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
const frames = [
"please help me with","I have a question about","could you explain","tell me more about","I would like to know about","can you help me understand","how can I manage","where can I find","I need information about","I want to ask about","what should I do about","can you guide me on","please tell me how to","I am asking about","I need help regarding","could you clarify","je voudrais savoir","aidez-moi avec","j'ai une question sur","expliquez-moi","comment faire pour","où trouver","j'aimerais comprendre","pouvez-vous m'aider avec","أريد أن أعرف عن","ساعدني في","لدي سؤال عن","اشرح لي","كيف يمكنني","أحتاج مساعدة في","هل يمكنك توضيح","أريد معلومات عن","من فضلك أخبرني عن","ماذا أفعل بخصوص","can you tell me","I am not sure about","I am confused about","what about","is there a way to","please guide me through"
];
const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g," ").replace(/\s+/g," ").trim();
const stop=new Set(["please","could","would","help","with","about","the","for","and","what","how","where","tell","more","question","je","de","la","le","les","une","des","du","dans","sur","avec","pour","comment","vous","mon","ma","mes","من","في","عن","هل","كيف","أريد","أحتاج","مع","لي"]);
const tokens=(s:string)=>normalize(s).split(" ").filter(t=>t.length>1&&!stop.has(t));
const examples:Array<{text:string;canonical:string}>=[];
for(const intent of intents) for(const alias of intent.aliases) {
 examples.push({text:alias,canonical:intent.canonical});
 for(const frame of frames) examples.push({text:frame+" "+alias,canonical:intent.canonical});
}
export const CHAT_EXAMPLE_COUNT=examples.length;
export function matchChatExample(query:string):{score:number;canonical:string}|null {
 const q=normalize(query); if(!q) return null;
 const qt=new Set(tokens(q)); if(!qt.size) return null;
 let best:{score:number;canonical:string}|null=null;
 for(const e of examples) {
  const phrase=normalize(e.text);
  if(q.includes(phrase)) { const score=Math.min(.99,.78+Math.min(.21,phrase.length/180)); if(!best||score>best.score)best={score,canonical:e.canonical}; continue; }
  const wanted=tokens(e.text); if(!wanted.length)continue;
  const overlap=wanted.filter(t=>qt.has(t)).length; if(!overlap)continue;
  const precision=overlap/wanted.length, recall=overlap/Math.max(1,qt.size);
  const score=Math.min(.88,precision*.58+recall*.42);
  if(score>=.56&&(!best||score>best.score))best={score,canonical:e.canonical};
 }
 return best;
}
