import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import api from '../../api/axios';

export default function ProviderDashboardScreen() {
  const [dashboardData, setDashboardData] = useState({ stats: { earnings: 0, active: 0, pending: 0, completedJobs: 0 }, services: [] });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, bookRes] = await Promise.all([
        api.get('/provider/dashboard'),
        api.get('/bookings/provider?limit=50')
      ]);
      setDashboardData(dashRes.data);
      setBookings(bookRes.data.data || []);
    } catch (err) {
      console.log('Failed to fetch provider data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#0ea5e9';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'rejected':
      case 'cancelled': return '#f43f5e';
      default: return '#64748b';
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.serviceType} Request</Text>
          <Chip textStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }} style={{ backgroundColor: getStatusColor(item.status), height: 24, paddingVertical: 0 }}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Customer</Text>
          <Text variant="bodySmall">{item.user?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Contact</Text>
          <Text variant="bodySmall">{item.user?.mobile}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Date</Text>
          <Text variant="bodySmall">{new Date(item.bookingDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Location</Text>
          <Text variant="bodySmall" style={{ maxWidth: '60%', textAlign: 'right' }}>{item.address}</Text>
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Text variant="bodySmall" style={{ color: '#059669', fontWeight: 'bold' }}>Total Value</Text>
          <Text variant="bodySmall" style={{ color: '#059669', fontWeight: 'bold' }}>₹{item.totalAmount}</Text>
        </View>
        {item.notes && (
          <View style={styles.notesBox}>
            <Text variant="bodySmall" style={{ fontStyle: 'italic' }}>"{item.notes}"</Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {item.status === 'pending' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button mode="outlined" textColor="#ef4444" style={{ borderColor: '#ef4444', flex: 1, marginRight: 5 }} onPress={() => handleStatusChange(item._id, 'rejected')}>Reject</Button>
            <Button mode="contained" buttonColor="#0284c7" style={{ flex: 1, marginLeft: 5 }} onPress={() => handleStatusChange(item._id, 'accepted')}>Accept</Button>
          </View>
        )}
        {item.status === 'accepted' && (item.serviceType === 'Tractor' || item.serviceType === 'JCB') && (
          <Button mode="contained" buttonColor="#0284c7" style={{ width: '100%', marginTop: 5 }} onPress={() => handleStatusChange(item._id, 'in_progress')}>Start Work</Button>
        )}
        {((item.status === 'accepted' && item.serviceType !== 'Tractor' && item.serviceType !== 'JCB') || item.status === 'in_progress') && (
          <Button mode="contained" buttonColor="#059669" style={{ width: '100%', marginTop: 5 }} onPress={() => handleStatusChange(item._id, 'completed')}>
            Mark Completed (Payment Collected)
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 20 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 10 }}>Overview</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <Card style={styles.statCard}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text variant="labelMedium" style={styles.label}>Earnings</Text>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#059669' }}>₹{dashboardData.stats.earnings}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text variant="labelMedium" style={styles.label}>Pending</Text>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#f59e0b' }}>{dashboardData.stats.pending}</Text>
                </Card.Content>
              </Card>
            </View>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Booking Requests</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={[styles.center, { marginTop: 40 }]}>
            <Text style={{ color: '#64748b' }}>No booking requests found.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, backgroundColor: '#fff' },
  statCard: { width: '48%', marginBottom: 10, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  label: { color: '#64748b', fontWeight: '500' },
  notesBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' }
});
