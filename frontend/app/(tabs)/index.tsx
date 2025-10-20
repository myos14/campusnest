// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { propiedadesService } from '../../services/api';
import type { Propiedad } from '../../types';
import PropertyCard from '../../components/PropertyCard';
import Header from '../../components/Header';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function HomeScreen() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [distanciaMax, setDistanciaMax] = useState(10);
  const [scrollY, setScrollY] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const universidad = params.universidad as string;

  useEffect(() => {
    cargarPropiedades();
  }, [distanciaMax]);

  async function cargarPropiedades() {
    try {
      const data = universidad 
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

  const handleScroll = (event: any) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const handleFilterPress = (filter: string) => {
    if (filter === 'mostrar_todos') {
      // Aquí puedes abrir un modal con todos los filtros
      console.log('Mostrar modal de filtros');
      return;
    }

    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      }
      return [...prev, filter];
    });
  };

  const propiedadesFiltradas = propiedades.filter(p => {
    // Filtro de búsqueda por texto
    const matchBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.colonia?.toLowerCase().includes(busqueda.toLowerCase());
    
    // Aquí puedes agregar lógica para filtrar por activeFilters
    // Por ejemplo:
    // if (activeFilters.includes('wifi') && !p.amenidades?.includes('wifi')) return false;
    
    return matchBusqueda;
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando propiedades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        scrollY={scrollY}
        onFilterPress={handleFilterPress}
        activeFilters={activeFilters}
      />

      <FlatList
        data={propiedadesFiltradas}
        keyExtractor={(item) => item.id_propiedad}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Banner de universidad - Solo si hay universidad seleccionada */}
            {universidad && (
              <View style={styles.universidadBanner}>
                <View style={styles.universidadIcon}>
                  <Ionicons name="school" size={24} color={Colors.white} />
                </View>
                <View style={styles.universidadTextContainer}>
                  <Text style={styles.universidadTitle}>
                    Propiedades cerca de {universidad}
                  </Text>
                  <Text style={styles.universidadSubtitle}>
                    Mostrando opciones a menos de {distanciaMax} km
                  </Text>
                </View>
              </View>
            )}

            {/* Filtros de distancia - Solo si hay universidad */}
            {universidad && (
              <View style={styles.distanceFilters}>
                <TouchableOpacity 
                  style={[styles.distanceButton, distanciaMax === 2 && styles.distanceButtonActive]}
                  onPress={() => setDistanciaMax(2)}
                >
                  <Text style={[styles.distanceButtonText, distanciaMax === 2 && styles.distanceButtonTextActive]}>
                    Muy cerca (&lt;2km)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.distanceButton, distanciaMax === 5 && styles.distanceButtonActive]}
                  onPress={() => setDistanciaMax(5)}
                >
                  <Text style={[styles.distanceButtonText, distanciaMax === 5 && styles.distanceButtonTextActive]}>
                    Cerca (&lt;5km)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.distanceButton, distanciaMax === 10 && styles.distanceButtonActive]}
                  onPress={() => setDistanciaMax(10)}
                >
                  <Text style={[styles.distanceButtonText, distanciaMax === 10 && styles.distanceButtonTextActive]}>
                    Lejos (&lt;10km)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Indicador de resultados */}
            <View style={styles.resultsIndicator}>
              <Text style={styles.resultsText}>
                {propiedadesFiltradas.length} {propiedadesFiltradas.length === 1 ? 'propiedad' : 'propiedades'}
              </Text>
              {activeFilters.length > 0 && (
                <TouchableOpacity onPress={() => setActiveFilters([])}>
                  <Text style={styles.clearFilters}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <PropertyCard
            propiedad={item}
            onPress={() => router.push(`/propiedad/${item.id_propiedad}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={Colors.neutral200} />
            <Text style={styles.emptyTitle}>No hay propiedades disponibles</Text>
            <Text style={styles.emptyText}>
              {universidad 
                ? `No hay propiedades cerca de ${universidad}` 
                : 'Intenta ajustar tu búsqueda o filtros'
              }
            </Text>
            {activeFilters.length > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => setActiveFilters([])}
              >
                <Text style={styles.clearFiltersButtonText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
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
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral400,
    fontSize: FontSizes.md,
  },
  universidadBanner: {
    backgroundColor: Colors.primary,
    margin: Spacing.xl,
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
  distanceFilters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
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
    paddingHorizontal: Spacing.xl,
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
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 24,
  },
  clearFiltersButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  clearFiltersButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});