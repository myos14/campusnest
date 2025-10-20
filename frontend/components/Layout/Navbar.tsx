import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants/theme';

interface NavbarProps {
  onMenuPress: () => void;
  scrollY?: number; // Pasar el scroll desde el componente padre
}

export default function Navbar({ onMenuPress, scrollY = 0 }: NavbarProps) {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Cambiar color basado en scroll
  const isScrolled = scrollY > 10;
  const navbarBg = isScrolled ? Colors.primary : Colors.white;
  const textColor = isScrolled ? Colors.white : Colors.primary;
  const iconColor = isScrolled ? Colors.white : Colors.primary;

  const handleLogout = async () => {
    setProfileMenuVisible(false);
    
    if (Platform.OS === 'web') {
      setLogoutConfirmVisible(true);
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar sesión', style: 'destructive', onPress: executeLogout }
        ]
      );
    }
  };

  const executeLogout = async () => {
    try {
      await logout();
      router.replace('/(onboarding)');
      setLogoutConfirmVisible(false);
    } catch (error) {
      setLogoutConfirmVisible(false);
    }
  };

  const handleLogoPress = () => {
    if (user) {
      router.push('/(tabs)');
    } else {
      router.replace('/(onboarding)');
    }
  };

  const menuItems = [
    {
      label: 'Mensajes',
      icon: 'chatbubble-outline' as const,
      onPress: () => {
        setProfileMenuVisible(false);
        router.push('/(tabs)/messages');
      }
    },
    {
      label: 'Cuenta',
      icon: 'person-outline' as const,
      onPress: () => {
        setProfileMenuVisible(false);
        router.push('/(tabs)/perfil');
      }
    },
    {
      label: 'Cerrar sesión',
      icon: 'log-out-outline' as const,
      onPress: handleLogout,
      isDestructive: true
    }
  ];

  return (
    <View style={[styles.navbar, { backgroundColor: navbarBg }]}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="menu" size={24} color={iconColor} />
        <Text style={[styles.menuText, { color: textColor }]}>Menú</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={handleLogoPress}>
          <Text style={[styles.logo, { color: textColor }]}>Roomie</Text>
        </TouchableOpacity>
      </View>

      {user ? (
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileMenuVisible(true)}
          >
            <Ionicons name="person-circle" size={32} color={iconColor} />
          </TouchableOpacity>

          <Modal
            visible={profileMenuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setProfileMenuVisible(false)}
          >
            <TouchableOpacity 
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setProfileMenuVisible(false)}
            >
              <View style={styles.menuContent}>
                <View style={styles.menuHeader}>
                  <Ionicons name="person-circle" size={40} color={Colors.primary} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.nombre_completo || 'Usuario'}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
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
                    <Ionicons 
                      name={item.icon} 
                      size={22} 
                      color={item.isDestructive ? Colors.error : Colors.neutral700} 
                    />
                    <Text style={[
                      styles.menuItemText,
                      item.isDestructive && styles.destructiveText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={logoutConfirmVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setLogoutConfirmVisible(false)}
          >
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Cerrar sesión</Text>
                <Text style={styles.confirmMessage}>
                  ¿Estás seguro de que quieres cerrar sesión?
                </Text>
                
                <View style={styles.confirmButtons}>
                  <TouchableOpacity 
                    style={[styles.confirmButton, styles.cancelButton]}
                    onPress={() => setLogoutConfirmVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.confirmButton, styles.logoutButton]}
                    onPress={executeLogout}
                  >
                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.authButtonText, { color: textColor }]}>Iniciar sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.registerButton]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.authButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 0,
    height: 65,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 6,
    minWidth: 80,
  },
  menuText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  logo: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  profileContainer: {
    position: 'relative',
    minWidth: 80,
    alignItems: 'flex-end',
  },
  profileButton: {
    padding: 4,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 80,
  },
  authButton: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  authButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: Colors.primary,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
  },
  menuContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    minWidth: 220,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    gap: Spacing.sm,
  },
  userInfo: {
    flex: 1,
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: FontSizes.md,
    color: Colors.neutral700,
    flex: 1,
  },
  destructiveText: {
    color: Colors.error,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  confirmBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },
  confirmMessage: {
    fontSize: FontSizes.md,
    color: Colors.neutral700,
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  confirmButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral100,
  },
  cancelButtonText: {
    color: Colors.neutral700,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});