import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

export default function ProfileScreen() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.name ? user.name.substring(0,2).toUpperCase() : 'U'} style={{ backgroundColor: '#0284c7' }} />
        <Text variant="headlineSmall" style={{ marginTop: 10, fontWeight: 'bold' }}>{user?.name || 'GramSathi User'}</Text>
        <Text variant="bodyMedium" color="gray">+91 {user?.mobile}</Text>
      </View>
      
      <List.Section style={styles.section}>
        <List.Subheader>Account Management</List.Subheader>
        <List.Item title="Edit Profile" left={() => <List.Icon icon="account-edit" />} onPress={() => {}} />
        <Divider />
        <List.Item title="My Bookings" left={() => <List.Icon icon="history" />} onPress={() => {}} />
        <Divider />
        <List.Item title="Notification Preferences" left={() => <List.Icon icon="bell" />} onPress={() => {}} />
      </List.Section>

      <Button mode="outlined" color="error" onPress={handleLogout} style={styles.logoutBtn} icon="logout">
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#fff', marginBottom: 15 },
  section: { backgroundColor: '#fff' },
  logoutBtn: { margin: 20, borderColor: '#ef4444' }
});
