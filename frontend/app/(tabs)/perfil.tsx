// app/(tabs)/perfil.tsx - VERSIÓN CORREGIDA SIN PLACEHOLDERS
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CustomInput } from '../../components/FormElements';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://campusnest-api.onrender.com';

export default function PerfilScreen() {
  const { user, token, logout } = useAuth();
  
  // Estados para los campos editables
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [activeSection, setActiveSection] = useState('cuenta');

  // Cargar datos del usuario al abrir la pantalla
  useEffect(() => {
    if (user) {
      cargarDatosUsuario();
    }
  }, [user]);

  const cargarDatosUsuario = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      
      setNombreCompleto(userData.nombre_completo || '');
      setTelefono(userData.telefono || '');
      
      // Datos de perfil estudiante
      if (userData.perfil_estudiante) {
        setUniversidad(userData.perfil_estudiante.universidad || '');
        setCarrera(userData.perfil_estudiante.carrera || '');
        setSemestre(userData.perfil_estudiante.semestre?.toString() || '');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarDatosBasicos = async () => {
    setGuardando(true);
    try {
      await axios.put(
        `${API_URL}/usuarios/me`,
        {
          nombre_completo: nombreCompleto,
          telefono: telefono || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      Alert.alert('Éxito', 'Datos básicos actualizados correctamente');
    } catch (error: any) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarPerfilEstudiante = async () => {
    setGuardando(true);
    try {
      await axios.put(
        `${API_URL}/usuarios/me/perfil-estudiante`,
        {
          universidad: universidad || null,
          carrera: carrera || null,
          semestre: semestre ? parseInt(semestre) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      Alert.alert('Éxito', 'Perfil de estudiante actualizado correctamente');
    } catch (error: any) {
      console.error('Error al guardar perfil estudiante:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo guardar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const obtenerIniciales = () => {
    if (!nombreCompleto) return 'U';
    const partes = nombreCompleto.split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return nombreCompleto.substring(0, 2).toUpperCase();
  };

  const renderSeccionCuenta = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionSubtitle}>
        Tu cuenta de Roomie estará asociada a estas credenciales.
      </Text>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Nombre completo *</Text>
        <Text style={styles.helperText}>Ingresa tu nombre completo</Text>
        <CustomInput 
          value={nombreCompleto}
          onChangeText={setNombreCompleto}
          placeholder=""
          editable={!guardando}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Email *</Text>
        <CustomInput 
          value={user?.email || ''}
          editable={false}
          placeholder=""
        />
        <Text style={styles.emailNote}>El email no se puede modificar</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Teléfono</Text>
        <Text style={styles.helperText}>Número a 10 dígitos</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.prefijoContainer}>
            <Text style={styles.prefijoText}>+52</Text>
          </View>
          <View style={styles.phoneInput}>
            <CustomInput 
              value={telefono}
              onChangeText={setTelefono}
              placeholder=""
              keyboardType="phone-pad"
              editable={!guardando}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, guardando && styles.saveButtonDisabled]}
        onPress={handleGuardarDatosBasicos}
        disabled={guardando}
      >
        <Text style={styles.saveButtonText}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeccionGeneral = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionSubtitle}>
        Información adicional para mejorar tu experiencia en Roomie.
      </Text>

      {(user?.tipo_usuario === 'estudiante' || user?.tipo_usuario === 'ambos') && (
        <View style={styles.studentProfileSection}>
          <Text style={styles.sectionTitle}>Perfil de Estudiante</Text>
          
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Universidad</Text>
            <Text style={styles.helperText}>ej. BUAP, UNAM, IPN...</Text>
            <CustomInput 
              value={universidad}
              onChangeText={setUniversidad}
              placeholder=""
              editable={!guardando}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Carrera</Text>
            <Text style={styles.helperText}>ej. Ingeniería en Computación</Text>
            <CustomInput 
              value={carrera}
              onChangeText={setCarrera}
              placeholder=""
              editable={!guardando}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Semestre</Text>
            <Text style={styles.helperText}>ej. 5</Text>
            <CustomInput 
              value={semestre}
              onChangeText={setSemestre}
              placeholder=""
              keyboardType="numeric"
              editable={!guardando}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, guardando && styles.saveButtonDisabled]}
            onPress={handleGuardarPerfilEstudiante}
            disabled={guardando}
          >
            <Text style={styles.saveButtonText}>
              {guardando ? 'Guardando...' : 'Guardar perfil estudiante'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Cerrar sesión',
              '¿Estás seguro de que quieres cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Cerrar sesión', 
                  style: 'destructive',
                  onPress: () => logout()
                }
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSeccionRentas = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionSubtitle}>
        Gestiona tus propiedades en renta y tu historial.
      </Text>
      
      <View style={styles.rentasStats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Propiedades activas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>En renta actualmente</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Historial total</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Publicar nueva propiedad</Text>
      </TouchableOpacity>

      <View style={styles.emptyRentas}>
        <Ionicons name="business-outline" size={64} color={Colors.neutral300} />
        <Text style={styles.emptyTitle}>No tienes propiedades en renta</Text>
        <Text style={styles.emptySubtitle}>
          Comienza publicando tu primera propiedad para llegar a más estudiantes.
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con foto y nombre */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{obtenerIniciales()}</Text>
            </View>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              <Text style={styles.editPhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{nombreCompleto || 'Usuario'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.tipo_usuario === 'estudiante' ? 'Estudiante' : 
                 user?.tipo_usuario === 'arrendador' ? 'Arrendador' : 'Estudiante y Arrendador'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navegación por pestañas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'cuenta' && styles.activeTab]}
          onPress={() => setActiveSection('cuenta')}
        >
          <Text style={[styles.tabText, activeSection === 'cuenta' && styles.activeTabText]}>
            Cuenta
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'general' && styles.activeTab]}
          onPress={() => setActiveSection('general')}
        >
          <Text style={[styles.tabText, activeSection === 'general' && styles.activeTabText]}>
            General
          </Text>
        </TouchableOpacity>
        
        {(user?.tipo_usuario === 'arrendador' || user?.tipo_usuario === 'ambos') && (
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'rentas' && styles.activeTab]}
            onPress={() => setActiveSection('rentas')}
          >
            <Text style={[styles.tabText, activeSection === 'rentas' && styles.activeTabText]}>
              Rentas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido de la sección activa */}
      <ScrollView style={styles.content}>
        {activeSection === 'cuenta' && renderSeccionCuenta()}
        {activeSection === 'general' && renderSeccionGeneral()}
        {activeSection === 'rentas' && renderSeccionRentas()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  profileHeader: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
  },
  editPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  editPhotoText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.md,
    color: Colors.neutral600,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    backgroundColor: Colors.neutral100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.neutral600,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.neutral900,
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.neutral600,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  studentProfileSection: {
    marginBottom: Spacing.xxl,
  },
  configSection: {
    marginTop: Spacing.xl,
  },
  formLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neutral800,
    marginBottom: Spacing.xs,
  },
  helperText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral500,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  emailNote: {
    fontSize: FontSizes.sm,
    color: Colors.neutral500,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  prefijoContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  prefijoText: {
    fontSize: FontSizes.md,
    color: Colors.neutral700,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.neutral300,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  logoutButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  rentasStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral50,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.neutral600,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  emptyRentas: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.neutral700,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 22,
  },
});