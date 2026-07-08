import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroGrass from "@/assets/hero-grass.jpg";
import farmerPortrait from "@/assets/farmer-portrait.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import cropWheat from "@/assets/crop-wheat.jpg";
import cropCorn from "@/assets/crop-corn.jpg";
import cropSugarcane from "@/assets/crop-sugarcane.jpg";
import cropCotton from "@/assets/crop-cotton.jpg";
import cropTomato from "@/assets/crop-tomato.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

type Lang = "en" | "ta";

const t = {
  en: {
    nav: { features: "Features", crops: "Crops", predict: "Predict", how: "How it works", impact: "Impact", contact: "Contact" },
    predict: {
      kicker: "AI Yield Prediction",
      heading: "Forecast your harvest in seconds",
      sub: "Enter your crop, location, soil profile and forecast window. Our model estimates yield, confidence and a smart advisory.",
      crop: "Crop type",
      cropPh: "Select a crop",
      location: "Location / District",
      locationPh: "e.g. Salem, Tamil Nadu",
      area: "Field area (acres)",
      soilType: "Soil type",
      soilPh: "Select soil",
      soilN: "Nitrogen (kg/ha)",
      soilP: "Phosphorus (kg/ha)",
      soilK: "Potassium (kg/ha)",
      soilPH: "Soil pH",
      rainfall: "Expected rainfall (mm)",
      start: "Forecast start",
      end: "Forecast end",
      submit: "Predict yield",
      reset: "Reset",
      result: "Predicted yield",
      perAcre: "per acre",
      total: "Total harvest",
      confidence: "Model confidence",
      advisory: "Advisory",
      soils: ["Loamy", "Clay", "Sandy", "Black cotton", "Red", "Alluvial"],
    },
    contact: {
      kicker: "Contact",
      heading: "Talk to our agronomy team",
      sub: "We're based in Salem, Tamil Nadu and reply within one working day.",
      phone: "Phone",
      email: "Email",
      location: "Location",
      call: "Call now",
      write: "Write to us",
    },
    cta: "Request Demo",
    hero: {
      kicker: "Smart farming · powered by AI",
      title1: "Precision yield forecasting for the",
      title2: "modern grower",
      body: "Satellite imagery, soil sensors and micro-climate AI — all in your palm. Predict harvests, prevent losses, and grow more with less.",
      primary: "Begin analysis",
      secondary: "View field report",
      chip1: "PLOT #A-142 · RICE · 320 ACRES",
      chip2: "FORECAST: 218 BU/AC · +12%",
      side1Label: "Live Paddy Price",
      side1Sub: "+2.4% vs last cycle",
      side2Label: "Region Advisory",
      side2Body: "Optimal planting window opens in 6 days.",
      side2Sub: "Tamil Nadu · Zone 5b",
    },
    metrics: {
      heading: "Real impact, on real fields.",
      items: [
        { v: "14.2%", l: "Average Yield Increase", b: "Across 2.4M hectares of monitored cropland." },
        { v: "₹3,200/ac", l: "Input Cost Reduction", b: "Less fertilizer and water waste with hyper-local prescriptions." },
        { v: "94%", l: "Forecast Accuracy", b: "Precision 30 days before the harvest window closes." },
      ],
    },
    features: {
      kicker: "The Platform",
      heading: "Intelligent layers of growth",
      sub: "One engine, three lenses on your field — from orbit to root zone to market.",
      f1t: "Multispectral vegetation index",
      f1b: "Track biomass health in real time. Detect nitrogen deficiencies 72 hours before they're visible.",
      f2t: "Micro-climate risk engine",
      f2b: "Predict frost, hail and drought windows down to the acre using local + regional models.",
      f3t: "Sub-soil analytics",
      f3b: "Root-zone moisture and nutrient modeling across 5m grids using deep-layer core samples.",
      f4t: "Variable-rate scripts",
      f4b: "Export prescription maps directly to John Deere, Case IH and AGCO equipment.",
      f5t: "Market hedging",
      f5b: "Match harvest volume against global futures to price your yield at the right moment.",
    },
    crops: {
      kicker: "Crop library",
      heading: "Tap a crop to see its features & uses",
      sub: "Localized AI models for every major crop grown across India.",
      hint: "Hover / tap a card",
      features: "Features",
      uses: "Uses",
    },
    how: {
      kicker: "How it works",
      heading: "From orbit to operator in three moves.",
      steps: [
        { t: "Onboard your fields", d: "Draw boundaries or import shapefiles. We backfill three years of imagery in minutes." },
        { t: "Model runs continuously", d: "Daily satellite passes, on-site sensors and weather feeds power a per-plot digital twin." },
        { t: "Act on prescriptions", d: "Get rate maps, alerts and yield forecasts pushed directly to your equipment." },
      ],
    },
    testimonial: {
      quote: "Seeing a yield deficit three weeks in advance let us adjust our nitrogen application and save our entire paddy crop.",
      name: "Erik Sorenson",
      role: "Head of Operations · Heartland Plains Ag",
    },
    cta2: {
      heading: "Ready to optimize your harvest?",
      body: "Join 4,500+ farmers and agribusinesses using Agri on Hands.",
      primary: "Schedule yield assessment",
      secondary: "Speak with an agronomist",
    },
    footer: { rights: "© 2026 Agri on Hands. All rights reserved." },
  },
  ta: {
    nav: { features: "வசதிகள்", crops: "பயிர்கள்", predict: "முன்கணிப்பு", how: "எப்படி இயங்குகிறது", impact: "தாக்கம்", contact: "தொடர்பு" },
    predict: {
      kicker: "AI விளைச்சல் முன்கணிப்பு",
      heading: "சில நொடிகளில் உங்கள் அறுவடையை கணிக்கவும்",
      sub: "பயிர், இடம், மண் விவரம் மற்றும் முன்கணிப்பு காலத்தை உள்ளிடுங்கள். எங்கள் மாதிரி விளைச்சல், நம்பகத்தன்மை மற்றும் ஆலோசனையைக் காட்டும்.",
      crop: "பயிர் வகை",
      cropPh: "ஒரு பயிரைத் தேர்ந்தெடு",
      location: "இடம் / மாவட்டம்",
      locationPh: "எ.கா. சேலம், தமிழ்நாடு",
      area: "நில பரப்பு (ஏக்கர்)",
      soilType: "மண் வகை",
      soilPh: "மண் தேர்ந்தெடு",
      soilN: "நைட்ரஜன் (kg/ha)",
      soilP: "பாஸ்பரஸ் (kg/ha)",
      soilK: "பொட்டாசியம் (kg/ha)",
      soilPH: "மண் pH",
      rainfall: "எதிர்பார்க்கும் மழை (மிமீ)",
      start: "முன்கணிப்பு தொடக்கம்",
      end: "முன்கணிப்பு முடிவு",
      submit: "விளைச்சலைக் கணி",
      reset: "மீட்டமை",
      result: "கணிக்கப்பட்ட விளைச்சல்",
      perAcre: "ஏக்கருக்கு",
      total: "மொத்த அறுவடை",
      confidence: "மாதிரி நம்பகத்தன்மை",
      advisory: "ஆலோசனை",
      soils: ["களிமண்", "கடுங்களி", "மணல்", "கருஞ்சி", "சிவப்பு", "வண்டல்"],
    },
    contact: {
      kicker: "தொடர்பு",
      heading: "எங்கள் விவசாய குழுவை தொடர்பு கொள்ளுங்கள்",
      sub: "நாங்கள் சேலம், தமிழ்நாட்டில் உள்ளோம். ஒரு வேலை நாளில் பதிலளிக்கிறோம்.",
      phone: "தொலைபேசி",
      email: "மின்னஞ்சல்",
      location: "இடம்",
      call: "இப்போது அழை",
      write: "எங்களுக்கு எழுது",
    },
    cta: "டெமோ கேளுங்கள்",
    hero: {
      kicker: "AI மூலம் இயங்கும் புத்திசாலி விவசாயம்",
      title1: "நவீன விவசாயிக்கான",
      title2: "துல்லிய விளைச்சல் முன்கணிப்பு",
      body: "செயற்கைக்கோள் படங்கள், மண் சென்சார்கள் மற்றும் நுண் காலநிலை AI — அனைத்தும் உங்கள் கையில். விளைச்சலை முன்கணிக்கவும், இழப்புகளைத் தடுக்கவும், குறைந்த வளங்களில் அதிகம் விளைவிக்கவும்.",
      primary: "பகுப்பாய்வைத் தொடங்கு",
      secondary: "வயல் அறிக்கை பார்க்க",
      chip1: "நிலம் #A-142 · நெல் · 320 ஏக்கர்",
      chip2: "முன்கணிப்பு: 218 மூடை/ஏக்கர் · +12%",
      side1Label: "நெல் விலை (நேரலை)",
      side1Sub: "கடந்த சுழற்சியை விட +2.4%",
      side2Label: "பிராந்திய ஆலோசனை",
      side2Body: "சிறந்த நடவு காலம் 6 நாட்களில் தொடங்கும்.",
      side2Sub: "தமிழ்நாடு · மண்டலம் 5b",
    },
    metrics: {
      heading: "உண்மையான வயல்களில், உண்மையான தாக்கம்.",
      items: [
        { v: "14.2%", l: "சராசரி விளைச்சல் அதிகரிப்பு", b: "2.4M ஹெக்டேர் நிலங்களில் கண்காணிக்கப்பட்டது." },
        { v: "₹3,200/ஏக்", l: "உள்ளீட்டு செலவு குறைப்பு", b: "மிக-உள்ளூர் பரிந்துரைகளால் உரம் மற்றும் நீர் விரயம் குறைகிறது." },
        { v: "94%", l: "முன்கணிப்பு துல்லியம்", b: "அறுவடைக்கு 30 நாட்கள் முன் துல்லியம்." },
      ],
    },
    features: {
      kicker: "தளம்",
      heading: "விளைச்சலின் புத்திசாலித்தனமான அடுக்குகள்",
      sub: "ஒரே இயந்திரம், மூன்று கண்ணோட்டங்கள் — வானிலிருந்து வேர் வரை, சந்தை வரை.",
      f1t: "பன்மைநிற தாவர குறியீடு",
      f1b: "உயிரி நிறை ஆரோக்கியத்தை நேரலையில் கண்காணி. கண்களுக்குத் தெரிவதற்கு 72 மணி நேரத்திற்கு முன்னரே நைட்ரஜன் குறைபாட்டைக் கண்டறியும்.",
      f2t: "நுண் காலநிலை ஆபத்து இயந்திரம்",
      f2b: "உள்ளூர் + பிராந்திய மாதிரிகளைப் பயன்படுத்தி பனிப்பாறை, ஆலங்கட்டி, வறட்சி காலங்களை ஏக்கர் வரை கணிக்கும்.",
      f3t: "மண்ணின் கீழ் பகுப்பாய்வு",
      f3b: "5மீ கட்டங்களில் வேர்-மண்டல ஈரப்பதம் மற்றும் ஊட்டச்சத்து மாதிரியாக்கம்.",
      f4t: "மாறுபட்ட விகித ஸ்கிரிப்ட்கள்",
      f4b: "பரிந்துரை வரைபடங்களை நேரடியாக John Deere, Case IH, AGCO கருவிகளுக்கு ஏற்றுமதி செய்யவும்.",
      f5t: "சந்தை பாதுகாப்பு",
      f5b: "உலகச் சந்தை விலைகளுடன் விளைச்சலைப் பொருத்தி சரியான நேரத்தில் விற்பனை.",
    },
    crops: {
      kicker: "பயிர் நூலகம்",
      heading: "ஒரு பயிரைத் தொட்டால் அதன் வசதிகள் & பயன்கள் தெரியும்",
      sub: "இந்தியாவில் பயிரிடப்படும் ஒவ்வொரு முக்கிய பயிருக்கும் உள்ளூர்மயமாக்கப்பட்ட AI மாதிரிகள்.",
      hint: "ஒரு அட்டையைத் தொடவும்",
      features: "வசதிகள்",
      uses: "பயன்கள்",
    },
    how: {
      kicker: "எப்படி இயங்குகிறது",
      heading: "வானிலிருந்து விவசாயி வரை மூன்று படிகளில்.",
      steps: [
        { t: "உங்கள் வயல்களை பதிவு செய்யுங்கள்", d: "எல்லைகளை வரையவும் அல்லது shapefiles இறக்குமதி செய்யவும். 3 ஆண்டுகள் படங்கள் நிமிடங்களில் சேரும்." },
        { t: "மாதிரி தொடர்ந்து இயங்குகிறது", d: "தினசரி செயற்கைக்கோள், சென்சார்கள், வானிலை உள்ளீடு — ஒவ்வொரு நிலத்திற்கும் டிஜிட்டல் இரட்டையர்." },
        { t: "பரிந்துரைகளின்படி செயல்படு", d: "விகித வரைபடங்கள், எச்சரிக்கைகள், விளைச்சல் முன்கணிப்புகள் — நேரடியாக உங்கள் கருவிகளுக்கு." },
      ],
    },
    testimonial: {
      quote: "விளைச்சல் குறைப்பை மூன்று வாரங்கள் முன்பே பார்த்ததால், நாங்கள் நைட்ரஜனை சரிசெய்து முழு நெல் விளைச்சலையும் காப்பாற்றினோம்.",
      name: "ஏரிக் சொரென்சன்",
      role: "செயல்பாட்டு தலைவர் · ஹார்ட்லேண்ட் பிளைன்ஸ் ஆக்",
    },
    cta2: {
      heading: "உங்கள் அறுவடையை மேம்படுத்த தயாரா?",
      body: "4,500+ விவசாயிகள் மற்றும் விவசாய நிறுவனங்கள் Agri on Hands-ஐ பயன்படுத்துகின்றனர்.",
      primary: "விளைச்சல் மதிப்பீடு பதிவு",
      secondary: "விவசாய நிபுணருடன் பேசு",
    },
    footer: { rights: "© 2026 Agri on Hands. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை." },
  },
};

const cropData = [
  {
    key: "rice",
    img: cropRice,
    en: {
      name: "Rice",
      features: ["Warm humid climate", "Requires 5–10 cm standing water", "120–150 day cycle"],
      uses: ["Staple food grain", "Rice bran oil", "Straw for cattle & thatching"],
    },
    ta: {
      name: "நெல்",
      features: ["வெப்பமான, ஈரப்பதமான காலநிலை", "5–10 செமீ நிற்கும் நீர் தேவை", "120–150 நாள் சுழற்சி"],
      uses: ["முதன்மை உணவு தானியம்", "அரிசி தவிடு எண்ணெய்", "மாடுகள் மற்றும் வேய்வதற்கு வைக்கோல்"],
    },
  },
  {
    key: "wheat",
    img: cropWheat,
    en: {
      name: "Wheat",
      features: ["Cool growing season, warm harvest", "500–1000 mm rainfall", "Well-drained loamy soil"],
      uses: ["Flour for bread, roti, pasta", "Livestock feed & straw", "Biofuel production"],
    },
    ta: {
      name: "கோதுமை",
      features: ["குளிர்ந்த வளர்ச்சி, வெப்ப அறுவடை", "500–1000 மிமீ மழை", "நன்கு வடிகட்டப்பட்ட களிமண்"],
      uses: ["ரொட்டி, சப்பாத்தி, பாஸ்தா மாவு", "கால்நடை உணவு & வைக்கோல்", "உயிரி எரிபொருள்"],
    },
  },
  {
    key: "corn",
    img: cropCorn,
    en: {
      name: "Maize (Corn)",
      features: ["Warm season crop", "80–110 day cycle", "Deep well-drained soil"],
      uses: ["Food, cornmeal & flakes", "Poultry & cattle feed", "Ethanol & cornstarch"],
    },
    ta: {
      name: "மக்காச்சோளம்",
      features: ["வெப்ப-கால பயிர்", "80–110 நாள் சுழற்சி", "ஆழமான, நன்கு வடிகட்டும் மண்"],
      uses: ["உணவு, மாவு & பொரிகள்", "கோழி & மாடு தீவனம்", "எத்தனால் & சோள மாவு"],
    },
  },
  {
    key: "sugarcane",
    img: cropSugarcane,
    en: {
      name: "Sugarcane",
      features: ["Tropical / subtropical", "10–18 month cycle", "Requires abundant water"],
      uses: ["Sugar & jaggery", "Ethanol biofuel", "Bagasse for paper & power"],
    },
    ta: {
      name: "கரும்பு",
      features: ["வெப்ப மண்டல காலநிலை", "10–18 மாத சுழற்சி", "அதிக நீர் தேவை"],
      uses: ["சர்க்கரை & வெல்லம்", "எத்தனால் உயிரி எரிபொருள்", "காகிதம் & மின்சாரத்திற்கு பகாஸ்"],
    },
  },
  {
    key: "cotton",
    img: cropCotton,
    en: {
      name: "Cotton",
      features: ["Long warm frost-free season", "Black cotton / alluvial soil", "150–180 day cycle"],
      uses: ["Textile fibre", "Cottonseed oil", "Livestock cake from seed meal"],
    },
    ta: {
      name: "பருத்தி",
      features: ["நீண்ட வெப்ப, பனியில்லா காலம்", "கருஞ்சி / வண்டல் மண்", "150–180 நாள் சுழற்சி"],
      uses: ["ஜவுளி நார்", "பருத்தி விதை எண்ணெய்", "விதை மாவிலிருந்து கால்நடை அப்பம்"],
    },
  },
  {
    key: "tomato",
    img: cropTomato,
    en: {
      name: "Tomato",
      features: ["Warm season vegetable", "60–90 day cycle", "Rich loamy soil, drip irrigation"],
      uses: ["Fresh vegetable & salad", "Sauces, ketchup & puree", "Rich source of lycopene"],
    },
    ta: {
      name: "தக்காளி",
      features: ["வெப்பகால காய்கறி", "60–90 நாள் சுழற்சி", "வளமான களிமண், சொட்டு நீர்ப்பாசனம்"],
      uses: ["புதிய காய்கறி & சாலட்", "சாஸ், கெட்சப் & பியூரி", "லைகோபீன் அதிகம் உள்ளது"],
    },
  },
];

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const c = t[lang];
  const isTa = lang === "ta";

  return (
    <div lang={lang} className="font-sans text-grass-900 bg-grass-50">
      <Nav lang={lang} setLang={setLang} c={c} />
      <Hero c={c} isTa={isTa} />
      <Metrics c={c} isTa={isTa} />
      <Features c={c} isTa={isTa} />
      <Crops lang={lang} c={c} isTa={isTa} />
      <HowItWorks c={c} isTa={isTa} />
      <Testimonial c={c} isTa={isTa} />
      <CTA c={c} isTa={isTa} />
      <Footer c={c} />
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-full bg-grass-100 p-1 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full transition ${lang === "en" ? "bg-grass-800 text-grass-50" : "text-grass-800 hover:text-grass-900"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ta")}
        className={`px-3 py-1 rounded-full transition ${lang === "ta" ? "bg-grass-800 text-grass-50" : "text-grass-800 hover:text-grass-900"}`}
      >
        தமிழ்
      </button>
    </div>
  );
}

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <div className="size-8 rounded-full bg-grass-800 grid place-items-center shrink-0">
        <LeafIcon className="size-4 text-sun-500" />
      </div>
      <span
        className="text-2xl md:text-3xl leading-none text-grass-900 tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Agri on Hands
      </span>
    </a>
  );
}

function Nav({ lang, setLang, c }: { lang: Lang; setLang: (l: Lang) => void; c: typeof t.en }) {
  return (
    <nav className="sticky top-0 z-50 bg-grass-50/85 backdrop-blur-md border-b border-grass-800/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />
        <div className="hidden lg:flex gap-8 text-sm font-medium text-grass-800">
          <a href="#features" className="hover:text-grass-900">{c.nav.features}</a>
          <a href="#crops" className="hover:text-grass-900">{c.nav.crops}</a>
          <a href="#how" className="hover:text-grass-900">{c.nav.how}</a>
          <a href="#impact" className="hover:text-grass-900">{c.nav.impact}</a>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle lang={lang} setLang={setLang} />
          <button className="hidden sm:inline-flex bg-grass-800 text-grass-50 text-sm font-medium py-2 px-4 rounded-full hover:bg-grass-900 transition-colors">
            {c.cta}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  return (
    <section className="py-12 lg:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-end">
          <div className="space-y-6">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">
              {c.hero.kicker}
            </span>
            <h1 className={`${isTa ? "" : "font-serif"} text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-balance`}>
              {c.hero.title1}{" "}
              <span className="italic text-grass-600">{c.hero.title2}</span>
            </h1>
            <p className="text-base md:text-lg text-grass-800 max-w-[54ch] text-pretty">
              {c.hero.body}
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-grass-800 text-grass-50 text-sm font-medium py-3 px-5 rounded-full hover:bg-grass-900 transition-colors inline-flex items-center gap-2">
                {c.hero.primary}
                <span aria-hidden>→</span>
              </button>
              <button className="text-grass-900 text-sm font-medium py-3 px-5 rounded-full ring-1 ring-grass-800/15 hover:bg-grass-100 transition-colors">
                {c.hero.secondary}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-5 bg-white ring-1 ring-grass-800/10 rounded-2xl shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-grass-600">
                {c.hero.side1Label}
              </span>
              <div className="mt-1 font-serif text-3xl">₹2,340<span className="text-base text-grass-600">/qtl</span></div>
              <div className="mt-1 text-sm text-grass-600 font-medium">{c.hero.side1Sub}</div>
            </div>
            <div className="p-5 bg-grass-800 text-grass-50 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-grass-200/70">
                {c.hero.side2Label}
              </span>
              <div className={`mt-2 ${isTa ? "" : "font-serif"} text-xl leading-tight`}>
                {c.hero.side2Body}
              </div>
              <div className="mt-3 text-xs text-grass-200/70">{c.hero.side2Sub}</div>
            </div>
          </aside>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl ring-1 ring-grass-800/10">
          <img
            src={heroGrass}
            alt="Lush green grass field with morning dew"
            width={1920}
            height={1024}
            className="w-full h-[320px] md:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-grass-900/50 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-3 justify-between text-grass-50">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-grass-900/60 backdrop-blur px-3 py-1.5 rounded-full">
              {c.hero.chip1}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-grass-900/60 backdrop-blur px-3 py-1.5 rounded-full">
              {c.hero.chip2}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  return (
    <section id="impact" className="py-20 px-4 md:px-6 bg-grass-800 text-grass-50">
      <div className="max-w-7xl mx-auto">
        <h2 className={`${isTa ? "" : "font-serif"} text-3xl md:text-4xl mb-12 max-w-[24ch] text-balance`}>
          {c.metrics.heading}
        </h2>
        <div className="grid md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-grass-50/10">
          {c.metrics.items.map((m, i) => (
            <div key={m.l} className={i === 0 ? "md:pr-10" : "md:px-10"}>
              <div className={`${isTa ? "" : "font-serif"} text-5xl md:text-6xl mb-3 text-sun-500`}>
                {m.v}
              </div>
              <p className="text-xs text-grass-200/70 font-semibold uppercase tracking-widest">
                {m.l}
              </p>
              <p className="mt-3 text-grass-50/85 text-sm text-pretty max-w-[32ch]">{m.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  const cards = [
    { t: c.features.f1t, b: c.features.f1b, icon: <SatelliteIcon /> },
    { t: c.features.f2t, b: c.features.f2b, icon: <CloudIcon /> },
    { t: c.features.f3t, b: c.features.f3b, icon: <SoilIcon /> },
    { t: c.features.f4t, b: c.features.f4b, icon: <ScriptIcon /> },
    { t: c.features.f5t, b: c.features.f5b, icon: <MarketIcon /> },
  ];
  return (
    <section id="features" className="py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-[52ch]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">
              {c.features.kicker}
            </span>
            <h2 className={`${isTa ? "" : "font-serif"} text-3xl md:text-5xl mt-3 text-balance`}>
              {c.features.heading}
            </h2>
          </div>
          <p className="text-grass-800 max-w-sm text-pretty">{c.features.sub}</p>
        </div>

        <div className="grid md:grid-cols-6 gap-4">
          {cards.map((f, i) => (
            <div
              key={i}
              className={`group bg-white p-6 md:p-7 rounded-2xl ring-1 ring-grass-800/8 hover:ring-grass-600/40 hover:-translate-y-0.5 transition ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
            >
              <div className="p-2.5 bg-grass-100 text-grass-800 rounded-xl w-fit">{f.icon}</div>
              <h3 className={`${isTa ? "" : "font-serif"} text-xl md:text-2xl mt-4`}>{f.t}</h3>
              <p className="text-grass-800 text-sm mt-2 text-pretty">{f.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Crops({ lang, c, isTa }: { lang: Lang; c: typeof t.en; isTa: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="crops" className="py-20 md:py-28 px-4 md:px-6 bg-grass-100/60">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="max-w-[54ch]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">
              {c.crops.kicker}
            </span>
            <h2 className={`${isTa ? "" : "font-serif"} text-3xl md:text-5xl mt-3 text-balance`}>
              {c.crops.heading}
            </h2>
            <p className="text-grass-800 mt-3 max-w-[52ch]">{c.crops.sub}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-grass-600 bg-white px-3 py-1.5 rounded-full ring-1 ring-grass-800/10">
            {c.crops.hint}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {cropData.map((crop) => {
            const info = crop[lang];
            const isActive = active === crop.key;
            return (
              <button
                key={crop.key}
                type="button"
                onClick={() => setActive(isActive ? null : crop.key)}
                onMouseEnter={() => setActive(crop.key)}
                onMouseLeave={() => setActive((prev) => (prev === crop.key ? null : prev))}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] text-left ring-1 ring-grass-800/10 focus:outline-none focus:ring-2 focus:ring-grass-600"
                aria-expanded={isActive}
              >
                <img
                  src={crop.img}
                  alt={info.name}
                  width={640}
                  height={640}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-grass-900/85 via-grass-900/30 to-transparent" />

                {/* Default label */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-4 md:p-5 text-grass-50 transition-opacity duration-300 ${isActive ? "opacity-0" : "opacity-100"}`}
                >
                  <div className={`${isTa ? "" : "font-serif"} text-2xl md:text-3xl leading-tight`}>
                    {info.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-grass-200/80 mt-1">
                    {c.crops.hint} →
                  </div>
                </div>

                {/* Reveal panel */}
                <div
                  className={`absolute inset-0 p-4 md:p-5 text-grass-50 flex flex-col justify-end transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                  <div className={`${isTa ? "" : "font-serif"} text-xl md:text-2xl mb-3`}>
                    {info.name}
                  </div>
                  <div className="space-y-3 text-xs md:text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-sun-500 font-semibold mb-1">
                        {c.crops.features}
                      </div>
                      <ul className="space-y-0.5 text-grass-50/90">
                        {info.features.map((f) => (
                          <li key={f} className="flex gap-1.5">
                            <span className="text-sun-500">·</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-sun-500 font-semibold mb-1">
                        {c.crops.uses}
                      </div>
                      <ul className="space-y-0.5 text-grass-50/90">
                        {info.uses.map((u) => (
                          <li key={u} className="flex gap-1.5">
                            <span className="text-sun-500">·</span>
                            <span>{u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  return (
    <section id="how" className="py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 max-w-[52ch]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">
            {c.how.kicker}
          </span>
          <h2 className={`${isTa ? "" : "font-serif"} text-3xl md:text-5xl mt-3 text-balance`}>
            {c.how.heading}
          </h2>
        </div>
        <ol className="grid md:grid-cols-3 gap-5">
          {c.how.steps.map((s, i) => (
            <li key={i} className="bg-white p-7 rounded-2xl ring-1 ring-grass-800/8 space-y-3">
              <div className={`${isTa ? "" : "font-serif"} text-5xl text-grass-600`}>
                0{i + 1}
              </div>
              <h3 className={`${isTa ? "" : "font-serif"} text-xl md:text-2xl`}>{s.t}</h3>
              <p className="text-grass-800 text-sm text-pretty">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonial({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-grass-100/50">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <img
          src={farmerPortrait}
          alt={c.testimonial.name}
          width={512}
          height={512}
          loading="lazy"
          className="size-20 mx-auto rounded-full object-cover ring-1 ring-grass-800/10"
        />
        <blockquote className={`${isTa ? "" : "font-serif"} text-2xl md:text-3xl text-grass-900 leading-snug text-balance`}>
          &ldquo;{c.testimonial.quote}&rdquo;
        </blockquote>
        <div>
          <p className="font-semibold">{c.testimonial.name}</p>
          <p className="text-sm text-grass-600">{c.testimonial.role}</p>
        </div>
      </div>
    </section>
  );
}

function CTA({ c, isTa }: { c: typeof t.en; isTa: boolean }) {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-grass-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <img
            src={heroGrass}
            alt=""
            aria-hidden
            width={1920}
            height={1024}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="relative space-y-5">
            <h2 className={`${isTa ? "" : "font-serif"} text-3xl md:text-5xl text-grass-50 text-balance`}>
              {c.cta2.heading}
            </h2>
            <p className="text-grass-50/85 max-w-[42ch] mx-auto">{c.cta2.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <button className="bg-sun-500 text-grass-900 text-sm font-semibold py-3 px-5 rounded-full hover:brightness-95 transition-all">
                {c.cta2.primary}
              </button>
              <button className="text-grass-50 text-sm font-medium py-3 px-5 rounded-full ring-1 ring-grass-50/25 hover:bg-grass-50/10 transition-colors">
                {c.cta2.secondary}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ c }: { c: typeof t.en }) {
  return (
    <footer className="py-10 px-4 md:px-6 border-t border-grass-800/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Logo />
        <p className="text-xs text-grass-600 text-center">{c.footer.rights}</p>
      </div>
    </footer>
  );
}

/* ---------- Icons ---------- */
function LeafIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3s-6 0-9 3 0 9 0 9 6 0 9-3 0-9 0-9z" />
      <path d="M4 12L10 6" />
    </svg>
  );
}
function SatelliteIcon() {
  return (
    <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.5 1.5M12 12l-1.5-1.5M4 12l1.5-1.5M12 4l-1.5 1.5" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a3 3 0 010-6 4 4 0 017.9.5A2.75 2.75 0 0113 11H4z" />
    </svg>
  );
}
function SoilIcon() {
  return (
    <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v6M6 4l2 2 2-2M2 10h12M2 13h12" />
    </svg>
  );
}
function ScriptIcon() {
  return (
    <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
      <path d="M5 6h6M5 8.5h6M5 11h4" />
    </svg>
  );
}
function MarketIcon() {
  return (
    <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l4-4 3 3 5-6" />
      <path d="M10 5h4v4" />
    </svg>
  );
}
