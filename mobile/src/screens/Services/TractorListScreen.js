import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export default function TractorListScreen() {
  const navigation = useNavigation();
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTractors();
  }, []);

  const fetchTractors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tractors');
      setTractors(response.data);
    } catch (e) {
      alert('Failed to load tractors');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Card.Cover source={{ uri: item.images[0] }} style={{ height: 150 }} />
      )}
      <Card.Content style={{ marginTop: 10 }}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.brand} - {item.tractorType}</Text>
        <Text variant="bodyMedium" color="gray">📍 {item.village}, {item.district}</Text>
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <Text variant="titleMedium" style={{ color: '#16a34a', fontWeight: 'bold', flex: 1 }}>
            ₹{item.ratePerHour}/hr
          </Text>
          <Chip icon="star" compact>{item.rating?.toFixed(1) || 'New'}</Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('BookingForm', {
          serviceType: 'Tractor',
          providerId: item._id,
          providerName: item.owner?.name || 'Unknown',
          rate: item.ratePerHour
        })}>Book Now</Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0284c7" /></View>;
  }

  return (
    <FlatList
      data={tractors}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      style={{ backgroundColor: '#f1f5f9' }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>No tractors available right now.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, backgroundColor: '#fff', overflow: 'hidden' }
});
