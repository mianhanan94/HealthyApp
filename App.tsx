import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DAILY_WATER_GOAL = 8;

export default function App() {
  const [glasses, setGlasses] = useState(0);
  const progress = Math.min(glasses / DAILY_WATER_GOAL, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthyApp</Text>
      <Text style={styles.subtitle}>Today's water intake</Text>

      <View style={styles.card}>
        <Text style={styles.count}>
          {glasses} / {DAILY_WATER_GOAL}
        </Text>
        <Text style={styles.label}>glasses</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>

        {glasses >= DAILY_WATER_GOAL && <Text style={styles.done}>Goal reached!</Text>}

        <View style={styles.row}>
          <Pressable
            style={[styles.button, styles.secondary]}
            onPress={() => setGlasses((g) => Math.max(g - 1, 0))}
          >
            <Text style={styles.secondaryText}>−</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => setGlasses((g) => g + 1)}>
            <Text style={styles.buttonText}>+ Glass</Text>
          </Pressable>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7F5',
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B4332',
  },
  subtitle: {
    fontSize: 16,
    color: '#52796F',
    marginTop: 4,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  count: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1B4332',
  },
  label: {
    fontSize: 16,
    color: '#52796F',
  },
  track: {
    width: '100%',
    height: 12,
    backgroundColor: '#D8E9E2',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2D9CDB',
  },
  done: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#D8E9E2',
  },
  secondaryText: {
    color: '#2D6A4F',
    fontSize: 18,
    fontWeight: '600',
  },
});
