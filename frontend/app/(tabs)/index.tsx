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
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    checkUniversitySelection();
  }, []);

  useEffect(() => {
    cargarPropiedades();
  }, [selectedUniversity]);

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
            distancia_max: 15,
            limit: 50,
          })
        : await propiedadesService.obtenerPropiedades({
            disponible: true,
            limit: 50,
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

  const handleUniversitySelect = async (universityId: string) => {
    try {
      const savedName = await AsyncStorage.getItem('selected_university_name');
      setSelectedUniversity(universityId);
      setUniversityName(savedName);
      setShowUniversityModal(false);
      setLoading(true);
      await cargarPropiedades();
    } catch (error) {
      console.error('Error al seleccionar universidad:', error);
    }
  };

  const handleUniversitySkip = () => {
    setShowUniversityModal(false);
  };

  // Filtrar propiedades (sin ordenamiento por ahora)
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

  // Handler para navegar a resultados
  const handleSearchSubmit = () => {
    if (searchValue.trim() || selectedUniversity) {
      // TODO: Navegar a página de resultados
      console.log('Navegar a resultados con:', { searchValue, selectedUniversity });
      // router.push(`/search?q=${searchValue}&university=${selectedUniversity}`);
    }
  };

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
      
      {/* SEARCHBAR SIMPLE (sin filtros) */}
      <SearchBar
        universityName={universityName}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onUniversityPress={() => setShowUniversityModal(true)}
        onSearchSubmit={handleSearchSubmit}
        placeholder="Buscar colonia, ciudad..."
      />

      {/* Lista de propiedades */}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="home-outline" size={48} color={Colors.neutral300} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchValue ? 'Sin resultados' : 'No hay propiedades'}
            </Text>
            <Text style={styles.emptyText}>
              {searchValue 
                ? `No encontramos propiedades con "${searchValue}"`
                : selectedUniversity 
                  ? `No hay propiedades disponibles cerca de tu universidad` 
                  : 'Selecciona tu universidad para comenzar'
              }
            </Text>
            {!selectedUniversity && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowUniversityModal(true)}
              >
                <Text style={styles.emptyButtonText}>Seleccionar universidad</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

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
    backgroundColor: Colors.white,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral400,
    fontSize: FontSizes.sm,
  },
  
  // LISTA
  list: {
    paddingBottom: Spacing.xxl * 2,
  },
  
  // EMPTY STATE
  emptyState: {
    paddingVertical: Spacing.xxl * 3,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});