const getStaticGovernmentData = (state, district) => ({
  policies: {
    centralSchemes: [
      { name: "PM-KISAN", description: "₹6000/year income support", eligibility: "All farmers", benefits: "₹2000 in 3 installments", website: "https://pmkisan.gov.in/" },
      { name: "PM Fasal Bima Yojana", description: "Crop insurance", eligibility: "All farmers", benefits: "Insurance with minimal premium", website: "https://pmfby.gov.in/" },
      { name: "Soil Health Card", description: "Free soil testing", eligibility: "All farmers", benefits: "Soil analysis & recommendations", website: "https://soilhealth.dac.gov.in/" }
    ],
    stateSchemes: [{ name: `${state} Farmer Welfare`, description: "State support program", eligibility: "State farmers", benefits: "Subsidies on inputs", website: `https://${state.toLowerCase().replace(/\s+/g, '')}.gov.in` }],
    subsidies: [
      { type: "Seed Subsidy", amount: "40-50%", applicableFor: "Certified seeds", howToApply: "District agriculture office" },
      { type: "Fertilizer Subsidy", amount: "varies", applicableFor: "DAP, Urea", howToApply: "At purchase" },
      { type: "Equipment Subsidy", amount: "Up to 50%", applicableFor: "Farm machinery", howToApply: "State dept" }
    ],
    insurance: { schemes: ["PM Fasal Bima"], coverage: "Natural calamities", premium: "1.5-5%", claimProcess: "Report in 72hrs" },
    loans: { schemes: ["Kisan Credit Card"], interestRate: "4-7%", maximumAmount: "₹3 lakh+", applyAt: "Banks" },
    officialWebsites: [
      { name: "Ministry of Agriculture", url: "https://agricoop.gov.in/", description: "Central govt portal" },
      { name: "Kisan Call Centre", url: "https://mkisan.gov.in/", description: "Helpline: 1800-180-1551" }
    ],
    state, district, lastUpdated: new Date(), source: 'Static Data'
  },
  prices: {
    crops: [
      { name: "Wheat", hindiName: "गेहूं", currentPrice: "₹2125/quintal", msp: "₹2125", priceRange: "₹2000-2200", trend: "stable", season: "Rabi", marketDemand: "high" },
      { name: "Rice", hindiName: "धान", currentPrice: "₹2183/quintal", msp: "₹2183", priceRange: "₹2100-2300", trend: "stable", season: "Kharif", marketDemand: "high" },
      { name: "Cotton", hindiName: "कपास", currentPrice: "₹6620/quintal", msp: "₹6620", priceRange: "₹6500-6800", trend: "increasing", season: "Kharif", marketDemand: "medium" },
      { name: "Sugarcane", hindiName: "गन्ना", currentPrice: "₹315/quintal", msp: "₹315", priceRange: "₹300-330", trend: "stable", season: "Rabi", marketDemand: "high" },
      { name: "Maize", hindiName: "मक्का", currentPrice: "₹2090/quintal", msp: "₹2090", priceRange: "₹2000-2150", trend: "stable", season: "Kharif", marketDemand: "medium" },
      { name: "Soybean", hindiName: "सोयाबीन", currentPrice: "₹4600/quintal", msp: "₹4600", priceRange: "₹4500-4700", trend: "increasing", season: "Kharif", marketDemand: "high" },
      { name: "Mustard", hindiName: "सरसों", currentPrice: "₹5450/quintal", msp: "₹5450", priceRange: "₹5300-5600", trend: "stable", season: "Rabi", marketDemand: "medium" },
      { name: "Groundnut", hindiName: "मूंगफली", currentPrice: "₹6377/quintal", msp: "₹6377", priceRange: "₹6200-6500", trend: "stable", season: "Kharif", marketDemand: "medium" }
    ],
    markets: [
      { name: `${district} APMC Mandi`, location: district, type: "APMC", facilities: ["Electronic weighing", "Storage", "Grading"] },
      { name: `${state} Market`, location: state, type: "Wholesale", facilities: ["Cold storage", "Quality testing"] }
    ],
    onlineResources: [
      { name: "e-NAM", url: "https://enam.gov.in/", features: "Online trading", coverage: "Pan-India" },
      { name: "Agmarknet", url: "https://agmarknet.gov.in/", features: "Daily prices", coverage: "All states" }
    ],
    marketInfo: { peakSeason: "Rabi crops in market", advisory: "MSP assured. Check local rates", contacts: "1800-180-1551" },
    state, district, lastUpdated: new Date(), source: 'Static Data', disclaimer: 'Approximate prices, verify locally'
  },
  resources: {
    departments: [{ name: `${state} Agriculture Dept`, website: `https://${state.toLowerCase().replace(/\s+/g, '')}.gov.in`, services: ["Registration", "Subsidies", "Soil testing"], contact: "State office" }],
    eGovernance: [{ name: "Farmer Portal", url: "https://farmer.gov.in/", purpose: "One-stop services", howToRegister: "Use Aadhaar" }],
    institutions: [{ name: "Krishi Vigyan Kendra", type: "Training", location: district, services: ["Training", "Advisory", "Demos"], contact: `KVK ${district}` }],
    helplines: [{ name: "Kisan Call Centre", number: "1800-180-1551", availability: "24x7", languages: ["Hindi", "English"] }],
    mobileApps: [{ name: "Kisan Suvidha", purpose: "Weather, prices, plant protection", platform: "Android/iOS", downloadLink: "App Store" }],
    state, lastUpdated: new Date(), source: 'Static Data'
  }
});

module.exports = {
  getGovernmentPolicies: async (state, district) => getStaticGovernmentData(state, district).policies,
  getCropPrices: async (state, district) => getStaticGovernmentData(state, district).prices,
  getAgriculturalResources: async (state) => getStaticGovernmentData(state, 'District').resources,
  getComprehensiveGovernmentInfo: async (state, district) => {
    const data = getStaticGovernmentData(state, district);
    return { ...data, generatedAt: new Date() };
  }
};
