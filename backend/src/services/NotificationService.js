const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendToDevice, sendToTopic } = require('../utils/fcmHelper');
const { sendSMS } = require('../utils/smsHelper');

class NotificationService {
  /**
   * Dispatch a direct notification to a specific user
   */
  static async dispatch({ io, userId, title, message, type = 'system', relatedId }) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // 1. Database Persistence
      const notif = new Notification({
        user: userId,
        title,
        message,
        type,
        relatedId
      });
      await notif.save();

      // 2. In-App WebSockets
      if (io) {
        io.to(userId.toString()).emit('newNotification', notif);
      }

      // 3. Push Notifications (FCM)
      if (user.notificationPreferences?.push !== false && user.fcmTokens?.length > 0) {
        await sendToDevice(user.fcmTokens, title, message);
      }

      // 4. SMS Alerts
      if (user.notificationPreferences?.sms !== false && user.mobile) {
        await sendSMS(user.mobile, `GramSathi: ${title} - ${message}`);
      }

    } catch (error) {
      console.error('Notification Dispatch Error:', error);
    }
  }

  /**
   * Dispatch a global notification to all users or a specific topic
   */
  static async broadcast({ io, title, message, type = 'alert', topic = 'all' }) {
    try {
      // Broadcast via WebSocket
      if (io) {
        io.emit('newNotification', { title, message, type, createdAt: new Date() });
      }

      // Broadcast via FCM Topic
      await sendToTopic(topic, title, message);

      // Note: We avoid saving global broadcasts to individual user Notification models 
      // to prevent database bloating, unless we implement a dedicated 'GlobalAlert' schema.

    } catch (error) {
      console.error('Notification Broadcast Error:', error);
    }
  }
}

module.exports = NotificationService;
