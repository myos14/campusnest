// components/Layout/Navbar.tsx - VERSIÓN CON MENÚ DE PERFIL
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants/theme';

interface NavbarProps {
  onMenuPress: () => void;
}

export default function Navbar({ onMenuPress }: NavbarProps) {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname.includes('/login') || pathname === '/login';
  const isRegisterPage = pathname.includes('/register') || pathname === '/register';

  const handleLogout = () => {
    setProfileMenuVisible(false); // Cierra el modal
    
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: async () => {
            console.log('Iniciando logout...');
            await logout(); // Esto limpia user y token
            console.log('Redirigiendo a onboarding...');
            router.replace('/(onboarding)'); // Esto cambia la pantalla
          }
        }
      ]
    );
  };

  const handleLogoPress = () => {
    router.replace('/(onboarding)');
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
    <View style={styles.navbar}>
      {/* Botón Menú - Parte izquierda */}
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="menu" size={24} color={Colors.white} />
        <Text style={styles.menuText}>Menú</Text>
      </TouchableOpacity>

      {/* Logo - CENTRADO */}
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={handleLogoPress}>
          <Text style={styles.logo}>Roomie</Text>
        </TouchableOpacity>
      </View>

      {/* Perfil o Login - Parte derecha */}
      {user ? (
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileMenuVisible(true)}
          >
            <Ionicons name="person-circle" size={32} color={Colors.white} />
          </TouchableOpacity>

          {/* Menú desplegable del perfil */}
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
                {/* Header con info del usuario */}
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

                {/* Items del menú */}
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
        </View>
      ) : (
        <View style={styles.authButtons}>
          {/* Botón Login */}
          <TouchableOpacity 
            style={[
              styles.authButton,
              isLoginPage && styles.activeAuthButton
            ]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[
              styles.authButtonText,
              isLoginPage && styles.activeAuthButtonText
            ]}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
          
          {/* Botón Register */}
          <TouchableOpacity 
            style={[
              styles.authButton,
              styles.registerButton,
              isRegisterPage && styles.activeAuthButton
            ]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={[
              styles.authButtonText,
              isRegisterPage && styles.activeAuthButtonText
            ]}>
              Registrarse
            </Text>
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
    backgroundColor: Colors.primary,
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
    color: Colors.white,
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
    color: Colors.white,
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
    color: Colors.white,
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeAuthButton: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  activeAuthButtonText: {
    fontWeight: 'bold',
    color: Colors.white,
  },
  // Estilos del menú desplegable
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80, // Ajusta según la altura de tu navbar
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
  },
  menuContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    minWidth: 220,
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
});