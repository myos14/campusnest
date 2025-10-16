import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CustomInput, TipoUsuarioDropdown } from '../../components/FormElements';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'estudiante' | 'arrendador' | 'ambos'>('estudiante');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !nombreCompleto) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        email,
        password,
        nombre_completo: nombreCompleto,
        tipo_usuario: tipoUsuario,
        telefono: undefined,
        perfil_estudiante: tipoUsuario === 'estudiante' || tipoUsuario === 'ambos' ? {} : undefined,
        perfil_arrendador: tipoUsuario === 'arrendador' || tipoUsuario === 'ambos' ? {} : undefined,
      };

      await register(registerData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Roomie</Text>
          <Text style={styles.subtitle}>Encuentra tu hogar cerca de tu universidad</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.tabText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Nombre completo"
              placeholder=""
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              editable={!loading}
            />

            <CustomInput
              label="Email"
              placeholder=""
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <CustomInput
              label="Contraseña"
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TipoUsuarioDropdown
              value={tipoUsuario}
              onValueChange={setTipoUsuario}
              disabled={loading}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login')}
              disabled={loading}
            >
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  content: {
    paddingVertical: 40,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.neutral400,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    ...Shadows.md,
    width: '100%',
    maxWidth: 400,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral100,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.xxl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.neutral400,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    // gap is handled by CustomInput marginBottom
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral100,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});