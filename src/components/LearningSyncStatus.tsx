import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';
import { CloudOff, RefreshCw } from 'lucide-react-native';
import { flushOfflineQueue, getOfflineQueueCount } from '../services/offlineQueue';
import { useAuth } from '../context/AuthContext';

export default function LearningSyncStatus() {
  const { user } = useAuth();
  const network = useNetworkState();
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const offline = network.isConnected === false || network.isInternetReachable === false;
  const refresh = useCallback(async () => {
    if (!user) return;
    try { setPending(await getOfflineQueueCount()); }
    catch { setFailed(true); }
  }, [user?.id]);
  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    return () => clearInterval(interval);
  }, [refresh]);
  const sync = async () => {
    setBusy(true);
    setFailed(false);
    try { await flushOfflineQueue(); await refresh(); }
    catch { setFailed(true); }
    finally { setBusy(false); }
  };
  if (!user || (!offline && !pending && !failed)) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <CloudOff size={19} color="#92400E" />
      <Text style={styles.text}>{offline ? 'Sem ligação à internet. ' : ''}{pending
        ? `${pending} ${pending === 1 ? 'ação por sincronizar.' : 'ações por sincronizar.'}`
        : failed ? 'Não foi possível sincronizar. Tente novamente.' : 'Os cursos descarregados continuam disponíveis.'}</Text>
      {!offline && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sincronizar agora" disabled={busy} onPress={sync} style={styles.retry}>
        <RefreshCw size={20} color="#92400E" />
      </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { marginHorizontal: 20, marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#FFFBEB', flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { flex: 1, fontSize: 14, lineHeight: 20, color: '#92400E' },
  retry: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
