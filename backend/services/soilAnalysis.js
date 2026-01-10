/**
 * Simplified soil analysis system
 * Extracts data from PDF and provides rule-based recommendations
 */

function extractSoilDataFromPDF(pdfText) {
    const data = {
        pH: 'Not detected',
        nitrogen: 'Unknown',
        phosphorus: 'Unknown',
        potassium: 'Unknown',
        organicCarbon: 'Unknown',
        deficiencies: [],
        strengths: []
    };

    // Extract pH
    const phMatch = pdfText.match(/pH[\s:]+(\d+\.?\d*)/i);
    if (phMatch) {
        const pH = parseFloat(phMatch[1]);
        data.pH = pH.toString();
        if (pH < 6.5) data.deficiencies.push('Acidic soil');
        if (pH > 7.5) data.deficiencies.push('Alkaline soil');
        if (pH >= 6.5 && pH <= 7.5) data.strengths.push('Optimal pH');
    }

    // Extract Nitrogen
    const nMatch = pdfText.match(/N(?:itrogen)?[\s:]+(\w+)/i);
    if (nMatch) {
        data.nitrogen = nMatch[1];
        if (nMatch[1].toLowerCase().includes('low')) data.deficiencies.push('Nitrogen');
        if (nMatch[1].toLowerCase().includes('high')) data.strengths.push('Good Nitrogen');
    }

    // Extract Phosphorus
    const pMatch = pdfText.match(/P(?:hosphorus)?[\s:]+(\w+)/i);
    if (pMatch) {
        data.phosphorus = pMatch[1];
        if (pMatch[1].toLowerCase().includes('low')) data.deficiencies.push('Phosphorus');
        if (pMatch[1].toLowerCase().includes('high')) data.strengths.push('Good Phosphorus');
    }

    // Extract Potassium
    const kMatch = pdfText.match(/K(?:alium|Potassium)?[\s:]+(\w+)/i);
    if (kMatch) {
        data.potassium = kMatch[1];
        if (kMatch[1].toLowerCase().includes('low')) data.deficiencies.push('Potassium');
        if (kMatch[1].toLowerCase().includes('high')) data.strengths.push('Good Potassium');
    }

    return data;
}

function getCropRecommendations(soilType, state, soilAnalysis) {
    const cropDatabase = {
        alluvial: [
            { cropName: { english: 'Rice', hindi: 'चावल' }, suitability: 'excellent', season: 'Kharif', expectedYield: '35-45 quintals/hectare', waterRequirement: 'high', marketPrice: '₹1900-2200 per quintal', reason: 'Alluvial soil is ideal for rice cultivation with good water retention' },
            { cropName: { english: 'Wheat', hindi: 'गेहूं' }, suitability: 'excellent', season: 'Rabi', expectedYield: '40-50 quintals/hectare', waterRequirement: 'medium', marketPrice: '₹2000-2200 per quintal', reason: 'Perfect for wheat with optimal nutrient content' },
            { cropName: { english: 'Sugarcane', hindi: 'गन्ना' }, suitability: 'good', season: 'Perennial', expectedYield: '800-1000 quintals/hectare', waterRequirement: 'high', marketPrice: '₹280-310 per quintal', reason: 'High yielding crop for alluvial soil' },
            { cropName: { english: 'Maize', hindi: 'मक्का' }, suitability: 'good', season: 'Kharif', expectedYield: '55-65 quintals/hectare', waterRequirement: 'medium', marketPrice: '₹1800-2000 per quintal', reason: 'Grows well in fertile alluvial soil' },
            { cropName: { english: 'Vegetables', hindi: 'सब्जियां' }, suitability: 'excellent', season: 'All seasons', expectedYield: 'Varies', waterRequirement: 'medium', marketPrice: 'Varies', reason: 'Highly profitable with good market demand' }
        ],
        black: [
            { cropName: { english: 'Cotton', hindi: 'कपास' }, suitability: 'excellent', season: 'Kharif', expectedYield: '20-25 quintals/hectare', waterRequirement: 'medium', marketPrice: '₹5500-6500 per quintal', reason: 'Black soil is most suitable for cotton cultivation' },
            { cropName: { english: 'Soybean', hindi: 'सोयाबीन' }, suitability: 'excellent', season: 'Kharif', expectedYield: '18-22 quintals/hectare', waterRequirement: 'low', marketPrice: '₹3800-4200 per quintal', reason: 'Excellent nitrogen-fixing crop for black soil' },
            { cropName: { english: 'Jowar', hindi: 'ज्वार' }, suitability: 'good', season: 'Kharif', expectedYield: '15-20 quintals/hectare', waterRequirement: 'low', marketPrice: '₹2800-3100 per quintal', reason: 'Drought-resistant crop for black soil' },
            { cropName: { english: 'Chickpea', hindi: 'चना' }, suitability: 'good', season: 'Rabi', expectedYield: '20-25 quintals/hectare', waterRequirement: 'low', marketPrice: '₹4500-5200 per quintal', reason: 'Good pulse crop for black soil' },
            { cropName: { english: 'Sunflower', hindi: 'सूरजमुखी' }, suitability: 'good', season: 'Kharif/Rabi', expectedYield: '18-22 quintals/hectare', waterRequirement: 'medium', marketPrice: '₹5500-6000 per quintal', reason: 'Oil seed crop suitable for black soil' }
        ],
        red: [
            { cropName: { english: 'Groundnut', hindi: 'मूंगफली' }, suitability: 'excellent', season: 'Kharif', expectedYield: '22-28 quintals/hectare', waterRequirement: 'low', marketPrice: '₹5000-5800 per quintal', reason: 'Best oilseed crop for red soil' },
            { cropName: { english: 'Millets', hindi: 'बाजरा' }, suitability: 'excellent', season: 'Kharif', expectedYield: '15-20 quintals/hectare', waterRequirement: 'low', marketPrice: '₹2000-2400 per quintal', reason: 'Drought-tolerant crop ideal for red soil' },
            { cropName: { english: 'Pulses', hindi: 'दालें' }, suitability: 'good', season: 'Rabi', expectedYield: '12-16 quintals/hectare', waterRequirement: 'low', marketPrice: '₹4500-5500 per quintal', reason: 'Legume crops improve soil fertility' },
            { cropName: { english: 'Cashew', hindi: 'काजू' }, suitability: 'good', season: 'Perennial', expectedYield: '8-10 quintals/hectare', waterRequirement: 'low', marketPrice: '₹800-1000 per kg', reason: 'High-value plantation crop for red soil' },
            { cropName: { english: 'Turmeric', hindi: 'हल्दी' }, suitability: 'good', season: 'Kharif', expectedYield: '200-250 quintals/hectare', waterRequirement: 'medium', marketPrice: '₹7000-8500 per quintal', reason: 'Spice crop with good returns' }
        ]
    };

    return cropDatabase[soilType] || cropDatabase['alluvial'];
}

function getFertilizerPlan(soilAnalysis) {
    const plan = {
        organic: ['Farm Yard Manure (FYM)', 'Vermicompost', 'Green manure'],
        chemical: []
    };

    if (soilAnalysis.deficiencies.includes('Nitrogen')) {
        plan.chemical.push({ name: 'Urea', quantity: '100-150 kg/hectare', timing: 'Split application - basal and top dressing' });
    }
    if (soilAnalysis.deficiencies.includes('Phosphorus')) {
        plan.chemical.push({ name: 'SSP/DAP', quantity: '50-75 kg/hectare', timing: 'Basal application at sowing' });
    }
    if (soilAnalysis.deficiencies.includes('Potassium')) {
        plan.chemical.push({ name: 'MOP', quantity: '40-60 kg/hectare', timing: 'Basal application' });
    }

    if (plan.chemical.length === 0) {
        plan.chemical.push({ name: 'NPK 20:20:20', quantity: '50 kg/hectare', timing: 'Basal application' });
    }

    return plan;
}

function getSoilImprovementTips(soilAnalysis, soilType) {
    const tips = [];

    if (soilAnalysis.deficiencies.includes('Acidic soil')) {
        tips.push('Add lime (calcium carbonate) @200-300 kg/hectare to neutralize soil acidity');
    }
    if (soilAnalysis.deficiencies.includes('Alkaline soil')) {
        tips.push('Apply gypsum @250-400 kg/hectare to reduce soil alkalinity');
    }

    tips.push('Practice crop rotation with legumes to improve soil nitrogen naturally');
    tips.push('Add organic matter through compost and farm yard manure regularly');
    tips.push('Mulching helps retain soil moisture and prevent erosion');
    tips.push('Practice zero tillage or minimum tillage to improve soil structure');

    return tips;
}

async function analyzeSoilReport(pdfText, location, farmDetails) {
    // Extract basic soil data from PDF text
    const soilAnalysis = extractSoilDataFromPDF(pdfText);

    // Get crop recommendations based on soil type and location
    const cropRecommendations = getCropRecommendations(farmDetails.soilType, location.state, soilAnalysis);

    // Get fertilizer recommendations
    const fertilizerPlan = getFertilizerPlan(soilAnalysis);

    // Get soil improvement suggestions
    const soilImprovement = getSoilImprovementTips(soilAnalysis, farmDetails.soilType);

    return {
        soilAnalysis,
        cropRecommendations,
        fertilizerPlan,
        soilImprovement
    };
}

module.exports = {
    analyzeSoilReport
};
