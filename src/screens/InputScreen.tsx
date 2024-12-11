import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Slider, TouchableOpacity, FlatList, Alert } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VibeButton from '../components/VibeButton';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA2GLTPo0Qykokes3JkPzN8bmGGlR9HYxA'; 
const VIBE_OPTIONS = ['Romantic', 'Chill', 'Adventurous', 'Fun'];

const InputScreen = () => {
  const navigation = useNavigation();
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [budget, setBudget] = useState(50);
  const [vibe, setVibe] = useState('Romantic');

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,
            types: '(cities)',
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
      setSuggestions(response.data.predictions);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch city suggestions.');
    }
  };

  const handleCityChange = (text: string) => {
    setCity(text);
    fetchLocationSuggestions(text);
  };

  const handleCitySelect = (description: string) => {
    setCity(description);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (!city) {
      Alert.alert('Validation Error', 'Please select a city from the suggestions.');
      return;
    }
    navigation.navigate('Results', { city, budget, vibe });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>City</Text>
      <Autocomplete
        data={suggestions}
        defaultValue={city}
        onChangeText={handleCityChange}
        placeholder="Enter city"
        flatListProps={{
          keyExtractor: (item) => item.place_id,
          renderItem: ({ item }) => (
            <TouchableOpacity onPress={() => handleCitySelect(item.description)}>
              <Text style={styles.item}>{item.description}</Text>
            </TouchableOpacity>
          ),
        }}
        style={styles.autocomplete}
      />
      <Text style={styles.label}>Budget: ${budget}</Text>
      <Slider
        minimumValue={10}
        maximumValue={200}
        step={10}
        value={budget}
        onValueChange={(value) => setBudget(value)}
        style={styles.slider}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#000000"
      />
      <Text style={styles.label}>Vibe Preferences</Text>
      <View style={styles.vibeContainer}>
        {VIBE_OPTIONS.map((option) => (
          <VibeButton
            key={option}
            label={option}
            selected={vibe === option}
            onPress={() => setVibe(option)}
          />
        ))}
      </View>
      <Button title="Find Your Date" onPress={handleSubmit} color="#1DB954" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  autocomplete: {
    marginBottom: 20,
  },
  item: {
    padding: 10,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  vibeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
});

export default InputScreen;
