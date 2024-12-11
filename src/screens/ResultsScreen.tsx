import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Linking, ActivityIndicator, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VenueCard from '../components/VenueCard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Venue {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
}

const ResultsScreen = ({ route }) => {
  const { city, budget, vibe } = route.params;
  const [idea, setIdea] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatePlan = async () => {
      try {
        const spotifyToken = await AsyncStorage.getItem('spotify_token');
        if (!spotifyToken) {
          Alert.alert('Authentication Error', 'Spotify token not found. Please log in again.');
          return;
        }

        const response = await axios.post(
          'https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net/generateDatePlan', // Replace with your actual URL
          { city, budget, vibe },
          { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );
        setIdea(response.data.idea);
        setVenues(response.data.venues);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch date plan. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatePlan();
  }, [city, budget, vibe]);

  const handleBooking = (venue: Venue) => {
    if (venue.category.includes('Restaurant')) {
      Linking.openURL(`https://www.opentable.com/${venue.id}`);
    } else if (venue.category.includes('Music')) {
      Linking.openURL(`https://www.ticketmaster.com/${venue.id}`);
    } else {
      Alert.alert('Booking Unavailable', 'Booking not available for this venue.');
    }
  };

  const saveDatePlan = async () => {
    try {
      const existingPlans = await AsyncStorage.getItem('savedPlans');
      const newPlan = {
        city,
        budget,
        vibe,
        idea,
        venues,
        createdAt: new Date(),
      };
      const updatedPlans = existingPlans ? JSON.parse(existingPlans) : [];
      updatedPlans.push(newPlan);
      await AsyncStorage.setItem('savedPlans', JSON.stringify(updatedPlans));
      Alert.alert('Success', 'Date plan saved successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save date plan.');
    }
  };

  const shareDatePlan = async () => {
    try {
      const planData = JSON.stringify({ city, budget, vibe, idea, venues }, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'datePlan.json';
      await FileSystem.writeAsStringAsync(fileUri, planData, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share Your Date Plan',
        UTI: 'public.json',
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share date plan.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.idea}>{idea}</Text>
      <Text style={styles.sectionTitle}>Suggested Venues:</Text>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VenueCard venue={item} onBook={() => handleBooking(item)} />
        )}
      />
      <View style={styles.buttonContainer}>
        <Button title="Save Plan" onPress={saveDatePlan} color="#1DB954" />
        <View style={styles.buttonSpacing} />
        <Button title="Share Plan" onPress={shareDatePlan} color="#1DB954" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  idea: {
    fontSize: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  buttonSpacing: {
    width: 20,
  },
});

export default ResultsScreen;
