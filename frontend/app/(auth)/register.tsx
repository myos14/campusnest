import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CustomInput, TipoUsuarioDropdown } from '../../components/FormElements';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { uploadService } from '../../services/uploadService';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'estudiante' | 'arrendador' | 'ambos'>('estudiante');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    nombreCompleto?: string;
    telefono?: string;
  }>({});

  const { register } = useAuth();
  const router = useRouter();

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone: string): boolean {
    if (!phone) return true;
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  function getPasswordStrength(password: string): { strength: number; text: string; color: string } {
    if (password.length === 0) return { strength: 0, text: '', color: Colors.neutral300 };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Débil', color: Colors.error };
    if (strength <= 3) return { strength, text: 'Media', color: Colors.warning };
    return { strength, text: 'Fuerte', color: Colors.success };
  }

  function validateForm(): boolean {
    const newErrors: typeof errors = {};

    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    } else if (nombreCompleto.trim().length < 3) {
      newErrors.nombreCompleto = 'El nombre debe tener al menos 3 caracteres';
    }

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

    if (telefono && !validatePhone(telefono)) {
      newErrors.telefono = 'Ingresa un teléfono válido de 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSelectImage() {
    try {
      setUploadingImage(true);
      const imageUri = await uploadService.seleccionarImagen();
      
      if (imageUri) {
        setFotoPerfil(imageUri);
        const resultado = await uploadService.subirImagen(imageUri);
        setFotoUrl(resultado.url);
        Alert.alert('Imagen subida', 'Foto de perfil cargada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la imagen');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRegister() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        email: email.trim().toLowerCase(),
        password,
        nombre_completo: nombreCompleto.trim(),
        tipo_usuario: tipoUsuario,
        telefono: telefono ? telefono.replace(/\s/g, '') : undefined,
        foto_perfil_url: fotoUrl || undefined,
        perfil_estudiante: (tipoUsuario === 'estudiante' || tipoUsuario === 'ambos') ? {} : undefined,
        perfil_arrendador: (tipoUsuario === 'arrendador' || tipoUsuario === 'ambos') ? {} : undefined,
      };

      await register(registerData);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al registrarse. Intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = getPasswordStrength(password);

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
            
            <TouchableOpacity 
              style={[styles.tab, styles.activeTab]}
              disabled={true}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Foto de perfil (opcional)</Text>
              <TouchableOpacity 
                style={styles.photoUpload}
                onPress={handleSelectImage}
                disabled={uploadingImage || loading}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={32} color={Colors.neutral400} />
                    <Text style={styles.photoText}>Agregar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <CustomInput
                label="Nombre completo"
                placeholder=""
                value={nombreCompleto}
                onChangeText={(text) => {
                  setNombreCompleto(text);
                  if (errors.nombreCompleto) setErrors({...errors, nombreCompleto: undefined});
                }}
                editable={!loading}
              />
              {errors.nombreCompleto && <Text style={styles.errorText}>{errors.nombreCompleto}</Text>}
            </View>

            <View style={styles.inputWrapper}>
              <CustomInput
                label="Email"
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
                label="Teléfono (opcional)"
                placeholder=""
                value={telefono}
                onChangeText={(text) => {
                  setTelefono(text);
                  if (errors.telefono) setErrors({...errors, telefono: undefined});
                }}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={10}
              />
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
              {!errors.telefono && telefono && (
                <Text style={styles.helperText}>10 dígitos sin espacios</Text>
              )}
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
              
              {password && !errors.password && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <TipoUsuarioDropdown
                value={tipoUsuario}
                onValueChange={setTipoUsuario}
                disabled={loading}
              />
            </View>

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
  form: {},
  photoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  photoLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.neutral700,
    marginBottom: Spacing.md,
  },
  photoUpload: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    backgroundColor: Colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral200,
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: FontSizes.xs,
    color: Colors.neutral400,
    marginTop: Spacing.xs,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  helperText: {
    color: Colors.neutral500,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontStyle: 'italic',
  },
  passwordStrength: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: Colors.neutral200,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  strengthFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  strengthText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral300,
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
