import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();

  const menuItems = [
    { label: 'Inicio', icon: 'home-outline', route: '/(tabs)' },
    { label: 'Favoritos', icon: 'heart-outline', route: '/(tabs)/favorites' },
    { label: 'Mis Propiedades', icon: 'business-outline', route: '/(tabs)/my-properties' },
    { label: 'Calificaciones', icon: 'star-outline', route: '/(tabs)/ratings' },
    { label: 'Reportes', icon: 'flag-outline', route: '/(tabs)/reports' },
    { label: 'Configuración', icon: 'settings-outline', route: '/(tabs)/settings' },
  ];

  const navigateTo = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.sidebarOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>CampusNest</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          <View style={styles.sidebarContent}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => navigateTo(item.route)}
              >
                <Ionicons name={item.icon as any} size={22} color="#374151" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sidebarFooter}>
            <Text style={styles.userInfo}>
              {user?.nombre_completo}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  userInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});