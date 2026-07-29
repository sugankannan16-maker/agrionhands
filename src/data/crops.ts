import cropRice from "@/assets/crop-rice.jpg";
import cropWheat from "@/assets/crop-wheat.jpg";
import cropCorn from "@/assets/crop-corn.jpg";
import cropSugarcane from "@/assets/crop-sugarcane.jpg";
import cropCotton from "@/assets/crop-cotton.jpg";
import cropTomato from "@/assets/crop-tomato.jpg";

export type CropInfo = { name: string; features: string[]; uses: string[] };
export type Crop = { key: string; img: string; en: CropInfo; ta: CropInfo; hi: CropInfo };

export const cropData: Crop[] = [
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
    hi: {
      name: "धान",
      features: ["गर्म आर्द्र जलवायु", "5–10 सेमी खड़ा पानी आवश्यक", "120–150 दिन का चक्र"],
      uses: ["मुख्य खाद्यान्न", "राइस ब्रान तेल", "पशु चारा एवं छप्पर हेतु पुआल"],
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
    hi: {
      name: "गेहूँ",
      features: ["ठंडा बढ़वार मौसम, गर्म कटाई", "500–1000 मिमी वर्षा", "अच्छी जल निकासी वाली दोमट मिट्टी"],
      uses: ["रोटी, ब्रेड, पास्ता का आटा", "पशु चारा एवं भूसा", "जैव ईंधन उत्पादन"],
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
    hi: {
      name: "मक्का",
      features: ["गर्म मौसम की फसल", "80–110 दिन का चक्र", "गहरी, जल निकासी वाली मिट्टी"],
      uses: ["भोजन, मक्का आटा व फ्लेक्स", "मुर्गी व पशु आहार", "एथेनॉल व कॉर्नस्टार्च"],
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
    hi: {
      name: "गन्ना",
      features: ["उष्णकटिबंधीय जलवायु", "10–18 माह का चक्र", "प्रचुर जल की आवश्यकता"],
      uses: ["चीनी व गुड़", "एथेनॉल जैव ईंधन", "कागज़ व बिजली हेतु खोई"],
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
    hi: {
      name: "कपास",
      features: ["लंबा गर्म, पालारहित मौसम", "काली कपास / जलोढ़ मिट्टी", "150–180 दिन का चक्र"],
      uses: ["वस्त्र रेशा", "बिनौला तेल", "बिनौला खली पशु आहार"],
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
    hi: {
      name: "टमाटर",
      features: ["गर्म मौसम की सब्ज़ी", "60–90 दिन का चक्र", "उपजाऊ दोमट मिट्टी, ड्रिप सिंचाई"],
      uses: ["ताज़ी सब्ज़ी व सलाद", "सॉस, केचप व प्यूरी", "लाइकोपीन का उत्तम स्रोत"],
    },
  },
];

export const cropBaselines: Record<string, number> = {
  rice: 22,
  wheat: 18,
  corn: 28,
  sugarcane: 380,
  cotton: 6,
  tomato: 120,
};
