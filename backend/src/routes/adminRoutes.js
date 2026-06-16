const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Stats and Analytics
router.get('/stats', auth, authorize('admin', 'super_admin'), adminController.getStats);
router.get('/chart-data', auth, authorize('admin', 'super_admin'), adminController.getChartData);
router.get('/reports', auth, authorize('admin', 'super_admin'), adminController.getReports);
router.get('/activity-logs', auth, authorize('admin', 'super_admin'), adminController.getActivityLogs);

// User Management
router.get('/users', auth, authorize('admin', 'super_admin'), adminController.getAllUsers);
router.put('/users/:id', auth, authorize('admin', 'super_admin'), adminController.updateUser);
router.delete('/users/:id', auth, authorize('admin', 'super_admin'), adminController.deleteUser);

// Provider Management
router.get('/providers', auth, authorize('admin', 'super_admin'), adminController.getAllProviders);
router.put('/providers/:id/status', auth, authorize('admin', 'super_admin'), adminController.updateProviderStatus);
router.delete('/providers/:id', auth, authorize('admin', 'super_admin'), adminController.deleteProvider);

// Provider Verification Management
router.get('/verifications', auth, authorize('admin', 'super_admin'), adminController.getAllVerifications);
router.put('/verifications/:id/approve', auth, authorize('admin', 'super_admin'), adminController.approveVerification);
router.put('/verifications/:id/reject', auth, authorize('admin', 'super_admin'), adminController.rejectVerification);
router.put('/verifications/:id/suspend', auth, authorize('admin', 'super_admin'), adminController.suspendVerification);

// Bookings Management
router.get('/bookings', auth, authorize('admin', 'super_admin'), adminController.getAllBookings);
router.put('/bookings/:id/status', auth, authorize('admin', 'super_admin'), adminController.updateBookingStatus);
router.delete('/bookings/:id', auth, authorize('admin', 'super_admin'), adminController.deleteBooking);

// Lost & Found Management
router.get('/lost-found', auth, authorize('admin', 'super_admin'), adminController.getAllLostFound);
router.put('/lost-found/:id', auth, authorize('admin', 'super_admin'), adminController.updateLostFound);
router.delete('/lost-found/:id', auth, authorize('admin', 'super_admin'), adminController.deleteLostFound);

// Emergency Contacts Management
router.get('/emergency', auth, authorize('admin', 'super_admin'), adminController.getAllEmergencyContacts);
router.post('/emergency', auth, authorize('admin', 'super_admin'), adminController.createEmergencyContact);
router.put('/emergency/:id', auth, authorize('admin', 'super_admin'), adminController.updateEmergencyContact);
router.delete('/emergency/:id', auth, authorize('admin', 'super_admin'), adminController.deleteEmergencyContact);

// Notifications Management
router.get('/notifications', auth, authorize('admin', 'super_admin'), adminController.getAllNotifications);
router.post('/notifications/broadcast', auth, authorize('admin', 'super_admin'), adminController.broadcastNotification);
router.delete('/notifications/:id', auth, authorize('admin', 'super_admin'), adminController.deleteNotification);

// System Configuration & Audit Logs (Super Admin Only)
router.get('/config', auth, authorize('super_admin'), adminController.getSystemConfig);
router.put('/config', auth, authorize('super_admin'), adminController.updateSystemConfig);
router.get('/audit-logs', auth, authorize('super_admin'), adminController.getAuditLogs);

module.exports = router;
