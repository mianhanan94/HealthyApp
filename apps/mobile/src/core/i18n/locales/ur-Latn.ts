import type { Translations } from './en';

/** Roman Urdu. Must have exactly the same keys as `en` (enforced by the type). */
const urLatn: Translations = {
  tabs: {
    home: 'Home',
    target: 'Target',
    cart: 'Cart',
    profile: 'Profile',
  },
  common: {
    kcal: '{{value}} kcal',
    protein: '{{value}}g protein',
    kcalProtein: '{{kcal}} kcal · {{protein}}g protein',
    highProtein: 'Zyada protein',
    setMyPlan: 'Apna plan banayein',
  },
  home: {
    greeting: {
      morning: 'Subah bakhair,',
      afternoon: 'Assalam-o-alaikum,',
      evening: 'Shaam bakhair,',
    },
    guestName: 'Mehmaan',
    setLocation: 'Delivery ki location set karein',
    today: 'Aaj',
    dailyProgress: 'Aaj ki progress',
    ofYourDay: 'aaj ka hissa',
    guestPrompt: 'Account banayein aur apna plan payein.',
    curatedEyebrow: 'Aapke liye chuna gaya',
    curatedTitle: 'Achha khayein, achha mehsoos karein.',
    viewAll: 'Sab dekhein',
    customize: 'Apni marzi se banayein',
    add: '{{name}} add karein',
    guidanceTitle: 'Thora sa mashwara',
    guidanceBody: 'Agla meal protein ke gird banayein, der tak pait bhara rahega.',
    moreToExplore: 'Aur dekhein',
    menu: 'Menu',
  },
  menu: {
    title: 'Menu',
    empty: 'Abhi yahan kuch nahi. Koi aur category dekhein.',
    category: {
      all: 'Sab',
      bowls: 'Bowls',
      breakfast: 'Nashta',
      drinks: 'Drinks',
    },
    nutritionInfo: '{{badge}} nutrition ke baare mein',
    badge: {
      verified: 'Verified',
      calculated: 'Calculated',
      estimated: 'Andaazan',
    },
  },
  target: {
    eyebrow: 'Aapke numbers',
    title: 'Aapka rozana target',
    intro: 'Calories, protein aur sugar aapke jism aur goal ke hisaab se.',
    noPlanEyebrow: 'Abhi plan nahi',
    noPlanBody: 'Kuch sawalon ke jawab dein, hum bata denge aapke jism ko kya chahiye.',
  },
  cart: {
    eyebrow: 'Aapka order',
    title: 'Aapka cart',
    empty: 'Aapka cart khaali hai.',
    emptyBody: 'Apne plan ke mutabiq kuch dhoondein.',
    browse: 'Menu dekhein',
  },
  profile: {
    eyebrow: 'Aapki maloomat',
    title: 'Profile',
    account: 'Account',
    guest: 'Mehmaan ke taur par',
    delivery: 'Delivery',
    noAddress: 'Abhi koi address nahi',
    language: 'Zabaan',
  },
  bodyCheck: {
    title: 'Aapka jism',
    height: 'Qad',
    bmi: 'Aapka BMI',
    weight: 'Wazan',
    cm: 'cm',
    kg: 'kg',
    bmiLine: 'BMI {{bmi}} · {{category}}',
    healthyRange: 'Aapke qad ke liye sehatmand wazan {{min}}–{{max}} kg hai.',
    errors: {
      height: '{{min}} aur {{max}} cm ke darmiyan qad likhein.',
      weight: '{{min}} aur {{max}} kg ke darmiyan wazan likhein.',
    },
  },
  bmiCategory: {
    underweight: 'Wazan kam',
    healthy: 'Sehatmand',
    overweight: 'Wazan zyada',
    obese: 'Motapa',
  },
  language: {
    en: 'English',
    'ur-Latn': 'Roman Urdu',
  },
};

export default urLatn;
