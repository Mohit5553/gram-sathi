import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      // Wait for backend to send OTP
      await api.post('/auth/login', { mobile });
      navigation.navigate('Otp', { mobile });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>GramSathi Mobile</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Enter mobile number to continue</Text>
      <TextInput
        label="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSendOtp} loading={loading} disabled={mobile.length < 10}>
        Send OTP
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10, color: '#0284c7' },
  subtitle: { textAlign: 'center', marginBottom: 30, color: 'gray' },
  input: { marginBottom: 20 }
});
