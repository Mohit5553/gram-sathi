const { admin, isInitialized } = require('../config/firebase');

exports.sendToDevice = async (fcmTokens, title, body, data = {}) => {
  if (!isInitialized || !fcmTokens || fcmTokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: { ...data, timestamp: new Date().toISOString() },
    tokens: fcmTokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    if (response.failureCount > 0) {
      console.warn(`FCM: ${response.failureCount} messages failed to send.`);
    }
  } catch (error) {
    console.error('FCM Send Error:', error);
  }
};

exports.sendToTopic = async (topic, title, body, data = {}) => {
  if (!isInitialized) return;

  const message = {
    notification: { title, body },
    data: { ...data, timestamp: new Date().toISOString() },
    topic
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    console.error(`FCM Topic [${topic}] Send Error:`, error);
  }
};
