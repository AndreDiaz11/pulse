import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors } from '../theme/colors';

interface Props {
  icon: string;
  message: string;
}

export function StateMessage({ icon, message }: Props) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={48} color={AppColors.textSecondary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  text: { color: AppColors.textSecondary, textAlign: 'center', marginTop: 12 },
});
