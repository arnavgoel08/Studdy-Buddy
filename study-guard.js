/* Study-only request guard. Deterministic, local, and intentionally dependency-free. */
(function (root) {
  'use strict';

  var REDIRECT = "I'm your Study Buddy! I can help with maths, science, engineering, programming, languages, and other learning-related questions. Try asking me something you're studying. 😊";

  var SUBJECT_PATTERNS = [
    /\bmaths?\b|\bmathematics\b|\balgebra\b|\bgeometry\b|\btrigonometry\b|\bcalculus\b|\bintegrals?\b|\bderivatives?\b|\bstatistics\b|\bprobability\b|\bdifferential equations?\b|\blinear algebra\b/i,
    /\bphysics\b|\bquantum\b|\bmechanics\b|\bthermodynamics\b|\boptics\b|\belectromagnetism\b|\bwave[- ]particle\b|\bchemistry\b|\borganic chemistry\b|\bbiochemistry\b|\bbiology\b|\bbiotechnology\b|\bgenetics\b|\bphotosynthesis\b|\bcell biology\b|\bmitochondria?\b|\banatomy\b|\bphysiology\b|\bmicrobiology\b|\becology\b|\bgeology\b|\bastronomy\b|\brain formation\b|\bwater cycle\b|\bevaporation\b|\bcondensation\b|\bweather patterns?\b|\bcloud formation\b|\brain\b|\brainfall\b|\bclimate\b|\bgravity\b|\belectricity\b|\bmagnetism\b|\benergy\b|\bforce\b|\bmotion\b|\batoms?\b|\bmolecules?\b/i,
    /\bcomputer science\b|\bprogramming\b|\bpython\b|\bjavascript\b|\btypescript\b|\bjava\b|\bc\+\+(?:\b|$)|\bc#(?:\b|$)|\bhtml\b|\bcss\b|\bweb development\b|\bdata structures?\b|\balgorithms?\b|\brecursion\b|\bdebug(?:ging)?\b|\bsyntax error\b|\bcode\b|\bdatabase\b|\bdbms\b|\bsql\b|\boperating systems?\b|\bcomputer networks?\b|\bcybersecurity\b|\bmachine learning\b|\bdeep learning\b|\bartificial intelligence\b|\bai\b|\bml\b|\brobotics\b|\bengineering\b|\bdigital logic\b|\belectronics?\b|\belectrical\b|\bmechanical engineering\b|\bcivil engineering\b|\bdata science\b|\binformation technology\b|\b\bmdp\b/i,
    /\bhistory\b|\bfrench revolution\b|\bindian independence\b|\bindian constitution\b|\bworld war(?: i| ii| one| two)?\b|\bamerican revolution\b|\bindustrial revolution\b|\bcold war\b|\bdemocracy\b|\bconstitution\b|\bfundamental rights\b|\bcivics\b|\binflation\b|\beconomics\b|\baccounting\b|\bfinance\b|\bbusiness studies\b|\bmanagement\b|\bmarketing\b|\bpsychology\b|\bsociology\b|\bphilosophy\b|\bpolitical science\b|\blaw\b|\bliterature\b|\benglish\b|\btamil\b|\bhindi\b|\bgrammar\b|\blanguage learning\b|\bcommunication skills\b|\btechnical english\b|\benvironmental science\b|\bevs\b|\bdesign thinking\b|\bart history\b|\bmusic theory\b|\barchitecture\b|\bentrepreneurship\b|\bethics\b|\bresearch methods\b|\bproject management\b|\bphysical education\b|\bsports science\b|\beducation\b|\bcomputer\b/i,
    /\bhomework\b|\bassignment\b|\bexam\b|\bquiz\b|\btest question\b|\blecture notes\b|\bstudy notes\b|\bflashcards?\b|\bformula\b|\bequation\b|\btheorem\b|\bproof\b|\bderive\b|\bcalculate\b|\bsolve for\b|\bworksheet\b|\bchapter\b|\bcoursework\b/i
  ];

  var OFF_TOPIC_PATTERNS = [
    /\b(?:tell|give|make|write|create|generate|compose)\s+(?:me\s+)?(?:a\s+)?(?:joke|meme|roast|pickup line|love letter|romantic poem|poem|song|short story|song lyrics?)\b/i,
    /\b(?:dating advice|relationship advice|my (?:girlfriend|boyfriend|crush|ex|relationship)|what should i text (?:my )?(?:crush|ex|girlfriend|boyfriend)|how do i get (?:a )?(?:girlfriend|boyfriend)|how to impress (?:my |a )?(?:crush|girl|boy|partner)|flirt(?:ing)? tips?|breakup advice|personal advice)\b/i,
    /\b(?:horoscope|fortune telling|tarot reading|recipe for|how to cook|what should i eat|meal plan for weight loss|workout plan|fitness advice|travel itinerary|vacation itinerary|holiday itinerary|shopping advice|recommend (?:a )?(?:phone|laptop|car|restaurant|movie|game)|movie recommendations?|celebrity gossip|sports scores?|who will win (?:the )?(?:match|game|world cup)|stock picks|investment advice|how to invest|crypto trading|betting tips|gambling tips|weather forecast|latest news)\b/i,
    /\b(?:write|compose)\s+(?:me\s+)?(?:a\s+)?(?:love|breakup|birthday|wedding)\s+(?:poem|song|letter|speech)\b/i,
    /\b(?:pretend to be my (?:girlfriend|boyfriend|partner)|romantic roleplay|adult roleplay)\b/i
  ];

  var ACADEMIC_FRAMING = /\b(?:for (?:my )?(?:class|homework|assignment|exam|course|presentation|essay|report|research project)|in (?:the|this) (?:book|novel|poem|play|story)|literary analysis|academic(?:ally)?|educational|study of|theory of|concept of|explain the science|history of|psychology of|sociology of|analyse|analyze|analysis of)\b/i;
  var LEARNING_INTENT = /\b(?:help me learn|teach me|help me understand|explain|define|derive|prove|calculate|solve|debug|fix this (?:code|error|program)|why does this (?:code|program|equation|formula)|summari[sz]e|make (?:study )?notes|quiz me|create flashcards|practice questions|revise|revision|homework|assignment|exam question|show the steps|step by step|what is the function of|how does .* work|what causes|compare and contrast|translate this|check my answer)\b/i;

  function normalise(value) {
    return String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }

  function isAcademicSubject(value) {
    var text = normalise(value);
    if (!text || text.length > 100) return false;
    if (/^(?:it|cs|cse|ece|eee|mdp|evs|b\.?(?:tech|e)\s*(?:it|cs|cse|ece|eee)|ai ?& ?ml)$/.test(text)) return true;
    return SUBJECT_PATTERNS.some(function (pattern) { return pattern.test(text); });
  }

  function isStudyRequest(value, context, hasImage) {
    var text = normalise(value);
    // Photo questions are permitted; tutor instructions require checking that the image is academic.
    if (!text && hasImage) return true;
    if (!text) return false;
    var hasSubject = SUBJECT_PATTERNS.some(function (pattern) { return pattern.test(text); });
    var hasMathNotation = /\b(?:\d+\s*[+*/=^-]|[a-z]\s*[=+*/-]\s*\d|[=+*/-]\s*[a-z0-9])|[√∫∑≤≥π]/i.test(text);
    var hasAcademicTask = LEARNING_INTENT.test(text) && (hasSubject || hasMathNotation || /\b(?:question|topic|concept|chapter|subject|formula|equation|code|program|error|algorithm|method|example|lesson|class|course|book|novel|assignment|homework|exam|test|quiz|notes|language|grammar|science|history|math|physics|chemistry|biology|computer|engineering|data structure|network|cell|energy|force|motion|matter|climate|democracy|constitution|economy|culture|literature|function|theorem|proof|calculus|variable|derivative|integral|recursion|loop|database|software|web development)\b/i.test(text));
    var academicallyFramed = ACADEMIC_FRAMING.test(text) || /\b(?:for learning|for studying|to understand the concept|educational purpose|for my class|for homework|for an assignment|for an exam|for a presentation|for a research project)\b/i.test(text);
    if (OFF_TOPIC_PATTERNS.some(function (pattern) { return pattern.test(text); }) && !academicallyFramed && !hasAcademicTask) return false;
    if (hasSubject || hasMathNotation) return true;
    if (hasAcademicTask) return true;
    // Explicit educational framing can include broad requests such as presentation topics.
    if (academicallyFramed && !OFF_TOPIC_PATTERNS.some(function (pattern) { return pattern.test(text); })) return true;
    return false;
  }

  root.SBStudyGuard = {
    redirect: function () { return REDIRECT; },
    isAcademicSubject: isAcademicSubject,
    isStudyRequest: isStudyRequest
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SBStudyGuard;
})(typeof window !== 'undefined' ? window : globalThis);
