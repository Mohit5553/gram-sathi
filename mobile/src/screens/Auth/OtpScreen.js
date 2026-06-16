import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import api from '../../api/axios';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const dispatch = useDispatch();
  const { mobile } = route.params;

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/verify-otp', { mobile, otp });
      dispatch(loginSuccess(res.data));
    } catch (e) {
      alert(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Verification</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Enter the OTP sent to {mobile}</Text>
      <TextInput
        label="OTP Code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleVerifyOtp} loading={loading} disabled={otp.length < 4}>
        Verify & Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 30, color: 'gray' },
  input: { marginBottom: 20 }
});
