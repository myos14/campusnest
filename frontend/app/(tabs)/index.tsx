// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const [distanciaMax, setDistanciaMax] = useState(10); // Cambiado a 10 por defecto
  const [scrollY, setScrollY] = useState(0);
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

  const propiedadesFiltradas = propiedades.filter(p =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.colonia?.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        showFilters={true}
        scrollY={scrollY}
      />

      <FlatList
        data={propiedadesFiltradas}
        keyExtractor={(item) => item.id_propiedad}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Filtros rápidos horizontales */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>🛏️ Habitaciones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>🏠 Departamentos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>📶 WiFi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>🅿️ Estacionamiento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>🐾 Mascotas</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Banner de universidad (SIN EMOJI) */}
            {universidad && (
              <View style={styles.universidadBanner}>
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

            {/* Filtros de distancia (solo si hay universidad) */}
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
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No hay propiedades disponibles</Text>
            <Text style={styles.emptyText}>
              {universidad 
                ? `No hay propiedades cerca de ${universidad}` 
                : 'Intenta ajustar tu búsqueda'
              }
            </Text>
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
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  filtersContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterChip: {
    backgroundColor: Colors.neutral50,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral700,
  },
  universidadBanner: {
    backgroundColor: Colors.primary,
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    borderWidth: 1,
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
    fontWeight: '500',
  },
  distanceButtonTextActive: {
    color: Colors.white,
  },
  list: {
    padding: Spacing.xl,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.neutral400,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});