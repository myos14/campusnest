import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // Detectar si es móvil
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const handleLogout = async () => {
    try {
      await logout();
      setShowMenu(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleMenuItemPress = (route: string) => {
    setShowMenu(false);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        {/* Logo */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.logoContainer}
        >
          <Text style={[styles.logo, isMobile && styles.logoMobile]}>Roomie</Text>
        </TouchableOpacity>

        {/* Derecha */}
        <View style={styles.rightSection}>
          {/* Botón Anfitrión - Adaptativo */}
          {isAuthenticated ? (
            <TouchableOpacity 
              style={[styles.hostButton, isMobile && styles.hostButtonMobile]}
              onPress={() => handleMenuItemPress('/profile/my-properties')}
            >
              <Text style={[styles.hostButtonText, isMobile && styles.hostButtonTextMobile]}>
                {isMobile ? 'Publicar' : isTablet ? 'Mi propiedad' : 'Publica tu propiedad'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.hostButton, isMobile && styles.hostButtonMobile]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={[styles.hostButtonText, isMobile && styles.hostButtonTextMobile]}>
                {isMobile ? 'Publicar' : 'Publicar propiedad'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Menú hamburguesa (móvil) o botón normal (desktop) */}
          {isMobile ? (
            <TouchableOpacity 
              style={styles.menuButtonMobile}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons 
                name={showMenu ? "close" : "menu"} 
                size={24} 
                color={Colors.neutral700} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="menu" size={18} color={Colors.neutral700} />
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color={Colors.neutral700} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dropdown Menu - Adaptativo */}
      {showMenu && (
        <>
          {/* Overlay para cerrar el menú al hacer click fuera */}
          <TouchableOpacity 
            style={styles.overlay}
            onPress={() => setShowMenu(false)}
            activeOpacity={1}
          />
          
          <View style={[
            styles.dropdown, 
            isMobile ? styles.dropdownMobile : styles.dropdownDesktop
          ]}>
            {isAuthenticated ? (
              <>
                {/* Header del menú - Solo en móvil */}
                {isMobile && user && (
                  <View style={styles.menuHeader}>
                    <View style={styles.menuAvatar}>
                      <Ionicons name="person" size={24} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuUserName} numberOfLines={1}>
                        {user.nombre_completo || 'Usuario'}
                      </Text>
                      <Text style={styles.menuUserEmail} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Enlaces de navegación - Solo en móvil */}
                {isMobile && (
                  <>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress('/(tabs)')}
                    >
                      <Ionicons name="home-outline" size={20} color={Colors.neutral700} />
                      <Text style={styles.menuItemText}>Inicio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress('/(tabs)/favorites')}
                    >
                      <Ionicons name="heart-outline" size={20} color={Colors.neutral700} />
                      <Text style={styles.menuItemText}>Favoritos</Text>
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />
                  </>
                )}

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/(tabs)/perfil')}
                >
                  <Ionicons name="person-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/(tabs)/messages')}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Mensajes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/profile/notifications')}
                >
                  <Ionicons name="notifications-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Notificaciones</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/profile/my-properties')}
                >
                  <Ionicons name="business-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Mis propiedades</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/profile/settings')}
                >
                  <Ionicons name="settings-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={[styles.menuItemText, { color: Colors.error }]}>
                    Cerrar sesión
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Menú no autenticado - Móvil */}
                {isMobile && (
                  <>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress('/(tabs)')}
                    >
                      <Ionicons name="home-outline" size={20} color={Colors.neutral700} />
                      <Text style={styles.menuItemText}>Inicio</Text>
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                  </>
                )}

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/(auth)/register')}
                >
                  <Ionicons name="person-add-outline" size={20} color={Colors.neutral700} />
                  <Text style={styles.menuItemText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress('/(auth)/login')}
                >
                  <Ionicons name="log-in-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.menuItemText, { color: Colors.primary, fontWeight: '600' }]}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerMobile: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  logoMobile: {
    fontSize: 20,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hostButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  hostButtonMobile: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  hostButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.neutral700,
  },
  hostButtonTextMobile: {
    fontSize: FontSizes.sm,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  menuButtonMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
      default: {
        position: 'absolute' as any,
      },
    }),
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    borderWidth: 1,
    borderColor: Colors.neutral100,
  },
  dropdownDesktop: {
    top: 70,
    right: Spacing.xl,
    minWidth: 240,
    maxWidth: 280,
  },
  dropdownMobile: {
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuUserName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  menuUserEmail: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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
  menuDivider: {
    height: 1,
    backgroundColor: Colors.neutral100,
    marginVertical: Spacing.sm,
  },
});