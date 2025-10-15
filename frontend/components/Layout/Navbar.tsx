import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface NavbarProps {
  onMenuPress: () => void;
}

export default function Navbar({ onMenuPress }: NavbarProps) {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.navbar}>
      {/* Boton de menú */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={onMenuPress}
      >
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.menuText}>Menú</Text>
      </TouchableOpacity>

      {/* Logo */}
      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Text style={styles.logo}>Roomie</Text>
      </TouchableOpacity>
      
      {/* Profile Dropdown */}
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => setProfileMenuVisible(true)}
      >
        <Ionicons name="person-circle" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Profile Menu Modal */}
      <Modal
        visible={profileMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.profileOverlay}
          activeOpacity={1}
          onPress={() => setProfileMenuVisible(false)}
        >
          <View style={styles.profileMenu}>
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push('/(tabs)/perfil');
              }}
            >
              <Ionicons name="person-outline" size={20} color="#374151" />
              <Text style={styles.profileMenuText}>Ver perfil</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={[styles.profileMenuText, styles.logoutText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,     
    paddingBottom: 12,
    backgroundColor: '#FF385C',
    borderBottomWidth: 0,
    height: 65,
    position: 'relative',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    position: 'absolute',
    left: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    padding: 4,
    position: 'absolute',
    right: 20,
  },
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  profileMenuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutText: {
    color: '#dc2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
}); 