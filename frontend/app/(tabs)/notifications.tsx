import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { notificationsService } from '../../services/notificationsService';
import type { Notificacion } from '../../types';

export default function NotificationsScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  async function cargarNotificaciones() {
    try {
      const data = await notificationsService.obtenerNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarLeida(id: number) {
    await notificationsService.marcarComoLeida(id);
    cargarNotificaciones();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id_notificacion.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.leida && styles.noLeida]}
            onPress={() => marcarLeida(item.id_notificacion)}
          >
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.mensaje}>{item.mensaje}</Text>
            <Text style={styles.fecha}>
              {new Date(item.fecha_creacion).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  noLeida: { backgroundColor: '#e3f2fd' },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  mensaje: { fontSize: 14, color: '#666', marginTop: 4 },
  fecha: { fontSize: 12, color: '#999', marginTop: 4 },
});