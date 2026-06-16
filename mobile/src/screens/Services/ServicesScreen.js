import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ServicesScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>All Services</Text>
      
      <Card style={styles.card} onPress={() => navigation.navigate('Tractors')}>
        <List.Item
          title="Tractor Booking"
          description="Find and book local tractors for farming"
          left={props => <List.Icon {...props} icon="tractor" color="#0284c7" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>
      
      <Card style={styles.card} onPress={() => alert('Coming soon!')}>
        <List.Item
          title="JCB Booking"
          description="Heavy machinery for construction"
          left={props => <List.Icon {...props} icon="excavator" color="#ea580c" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>

      <Card style={styles.card} onPress={() => alert('Coming soon!')}>
        <List.Item
          title="Hire Labour"
          description="Find skilled and unskilled daily wage workers"
          left={props => <List.Icon {...props} icon="account-hard-hat" color="#16a34a" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>

      <Card style={styles.card} onPress={() => alert('Coming soon!')}>
        <List.Item
          title="Plumbers & Electricians"
          description="Local experts for urgent repairs"
          left={props => <List.Icon {...props} icon="wrench" color="#9333ea" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  title: { fontWeight: 'bold', marginBottom: 20 },
  card: { marginBottom: 10, backgroundColor: 'white' }
});
