import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSettingsStore } from '../store/settingsStore';
import { AppColors } from '../theme/colors';
import packageJson from '../../package.json';

const OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 15, label: '15 minutos antes' },
  { minutes: 30, label: '30 minutos antes' },
  { minutes: 60, label: '1 hora antes' },
  { minutes: 180, label: '3 horas antes' },
  { minutes: 1440, label: '1 día antes' },
];

export function SettingsScreen() {
  const leadMinutes = useSettingsStore(s => s.leadMinutes);
  const setLeadMinutes = useSettingsStore(s => s.setLeadMinutes);
  const persistentEnabled = useSettingsStore(s => s.persistentEnabled);
  const setPersistentEnabled = useSettingsStore(s => s.setPersistentEnabled);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Avisarme con anticipación</Text>
      <View style={styles.card}>
        {OPTIONS.map(opt => (
          <Pressable key={opt.minutes} onPress={() => setLeadMinutes(opt.minutes)} style={styles.optionRow}>
            <Icon
              name={leadMinutes === opt.minutes ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={20}
              color={leadMinutes === opt.minutes ? AppColors.accent : AppColors.textSecondary}
            />
            <Text style={styles.optionLabel}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Notificación fija</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Mostrar siempre el próximo partido favorito</Text>
            <Text style={styles.switchSubtitle}>
              Notificación fija en la barra, no se puede deslizar para cerrar. Se actualiza sola aunque la app esté cerrada.
            </Text>
          </View>
          <Switch
            value={persistentEnabled}
            onValueChange={setPersistentEnabled}
            trackColor={{ true: AppColors.accent, false: AppColors.chipBackground }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Text style={styles.versionLabel}>Pulse v{packageJson.version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, padding: 12 },
  sectionLabel: { color: AppColors.textSecondary, fontSize: 12, marginBottom: 8, marginTop: 4, marginLeft: 4 },
  card: { backgroundColor: AppColors.surface, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  optionLabel: { color: AppColors.textPrimary, marginLeft: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  switchTitle: { color: AppColors.textPrimary, fontWeight: '600' },
  switchSubtitle: { color: AppColors.textSecondary, fontSize: 12, marginTop: 4 },
  versionLabel: { color: AppColors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
