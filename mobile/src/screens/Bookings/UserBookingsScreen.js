import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import api from '../../api/axios';
import { useSelector } from 'react-redux';

export default function UserBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings?limit=50`);
      setBookings(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b'; // amber
      case 'accepted': return '#0ea5e9'; // sky
      case 'in_progress': return '#3b82f6'; // blue
      case 'completed': return '#10b981'; // emerald
      case 'rejected':
      case 'cancelled': return '#f43f5e'; // rose
      default: return '#64748b'; // slate
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {item.serviceType} Booking
          </Text>
          <Chip 
            textStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }} 
            style={{ backgroundColor: getStatusColor(item.status), height: 24, paddingVertical: 0 }}
          >
            {item.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Date</Text>
          <Text variant="bodySmall">{new Date(item.bookingDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Amount</Text>
          <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>₹{item.totalAmount}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" style={styles.label}>Payment Method</Text>
          <Text variant="bodySmall">{item.paymentMethod || 'Cash'}</Text>
        </View>

        {(item.status === 'accepted' || item.status === 'in_progress' || item.status === 'completed') && item.providerContact && (
          <View style={styles.contactBox}>
            <Text variant="labelMedium" style={{ color: '#0369a1', fontWeight: 'bold', marginBottom: 4 }}>Provider Contact Details</Text>
            <View style={styles.row}>
              <Text variant="bodySmall" style={{ color: '#075985' }}>Name:</Text>
              <Text variant="bodySmall" style={{ color: '#075985', fontWeight: 'bold' }}>{item.providerName}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodySmall" style={{ color: '#075985' }}>Phone:</Text>
              <Text variant="bodySmall" style={{ color: '#075985', fontWeight: 'bold' }}>{item.providerContact}</Text>
            </View>
            {item.status !== 'completed' && (
              <Text variant="bodySmall" style={styles.payText}>
                Please pay ₹{item.totalAmount} directly to the provider via {item.paymentMethod || 'Cash'}.
              </Text>
            )}
          </View>
        )}

      </Card.Content>
      {(item.status === 'pending' || item.status === 'accepted') && (
        <Card.Actions>
          <Button mode="outlined" textColor="#ef4444" style={{ borderColor: '#ef4444' }} onPress={() => handleCancel(item._id)}>
            Cancel Booking
          </Button>
        </Card.Actions>
      )}
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
      {error ? (
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>{error}</Text>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: '#64748b' }}>You have no bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  label: { color: '#64748b', fontWeight: '500' },
  contactBox: { backgroundColor: '#e0f2fe', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#bae6fd' },
  payText: { fontSize: 10, color: '#0284c7', marginTop: 6, backgroundColor: '#fff', padding: 4, borderRadius: 4, textAlign: 'center' }
});
