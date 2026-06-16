import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { user } = useSelector(state => state.auth);
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge">Welcome back,</Text>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#0284c7' }}>
          {user?.name || user?.mobile}
        </Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Quick Actions</Text>
          <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-around' }}>
            <Button mode="contained-tonal" icon="tractor" onPress={() => navigation.navigate('Services')}>
              Book Tractor
            </Button>
            <Button mode="contained-tonal" icon="file-document" onPress={() => navigation.navigate('Schemes')}>
              Schemes
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: '#fee2e2' }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: '#b91c1c' }}>Emergency Contacts</Text>
          <Text variant="bodyMedium" style={{ marginTop: 10 }}>Police: 100</Text>
          <Text variant="bodyMedium">Ambulance: 108</Text>
          <Text variant="bodyMedium">Fire: 101</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  header: { marginBottom: 20, marginTop: 10 },
  card: { marginBottom: 15 }
});
