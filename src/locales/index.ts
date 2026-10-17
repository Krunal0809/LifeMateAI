import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  inputPlaceholder: string;
  newChat: string;
  searchConversations: string;
  noConversations: string;
  clearHistory: string;
  confirmClear: string;
  
  // Navigation
  navChat: string;
  navLearn: string;
  navDailyLife: string;
  navCareer: string;
  navVoice: string;
  navKnowledge: string;
  navTickets: string;
  navAdmin: string;
  navSettings: string;
  navDocs: string;

  // Assistant Modes
  modeSimple: string;
  modeSimpleDesc: string;
  modeStudent: string;
  modeStudentDesc: string;
  modeProfessional: string;
  modeProfessionalDesc: string;
  modeSenior: string;
  modeSeniorDesc: string;
  modeCustom: string;

  // Starter Cards
  starterLearnTitle: string;
  starterLearnDesc: string;
  starterDailyTitle: string;
  starterDailyDesc: string;
  starterLangTitle: string;
  starterLangDesc: string;
  starterExamTitle: string;
  starterExamDesc: string;
  starterPhoneTitle: string;
  starterPhoneDesc: string;
  starterInterviewTitle: string;
  starterInterviewDesc: string;

  // Chat Actions
  send: string;
  stop: string;
  copy: string;
  copied: string;
  regenerate: string;
  readAloud: string;
  stopSpeech: string;
  helpful: string;
  notHelpful: string;
  requestHumanHelp: string;
  viewSources: string;
  agentBadge: string;
  detectedLangBadge: string;

  // Voice controls
  voiceListening: string;
  voiceStart: string;
  voiceStop: string;
  voiceTranscript: string;
  voiceEditBeforeSend: string;
  voiceErrorMicDenied: string;
  voiceNotSupported: string;

  // Common UI
  language: string;
  selectLanguage: string;
  mode: string;
  role: string;
  save: string;
  cancel: string;
  delete: string;
  loading: string;
  disclaimer: string;
  sourcesUsed: string;
  confidence: string;
  status: string;

  // Ticket System
  ticketsTitle: string;
  createNewTicket: string;
  ticketSubject: string;
  ticketDescription: string;
  ticketCategory: string;
  ticketPriority: string;
  ticketStatus: string;
  replyToTicket: string;
  submitReply: string;
  ticketCreatedSuccess: string;
  escalatedFromChat: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'LifeMate AI',
    tagline: 'One AI. Every Generation. Everyday Help.',
    welcomeTitle: 'Hello! Welcome to LifeMate AI.',
    welcomeSubtitle: 'Your personal AI companion for learning, everyday questions, technology guidance, and career preparation.',
    inputPlaceholder: 'What would you like help with today? (Ask in English, हिन्दी, or ગુજરાતી)...',
    newChat: 'New Conversation',
    searchConversations: 'Search chats...',
    noConversations: 'No previous conversations found.',
    clearHistory: 'Clear History',
    confirmClear: 'Are you sure you want to clear all conversations?',

    navChat: 'Assistant Chat',
    navLearn: 'Learn with AI',
    navDailyLife: 'Daily Life Assistant',
    navCareer: 'Career Assistant',
    navVoice: 'Voice Assistant',
    navKnowledge: 'Knowledge Base (RAG)',
    navTickets: 'Support Tickets',
    navAdmin: 'Admin Dashboard',
    navSettings: 'Settings & Accessibility',
    navDocs: 'Project Architecture & Viva',

    modeSimple: 'Simple Mode',
    modeSimpleDesc: 'Short sentences, practical examples, and easy-to-understand terms.',
    modeStudent: 'Student Mode',
    modeStudentDesc: 'Academic depth, step-by-step logic, study quizzes, and concepts.',
    modeProfessional: 'Professional Mode',
    modeProfessionalDesc: 'Structured output, productivity focus, and industry workflows.',
    modeSenior: 'Senior-Friendly Mode',
    modeSeniorDesc: 'Large high-contrast text, simplified steps, and speech support.',
    modeCustom: 'Custom Mode',

    starterLearnTitle: 'Learn Something New',
    starterLearnDesc: 'Explain Quantum Computing or Photosynthesis in simple words.',
    starterDailyTitle: 'Ask an Everyday Question',
    starterDailyDesc: 'How to safely set up and use UPI payments on your mobile phone.',
    starterLangTitle: 'Improve My Language',
    starterLangDesc: 'Practice conversational English, Gujarati idioms, or Hindi vocabulary.',
    starterExamTitle: 'Prepare for an Exam',
    starterExamDesc: 'Create a 7-day study plan and practice MCQs for my college test.',
    starterPhoneTitle: 'Learn How to Use My Phone',
    starterPhoneDesc: 'Step-by-step instructions for backing up photos to Google Drive.',
    starterInterviewTitle: 'Practice for an Interview',
    starterInterviewDesc: 'Conduct a mock technical interview for an IT / Software role.',

    send: 'Send',
    stop: 'Stop Generation',
    copy: 'Copy',
    copied: 'Copied!',
    regenerate: 'Regenerate',
    readAloud: 'Read Aloud',
    stopSpeech: 'Stop Audio',
    helpful: 'Helpful',
    notHelpful: 'Not helpful',
    requestHumanHelp: 'Connect to Human Support',
    viewSources: 'Retrieved Knowledge Sources',
    agentBadge: 'Active Agent',
    detectedLangBadge: 'Language',

    voiceListening: 'Listening to your voice...',
    voiceStart: 'Start Voice Input',
    voiceStop: 'Stop Voice Input',
    voiceTranscript: 'Recognized Voice Preview:',
    voiceEditBeforeSend: 'You can edit this recognized text before sending.',
    voiceErrorMicDenied: 'Microphone permission was denied. Please allow mic access in your browser.',
    voiceNotSupported: 'Speech recognition is not supported in this browser. Please use text input.',

    language: 'Language',
    selectLanguage: 'Select Language',
    mode: 'Assistant Mode',
    role: 'Active Role',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Processing request...',
    disclaimer: 'LifeMate AI may make mistakes. Please verify critical medical, financial, or legal information.',
    sourcesUsed: 'Verified Document Sources',
    confidence: 'Intent Confidence',
    status: 'Status',

    ticketsTitle: 'Human Support Tickets',
    createNewTicket: 'Create Support Ticket',
    ticketSubject: 'Subject / Issue Summary',
    ticketDescription: 'Detailed Description of your question',
    ticketCategory: 'Category',
    ticketPriority: 'Priority',
    ticketStatus: 'Ticket Status',
    replyToTicket: 'Write a reply...',
    submitReply: 'Send Reply',
    ticketCreatedSuccess: 'Support ticket created successfully! Your ticket ID has been generated.',
    escalatedFromChat: 'Escalated from AI Chat session'
  },
  hi: {
    appName: 'LifeMate AI (लाइफमेट एआई)',
    tagline: 'एक एआई। हर पीढ़ी। हर दिन की मदद।',
    welcomeTitle: 'नमस्ते! लाइफमेट एआई में आपका स्वागत है।',
    welcomeSubtitle: 'शिक्षा, दैनिक जीवन के प्रश्न, तकनीकी मार्गदर्शन और करियर की तैयारी के लिए आपका व्यक्तिगत एआई साथी।',
    inputPlaceholder: 'आज आप किस विषय पर सहायता चाहते हैं? (हिंदी, गुजराती या अंग्रेजी में पूछें)...',
    newChat: 'नई बातचीत शुरू करें',
    searchConversations: 'बातचीत खोजें...',
    noConversations: 'कोई पूर्व बातचीत नहीं मिली।',
    clearHistory: 'इतिहास साफ करें',
    confirmClear: 'क्या आप सचमुच सभी बातचीत मिटाना चाहते हैं?',

    navChat: 'एआई सहायक चैट',
    navLearn: 'एआई के साथ सीखें',
    navDailyLife: 'दैनिक जीवन सहायक',
    navCareer: 'करियर सहायक',
    navVoice: 'वॉयस सहायक',
    navKnowledge: 'ज्ञान पुस्तकालय (RAG)',
    navTickets: 'सपोर्ट टिकट',
    navAdmin: 'एडमिन डैशबोर्ड',
    navSettings: 'सेटिंग्स व सुगमता',
    navDocs: 'प्रोजेक्ट आर्किटेक्चर व वाइवा',

    modeSimple: 'सरल मोड (Simple)',
    modeSimpleDesc: 'छोटे वाक्य, रोज़मर्रा के उदाहरण और आसान व्याख्या।',
    modeStudent: 'विद्यार्थी मोड (Student)',
    modeStudentDesc: 'अध्ययन योजना, चरण-दर-चरण व्याख्या, प्रश्नोत्तरी और अभ्यास।',
    modeProfessional: 'पेशेवर मोड (Professional)',
    modeProfessionalDesc: 'संरचित उत्तर, कार्यकुशलता और कार्यस्थल मार्गदर्शन।',
    modeSenior: 'वरिष्ठ नागरिक मोड (Senior)',
    modeSeniorDesc: 'बड़ा टेक्स्ट, स्पष्ट बटन, सरल निर्देश और आवाज़ समर्थन।',
    modeCustom: 'कस्टम मोड (Custom)',

    starterLearnTitle: 'कुछ नया सीखें',
    starterLearnDesc: 'क्वांटम कंप्यूटिंग या प्रकाश संश्लेषण को सरल शब्दों में समझें।',
    starterDailyTitle: 'दैनिक जीवन का प्रश्न पूछें',
    starterDailyDesc: 'मोबाइल पर सुरक्षित रूप से यूपीआई (UPI) भुगतान कैसे करें।',
    starterLangTitle: 'अपनी भाषा सुधारें',
    starterLangDesc: 'अंग्रेजी, हिंदी मुहावरे या नए शब्दों का अभ्यास करें।',
    starterExamTitle: 'परीक्षा की तैयारी करें',
    starterExamDesc: 'कॉलेज परीक्षा के लिए 7 दिन की अध्ययन योजना और क्विज बनाएं।',
    starterPhoneTitle: 'मोबाइल चलाना सीखें',
    starterPhoneDesc: 'गूगल ड्राइव में फोटो सुरक्षित रूप से बैकअप करने के निर्देश।',
    starterInterviewTitle: 'इंटरव्यू का अभ्यास करें',
    starterInterviewDesc: 'आईटी या जॉब इंटरव्यू के लिए प्रश्नों का मॉक अभ्यास करें।',

    send: 'भेजें',
    stop: 'रोकें',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया!',
    regenerate: 'पुनः उत्पन्न करें',
    readAloud: 'बोलकर सुनाएं',
    stopSpeech: 'आवाज़ बंद करें',
    helpful: 'उपयोगी',
    notHelpful: 'अनुपयोगी',
    requestHumanHelp: 'मानव सहायता से संपर्क करें',
    viewSources: 'सत्यापित संदर्भ स्रोत',
    agentBadge: 'सक्रिय एजेंट',
    detectedLangBadge: 'पहचानी गई भाषा',

    voiceListening: 'आपकी आवाज़ सुनी जा रही है...',
    voiceStart: 'बोलकर पूछें',
    voiceStop: 'बोलना समाप्त करें',
    voiceTranscript: 'पहचानी गई आवाज़ का पूर्वावलोकन:',
    voiceEditBeforeSend: 'आप भेजने से पहले इस टेक्स्ट में सुधार कर सकते हैं।',
    voiceErrorMicDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।',
    voiceNotSupported: 'इस ब्राउज़र में ध्वनि पहचान समर्थित नहीं है। कृपया टाइप करें।',

    language: 'भाषा',
    selectLanguage: 'भाषा चुनें',
    mode: 'सहायक मोड',
    role: 'सक्रिय भूमिका',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    loading: 'अनुरोध संसाधित हो रहा है...',
    disclaimer: 'लाइफमेट एआई से गलतियां हो सकती हैं। कृपया महत्वपूर्ण चिकित्सा या वित्तीय सलाह की पुष्टि करें।',
    sourcesUsed: 'प्रमाणित दस्तावेज़ संदर्भ',
    confidence: 'विश्वसनीयता स्तर',
    status: 'स्थिति',

    ticketsTitle: 'सपोर्ट टिकट प्रबंधन',
    createNewTicket: 'नया टिकट बनाएं',
    ticketSubject: 'विषय / समस्या का सार',
    ticketDescription: 'अपने प्रश्न का विस्तृत विवरण दें',
    ticketCategory: 'श्रेणी',
    ticketPriority: 'प्राथमिकता',
    ticketStatus: 'टिकट स्थिति',
    replyToTicket: 'जवाब लिखें...',
    submitReply: 'जवाब भेजें',
    ticketCreatedSuccess: 'सपोर्ट टिकट सफलतापूर्वक बनाया गया! टिकट आईडी जारी हो गई है।',
    escalatedFromChat: 'एआई चैट से स्थानांतरित'
  },
  gu: {
    appName: 'LifeMate AI (લાઈફમેટ એઆઈ)',
    tagline: 'એક એઆઈ. દરેક પેઢી. રોજિંદી મદદ.',
    welcomeTitle: 'નમસ્તે! લાઈફમેટ એઆઈમાં આપનું સ્વાગત છે.',
    welcomeSubtitle: 'શિક્ષણ, રોજિંદા પ્રશ્નો, ટેક્નોલોજી માર્ગદર્શન અને કારકિર્દી તૈયારી માટે તમારો પોતાનો એઆઈ સાથી.',
    inputPlaceholder: 'આજે તમને કઈ બાબતમાં મદદ જોઈએ છે? (ગુજરાતી, हिन्दी કે English માં પૂછો)...',
    newChat: 'નવી વાતચીત શરૂ કરો',
    searchConversations: 'વાતચીત શોધો...',
    noConversations: 'કોઈ જૂની વાતચીત મળી નથી.',
    clearHistory: 'ઈતિહાસ સાફ કરો',
    confirmClear: 'શું તમે ખરેખર બધી વાતચીતો કાઢી નાખવા માંગો છો?',

    navChat: 'એઆઈ ચેટ સહાયક',
    navLearn: 'એઆઈ સાથે શીખો',
    navDailyLife: 'રોજિંદા જીવન સહાયક',
    navCareer: 'કારકિર્દી સહાયક',
    navVoice: 'વોઈસ સહાયક',
    navKnowledge: 'જ્ઞાન પુસ્તકાલય (RAG)',
    navTickets: 'સપોર્ટ ટિકિટ્સ',
    navAdmin: 'એડમિન ડેશબોર્ડ',
    navSettings: 'સેટિંગ્સ અને સરળતા',
    navDocs: 'પ્રોજેક્ટ આર્કિટેક્ચર અને વાઇવા',

    modeSimple: 'સરળ મોડ (Simple)',
    modeSimpleDesc: 'ટૂંકા વાક્યો, વ્યવહારુ ઉદાહરણો અને સરળ ભાષામાં સમજૂતી.',
    modeStudent: 'વિદ્યાર્થી મોડ (Student)',
    modeStudentDesc: 'શૈક્ષણિક વિષયો, સ્ટેપ-બાય-સ્ટેપ સમજણ અને ક્વિઝ પ્રેક્ટિસ.',
    modeProfessional: 'પ્રોફેશનલ મોડ (Professional)',
    modeProfessionalDesc: 'સુવ્યવસ્થિત મુદ્દાઓ, કામકાજની પદ્ધતિ અને પ્રોડક્ટિવિટી.',
    modeSenior: 'વડીલો માટે અનુકૂળ (Senior)',
    modeSeniorDesc: 'મોટા અક્ષરો, સ્પષ્ટ બટન, સરળ પગલાં અને ઓડિયો સહાય.',
    modeCustom: 'કસ્ટમ મોડ (Custom)',

    starterLearnTitle: 'કંઈક નવું શીખો',
    starterLearnDesc: 'ક્વોન્ટમ કમ્પ્યુટિંગ અથવા પ્રકાશસંશ્લેષણ સરળ ભાષામાં સમજો.',
    starterDailyTitle: 'રોજિંદો પ્રશ્ન પૂછો',
    starterDailyDesc: 'મોબાઈલમાં સુરક્ષિત રીતે યુપીઆઈ (UPI) પેમેન્ટ કેવી રીતે વાપરવું.',
    starterLangTitle: 'ભાષા સુધારો',
    starterLangDesc: 'અંગ્રેજી સંવાદ, ગુજરાતી રૂઢિપ્રયોગો અને નવા શબ્દો શીખો.',
    starterExamTitle: 'પરીક્ષાની તૈયારી કરો',
    starterExamDesc: 'પરીક્ષા માટે 7 દિવસનું ટાઈમટેબલ અને મહત્વના પ્રશ્નો મેળવો.',
    starterPhoneTitle: 'સ્માર્ટફોન વાપરતા શીખો',
    starterPhoneDesc: 'ગૂગલ ડ્રાઈવમાં ફોટો બેકઅપ કરવાના સરળ પગલાં.',
    starterInterviewTitle: 'ઈન્ટરવ્યૂ પ્રેક્ટિસ',
    starterInterviewDesc: 'આઈટી કે સરકારી નોકરીના ઇન્ટરવ્યુ માટે મોક સવાલ-જવાબ.',

    send: 'મોકલો',
    stop: 'અટકાવો',
    copy: 'કૉપી કરો',
    copied: 'કૉપી થઈ ગયું!',
    regenerate: 'ફરી બનાવો',
    readAloud: 'વાંચી સંભળાવો',
    stopSpeech: 'અવાજ બંધ કરો',
    helpful: 'ઉપયોગી',
    notHelpful: 'બરાબર નથી',
    requestHumanHelp: 'માણસ સહાયકનો સંપર્ક કરો',
    viewSources: 'પ્રમાણિત દસ્તાવેજી સંદર્ભ',
    agentBadge: 'કાર્યરત એજન્ટ',
    detectedLangBadge: 'ઓળખાયેલી ભાષા',

    voiceListening: 'તમારો અવાજ સાંભળી રહ્યા છીએ...',
    voiceStart: 'બોલીને પૂછો',
    voiceStop: 'બોલવાનું બંધ કરો',
    voiceTranscript: 'ઓળખાયેલ અવાજનું લખાણ:',
    voiceEditBeforeSend: 'મોકલતા પહેલા તમે આ લખાણમાં સુધારો કરી શકો છો.',
    voiceErrorMicDenied: 'માઇક્રોફોનની પરવાનગી નકારી કાઢવામાં આવી છે.',
    voiceNotSupported: 'આ બ્રાઉઝરમાં વોઈસ ઇનપુટ ઉપલબ્ધ નથી. કૃપા કરીને ટાઈપ કરો.',

    language: 'ભાષા',
    selectLanguage: 'ભાષા પસંદ કરો',
    mode: 'સહાયક મોડ',
    role: 'સક્રિય ભૂમિકા',
    save: 'સાચવો',
    cancel: 'રદ કરો',
    delete: 'કાઢી નાખો',
    loading: 'પ્રોસેસિંગ ચાલુ છે...',
    disclaimer: 'લાઈફમેટ એઆઈથી ભૂલ થઈ શકે છે. કાનૂની અથવા તબીબી બાબતોમાં નિષ્ણાતની સલાહ લો.',
    sourcesUsed: 'પ્રમાણિત દસ્તાવેજ સંદર્ભ',
    confidence: 'વિશ્વાસ સ્તર',
    status: 'સ્થિતિ',

    ticketsTitle: 'સપોર્ટ ટિકિટ વ્યવસ્થાપન',
    createNewTicket: 'નવી ટિકિટ બનાવો',
    ticketSubject: 'વિષય / પ્રશ્નનો સાર',
    ticketDescription: 'તમારા પ્રશ્નની વિગતવાર માહિતી લખો',
    ticketCategory: 'શ્રેણી',
    ticketPriority: 'પ્રાથમિકતા',
    ticketStatus: 'ટિકિટ સ્થિતિ',
    replyToTicket: 'જવાબ લખો...',
    submitReply: 'જવાબ મોકલો',
    ticketCreatedSuccess: 'સપોર્ટ ટિકિટ સફળતાપૂર્વક બની ગઈ છે! તમારી ટિકિટ આઈડી તૈયાર છે.',
    escalatedFromChat: 'એઆઈ ચેટ સત્રમાંથી મોકલેલ'
  }
};
