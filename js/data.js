// EduBD - Bangladesh Education Portal - Sample Data
const eduData = {
  breakingNews: [
    "SSC পরীক্ষা ২০২৫: ফেব্রুয়ারি মাসে শুরু হবে, রুটিন প্রকাশিত",
    "HSC পরীক্ষা ২০২৫: এপ্রিল মাসে শুরু হবে বলে জানা গেছে",
    "ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষা: আবেদন শুরু ১৫ জানুয়ারি",
    "জাতীয় বিশ্ববিদ্যালয়ের অনার্স ভর্তি: বিজ্ঞপ্তি প্রকাশিত",
    "চিকিৎসা ভর্তি পরীক্ষা ২০২৫: নতুন আসন বিন্যাস ঘোষণা",
    "বৃত্তি পরীক্ষার ফলাফল: প্রাথমিক বৃত্তি পরীক্ষার ফলাফল প্রকাশিত",
    "বুয়েট ভর্তি পরীক্ষা: আবেদনের শেষ তারিখ ৩১ জানুয়ারি",
    "একাদশ শ্রেণী ভর্তি: অনলাইনে আবেদন শুরু ২৬ ফেব্রুয়ারি"
  ],

  latestNews: [
    {
      id: 1,
      category: "SSC 2025",
      title: "SSC পরীক্ষা ২০২৫: বাংলাদেশের সকল বোর্ডে একযোগে শুরু",
      summary: "আগামী ফেব্রুয়ারি মাস থেকে এসএসসি পরীক্ষা ২০২৫ শুরু হবে। সকল শিক্ষা বোর্ডে একযোগে পরীক্ষা অনুষ্ঠিত হবে। প্রায় ২০ লাখ শিক্ষার্থী এই পরীক্ষায় অংশগ্রহণ করবে।",
      source: "শিক্ষা মন্ত্রণালয়",
      date: "২০২৫-০১-১০",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=SSC+2025",
      link: "pages/ssc.html",
      views: 15420
    },
    {
      id: 2,
      category: "বিশ্ববিদ্যালয়",
      title: "ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষা ২০২৫: বিস্তারিত সময়সূচি প্রকাশ",
      summary: "ঢাকা বিশ্ববিদ্যালয়ের ২০২৪-২৫ শিক্ষাবর্ষের ভর্তি পরীক্ষার বিস্তারিত সময়সূচি প্রকাশিত হয়েছে। ভর্তি পরীক্ষা মার্চ-এপ্রিল মাসে অনুষ্ঠিত হবে।",
      source: "ঢাকা বিশ্ববিদ্যালয়",
      date: "২০২৫-০১-০৮",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=DU+Admission",
      link: "pages/admissions.html",
      views: 12300
    },
    {
      id: 3,
      category: "স্কলারশিপ",
      title: "Chevening বৃত্তি ২০২৫-২৬: বাংলাদেশী শিক্ষার্থীদের আবেদনের সুযোগ",
      summary: "যুক্তরাজ্য সরকারের Chevening বৃত্তি কর্মসূচিতে ২০২৫-২৬ শিক্ষাবর্ষে আবেদন শুরু হয়েছে। এই বৃত্তিতে সম্পূর্ণ বিনামূল্যে যুক্তরাজ্যের বিশ্ববিদ্যালয়ে পড়ার সুযোগ পাওয়া যাবে।",
      source: "British Council",
      date: "২০২৫-০১-০৫",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Chevening",
      link: "pages/scholarships.html",
      views: 9800
    },
    {
      id: 4,
      category: "HSC 2025",
      title: "HSC পরীক্ষা ২০২৫: নতুন সিলেবাস ও প্রশ্নপত্র কাঠামো ঘোষণা",
      summary: "উচ্চ মাধ্যমিক পরীক্ষা ২০২৫-এর জন্য নতুন সিলেবাস এবং প্রশ্নপত্র কাঠামো ঘোষণা করা হয়েছে। শিক্ষা বোর্ড জানিয়েছে, সৃজনশীল পদ্ধতিতে পরীক্ষা নেওয়া হবে।",
      source: "আন্তঃশিক্ষা বোর্ড",
      date: "২০২৫-০১-০৩",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=HSC+2025",
      link: "pages/hsc.html",
      views: 11200
    },
    {
      id: 5,
      category: "মেডিকেল ভর্তি",
      title: "মেডিকেল ভর্তি পরীক্ষা ২০২৫: আসন সংখ্যা বৃদ্ধির ঘোষণা",
      summary: "বাংলাদেশ সরকারি মেডিকেল কলেজে আসন সংখ্যা বৃদ্ধি করা হয়েছে। এবার মোট ৫,৫৮০টি আসনে ভর্তি পরীক্ষা অনুষ্ঠিত হবে।",
      source: "স্বাস্থ্য মন্ত্রণালয়",
      date: "২০২৫-০১-০১",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Medical",
      link: "pages/admissions.html",
      views: 8900
    },
    {
      id: 6,
      category: "বৃত্তি",
      title: "প্রাথমিক বৃত্তি পরীক্ষার ফলাফল ২০২৪ প্রকাশিত",
      summary: "প্রাথমিক ও ইবতেদায়ী সমাপনী বৃত্তি পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এবার মোট ৮২,৫০০ শিক্ষার্থীকে বৃত্তি প্রদান করা হয়েছে।",
      source: "প্রাথমিক শিক্ষা অধিদপ্তর",
      date: "২০২৪-১২-২৮",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Scholarship",
      link: "pages/scholarships.html",
      views: 7600
    },
    {
      id: 7,
      category: "রুটিন",
      title: "JSC পরীক্ষার রুটিন ২০২৫ প্রকাশিত",
      summary: "জুনিয়র স্কুল সার্টিফিকেট (JSC) পরীক্ষার রুটিন প্রকাশিত হয়েছে। নভেম্বর মাসে পরীক্ষা শুরু হবে।",
      source: "শিক্ষা বোর্ড",
      date: "২০২৪-১২-২৫",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Routine",
      link: "pages/routines.html",
      views: 6500
    },
    {
      id: 8,
      category: "বিদেশে পড়াশোনা",
      title: "DAAD বৃত্তি ২০২৫: জার্মানিতে উচ্চশিক্ষার সুযোগ",
      summary: "জার্মান একাডেমিক এক্সচেঞ্জ সার্ভিস (DAAD) বাংলাদেশী শিক্ষার্থীদের জন্য বিভিন্ন বৃত্তি প্রদান করছে। আবেদনের শেষ তারিখ ৩১ মার্চ ২০২৫।",
      source: "DAAD Bangladesh",
      date: "২০২৪-১২-২০",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=DAAD",
      link: "pages/scholarships.html",
      views: 5400
    },
    {
      id: 9,
      category: "কারিগরি",
      title: "কারিগরি শিক্ষা বোর্ডে নতুন কোর্স চালু",
      summary: "বাংলাদেশ কারিগরি শিক্ষা বোর্ডে নতুন ১৫টি কোর্স চালু করা হয়েছে। ডিপ্লোমা ইন ইঞ্জিনিয়ারিং-এ আসন সংখ্যাও বৃদ্ধি করা হয়েছে।",
      source: "কারিগরি শিক্ষা বোর্ড",
      date: "২০২৪-১২-১৮",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Technical",
      link: "pages/news.html",
      views: 4300
    },
    {
      id: 10,
      category: "মাদ্রাসা",
      title: "দাখিল পরীক্ষার রুটিন ২০২৫ প্রকাশিত",
      summary: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ডের দাখিল পরীক্ষা ২০২৫-এর রুটিন প্রকাশিত হয়েছে। পরীক্ষা ফেব্রুয়ারি মাসে শুরু হবে।",
      source: "মাদ্রাসা শিক্ষা বোর্ড",
      date: "২০২৪-১২-১৫",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=Madrasha",
      link: "pages/news.html",
      views: 3900
    },
    {
      id: 11,
      category: "ফলাফল",
      title: "HSC ফলাফল ২০২৪: পাসের হার ৭৮.৬৪%",
      summary: "উচ্চ মাধ্যমিক সার্টিফিকেট (HSC) পরীক্ষার ফলাফল ২০২৪ প্রকাশিত হয়েছে। এবার মোট পাসের হার ৭৮.৬৪% এবং GPA-5 পেয়েছে ৯২,৫৬৩ জন।",
      source: "আন্তঃশিক্ষা বোর্ড",
      date: "২০২৪-১২-১০",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=HSC+Result",
      link: "pages/results.html",
      views: 28900
    },
    {
      id: 12,
      category: "নোটিশ",
      title: "জাতীয় বিশ্ববিদ্যালয়: অনার্স ৪র্থ বর্ষ পরীক্ষার সময়সূচি প্রকাশ",
      summary: "জাতীয় বিশ্ববিদ্যালয়ের অনার্স ৪র্থ বর্ষ পরীক্ষার সময়সূচি প্রকাশিত হয়েছে। পরীক্ষা মার্চ-এপ্রিল মাসে অনুষ্ঠিত হবে।",
      source: "জাতীয় বিশ্ববিদ্যালয়",
      date: "২০২৪-১২-০৫",
      image: "https://via.placeholder.com/400x200/1a6b3c/ffffff?text=NU+Notice",
      link: "pages/news.html",
      views: 6700
    }
  ],

  admissions: [
    {
      id: 1,
      university: "ঢাকা বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "ঢাকা বিশ্ববিদ্যালয় স্নাতক ভর্তি বিজ্ঞপ্তি ২০২৪-২৫",
      deadline: "2025-02-28",
      deadlineDisplay: "২৮ ফেব্রুয়ারি ২০২৫",
      link: "https://admission.eis.du.ac.bd",
      status: "চলছে",
      seats: "৭,৩৯৬",
      fee: "৬৫০ টাকা",
      description: "ঢাকা বিশ্ববিদ্যালয়ের বিভিন্ন অনুষদে ২০২৪-২৫ শিক্ষাবর্ষে ভর্তির জন্য আবেদন চলছে।"
    },
    {
      id: 2,
      university: "বুয়েট (BUET)",
      type: "ইঞ্জিনিয়ারিং",
      title: "BUET আন্ডারগ্রাজুয়েট ভর্তি ২০২৪-২৫",
      deadline: "2025-01-31",
      deadlineDisplay: "৩১ জানুয়ারি ২০২৫",
      link: "https://ugadmission.buet.ac.bd",
      status: "চলছে",
      seats: "১,১৫৫",
      fee: "৮৫০ টাকা",
      description: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়ে ইঞ্জিনিয়ারিং, স্থাপত্য ও পরিকল্পনায় ভর্তির সুযোগ।"
    },
    {
      id: 3,
      university: "ঢাকা মেডিকেল কলেজ",
      type: "মেডিকেল",
      title: "MBBS ভর্তি বিজ্ঞপ্তি ২০২৪-২৫",
      deadline: "2025-03-15",
      deadlineDisplay: "১৫ মার্চ ২০২৫",
      link: "https://dgme.gov.bd",
      status: "চলছে",
      seats: "৫,৫৮০",
      fee: "১,০০০ টাকা",
      description: "সরকারি মেডিকেল কলেজে MBBS ও BDS কোর্সে ভর্তির আবেদন চলছে।"
    },
    {
      id: 4,
      university: "চট্টগ্রাম বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "চট্টগ্রাম বিশ্ববিদ্যালয় ভর্তি ২০২৪-২৫",
      deadline: "2025-02-20",
      deadlineDisplay: "২০ ফেব্রুয়ারি ২০২৫",
      link: "https://admission.cu.ac.bd",
      status: "চলছে",
      seats: "৬,৫০০",
      fee: "৫৫০ টাকা",
      description: "চট্টগ্রাম বিশ্ববিদ্যালয়ের বিভিন্ন বিভাগে ভর্তির জন্য আবেদন করুন।"
    },
    {
      id: 5,
      university: "একাদশ শ্রেণী (কলেজ ভর্তি)",
      type: "কলেজ",
      title: "একাদশ শ্রেণীতে ভর্তি বিজ্ঞপ্তি ২০২৫",
      deadline: "2025-02-26",
      deadlineDisplay: "২৬ ফেব্রুয়ারি ২০২৫",
      link: "https://xiclassadmission.gov.bd",
      status: "শীঘ্রই",
      seats: "৩,০০,০০০",
      fee: "১৫০ টাকা",
      description: "SSC ২০২৫ পাসকৃত শিক্ষার্থীদের একাদশ শ্রেণীতে ভর্তির জন্য অনলাইনে আবেদন করতে হবে।"
    },
    {
      id: 6,
      university: "রাজশাহী বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "রাজশাহী বিশ্ববিদ্যালয় ভর্তি ২০২৪-২৫",
      deadline: "2025-03-10",
      deadlineDisplay: "১০ মার্চ ২০২৫",
      link: "https://admission.ru.ac.bd",
      status: "চলছে",
      seats: "৫,৮০০",
      fee: "৫০০ টাকা",
      description: "রাজশাহী বিশ্ববিদ্যালয়ে বিজ্ঞান, মানবিক ও বাণিজ্য অনুষদে ভর্তির সুযোগ।"
    },
    {
      id: 7,
      university: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ভর্তি ২০২৪-২৫",
      deadline: "2025-02-15",
      deadlineDisplay: "১৫ ফেব্রুয়ারি ২০২৫",
      link: "https://admission.juniv.edu",
      status: "চলছে",
      seats: "২,৫০০",
      fee: "৬০০ টাকা",
      description: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের আন্ডারগ্র্যাজুয়েট প্রোগ্রামে ভর্তির সুযোগ।"
    },
    {
      id: 8,
      university: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "SUST ভর্তি বিজ্ঞপ্তি ২০২৪-২৫",
      deadline: "2025-03-20",
      deadlineDisplay: "২০ মার্চ ২০২৫",
      link: "https://www.sust.edu",
      status: "চলছে",
      seats: "১,৮০০",
      fee: "৫৫০ টাকা",
      description: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে বিজ্ঞান ও প্রযুক্তি বিভাগে ভর্তির সুযোগ।"
    },
    {
      id: 9,
      university: "ইসলামী বিশ্ববিদ্যালয়",
      type: "বিশ্ববিদ্যালয়",
      title: "ইসলামী বিশ্ববিদ্যালয় ভর্তি ২০২৪-২৫",
      deadline: "2024-12-31",
      deadlineDisplay: "৩১ ডিসেম্বর ২০২৪",
      link: "https://www.iu.ac.bd",
      status: "শেষ",
      seats: "৩,২০০",
      fee: "৪৫০ টাকা",
      description: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়ায় বিভিন্ন বিভাগে ভর্তি।"
    },
    {
      id: 10,
      university: "বেসরকারি মেডিকেল কলেজ",
      type: "মেডিকেল",
      title: "বেসরকারি মেডিকেল ও ডেন্টাল কলেজ ভর্তি ২০২৪-২৫",
      deadline: "2025-04-30",
      deadlineDisplay: "৩০ এপ্রিল ২০২৫",
      link: "https://dgme.gov.bd",
      status: "শীঘ্রই",
      seats: "৬,৩৫৫",
      fee: "১,৫০০ টাকা",
      description: "দেশের বেসরকারি মেডিকেল ও ডেন্টাল কলেজে MBBS ও BDS কোর্সে ভর্তির সুযোগ।"
    }
  ],

  scholarships: [
    {
      id: 1,
      name: "Chevening Scholarship",
      country: "যুক্তরাজ্য",
      flag: "🇬🇧",
      type: "সম্পূর্ণ বৃত্তি",
      level: "মাস্টার্স",
      amount: "সম্পূর্ণ খরচ",
      deadline: "2025-11-07",
      deadlineDisplay: "৭ নভেম্বর ২০২৫",
      eligibility: "স্নাতক ডিগ্রি, ২ বছরের কর্ম অভিজ্ঞতা",
      link: "https://www.chevening.org",
      description: "যুক্তরাজ্য সরকারের ফ্ল্যাগশিপ বৃত্তি কর্মসূচি। টিউশন ফি, জীবনযাত্রার ভাতা, বিমান টিকিট সহ সব খরচ বহন করা হয়।"
    },
    {
      id: 2,
      name: "Commonwealth Scholarship",
      country: "যুক্তরাজ্য",
      flag: "🇬🇧",
      type: "সম্পূর্ণ বৃত্তি",
      level: "মাস্টার্স/পিএইচডি",
      amount: "সম্পূর্ণ খরচ",
      deadline: "2025-10-15",
      deadlineDisplay: "১৫ অক্টোবর ২০২৫",
      eligibility: "স্নাতক/স্নাতকোত্তর ডিগ্রি",
      link: "https://cscuk.fcdo.gov.uk",
      description: "কমনওয়েলথ দেশের নাগরিকদের জন্য বৃত্তি। যুক্তরাজ্যে উচ্চতর গবেষণার সুযোগ।"
    },
    {
      id: 3,
      name: "DAAD Scholarship",
      country: "জার্মানি",
      flag: "🇩🇪",
      type: "সম্পূর্ণ বৃত্তি",
      level: "মাস্টার্স/পিএইচডি",
      amount: "€৮৬১/মাস",
      deadline: "2025-03-31",
      deadlineDisplay: "৩১ মার্চ ২০২৫",
      eligibility: "ভালো একাডেমিক রেকর্ড, জার্মান/ইংরেজি ভাষা দক্ষতা",
      link: "https://www.daad.de",
      description: "জার্মান একাডেমিক এক্সচেঞ্জ সার্ভিস কর্তৃক প্রদত্ত বৃত্তি। জার্মানিতে বিনামূল্যে পড়ার সুযোগ।"
    },
    {
      id: 4,
      name: "Fulbright Scholarship",
      country: "যুক্তরাষ্ট্র",
      flag: "🇺🇸",
      type: "সম্পূর্ণ বৃত্তি",
      level: "মাস্টার্স/পিএইচডি",
      amount: "সম্পূর্ণ খরচ",
      deadline: "2025-05-15",
      deadlineDisplay: "১৫ মে ২০২৫",
      eligibility: "স্নাতক ডিগ্রি, GPA ৩.০+",
      link: "https://bd.usembassy.gov/fulbright",
      description: "মার্কিন সরকারের প্রেস্টিজিয়াস বৃত্তি। যুক্তরাষ্ট্রের বিশ্ববিদ্যালয়ে পড়ার সুযোগ।"
    },
    {
      id: 5,
      name: "প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট",
      country: "বাংলাদেশ",
      flag: "🇧🇩",
      type: "আংশিক বৃত্তি",
      level: "এসএসসি/এইচএসসি/স্নাতক",
      amount: "৫,০০০-৫০,০০০ টাকা/বছর",
      deadline: "2025-06-30",
      deadlineDisplay: "৩০ জুন ২০২৫",
      eligibility: "মেধাবী ও আর্থিকভাবে অসচ্ছল শিক্ষার্থী",
      link: "https://pmeat.gov.bd",
      description: "প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট থেকে মেধাবী শিক্ষার্থীদের বৃত্তি প্রদান করা হয়।"
    },
    {
      id: 6,
      name: "Japanese Government (MEXT) Scholarship",
      country: "জাপান",
      flag: "🇯🇵",
      type: "সম্পূর্ণ বৃত্তি",
      level: "স্নাতক/মাস্টার্স/পিএইচডি",
      amount: "¥১১৭,০০০/মাস",
      deadline: "2025-04-20",
      deadlineDisplay: "২০ এপ্রিল ২০২৫",
      eligibility: "HSC পাস, বয়স ১৭-২৫ বছর",
      link: "https://www.bd.emb-japan.go.jp",
      description: "জাপান সরকারের বৃত্তি কর্মসূচি। টিউশন ফি, আবাসন, ভাতা সহ সব সুবিধা প্রদান।"
    },
    {
      id: 7,
      name: "Chinese Government Scholarship (CSC)",
      country: "চীন",
      flag: "🇨🇳",
      type: "সম্পূর্ণ বৃত্তি",
      level: "স্নাতক/মাস্টার্স/পিএইচডি",
      amount: "সম্পূর্ণ খরচ",
      deadline: "2025-03-15",
      deadlineDisplay: "১৫ মার্চ ২০২৫",
      eligibility: "ভালো একাডেমিক রেকর্ড, বয়স সীমা প্রযোজ্য",
      link: "https://www.campuschina.org",
      description: "চীন সরকার কর্তৃক বাংলাদেশী শিক্ষার্থীদের জন্য বৃত্তি। চীনের বিশ্ববিদ্যালয়ে পড়ার সুযোগ।"
    },
    {
      id: 8,
      name: "সরকারি বৃত্তি (SSC/HSC)",
      country: "বাংলাদেশ",
      flag: "🇧🇩",
      type: "সরকারি বৃত্তি",
      level: "মাধ্যমিক/উচ্চমাধ্যমিক",
      amount: "৩০০-৮৫০ টাকা/মাস",
      deadline: "2025-09-30",
      deadlineDisplay: "৩০ সেপ্টেম্বর ২০২৫",
      eligibility: "SSC/HSC পরীক্ষায় ভালো ফলাফল",
      link: "https://shed.gov.bd",
      description: "মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর কর্তৃক মেধা ও সাধারণ বৃত্তি প্রদান।"
    },
    {
      id: 9,
      name: "Turkish Government Scholarship (Türkiye Bursları)",
      country: "তুরস্ক",
      flag: "🇹🇷",
      type: "সম্পূর্ণ বৃত্তি",
      level: "স্নাতক/মাস্টার্স/পিএইচডি",
      amount: "₺৮০০-১,৯৫০/মাস",
      deadline: "2025-02-28",
      deadlineDisplay: "২৮ ফেব্রুয়ারি ২০২৫",
      eligibility: "ভালো একাডেমিক রেকর্ড, বয়স সীমা প্রযোজ্য",
      link: "https://www.turkiyeburslari.gov.tr",
      description: "তুরস্ক সরকারের প্রেস্টিজিয়াস বৃত্তি। আবাসন, ভাতা, বিমান টিকিট সহ বৃত্তি।"
    },
    {
      id: 10,
      name: "Australia Awards Scholarship",
      country: "অস্ট্রেলিয়া",
      flag: "🇦🇺",
      type: "সম্পূর্ণ বৃত্তি",
      level: "মাস্টার্স/পিএইচডি",
      amount: "সম্পূর্ণ খরচ",
      deadline: "2025-04-30",
      deadlineDisplay: "৩০ এপ্রিল ২০২৫",
      eligibility: "স্নাতক ডিগ্রি, ২ বছরের কর্ম অভিজ্ঞতা",
      link: "https://www.australiaawardsbangladesh.org",
      description: "অস্ট্রেলিয়া সরকারের বৃত্তি। অস্ট্রেলিয়ার বিশ্ববিদ্যালয়ে মাস্টার্স/পিএইচডি করার সুযোগ।"
    }
  ],

  deadlines: [
    {
      id: 1,
      title: "BUET ভর্তি আবেদন শেষ",
      date: "2025-01-31",
      link: "pages/admissions.html"
    },
    {
      id: 2,
      title: "ঢাবি ভর্তি আবেদন শেষ",
      date: "2025-02-28",
      link: "pages/admissions.html"
    },
    {
      id: 3,
      title: "মেডিকেল ভর্তি পরীক্ষা",
      date: "2025-03-15",
      link: "pages/admissions.html"
    },
    {
      id: 4,
      title: "Türkiye Bursları বৃত্তি",
      date: "2025-02-28",
      link: "pages/scholarships.html"
    },
    {
      id: 5,
      title: "DAAD বৃত্তি আবেদন শেষ",
      date: "2025-03-31",
      link: "pages/scholarships.html"
    },
    {
      id: 6,
      title: "SSC পরীক্ষা শুরু",
      date: "2025-02-15",
      link: "pages/ssc.html"
    }
  ],

  boards: [
    {
      id: "dhaka",
      name: "ঢাকা শিক্ষা বোর্ড",
      shortName: "ঢাকা",
      website: "https://dhakaeducationboard.gov.bd",
      phone: "০২-৯৫৫৮৬৩৫",
      email: "info@dhakaeducationboard.gov.bd",
      address: "বাংলাদেশ সরকার, মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা",
      established: "১৯২১",
      districts: ["ঢাকা", "ময়মনসিংহ", "গাজীপুর", "নারায়ণগঞ্জ", "মুন্সীগঞ্জ", "মানিকগঞ্জ", "কিশোরগঞ্জ"]
    },
    {
      id: "rajshahi",
      name: "রাজশাহী শিক্ষা বোর্ড",
      shortName: "রাজশাহী",
      website: "https://rajshahieducationboard.gov.bd",
      phone: "০৭২১-৭৭৫৪৫৩",
      email: "info@rajshahieducationboard.gov.bd",
      address: "রাজশাহী, বাংলাদেশ",
      established: "১৯৬১",
      districts: ["রাজশাহী", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা", "সিরাজগঞ্জ", "বগুড়া", "জয়পুরহাট"]
    },
    {
      id: "chittagong",
      name: "চট্টগ্রাম শিক্ষা বোর্ড",
      shortName: "চট্টগ্রাম",
      website: "https://bise-ctg.portal.gov.bd",
      phone: "০৩১-৬৩০৮৩০",
      email: "info@bise-ctg.gov.bd",
      address: "চট্টগ্রাম, বাংলাদেশ",
      established: "১৯৯৫",
      districts: ["চট্টগ্রাম", "কক্সবাজার", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি"]
    },
    {
      id: "sylhet",
      name: "সিলেট শিক্ষা বোর্ড",
      shortName: "সিলেট",
      website: "https://sylheteducationboard.gov.bd",
      phone: "০৮২১-৭১৬৯৮৪",
      email: "info@sylheteducationboard.gov.bd",
      address: "সিলেট, বাংলাদেশ",
      established: "১৯৯৯",
      districts: ["সিলেট", "সুনামগঞ্জ", "হবিগঞ্জ", "মৌলভীবাজার"]
    },
    {
      id: "comilla",
      name: "কুমিল্লা শিক্ষা বোর্ড",
      shortName: "কুমিল্লা",
      website: "https://comillaboard.portal.gov.bd",
      phone: "০৮১-৭৮০০৬২",
      email: "info@comillaboard.gov.bd",
      address: "কুমিল্লা, বাংলাদেশ",
      established: "১৯৬২",
      districts: ["কুমিল্লা", "ফেনী", "চাঁদপুর", "ব্রাহ্মণবাড়িয়া", "নোয়াখালী", "লক্ষ্মীপুর"]
    },
    {
      id: "barisal",
      name: "বরিশাল শিক্ষা বোর্ড",
      shortName: "বরিশাল",
      website: "https://barisalboard.portal.gov.bd",
      phone: "০৪৩১-৬২৪৪০",
      email: "info@barisalboard.gov.bd",
      address: "বরিশাল, বাংলাদেশ",
      established: "১৯৯৯",
      districts: ["বরিশাল", "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "ভোলা", "বরগুনা"]
    },
    {
      id: "jessore",
      name: "যশোর শিক্ষা বোর্ড",
      shortName: "যশোর",
      website: "https://jessoreboard.gov.bd",
      phone: "০৪২১-৬৫৫০৬",
      email: "info@jessoreboard.gov.bd",
      address: "যশোর, বাংলাদেশ",
      established: "১৯৬৩",
      districts: ["যশোর", "খুলনা", "বাগেরহাট", "সাতক্ষীরা", "নড়াইল", "মাগুরা", "ঝিনাইদহ", "কুষ্টিয়া", "মেহেরপুর", "চুয়াডাঙ্গা"]
    },
    {
      id: "dinajpur",
      name: "দিনাজপুর শিক্ষা বোর্ড",
      shortName: "দিনাজপুর",
      website: "https://dinajpurboard.portal.gov.bd",
      phone: "০৫৩১-৬৩৭৩৯",
      email: "info@dinajpurboard.gov.bd",
      address: "দিনাজপুর, বাংলাদেশ",
      established: "১৯৬৩",
      districts: ["দিনাজপুর", "রংপুর", "কুড়িগ্রাম", "গাইবান্ধা", "নীলফামারী", "লালমনিরহাট", "ঠাকুরগাঁও", "পঞ্চগড়"]
    },
    {
      id: "mymensingh",
      name: "ময়মনসিংহ শিক্ষা বোর্ড",
      shortName: "ময়মনসিংহ",
      website: "https://mymensingheducationboard.gov.bd",
      phone: "০৯১-৬৭০৩৮",
      email: "info@mymensingheducationboard.gov.bd",
      address: "ময়মনসিংহ, বাংলাদেশ",
      established: "২০১৭",
      districts: ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোণা"]
    },
    {
      id: "madrasah",
      name: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড",
      shortName: "মাদ্রাসা",
      website: "https://www.bmeb.gov.bd",
      phone: "০২-৯৫৫০৩৫৩",
      email: "info@bmeb.gov.bd",
      address: "ঢাকা, বাংলাদেশ",
      established: "১৯৭৮",
      districts: ["সারা বাংলাদেশ"]
    },
    {
      id: "technical",
      name: "বাংলাদেশ কারিগরি শিক্ষা বোর্ড",
      shortName: "কারিগরি",
      website: "https://www.bteb.gov.bd",
      phone: "০২-৮৮৩৫৬৮৬",
      email: "info@bteb.gov.bd",
      address: "ঢাকা, বাংলাদেশ",
      established: "১৯৬৭",
      districts: ["সারা বাংলাদেশ"]
    }
  ],

  routines: [
    {
      id: 1,
      exam: "SSC পরীক্ষা ২০২৫",
      board: "সকল বোর্ড",
      startDate: "2025-02-15",
      endDate: "2025-03-08",
      startDateDisplay: "১৫ ফেব্রুয়ারি ২০২৫",
      endDateDisplay: "৮ মার্চ ২০২৫",
      link: "pages/ssc.html",
      schedule: [
        { date: "১৫ ফেব্রুয়ারি", subject: "বাংলা প্রথম পত্র" },
        { date: "১৬ ফেব্রুয়ারি", subject: "বাংলা দ্বিতীয় পত্র" },
        { date: "১৮ ফেব্রুয়ারি", subject: "ইংরেজি প্রথম পত্র" },
        { date: "১৯ ফেব্রুয়ারি", subject: "ইংরেজি দ্বিতীয় পত্র" },
        { date: "২১ ফেব্রুয়ারি", subject: "গণিত" },
        { date: "২৩ ফেব্রুয়ারি", subject: "পদার্থ বিজ্ঞান / ব্যবসায় উদ্যোগ" },
        { date: "২৫ ফেব্রুয়ারি", subject: "রসায়ন / হিসাববিজ্ঞান" },
        { date: "২৭ ফেব্রুয়ারি", subject: "জীববিজ্ঞান / অর্থনীতি" },
        { date: "১ মার্চ", subject: "উচ্চতর গণিত / ফিন্যান্স ও ব্যাংকিং" },
        { date: "৩ মার্চ", subject: "বাংলাদেশ ও বিশ্বপরিচয়" },
        { date: "৫ মার্চ", subject: "তথ্য ও যোগাযোগ প্রযুক্তি" },
        { date: "৮ মার্চ", subject: "ধর্ম ও নৈতিক শিক্ষা" }
      ]
    },
    {
      id: 2,
      exam: "HSC পরীক্ষা ২০২৫",
      board: "সকল বোর্ড",
      startDate: "2025-04-02",
      endDate: "2025-05-13",
      startDateDisplay: "২ এপ্রিল ২০২৫",
      endDateDisplay: "১৩ মে ২০২৫",
      link: "pages/hsc.html",
      schedule: [
        { date: "২ এপ্রিল", subject: "বাংলা প্রথম পত্র" },
        { date: "৩ এপ্রিল", subject: "বাংলা দ্বিতীয় পত্র" },
        { date: "৫ এপ্রিল", subject: "ইংরেজি প্রথম পত্র" },
        { date: "৬ এপ্রিল", subject: "ইংরেজি দ্বিতীয় পত্র" },
        { date: "৮ এপ্রিল", subject: "তথ্য ও যোগাযোগ প্রযুক্তি" },
        { date: "১০ এপ্রিল", subject: "পদার্থ বিজ্ঞান প্রথম পত্র / অর্থনীতি প্রথম পত্র" },
        { date: "১২ এপ্রিল", subject: "পদার্থ বিজ্ঞান দ্বিতীয় পত্র / অর্থনীতি দ্বিতীয় পত্র" },
        { date: "১৪ এপ্রিল", subject: "রসায়ন প্রথম পত্র / হিসাববিজ্ঞান প্রথম পত্র" }
      ]
    },
    {
      id: 3,
      exam: "দাখিল পরীক্ষা ২০২৫",
      board: "মাদ্রাসা বোর্ড",
      startDate: "2025-02-15",
      endDate: "2025-03-10",
      startDateDisplay: "১৫ ফেব্রুয়ারি ২০২৫",
      endDateDisplay: "১০ মার্চ ২০২৫",
      link: "pages/routines.html",
      schedule: [
        { date: "১৫ ফেব্রুয়ারি", subject: "কোরআন মজিদ ও তাজবিদ" },
        { date: "১৬ ফেব্রুয়ারি", subject: "আকাইদ ও ফিকহ" },
        { date: "১৮ ফেব্রুয়ারি", subject: "আরবি প্রথম পত্র" }
      ]
    }
  ],

  importantLinks: [
    { name: "শিক্ষা মন্ত্রণালয়", url: "https://moedu.gov.bd", icon: "🏛️" },
    { name: "UGC Bangladesh", url: "https://ugc.gov.bd", icon: "🎓" },
    { name: "Board Results", url: "https://eboardresults.com", icon: "📊" },
    { name: "শিক্ষক বাতায়ন", url: "https://teachers.gov.bd", icon: "👩‍🏫" },
    { name: "একাদশ ভর্তি", url: "https://xiclassadmission.gov.bd", icon: "📝" },
    { name: "জাতীয় বিশ্ববিদ্যালয়", url: "https://nu.ac.bd", icon: "🏫" },
    { name: "শিক্ষা বোর্ড", url: "https://educationboard.gov.bd", icon: "🏢" },
    { name: "BANBEIS", url: "https://banbeis.gov.bd", icon: "📈" },
    { name: "মাদ্রাসা বোর্ড", url: "https://www.bmeb.gov.bd", icon: "📚" },
    { name: "কারিগরি বোর্ড", url: "https://www.bteb.gov.bd", icon: "🔧" }
  ],

  sampleResults: {
    passed: {
      name: "রাহমান আহমেদ",
      roll: "123456",
      registration: "2024567890",
      board: "ঢাকা",
      exam: "SSC",
      year: "2024",
      gpa: "5.00",
      grade: "A+",
      status: "পাস",
      subjects: [
        { name: "বাংলা", grade: "A+", gpa: "5.00" },
        { name: "ইংরেজি", grade: "A+", gpa: "5.00" },
        { name: "গণিত", grade: "A+", gpa: "5.00" },
        { name: "বিজ্ঞান", grade: "A+", gpa: "5.00" },
        { name: "সমাজ বিজ্ঞান", grade: "A+", gpa: "5.00" },
        { name: "ধর্ম", grade: "A+", gpa: "5.00" },
        { name: "তথ্য ও যোগাযোগ প্রযুক্তি", grade: "A+", gpa: "5.00" }
      ]
    },
    failed: {
      name: "করিম মিয়া",
      roll: "654321",
      registration: "2024098765",
      board: "রাজশাহী",
      exam: "HSC",
      year: "2024",
      gpa: "0.00",
      grade: "F",
      status: "ফেল",
      subjects: [
        { name: "বাংলা", grade: "B", gpa: "3.00" },
        { name: "ইংরেজি", grade: "F", gpa: "0.00" },
        { name: "গণিত", grade: "C", gpa: "2.00" }
      ]
    }
  }
};

// Make data available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = eduData;
}
