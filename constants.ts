import { Haze, Milestone, Waves, Moon } from 'lucide-react';
import { BreathingPattern, Category } from './types';

export const MOTIVATIONAL_QUOTES = [
  "לנשום זה לחיות. נשום עמוק, חייה ברגע.",
  "שאיפה מביאה כוח, נשיפה משחררת לחץ.",
  "השקט נמצא במרווח שבין הנשימות.",
  "כשאתה שולט בנשימה שלך, אתה שולט בחיים שלך.",
  "רגשות באים והולכים כמו עננים בשמיים. נשימה היא העוגן.",
  "עצור. קח נשימה. הכל בסדר.",
  "הנשימה היא הגשר בין הגוף לנפש.",
  "כל נשימה היא הזדמנות חדשה להתחיל מחדש.",
  "אל תחשוב על העתיד, נשום את ההווה.",
  "שחרר את מה שאתה לא יכול לשלוט בו, דרך הנשיפה."
];

export const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  // Morning
  morning_standing: {
    id: 'morning_standing',
    name: 'נשימת בוקר בעמידה',
    description: 'עמידה זקופה, ידיים עולות בשאיפה ויורדות בנשיפה.',
    instruction: 'עמוד זקוף, שאף תוך הרמת ידיים, נשוף תוך הורדתן.',
    benefits: 'מעורר את הגוף ומזרים אנרגיה.',
    recommendedDuration: 180,
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
  },
  morning_ujjayi: {
    id: 'morning_ujjayi',
    name: 'נשימת אוקיינוס (Ujjayi)',
    description: 'נשימה עם כיווץ קל בגרון ליצירת צליל אוקיינוס מרגיע.',
    instruction: 'כווץ קלות את הגרון ונשום דרך האף ליצירת רחש עדין.',
    benefits: 'מרגיע את מערכת העצבים ומחמם את הגוף.',
    recommendedDuration: 180,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  morning_fire: {
    id: 'morning_fire',
    name: 'נשימת האש (Kapalabhati)',
    description: 'נשיפות חזקות וקצביות מהבטן, שאיפות פסיביות.',
    instruction: 'נשוף בחדות דרך האף תוך כיווץ הבטן, שחרר לשאיפה.',
    benefits: 'מנקה רעלים ומעלה את רמת האנרגיה.',
    recommendedDuration: 180,
    restDuration: 10,
    phases: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 }
  },
  morning_lion: {
    id: 'morning_lion',
    name: 'נשימת אריה',
    description: 'שאיפה עמוקה, נשיפה חזקה עם פה פתוח ולשון בחוץ.',
    instruction: 'שאף עמוק, נשוף בפה פתוח, לשון בחוץ ועיניים למעלה.',
    benefits: 'משחרר מתח מהפנים והלסת.',
    recommendedDuration: 120,
    phases: { inhale: 4, holdIn: 0, exhale: 7, holdOut: 0 }
  },
  morning_bellows: {
    id: 'morning_bellows',
    name: 'נשימת מפוח (Bhastrika)',
    description: 'שאיפות ונשיפות אקטיביות וחזקות להעלאת אנרגיה.',
    instruction: 'שאף ונשוף בעוצמה דרך האף בקצב מהיר.',
    benefits: 'ממריץ את זרימת הדם והחמצן.',
    recommendedDuration: 120,
    phases: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 }
  },

  // Sleep
  sleep_478: {
    id: 'sleep_478',
    name: 'נשימת 4-7-8',
    description: 'הטכניקה הקלאסית להירדמות מהירה והרגעת הגוף.',
    instruction: 'שאף 4 שניות, החזק 7, נשוף 8 דרך הפה.',
    benefits: 'מרגיע את הלב ומכין את הגוף לשינה.',
    recommendedDuration: 240,
    phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
  },
  sleep_bhramari: {
    id: 'sleep_bhramari',
    name: 'נשימת דבורה (Bhramari)',
    description: 'נשיפה ארוכה תוך השמעת זמזום עדין להרגעת המחשבות.',
    instruction: 'סתום אוזניים, שאף, ונשוף תוך השמעת זמזום "המממ".',
    benefits: 'משקיט מחשבות טורדניות ומשרה רוגע.',
    recommendedDuration: 180,
    phases: { inhale: 4, holdIn: 0, exhale: 7, holdOut: 0 }
  },
  sleep_diaphragm: {
    id: 'sleep_diaphragm',
    name: 'נשימת בטן סרעפתית',
    description: 'נשימה עמוקה אל הבטן התחתונה להאטת קצב הלב.',
    instruction: 'הנח יד על הבטן, נשום עמוק כך שהיד תעלה.',
    benefits: 'מפעיל את מערכת הרגיעה (הפאראסימפתטית).',
    recommendedDuration: 180,
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
  },
  sleep_muscle: {
    id: 'sleep_muscle',
    name: 'הרפיית שרירים הדרגתית',
    description: 'שחרור מתח פיזי מהגוף, קבוצת שרירים אחר קבוצה.',
    instruction: 'כווץ שריר בשאיפה, שחרר בבת אחת בנשיפה.',
    benefits: 'משחרר מתח פיזי עמוק ומקל על הירדמות.',
    recommendedDuration: 720,
    phases: { inhale: 5, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  sleep_bodyscan: {
    id: 'sleep_bodyscan',
    name: 'סריקת גוף (Body Scan)',
    description: 'מעבר מנטלי על איברי הגוף להרפיה מלאה.',
    instruction: 'התמקד בכל איבר בנפרד, מכפות הרגליים ועד הראש.',
    benefits: 'מגביר מודעות גופנית ומרפה מתחים.',
    recommendedDuration: 600,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },

  // Regulate (Calm)
  regulate_box: {
    id: 'regulate_box',
    name: 'נשימה מרובעת (Box)',
    description: 'איזון מושלם להחזרת השליטה והרוגע.',
    instruction: 'שאף 4, החזק 4, נשוף 4, החזק 4.',
    benefits: 'מאזן ומפקס במצבי לחץ.',
    recommendedDuration: 180,
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
  },
  regulate_sigh: {
    id: 'regulate_sigh',
    name: 'אנחת רווחה פיזיולוגית',
    description: 'שאיפה ונשיפה ארוכה לשחרור פחמן דו-חמצני.',
    instruction: 'שאיפה כפולה דרך האף, נשיפה ארוכה דרך הפה.',
    benefits: 'הורדה מיידית של רמת הלחץ.',
    recommendedDuration: 60,
    phases: { inhale: 4, holdIn: 0, exhale: 7, holdOut: 0 }
  },
  regulate_grounding: {
    id: 'regulate_grounding',
    name: 'תרגיל 5 החושים',
    description: 'התקרקעות בהווה. התמקד בחושים תוך כדי נשימה.',
    instruction: 'נשום וזהה: 5 דברים שרואים, 4 שמרגישים, 3 ששומעים...',
    benefits: 'מנתק ממחשבות חרדה ומחזיר לכאן ועכשיו.',
    recommendedDuration: 180,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  regulate_slow_belly: {
    id: 'regulate_slow_belly',
    name: 'נשימת בטן איטית',
    description: 'האטת הקצב לנשימה נמוכה ומרגיעה.',
    instruction: 'נשום לאט ועמוק אל הבטן, הארך את הנשיפה.',
    benefits: 'מפחית דופק ולחץ דם.',
    recommendedDuration: 180,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  regulate_alt_nostril: {
    id: 'regulate_alt_nostril',
    name: 'נשימת נחיריים לסירוגין',
    description: 'איזון בין אונות המוח והרגעת זרם המחשבות.',
    instruction: 'סתום נחיר ימין ונשום משמאל, החלף צדדים.',
    benefits: 'מאזן את מערכת העצבים ומשפר צלילות.',
    recommendedDuration: 240,
    phases: { inhale: 6, holdIn: 2, exhale: 6, holdOut: 0 }
  },

  // Focus
  focus_alt_nostril: {
    id: 'focus_alt_nostril',
    name: 'נשימת נחיריים - פוקוס',
    description: 'מיקוד והצללה מנטלית דרך איזון זרימת האוויר.',
    instruction: 'נשימה מבוקרת דרך נחיר אחד בכל פעם.',
    benefits: 'מחדד את הריכוז ומאזן אנרגיה.',
    recommendedDuration: 240,
    phases: { inhale: 6, holdIn: 2, exhale: 6, holdOut: 0 }
  },
  focus_equal: {
    id: 'focus_equal',
    name: 'נשימת קצב שווה',
    description: 'יצירת זרימה יציבה וקבועה לשיפור הריכוז.',
    instruction: 'שאף ונשוף לאותו פרק זמן בדיוק.',
    benefits: 'יוצר יציבות מנטלית ורוגע.',
    recommendedDuration: 300,
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
  },
  focus_palming: {
    id: 'focus_palming',
    name: 'Palming - מנוחה לעיניים',
    description: 'שפשוף כפות ידיים והנחתן על העיניים למנוחה.',
    instruction: 'חמם את כפות הידיים והנח אותן על העיניים העצומות.',
    benefits: 'מרגיע את העיניים והמוח לאחר מאמץ.',
    recommendedDuration: 120,
    phases: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 }
  },
  focus_count: {
    id: 'focus_count',
    name: 'מדיטציית ספירת נשימות',
    description: 'ספירת כל נשיפה מ-1 עד 10 וחזרה. אימון לתשומת לב.',
    instruction: 'ספור כל נשיפה. אם המחשבה נודדת, התחל מ-1.',
    benefits: 'משפר את יכולת הריכוז ותשומת הלב.',
    recommendedDuration: 420,
    phases: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 }
  },
  focus_candle: {
    id: 'focus_candle',
    name: 'מדיטציית בהייה בנר',
    description: 'מיקוד המבט בנקודה אחת לשיפור הריכוז.',
    instruction: 'הבט בלהבת נר או בנקודה קבועה ללא מצמוץ.',
    benefits: 'מחזק את שרירי העיניים והריכוז.',
    recommendedDuration: 300,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  }
};

export const CATEGORIES: Category[] = [
  {
    id: 'morning',
    name: 'בוקר',
    description: 'אנרגיה והתעוררות',
    icon: Haze,
    color: '',
    defaultPatternId: 'morning_standing',
    patterns: ['morning_standing', 'morning_ujjayi', 'morning_fire', 'morning_lion', 'morning_bellows']
  },
  {
    id: 'focus',
    name: 'מיקוד',
    description: 'ריכוז וחדות',
    icon: Milestone,
    color: '',
    defaultPatternId: 'focus_equal',
    patterns: ['focus_alt_nostril', 'focus_equal', 'focus_palming', 'focus_count', 'focus_candle']
  },
  {
    id: 'regulate',
    name: 'ויסות',
    description: 'הפחתת לחץ וחרדה',
    icon: Waves,
    color: '',
    defaultPatternId: 'regulate_box',
    patterns: ['regulate_box', 'regulate_sigh', 'regulate_grounding', 'regulate_slow_belly', 'regulate_alt_nostril']
  },
  {
    id: 'sleep',
    name: 'שינה',
    description: 'הרגעה והירדמות',
    icon: Moon,
    color: '',
    defaultPatternId: 'sleep_478',
    patterns: ['sleep_478', 'sleep_bhramari', 'sleep_diaphragm', 'sleep_muscle', 'sleep_bodyscan']
  }
];

export const PHASE_LABELS: Record<string, string> = {
  Idle: 'מוכן?',
  Inhale: 'שאיפה',
  HoldIn: 'החזקה',
  Exhale: 'נשיפה',
  HoldOut: 'החזקה',
  Rest: 'הפסקה',
  Finished: 'סיימנו'
};
