import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Universidad {
  value: string;
  label: string;
  tipo: 'publica' | 'privada';
}

export default function OnboardingScreen() {
  const [universidad, setUniversidad] = useState('');
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universidadSeleccionada, setUniversidadSeleccionada] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  // Si el usuario está logueado, redirigir a tabs
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  // Buscar universidades mientras escribe
  useEffect(() => {
    if (universidad.length >= 2) {
      buscarUniversidades(universidad);
    } else {
      setUniversidades([]);
      setShowDropdown(false);
    }
  }, [universidad]);

  const buscarUniversidades = async (searchText: string) => {
    try {
      setLoading(true);
      const url = `${API_URL}/propiedades/universidades/buscar?q=${encodeURIComponent(searchText)}`;
      console.log('🔍 Buscando en:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        setUniversidades(data);
        setShowDropdown(data.length > 0);
      } else {
        console.error('❌ Error en respuesta:', response.status);
      }
    } catch (error) {
      console.error('❌ Error buscando universidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUniversidad = (uni: Universidad) => {
    setUniversidad(uni.label);
    setUniversidadSeleccionada(uni.value);
    setShowDropdown(false);
  };

  const handleBuscar = () => {
    if (universidad.trim() && universidadSeleccionada) {
      router.push({
        pathname: '/(tabs)',
        params: { universidad: universidadSeleccionada }
      });
    }
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ImageBackground 
        source={require('../../assets/ImageOnboarding.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Roomie</Text>
          <Text style={styles.subtitle}>Encuentra tu hogar cerca de tu universidad</Text>
          
          <View style={styles.searchBox}>
            <Text style={styles.label}>¿Cuál es tu universidad?</Text>
            
            <View style={{ position: 'relative', zIndex: 1000 }}>
              <TextInput
                style={styles.input}
                placeholder="ej. BUAP, UPAEP, USEP..."
                value={universidad}
                onChangeText={setUniversidad}
                placeholderTextColor={Colors.neutral400}
                onFocus={() => universidad.length >= 2 && setShowDropdown(true)}
              />
              
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={Colors.primary}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12
                  }}
                />
              )}

              {/* Dropdown de resultados */}
              {showDropdown && universidades.length > 0 && (
                <View style={styles.dropdown}>
                  <FlatList
                    data={universidades}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSelectUniversidad(item)}
                      >
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                        <Text style={styles.dropdownItemSiglas}>{item.value}</Text>
                      </TouchableOpacity>
                    )}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}

              {/* Sin resultados */}
              {showDropdown && universidad.length >= 2 && universidades.length === 0 && !loading && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No se encontraron universidades con "{universidad}"
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, !universidadSeleccionada && styles.buttonDisabled]}
              onPress={handleBuscar}
              disabled={!universidadSeleccionada}
            >
              <Text style={styles.buttonText}>Buscar ubicaciones</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta? 
              <Text 
                style={styles.link} 
                onPress={() => router.push('/(auth)/login')}
              >
                {' '}Iniciar sesión
              </Text>
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: StatusBar.currentHeight || 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.white,
    marginBottom: 40,
    textAlign: 'center',
  },
  searchBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.neutral700,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral100,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
  },
  // Nuevos estilos para el dropdown
  dropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
    marginBottom: Spacing.xl,
  },
  dropdownItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  dropdownItemText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral900,
    fontWeight: '500',
    marginBottom: 2,
  },
  dropdownItemSiglas: {
    fontSize: FontSizes.xs,
    color: Colors.neutral600,
  },
  noResults: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: Spacing.xl,
  },
  noResultsText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral600,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral100,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
  },
  footerText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
  },
});