import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { Colors, Spacing, FontSizes } from '../../constants/theme';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={Colors.neutral100} />
          <Text style={styles.emptyTitle}>Tus Favoritos</Text>
          <Text style={styles.emptyText}>
            Las propiedades que guardes aparecerán aquí
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.neutral400,
    textAlign: 'center',
    lineHeight: 24,
  },
});