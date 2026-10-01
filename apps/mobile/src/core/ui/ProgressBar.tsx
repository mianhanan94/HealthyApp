import { StyleSheet, View } from 'react-native';

import { colors } from './theme';

interface ProgressBarProps {
  /** 0–1; values above 1 show an "over" segment. */
  progress: number;
  color?: string;
  trackColor?: string;
  overColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = colors.success,
  trackColor = colors.secondary,
  overColor = colors.commerce,
  height = 8,
}: ProgressBarProps) {
  const safe = Number.isFinite(progress) ? Math.max(progress, 0) : 0;
  const over = safe > 1;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
      <View
        style={{
          width: `${Math.min(safe, 1) * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: over ? overColor : color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
});
