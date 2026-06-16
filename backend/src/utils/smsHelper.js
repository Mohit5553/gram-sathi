/**
 * Mock SMS Helper for GramSathi Notification Engine
 * To be replaced with Twilio / MSG91 API keys in production
 */
exports.sendSMS = async (mobile, message) => {
  if (!mobile) return;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('=========================================');
  console.log(`📱 [SMS DISPATCHED] To: ${mobile}`);
  console.log(`💬 Message: ${message}`);
  console.log('=========================================');
  
  return true;
};
