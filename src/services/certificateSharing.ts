import { Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { safeVerificationUrl } from '../utils/certificateVerification';

export async function shareCertificateLink(certificate: any, copy = false) {
  const url = safeVerificationUrl(certificate.verificationUrl);
  if (!url) {
    Alert.alert('Link indisponível', 'Não foi possível obter o link de verificação. Volte a abrir o certificado com ligação à internet.');
    return;
  }
  try {
    if (copy) {
      await Clipboard.setStringAsync(url);
      Alert.alert('Link copiado', 'O link de verificação foi copiado.');
    } else if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: 'Certificado MAZA', url });
      else { await Clipboard.setStringAsync(url); Alert.alert('Link copiado', 'O link de verificação foi copiado.'); }
    } else {
      const message = `Certificado MAZA — ${certificate.course?.title || 'Curso'}`;
      await Share.share(Platform.OS === 'ios' ? { url, message } : { message: `${message}\n${url}` });
    }
  } catch (error: any) {
    if (error?.name !== 'AbortError') Alert.alert('Não foi possível partilhar', 'Tente copiar o link.');
  }
}
