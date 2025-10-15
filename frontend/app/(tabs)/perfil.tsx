import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportesService, calificacionesService } from '../../services/api';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [reportesCount, setReportesCount] = useState(0);

  useEffect(() => {
    cargarEstadisticas();
    cargarReportesCount();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Stats del usuario
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarReportesCount = async () => {
    try {
      const reportes = await reportesService.misReportes();
      setReportesCount(reportes.length);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

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
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'heart-outline',
      label: 'Mis Favoritos',
      description: 'Propiedades guardadas',
      onPress: () => router.push('/(tabs)/favorites'),
      color: '#FF385C'
    },
    {
      icon: 'business-outline',
      label: 'Mis Propiedades',
      description: 'Gestiona tus publicaciones',
      onPress: () => router.push('/(tabs)/my-properties'),
      color: '#10b981'
    },
    {
      icon: 'star-outline',
      label: 'Mis Calificaciones',
      description: 'Ver tus reseñas',
      onPress: () => router.push('/(tabs)/ratings'),
      color: '#f59e0b'
    },
    {
      icon: 'flag-outline',
      label: 'Mis Reportes',
      description: `${reportesCount} reportes realizados`,
      onPress: () => router.push('/(tabs)/reports'),
      color: '#ef4444'
    },
    {
      icon: 'settings-outline',
      label: 'Configuración',
      description: 'Ajustes de la cuenta',
      onPress: () => router.push('/(tabs)/settings'),
      color: '#6b7280'
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header del perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.foto_perfil_url ? (
            <Image source={{ uri: user.foto_perfil_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          )}
          {user?.verificado && (
            <View style={styles.verificationBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
        
        <Text style={styles.name}>{user?.nombre_completo}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.userType}>
          <Text style={styles.userTypeText}>
            {user?.tipo_usuario === 'estudiante' ? '🎓 Estudiante' : 
             user?.tipo_usuario === 'arrendador' ? '🏠 Arrendador' : '👥 Ambos'}
          </Text>
        </View>
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Propiedades</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Calificaciones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reportesCount}</Text>
          <Text style={styles.statLabel}>Reportes</Text>
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={20} color="#fff" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  userType: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginTop: -10,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#e5e7eb',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});