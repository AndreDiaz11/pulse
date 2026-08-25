import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors, AppRadius } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  color?: string;
  glowColor?: string;
  leftAccentColor?: string;
  padding?: number;
}

export function AppCard({ children, onPress, style, color, glowColor, leftAccentColor, padding = 12 }: Props) {
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: color ?? AppColors.surface },
        glowColor ? { borderWidth: 1.4, borderColor: glowColor } : null,
        style,
      ]}>
      {leftAccentColor ? <View style={[styles.accent, { backgroundColor: leftAccentColor }]} /> : null}
      <View style={{ flex: 1, padding }}>{children}</View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.pressed : null]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: AppRadius.md,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  accent: { width: 4 },
  pressed: { opacity: 0.85 },
});
