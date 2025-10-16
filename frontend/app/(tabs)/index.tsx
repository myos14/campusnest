import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const universidad = params.universidad as string;

  useEffect(() => {
    cargarPropiedades();
  }, []);

  async function cargarPropiedades() {
    try {
      const data = await propiedadesService.obtenerPropiedades({
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

  const propiedadesFiltradas = propiedades.filter(p =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.colonia?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        showFilters={true}
      />

      {universidad && (
        <View style={styles.universidadContainer}>
          <Ionicons name="school-outline" size={20} color={Colors.primary} />
          <Text style={styles.universidadText}>
            Propiedades cerca de {universidad}
          </Text>
        </View>
      )}

      <FlatList
        data={propiedadesFiltradas}
        keyExtractor={(item) => item.id_propiedad}
        renderItem={({ item }) => (
          <PropertyCard
            propiedad={item}
            onPress={() => router.push(`/propiedad/${item.id_propiedad}`)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          !universidad && styles.listWithoutUniversidad
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={64} color={Colors.neutral100} />
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
  universidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral50,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  universidadText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  list: {
    padding: Spacing.xl,
  },
  listWithoutUniversidad: {
    paddingTop: 0,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.neutral400,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});