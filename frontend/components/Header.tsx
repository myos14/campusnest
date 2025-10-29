import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';

interface HeaderProps {
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
}

export default function Header({ onLoginPress, onRegisterPress }: HeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    setMenuVisible(false);
    if (onLoginPress) {
      onLoginPress();
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleRegister = () => {
    setMenuVisible(false);
    if (onRegisterPress) {
      onRegisterPress();
    } else {
      router.push('/(auth)/register');
    }
  };

  const handleBecomeHost = () => {
    setMenuVisible(false);
    if (isAuthenticated) {
      router.push('/(tabs)/my-properties');
    } else {
      handleLogin();
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.header}>
      {/* Logo */}
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.logo}>Roomie</Text>
      </TouchableOpacity>

      {/* Tabs de categorías (centro) - Opcional para versión 2 */}
      <View style={styles.centerTabs}>
        <TouchableOpacity style={styles.tab}>
          <Text style={[styles.tabText, styles.tabActive]}>Alojamientos</Text>
        </TouchableOpacity>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {/* Botón "Conviértete en anfitrión" */}
        <TouchableOpacity 
          style={styles.becomeHostButton}
          onPress={handleBecomeHost}
        >
          <Text style={styles.becomeHostText}>Conviértete en anfitrión</Text>
        </TouchableOpacity>

        {/* Botón de menú (hamburguesa + avatar) */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={Colors.neutral700} />
          {isAuthenticated && user?.nombre_completo ? (
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarText}>
                {user.nombre_completo.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <Ionicons name="person-circle-outline" size={28} color={Colors.neutral500} />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal del menú desplegable */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            {isAuthenticated ? (
              // Menú para usuarios autenticados
              <>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)/perfil');
                  }}
                >
                  <Ionicons name="person-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)/favorites');
                  }}
                >
                  <Ionicons name="heart-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Favoritos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)/messages');
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Mensajes</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleBecomeHost}
                >
                  <Ionicons name="home-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Mis propiedades</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={[styles.menuItemText, { color: Colors.error }]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Menú para usuarios no autenticados
              <>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogin}
                >
                  <Text style={[styles.menuItemText, styles.menuItemBold]}>Iniciar sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleRegister}
                >
                  <Text style={styles.menuItemText}>Registrarse</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleBecomeHost}
                >
                  <Text style={styles.menuItemText}>Conviértete en anfitrión</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.menuItemText}>Centro de ayuda</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  centerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tabText: {
    fontSize: FontSizes.md,
    color: Colors.neutral500,
    fontWeight: '500',
  },
  tabActive: {
    color: Colors.neutral900,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  becomeHostButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  becomeHostText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: Spacing.xl,
  },
  menuDropdown: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    minWidth: 240,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemText: {
    fontSize: FontSizes.md,
    color: Colors.neutral700,
  },
  menuItemBold: {
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.neutral100,
    marginVertical: Spacing.xs,
  },
});