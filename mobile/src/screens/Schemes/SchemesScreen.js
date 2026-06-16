import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import api from '../../api/axios';

export default function SchemesScreen() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schemes');
      setSchemes(response.data);
    } catch (e) {
      alert('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#0284c7' }}>{item.title}</Text>
        <Text variant="bodySmall" style={{ color: 'gray', marginBottom: 10 }}>Department: {item.department}</Text>
        <Text variant="bodyMedium" numberOfLines={3}>{item.description}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="text" onPress={() => alert('Opening details...')}>Read More</Button>
        {item.applicationLink && (
          <Button mode="contained" onPress={() => alert(`Opening Link: ${item.applicationLink}`)}>Apply Now</Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0284c7" /></View>;
  }

  return (
    <FlatList
      data={schemes}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      style={{ backgroundColor: '#f1f5f9' }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, backgroundColor: '#fff' }
});
