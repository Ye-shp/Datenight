import React from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = 'e2f9ae3b9c644de8a6ad6b3478ab13ae'; 
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });
const SCOPES = ['user-top-read', 'user-read-recently-played'];

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleSpotifyLogin = async () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES.join(' '))}`;

    try {
      const result = await AuthSession.startAsync({ authUrl }) as any;
      if (result.type === 'success') {
        const { access_token } = result.params;
        await AsyncStorage.setItem('spotify_token', access_token);
        navigation.navigate('Input');
      } else {
        Alert.alert('Authentication Failed', 'Spotify login was unsuccessful.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during Spotify login.');
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/music-note.json')}
        autoPlay
        loop
        style={styles.animation}
      />
      <Button title="Connect Spotify" onPress={handleSpotifyLogin} color="#1DB954" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#1DB954',
  },
  animation: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default LoginScreen;
