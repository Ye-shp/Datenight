import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

interface VibeButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const VibeButton: React.FC<VibeButtonProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  buttonSelected: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.primary,
    fontSize: 16,
  },
  textSelected: {
    color: '#fff',
  },
});

export default VibeButton;
