import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Timer } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Timer size={48} color="#007AFF" />
        <Text style={styles.title}>Timer App</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.description}>
          A simple, cross-platform timer app that works on iOS, Android, and web.
        </Text>
        
        <Text style={styles.sectionTitle}>Features:</Text>
        <Text style={styles.feature}>• Count up and count down modes</Text>
        <Text style={styles.feature}>• Start, pause, stop, and reset controls</Text>
        <Text style={styles.feature}>• Custom time input for countdown</Text>
        <Text style={styles.feature}>• Clean, intuitive interface</Text>
        <Text style={styles.feature}>• Cross-platform compatibility</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 16,
  },
  version: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  description: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  feature: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 8,
  },
});