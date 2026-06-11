import React from 'react';
import { Platform, Text } from 'react-native';

let PdfComponent: any = null;

function getPdfComponent() {
  if (Platform.OS === 'web') {
    return null;
  }

  if (PdfComponent) {
    return PdfComponent;
  }

  try {
    const mod = require('react-native-pdf');
    PdfComponent = mod.default ?? mod;
    return PdfComponent;
  } catch {
    return null;
  }
}

export default function NativePdf(props: any) {
  const Pdf = getPdfComponent();

  if (!Pdf) {
    return <Text style={{ color: '#EF4444' }}>PDF indisponivel</Text>;
  }

  return <Pdf {...props} />;
}
