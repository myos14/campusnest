import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CustomInput } from '../../components/FormElements';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  
  const { login } = useAuth();
  const router = useRouter();

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    const newErrors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Roomie</Text>
          <Text style={styles.subtitle}>Encuentra tu hogar cerca de tu universidad</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, styles.activeTab]}
              disabled={true}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Text style={styles.tabText}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <CustomInput
                label="Correo electrónico"
                placeholder=""
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({...errors, email: undefined});
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputWrapper}>
              <CustomInput
                label="Contraseña"
                placeholder=""
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({...errors, password: undefined});
                }}
                secureTextEntry
                editable={!loading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.rememberContainer}>
              <TouchableOpacity style={styles.rememberCheck}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>Recordarme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Iniciando...' : 'Acceder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 35,
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
  form: {},
  inputWrapper: {
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  rememberCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.sm,
  },
  rememberText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral400,
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral300,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
