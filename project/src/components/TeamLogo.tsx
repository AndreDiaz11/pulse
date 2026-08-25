import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppColors, Region, regionColor } from '../theme/colors';

interface Props {
  logoUrl: string;
  teamName: string;
  region: Region;
  size?: number;
}

export function TeamLogo({ logoUrl, teamName, region, size = 28 }: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !logoUrl || failed;

  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: regionColor(region) },
      ]}>
      {showFallback ? (
        <View style={[styles.fallback, { borderRadius: size / 2 }]}>
          <Text style={styles.fallbackText}>{teamName ? teamName[0].toUpperCase() : '?'}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 2, padding: 1.5, alignItems: 'center', justifyContent: 'center' },
  fallback: { width: '100%', height: '100%', backgroundColor: AppColors.chipBackground, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: AppColors.textPrimary, fontWeight: 'bold' },
});
