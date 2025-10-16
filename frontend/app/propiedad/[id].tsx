// ===========================================
// app/propiedad/[id].tsx - DETALLE COMPLETO
// ===========================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { propiedadesService, calificacionesService, favoritosService } from '../../services/api';
import type { Propiedad, EstadisticasPropiedad } from '../../types';

const { width } = Dimensions.get('window');

export default function PropiedadDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPropiedad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorito, setIsFavorito] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    try {
      const [propData, statsData] = await Promise.all([
        propiedadesService.obtenerPropiedad(id),
        calificacionesService.obtenerEstadisticasPropiedad(id).catch(() => null),
      ]);
      setPropiedad(propData);
      setEstadisticas(statsData);

      const favStatus = await favoritosService.esFavorito(id).catch(() => false);
      setIsFavorito(favStatus);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorito() {
    try {
      if (isFavorito) {
        await favoritosService.eliminarFavorito(id);
      } else {
        await favoritosService.agregarFavorito(id);
      }
      setIsFavorito(!isFavorito);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E3F66" />
      </View>
    );
  }

  if (!propiedad) {
    return (
      <View style={styles.error}>
        <Text>No se encontró la propiedad</Text>
      </View>
    );
  }

  const fotos = propiedad.fotos || [];
  const fotoPrincipal = fotos.find(f => f.es_principal)?.url_foto || fotos[0]?.url_foto || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: fotoPrincipal }} style={styles.mainImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorito}>
          <Ionicons name={isFavorito ? "heart" : "heart-outline"} size={24} color={isFavorito ? "#1E3F66" : "#111"} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{propiedad.titulo}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text style={styles.location}>{propiedad.colonia}, {propiedad.ciudad}</Text>
            </View>
          </View>
          {estadisticas && estadisticas.total_calificaciones > 0 && (
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#1E3F66" />
              <Text style={styles.ratingText}>{estadisticas.promedio_general.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({estadisticas.total_calificaciones})</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <Text style={styles.price}>
          ${propiedad.precio_mensual.toLocaleString()} <Text style={styles.pricePeriod}>/ mes</Text>
        </Text>

        {propiedad.deposito_requerido && (
          <Text style={styles.deposit}>Depósito: ${propiedad.deposito_requerido.toLocaleString()}</Text>
        )}

        <View style={styles.divider} />

        {propiedad.descripcion && (
          <>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{propiedad.descripcion}</Text>
            <View style={styles.divider} />
          </>
        )}

        {propiedad.caracteristicas && (
          <>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.amenities}>
              {propiedad.caracteristicas.wifi && (
                <View style={styles.amenity}>
                  <Ionicons name="wifi" size={24} color="#111" />
                  <Text style={styles.amenityText}>WiFi</Text>
                </View>
              )}
              {propiedad.caracteristicas.amueblado && (
                <View style={styles.amenity}>
                  <Ionicons name="bed" size={24} color="#111" />
                  <Text style={styles.amenityText}>Amueblado</Text>
                </View>
              )}
              {propiedad.caracteristicas.cocina && (
                <View style={styles.amenity}>
                  <Ionicons name="restaurant" size={24} color="#111" />
                  <Text style={styles.amenityText}>Cocina</Text>
                </View>
              )}
              {propiedad.caracteristicas.lavadora && (
                <View style={styles.amenity}>
                  <Ionicons name="water" size={24} color="#111" />
                  <Text style={styles.amenityText}>Lavadora</Text>
                </View>
              )}
              {propiedad.caracteristicas.estacionamiento && (
                <View style={styles.amenity}>
                  <Ionicons name="car" size={24} color="#111" />
                  <Text style={styles.amenityText}>Estacionamiento</Text>
                </View>
              )}
              {propiedad.caracteristicas.mascotas_permitidas && (
                <View style={styles.amenity}>
                  <Ionicons name="paw" size={24} color="#111" />
                  <Text style={styles.amenityText}>Mascotas</Text>
                </View>
              )}
            </View>
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          {propiedad.caracteristicas && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Camas:</Text>
                <Text style={styles.detailValue}>{propiedad.caracteristicas.numero_camas}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Baños:</Text>
                <Text style={styles.detailValue}>{propiedad.caracteristicas.numero_banios}</Text>
              </View>
              {propiedad.caracteristicas.metros_cuadrados && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Área:</Text>
                  <Text style={styles.detailValue}>{propiedad.caracteristicas.metros_cuadrados} m²</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contactar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 400,
    backgroundColor: '#f3f4f6',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  pricePeriod: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#6b7280',
  },
  deposit: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  amenity: {
    alignItems: 'center',
    width: 80,
  },
  amenityText: {
    fontSize: 14,
    color: '#111',
    marginTop: 8,
    textAlign: 'center',
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#1E3F66',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});