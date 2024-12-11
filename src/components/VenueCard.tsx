import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { colors } from '../theme/theme';

interface Venue {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
}

interface VenueCardProps {
  venue: Venue;
  onBook: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onBook }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{venue.name}</Text>
      <Text>Category: {venue.category}</Text>
      <Text>Distance: {venue.distance}</Text>
      <Text>Rating: {venue.rating}</Text>
      <Button title="Book Now" onPress={onBook} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default VenueCard;
