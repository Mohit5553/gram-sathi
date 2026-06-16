const MetalRates = require('../models/MetalRates');

exports.refreshMetalRates = async () => {
  try {
    // Check if rates exist in database (admin overrides or previous cached values)
    const current = await MetalRates.findOne().sort({ updatedAt: -1 });

    // Use current DB rates or fallback to standard design base rates
    let gold24K = current ? current.gold24K : 9950;
    let gold22K = current ? current.gold22K : 9125;
    let silver = current ? current.silver : 109;
    
    // Generate slight percentage changes (-0.5% to +0.5%) for dynamic daily change indicators
    const gold24KChange = parseFloat((Math.random() * 1.0 - 0.5).toFixed(2));
    const gold22KChange = parseFloat((Math.random() * 1.0 - 0.5).toFixed(2));
    const silverChange = parseFloat((Math.random() * 1.5 - 0.75).toFixed(2));

    // Apply change to base rates
    gold24K = Math.round(gold24K * (1 + gold24KChange / 100));
    gold22K = Math.round(gold22K * (1 + gold22KChange / 100));
    silver = Math.round(silver * (1 + silverChange / 100));

    // Clear old metal records
    await MetalRates.deleteMany({});

    // Save the new rates
    const rates = new MetalRates({
      gold24K,
      gold22K,
      silver,
      gold24KChange,
      gold22KChange,
      silverChange,
      updatedAt: new Date()
    });

    await rates.save();
    console.log(`[MetalService] Successfully updated metal rates: Gold 24K: ₹${gold24K} (${gold24KChange}%), Silver: ₹${silver} (${silverChange}%)`);
    return true;
  } catch (error) {
    console.error('[MetalService] Error refreshing metal rates:', error.message);
    return false;
  }
};
