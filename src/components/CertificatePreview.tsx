import React, { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CertificateData, formatCertificateDate, getCertificateCode } from '../utils/certificateGenerator';
import { MAZA_LOGO_B64, UNICEF_LOGO_B64 } from '../assets/certificateAssets';
import { MAZA_HORIZONTAL_LOGO_B64 } from '../assets/certificateExtraAssets';

type Props = CertificateData & {
  style?: ViewStyle | ViewStyle[];
};

const A4_WIDTH = 1123;
const A4_HEIGHT = 794;
const A4_RATIO = A4_WIDTH / A4_HEIGHT;

export default function CertificatePreview({ style, ...data }: Props) {
  const [width, setWidth] = useState(0);

  const certificate = useMemo(() => ({
    date: formatCertificateDate(data.issuedAt),
    certCode: getCertificateCode(data.certificateId),
    studentName: (data.studentName || 'NOME COMPLETO').toUpperCase(),
    courseTitle: (data.courseTitle || 'NOME DO CURSO').toUpperCase(),
  }), [data.studentName, data.courseTitle, data.issuedAt, data.certificateId]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const scale = width > 0 ? width / A4_WIDTH : 0.5;
  const s = (value: number, min = 0) => Math.max(min, value * scale);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View style={[styles.sheet, { borderWidth: s(12, 3) }]}>
        <Image
          source={{ uri: MAZA_LOGO_B64 }}
          resizeMode="contain"
          style={[
            styles.watermark,
            {
              width: s(650),
              height: s(650),
              marginLeft: -s(325),
              marginTop: -s(325),
            },
          ]}
        />

        <Text
          style={[styles.title, { top: s(58), fontSize: s(30, 10), letterSpacing: s(0.8) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          CERTIFICADO DE CONCLUSÃO
        </Text>

        <Text style={[styles.certify, { top: s(240), fontSize: s(16, 7), letterSpacing: s(1.2) }]}>
          CERTIFICAMOS QUE
        </Text>

        <Text
          style={[
            styles.student,
            {
              top: s(300),
              left: s(140),
              right: s(140),
              fontSize: s(38, 11),
              letterSpacing: s(2.2),
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          {certificate.studentName}
        </Text>

        <Text style={[styles.completed, { top: s(410), fontSize: s(16, 7) }]}>
          completou com sucesso o curso
        </Text>

        <Text
          style={[
            styles.course,
            {
              top: s(438),
              left: s(160),
              right: s(160),
              fontSize: s(17, 7),
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          {certificate.courseTitle}
        </Text>

        <Text style={[styles.date, { top: s(515), fontSize: s(16, 7), letterSpacing: s(1.6) }]} numberOfLines={1}>
          {certificate.date.toUpperCase()}
        </Text>

        <View style={[styles.logos, { left: s(115), right: s(115), bottom: s(92), height: s(70, 24) }]}>
          <Image source={{ uri: UNICEF_LOGO_B64 }} resizeMode="contain" style={{ width: s(130, 42), height: s(52, 18) }} />
          <Image source={{ uri: MAZA_HORIZONTAL_LOGO_B64 }} resizeMode="contain" style={{ width: s(145, 46), height: s(58, 18) }} />
        </View>

        <Text
          style={[
            styles.footer,
            {
              left: s(60),
              right: s(60),
              bottom: s(24),
              fontSize: s(9, 4),
              letterSpacing: s(1),
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          ID DO CERTIFICADO: {certificate.certCode}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: A4_RATIO,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderColor: '#5b9bd5',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    left: '50%',
    top: '51%',
    opacity: 0.08,
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#5b9bd5',
    fontFamily: 'serif',
    fontWeight: '400',
    textAlign: 'center',
  },
  certify: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#4b5563',
    textAlign: 'center',
  },
  student: {
    position: 'absolute',
    color: '#5b9bd5',
    fontFamily: 'serif',
    fontWeight: '400',
    textAlign: 'center',
  },
  completed: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#4b5563',
    textAlign: 'center',
  },
  course: {
    position: 'absolute',
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
  date: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#4b5563',
    textAlign: 'center',
  },
  logos: {
    position: 'absolute',
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    zIndex: 4,
    color: '#6b7280',
    textAlign: 'center',
  },
});
