import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function OnboardingScreen() {
  const [universidad, setUniversidad] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleBuscar = () => {
    if (universidad.trim()) {
      router.push(`/(tabs)?universidad=${encodeURIComponent(universidad)}`);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/ImageOnboarding.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Roomie</Text>
        <Text style={styles.subtitle}>Encuentra tu hogar cerca de tu universidad</Text>
        
        <View style={styles.searchBox}>
          <Text style={styles.label}>¿Cuál es tu universidad?</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. UNAM, IPN, UANL..."
            value={universidad}
            onChangeText={setUniversidad}
            placeholderTextColor={Colors.neutral400}
          />
          <TouchableOpacity 
            style={[styles.button, !universidad && styles.buttonDisabled]}
            onPress={handleBuscar}
            disabled={!universidad}
          >
            <Text style={styles.buttonText}>Buscar ubicaciones</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? 
            <Text 
              style={styles.link} 
              onPress={() => router.push('/(auth)/login')}
            >
              {' '}Iniciar sesión
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.white,
    marginBottom: 40,
    textAlign: 'center',
  },
  searchBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.neutral700,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral100,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral100,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
  },
  footerText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
  },
});