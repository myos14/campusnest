import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propiedadesService } from '../../services/api';
import type { Propiedad } from '../../types';
import PropertyCard from '../../components/PropertyCard';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import UniversityModal from '../../components/UniversityModal';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function HomeScreen() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [distanciaMax, setDistanciaMax] = useState(10);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string | null>(null);
  
  const router = useRouter();

  // Cargar universidad guardada y mostrar modal si es necesario
  useEffect(() => {
    checkUniversitySelection();
  }, []);

  // Cargar propiedades cuando cambia la universidad o distancia
  useEffect(() => {
    cargarPropiedades();
  }, [distanciaMax, selectedUniversity]);

  const checkUniversitySelection = async () => {
    try {
      const savedUniversity = await AsyncStorage.getItem('selected_university');
      const savedUniversityName = await AsyncStorage.getItem('selected_university_name');
      const modalShown = await AsyncStorage.getItem('university_modal_shown');
      
      if (savedUniversity) {
        setSelectedUniversity(savedUniversity);
        setUniversityName(savedUniversityName);
      } else if (!modalShown) {
        setShowUniversityModal(true);
      }
    } catch (error) {
      console.error('Error cargando universidad:', error);
    }
  };

  async function cargarPropiedades() {
    try {
      const data = selectedUniversity 
        ? await propiedadesService.obtenerPropiedadesCercanas({
            distancia_max: distanciaMax,
            limit: 20,
          })
        : await propiedadesService.obtenerPropiedades({
            disponible: true,
            limit: 20,
          });
      
      setPropiedades(data);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await cargarPropiedades();
  }

  const handleFilterPress = () => {
    console.log('Abrir modal de filtros');
  };

  const handleUniversitySelect = (universityId: string) => {
    setSelectedUniversity(universityId);
    setShowUniversityModal(false);
    // Recargar propiedades con la nueva universidad
    cargarPropiedades();
  };

  const handleUniversitySkip = () => {
    setShowUniversityModal(false);
  };

  const propiedadesFiltradas = propiedades.filter(p => {
    if (!searchValue.trim()) return true;
    const searchLower = searchValue.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(searchLower) ||
      p.ciudad.toLowerCase().includes(searchLower) ||
      p.colonia?.toLowerCase().includes(searchLower) ||
      p.direccion_completa.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando propiedades...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onFilterPress={handleFilterPress}
        placeholder="Buscar por ciudad, colonia o título..."
      />

      <FlatList
        data={propiedadesFiltradas}
        keyExtractor={(item) => item.id_propiedad}
        renderItem={({ item }) => (
          <PropertyCard
            propiedad={item}
            onPress={() => router.push(`/propiedad/${item.id_propiedad}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {selectedUniversity && universityName && (
              <View style={styles.universidadBanner}>
                <View style={styles.universidadIcon}>
                  <Ionicons name="school" size={24} color={Colors.white} />
                </View>
                <View style={styles.universidadTextContainer}>
                  <Text style={styles.universidadTitle}>
                    Propiedades cerca de {universityName}
                  </Text>
                  <Text style={styles.universidadSubtitle}>
                    Mostrando opciones a menos de {distanciaMax} km
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => setShowUniversityModal(true)}
                >
                  <Ionicons name="pencil" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}

            {selectedUniversity && (
              <View style={styles.distanceFilters}>
                <TouchableOpacity 
                  style={[
                    styles.distanceButton, 
                    distanciaMax === 2 && styles.distanceButtonActive
                  ]}
                  onPress={() => setDistanciaMax(2)}
                >
                  <Text style={[
                    styles.distanceButtonText, 
                    distanciaMax === 2 && styles.distanceButtonTextActive
                  ]}>
                    Muy cerca (&lt;2km)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.distanceButton, 
                    distanciaMax === 5 && styles.distanceButtonActive
                  ]}
                  onPress={() => setDistanciaMax(5)}
                >
                  <Text style={[
                    styles.distanceButtonText, 
                    distanciaMax === 5 && styles.distanceButtonTextActive
                  ]}>
                    Cerca (&lt;5km)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.distanceButton, 
                    distanciaMax === 10 && styles.distanceButtonActive
                  ]}
                  onPress={() => setDistanciaMax(10)}
                >
                  <Text style={[
                    styles.distanceButtonText, 
                    distanciaMax === 10 && styles.distanceButtonTextActive
                  ]}>
                    Lejos (&lt;10km)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.resultsIndicator}>
              <Text style={styles.resultsText}>
                {propiedadesFiltradas.length} {propiedadesFiltradas.length === 1 ? 'propiedad' : 'propiedades'}
                {searchValue && ' encontradas'}
              </Text>
              {searchValue && (
                <TouchableOpacity onPress={() => setSearchValue('')}>
                  <Text style={styles.clearFilters}>Limpiar búsqueda</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={Colors.neutral200} />
            <Text style={styles.emptyTitle}>
              {searchValue ? 'No se encontraron resultados' : 'No hay propiedades disponibles'}
            </Text>
            <Text style={styles.emptyText}>
              {searchValue 
                ? `No hay propiedades que coincidan con "${searchValue}"`
                : selectedUniversity 
                  ? `No hay propiedades cerca de tu universidad` 
                  : 'Selecciona tu universidad para ver propiedades cercanas'
              }
            </Text>
            {searchValue && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => setSearchValue('')}
              >
                <Text style={styles.clearFiltersButtonText}>Limpiar búsqueda</Text>
              </TouchableOpacity>
            )}
            {!selectedUniversity && (
              <TouchableOpacity 
                style={styles.selectUniversityButton}
                onPress={() => setShowUniversityModal(true)}
              >
                <Text style={styles.selectUniversityButtonText}>Seleccionar universidad</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Modal de selección de universidad */}
      <UniversityModal
        visible={showUniversityModal}
        onSelectUniversity={handleUniversitySelect}
        onSkip={handleUniversitySkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral400,
    fontSize: FontSizes.md,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  universidadBanner: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  universidadIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  universidadTextContainer: {
    flex: 1,
  },
  universidadTitle: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  universidadSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FontSizes.sm,
  },
  changeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  distanceFilters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  distanceButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  distanceButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  distanceButtonText: {
    color: Colors.neutral700,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  distanceButtonTextActive: {
    color: Colors.white,
  },
  resultsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultsText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  clearFilters: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    padding: Spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  clearFiltersButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  clearFiltersButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  selectUniversityButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  selectUniversityButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});