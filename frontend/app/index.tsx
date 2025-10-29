import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/theme';

export default function Index() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.primary 
      }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  // Siempre redirigir a tabs
  // El modal de universidad se mostrará automáticamente si es necesario
  return <Redirect href="/(tabs)" />;
}