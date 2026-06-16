const CurrencyRate = require('../models/CurrencyRate');

exports.refreshCurrencyRates = async () => {
  try {
    console.log('[CurrencyService] Fetching live currency exchange rates from Frankfurter API...');
    const response = await fetch('https://api.frankfurter.app/latest?from=USD');
    if (!response.ok) {
      throw new Error(`Frankfurter API returned status ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.rates || !data.rates.INR || !data.rates.EUR) {
      throw new Error('Invalid response structure from Frankfurter API');
    }

    const rates = data.rates;
    
    // Calculate conversions to INR
    const usdToInr = parseFloat(rates.INR.toFixed(2));
    const eurToInr = parseFloat((rates.INR / rates.EUR).toFixed(2));
    const aedToInr = parseFloat((rates.INR / 3.6725).toFixed(2)); // AED is pegged to USD at 3.6725

    // Get previous rates to calculate trend percentage change
    const prev = await CurrencyRate.findOne().sort({ updatedAt: -1 });
    let usdChange = 0.05; // default subtle positive change
    let eurChange = -0.02;
    let aedChange = 0.01;

    if (prev) {
      usdChange = parseFloat((((usdToInr - prev.usdToInr) / prev.usdToInr) * 100).toFixed(2));
      eurChange = parseFloat((((eurToInr - prev.eurToInr) / prev.eurToInr) * 100).toFixed(2));
      aedChange = parseFloat((((aedToInr - prev.aedToInr) / prev.aedToInr) * 100).toFixed(2));
    }

    // Clean up old records
    await CurrencyRate.deleteMany({});

    // Save fresh rates
    const freshRates = new CurrencyRate({
      usdToInr,
      eurToInr,
      aedToInr,
      usdChange,
      eurChange,
      aedChange,
      updatedAt: new Date()
    });

    await freshRates.save();
    console.log(`[CurrencyService] Currency rates updated successfully: USD/INR: ₹${usdToInr} (${usdChange}%), EUR/INR: ₹${eurToInr} (${eurChange}%)`);
    return true;
  } catch (error) {
    console.error('[CurrencyService] Error refreshing currency rates:', error.message);
    return false;
  }
};
