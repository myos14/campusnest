import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Universidad {
  value: string;
  label: string;
  tipo: 'publica' | 'privada';
}

interface UniversityModalProps {
  visible: boolean;
  onSelectUniversity: (universityId: string) => void;
  onSkip: () => void;
}

export default function UniversityModal({ visible, onSelectUniversity, onSkip }: UniversityModalProps) {
  const [universidad, setUniversidad] = useState('');
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(
        `${API_URL}/propiedades/universidades/buscar?q=${encodeURIComponent(searchText)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setUniversidades(data);
        setShowDropdown(data.length > 0);
      }
    } catch (error) {
      console.error('Error buscando universidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUniversidad = async (uni: Universidad) => {
    try {
      await AsyncStorage.setItem('selected_university', uni.value);
      await AsyncStorage.setItem('selected_university_name', uni.label);
      setUniversidad('');
      setShowDropdown(false);
      onSelectUniversity(uni.value);
    } catch (error) {
      console.error('Error guardando universidad:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('university_modal_shown', 'true');
      onSkip();
    } catch (error) {
      console.error('Error al omitir:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <Pressable 
        style={styles.overlay}
        onPress={handleSkip}
      >
        <Pressable 
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="school" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>¿Cuál es tu universidad?</Text>
            <Text style={styles.subtitle}>
              Te mostraremos propiedades cercanas a tu campus
            </Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="search" size={20} color={Colors.neutral400} />
              <TextInput
                style={styles.input}
                placeholder="Buscar universidad (ej. BUAP, UDLAP...)"
                value={universidad}
                onChangeText={setUniversidad}
                placeholderTextColor={Colors.neutral400}
                onFocus={() => universidad.length >= 2 && setShowDropdown(true)}
              />
              {loading && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
            </View>

            {/* Dropdown */}
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
                      <View style={styles.dropdownItemContent}>
                        <Ionicons name="business" size={20} color={Colors.primary} />
                        <View style={styles.dropdownItemText}>
                          <Text style={styles.dropdownItemLabel}>{item.label}</Text>
                          <Text style={styles.dropdownItemValue}>{item.value}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
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
                <Ionicons name="search-outline" size={40} color={Colors.neutral300} />
                <Text style={styles.noResultsText}>
                  No se encontraron universidades
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Intenta con otro término de búsqueda
                </Text>
              </View>
            )}
          </View>

          {/* Skip Button */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Omitir por ahora</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.neutral600,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    padding: Spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.neutral900,
    padding: 0,
  },
  dropdown: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral100,
    maxHeight: 240,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neutral900,
    marginBottom: 2,
  },
  dropdownItemValue: {
    fontSize: FontSizes.sm,
    color: Colors.neutral500,
  },
  noResults: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.md,
  },
  noResultsText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neutral700,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  noResultsSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.neutral500,
    textAlign: 'center',
  },
  skipButton: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral100,
  },
  skipButtonText: {
    fontSize: FontSizes.md,
    color: Colors.neutral600,
    fontWeight: '500',
  },
});