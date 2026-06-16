import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import api from '../../api/axios';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BookingFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceType, providerId, providerName, rate } = route.params;

  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    durationHours: '1',
    address: '',
    notes: '',
    paymentMethod: 'Cash' // Default to Cash
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.bookingDate || !formData.durationHours || !formData.address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        serviceType,
        providerId,
        bookingDate: formData.bookingDate,
        durationHours: Number(formData.durationHours),
        address: formData.address,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod
      };

      await api.post('/bookings', payload);
      Alert.alert('Success', 'Booking request sent successfully!');
      navigation.navigate('Bookings');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = () => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: prev.paymentMethod === 'Cash' ? 'UPI Direct' : 'Cash'
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Book {serviceType}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 5, color: '#64748b' }}>Provider: {providerName}</Text>
          <Text variant="bodyMedium" style={{ color: '#059669', fontWeight: 'bold', marginTop: 2 }}>Rate: ₹{rate}</Text>
        </Card.Content>
      </Card>

      <View style={styles.formContainer}>
        <TextInput
          label="Date (YYYY-MM-DD) *"
          value={formData.bookingDate}
          onChangeText={(text) => setFormData({...formData, bookingDate: text})}
          mode="outlined"
          style={styles.input}
        />
        
        <TextInput
          label="Expected Duration (Hours) *"
          value={formData.durationHours}
          onChangeText={(text) => setFormData({...formData, durationHours: text})}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Work Address *"
          value={formData.address}
          onChangeText={(text) => setFormData({...formData, address: text})}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="Notes (Optional)"
          value={formData.notes}
          onChangeText={(text) => setFormData({...formData, notes: text})}
          mode="outlined"
          multiline
          numberOfLines={2}
          style={styles.input}
        />

        <View style={styles.paymentSection}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 10 }}>Payment Method (Pay Provider Directly)</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button 
              mode={formData.paymentMethod === 'Cash' ? 'contained' : 'outlined'} 
              onPress={() => setFormData({...formData, paymentMethod: 'Cash'})}
              style={{ flex: 1 }}
            >
              Cash
            </Button>
            <Button 
              mode={formData.paymentMethod === 'UPI Direct' ? 'contained' : 'outlined'} 
              onPress={() => setFormData({...formData, paymentMethod: 'UPI Direct'})}
              style={{ flex: 1 }}
            >
              UPI Direct
            </Button>
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 8 }}
        >
          Confirm Booking Request
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  card: { margin: 15, backgroundColor: '#fff' },
  formContainer: { paddingHorizontal: 15, paddingBottom: 30 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  paymentSection: { marginTop: 10, marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  submitBtn: { backgroundColor: '#0284c7' }
});
