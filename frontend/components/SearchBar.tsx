import React, { useState } from 'react';
import { View, Pressable, TextInput, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  universityName?: string | null;
  onUniversityPress?: () => void;
  onSearchSubmit?: () => void; // Para navegar a resultados
}

export default function SearchBar({ 
  searchValue, 
  onSearchChange,
  placeholder = 'Buscar ubicación...',
  universityName,
  onUniversityPress,
  onSearchSubmit,
}: SearchBarProps) {
  const [activeSection, setActiveSection] = useState<'university' | 'search' | null>(null);
  const [hoverUniversity, setHoverUniversity] = useState(false);
  const [hoverSearch, setHoverSearch] = useState(false);
  const [hoverIcon, setHoverIcon] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* SEARCHBAR CENTRADO */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchCard,
          (hoverUniversity || hoverSearch || hoverIcon || activeSection) && styles.searchCardElevated
        ]}>
          {/* SECCIÓN 1: Universidad */}
          {universityName && onUniversityPress && (
            <>
              <Pressable 
                style={({ pressed }) => [
                  styles.section,
                  styles.sectionUniversity,
                  activeSection === 'university' && styles.sectionActive,
                  hoverUniversity && styles.sectionHover,
                  pressed && styles.sectionPressed,
                ]}
                onPress={() => {
                  setActiveSection('university');
                  onUniversityPress();
                }}
                onHoverIn={() => setHoverUniversity(true)}
                onHoverOut={() => setHoverUniversity(false)}
              >
                <Text style={styles.sectionLabel}>UNIVERSIDAD</Text>
                <Text style={styles.sectionValue} numberOfLines={1}>
                  {universityName}
                </Text>
              </Pressable>
              <View style={styles.divider} />
            </>
          )}

          {/* SECCIÓN 2: Búsqueda */}
          <Pressable 
            style={({ pressed }) => [
              styles.section,
              styles.sectionSearch,
              !universityName && styles.sectionSearchFull,
              activeSection === 'search' && styles.sectionActive,
              hoverSearch && styles.sectionHover,
              pressed && styles.sectionPressed,
            ]}
            onPress={() => setActiveSection('search')}
            onHoverIn={() => setHoverSearch(true)}
            onHoverOut={() => setHoverSearch(false)}
          >
            <View style={styles.searchSection}>
              <Ionicons name="search" size={18} color={Colors.neutral400} />
              {activeSection === 'search' ? (
                <TextInput
                  style={styles.searchInput}
                  placeholder={placeholder}
                  value={searchValue}
                  onChangeText={onSearchChange}
                  placeholderTextColor={Colors.neutral400}
                  autoFocus
                  onBlur={() => setActiveSection(null)}
                  onSubmitEditing={onSearchSubmit}
                  returnKeyType="search"
                />
              ) : (
                <View style={styles.searchTextContainer}>
                  <Text style={styles.sectionLabel}>UBICACIÓN</Text>
                  <Text style={[
                    styles.sectionValue,
                    !searchValue && styles.sectionPlaceholder
                  ]} numberOfLines={1}>
                    {searchValue || placeholder}
                  </Text>
                </View>
              )}
              {searchValue && activeSection === 'search' && (
                <Pressable onPress={() => onSearchChange('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.neutral400} />
                </Pressable>
              )}
            </View>
          </Pressable>

          {/* ICONO DE BÚSQUEDA (clickeable para submit) */}
          <Pressable 
            style={[
              styles.searchIcon,
              hoverIcon && styles.searchIconHover,
            ]}
            onPress={onSearchSubmit}
            onHoverIn={() => setHoverIcon(true)}
            onHoverOut={() => setHoverIcon(false)}
          >
            <Ionicons name="search" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  searchContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
    maxWidth: 850,
  },
  searchCardElevated: {
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // SECCIONES
  section: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    minHeight: 64,
    justifyContent: 'center',
  },
  sectionUniversity: {
    flex: 1,
    minWidth: 200,
  },
  sectionSearch: {
    flex: 1,
  },
  sectionSearchFull: {
    flex: 1,
  },
  sectionHover: {
    backgroundColor: Colors.neutral50,
  },
  sectionActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionPressed: {
    backgroundColor: Colors.neutral100,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: FontSizes.sm,
    fontWeight: '400',
    color: Colors.neutral900,
    flexWrap: 'nowrap',
  },
  sectionPlaceholder: {
    color: Colors.neutral400,
  },
  
  // BÚSQUEDA
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  searchTextContainer: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '400',
    color: Colors.neutral900,
    padding: 0,
    margin: 0,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  } as any,
  
  // DIVISOR
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.neutral200,
    marginHorizontal: 4,
  },
  
  // ICONO DE BÚSQUEDA
  searchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  searchIconHover: {
    backgroundColor: Colors.primaryDark,
  },
});