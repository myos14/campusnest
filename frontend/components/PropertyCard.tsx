import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Propiedad } from '../types';
import { calificacionesService } from '../services/api';

interface PropertyCardProps {
  propiedad: Propiedad;
  onPress: () => void;
}

export default function PropertyCard({ propiedad, onPress }: PropertyCardProps) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const fotoPrincipal = propiedad.fotos?.find(f => f.es_principal)?.url_foto || 
                       'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';

  useEffect(() => {
    cargarEstadisticas();
  }, [propiedad.id_propiedad]);

  const cargarEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      const stats = await calificacionesService.obtenerEstadisticasPropiedad(propiedad.id_propiedad);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const toggleFavorito = () => {
    setEsFavorito(!esFavorito);
    // Implementacion de la llamada API
  };

  const renderEstrellas = (calificacion: number) => {
    return (
      <View style={styles.estrellasContainer}>
        {[1, 2, 3, 4, 5].map((estrella) => (
          <Ionicons
            key={estrella}
            name={estrella <= calificacion ? "star" : "star-outline"}
            size={12}
            color="#1E3F66"
          />
        ))}
        <Text style={styles.calificacionText}>({calificacion.toFixed(1)})</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isPressed && styles.cardPressed
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: fotoPrincipal }} style={styles.image} />
        
        {/* Badge de Verificado */}
        {propiedad.id_arrendador && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.verifiedText}>Verificado</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.favoriteButton, esFavorito && styles.favoriteButtonActive]}
          onPress={toggleFavorito}
          activeOpacity={1}
        >
          <Ionicons 
            name={esFavorito ? "heart" : "heart-outline"} 
            size={20} 
            color={esFavorito ? "#1E3F66" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Header con ubicación y calificación */}
        <View style={styles.header}>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {propiedad.colonia}, {propiedad.ciudad}
            </Text>
          </View>
          
          {estadisticas && estadisticas.total_calificaciones > 0 && (
            <View style={styles.ratingContainer}>
              {renderEstrellas(estadisticas.promedio_general)}
            </View>
          )}
        </View>

        {/* Título */}
        <Text style={styles.title} numberOfLines={2}>{propiedad.titulo}</Text>

        {/* Características principales */}
        <View style={styles.features}>
          {propiedad.caracteristicas?.numero_camas && (
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={14} color="#6b7280" />
              <Text style={styles.featureText}>{propiedad.caracteristicas.numero_camas}</Text>
            </View>
          )}
          {propiedad.caracteristicas?.numero_banios && (
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={14} color="#6b7280" />
              <Text style={styles.featureText}>{propiedad.caracteristicas.numero_banios}</Text>
            </View>
          )}
          {propiedad.caracteristicas?.metros_cuadrados && (
            <View style={styles.feature}>
              <Ionicons name="square-outline" size={14} color="#6b7280" />
              <Text style={styles.featureText}>{propiedad.caracteristicas.metros_cuadrados}m²</Text>
            </View>
          )}
        </View>

        {/* Características con iconos */}
        <View style={styles.amenities}>
          {propiedad.caracteristicas?.wifi && (
            <Ionicons name="wifi" size={16} color="#6b7280" />
          )}
          {propiedad.caracteristicas?.estacionamiento && (
            <Ionicons name="car-sport-outline" size={16} color="#6b7280" />
          )}
          {propiedad.caracteristicas?.mascotas_permitidas && (
            <Ionicons name="paw-outline" size={16} color="#6b7280" />
          )}
          {propiedad.caracteristicas?.amueblado && (
            <Ionicons name="home-outline" size={16} color="#6b7280" />
          )}
        </View>

        {/* Footer con precio */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              <Text style={styles.priceAmount}>${propiedad.precio_mensual.toLocaleString()}</Text>
              <Text style={styles.pricePeriod}> / mes</Text>
            </Text>
            {propiedad.deposito_requerido && (
              <Text style={styles.deposit}>
                + ${propiedad.deposito_requerido.toLocaleString()} de depósito
              </Text>
            )}
          </View>
          
          {estadisticas && estadisticas.total_calificaciones > 0 && (
            <Text style={styles.reviews}>
              {estadisticas.total_calificaciones} {estadisticas.total_calificaciones === 1 ? 'reseña' : 'reseñas'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    // Sombra estática con tu color rojo
    shadowColor: '#1E3F66',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardPressed: {
    // Cuando está presionado - tono más claro del rojo
    shadowColor: '#ff6b8b',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderColor: '#1E3F66',
    borderWidth: 1,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#f3f4f6',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    flex: 1,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  estrellasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  calificacionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
  },
  amenities: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6b7280',
  },
  deposit: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  reviews: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
});