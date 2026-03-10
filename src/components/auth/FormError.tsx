import React from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = { message: string | null };

export default function FormError({ message }: Props) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});
