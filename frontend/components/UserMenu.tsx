// components/UserMenu.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes } from '../constants/theme';

export default function UserMenu() {
  const [visible, setVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            setVisible(false);
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      label: 'Mensajes',
      onPress: () => {
        setVisible(false);
        router.push('/(tabs)/messages');
      },
      icon: '💬'
    },
    {
      label: 'Cuenta',
      onPress: () => {
        setVisible(false);
        router.push('/(tabs)/profile');
      },
      icon: '👤'
    },
    {
      label: 'Cerrar sesión',
      onPress: handleLogout,
      icon: '🚪',
      isDestructive: true
    }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.userIcon}>👤</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.userName}>
                {user?.nombre_completo || 'Usuario'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email}
              </Text>
            </View>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[
                  styles.menuText,
                  item.isDestructive && styles.destructiveText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  userButton: {
    padding: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.neutral100,
  },
  userIcon: {
    fontSize: FontSizes.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60, // Ajusta según la altura de tu navbar
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    minWidth: 200,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.neutral400,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: FontSizes.md,
    marginRight: Spacing.sm,
    width: 24,
  },
  menuText: {
    fontSize: FontSizes.md,
    color: Colors.neutral700,
    flex: 1,
  },
  destructiveText: {
    color: Colors.error,
  },
});