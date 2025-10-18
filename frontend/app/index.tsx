import { Redirect } from 'expo-router';
   import { useAuth } from '../context/AuthContext';
   import { ActivityIndicator, View } from 'react-native';

   export default function Index() {
     const { isAuthenticated, loading } = useAuth();

     if (loading) {
       return (
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E3F66' }}>
           <ActivityIndicator size="large" color="#fff" />
         </View>
       );
     }

     console.log('🔍 Index - isAuthenticated:', isAuthenticated);
     
     return <Redirect href={isAuthenticated ? '/(tabs)' : '/(onboarding)'} />;
   }