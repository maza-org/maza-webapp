import React, { useMemo } from 'react';
import { ColorValue, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENTS_COLORS: readonly [ColorValue, ColorValue][] = [
  ['#1EAAF1', '#0d4a8a'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#ffecd2', '#fcb69f'],
  ['#667eea', '#764ba2'],
  ['#f6d365', '#fda085'],
  ['#84fab0', '#8fd3f4'],
];

function getCourseGradientColors(id: string): [ColorValue, ColorValue] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS_COLORS[hash % GRADIENTS_COLORS.length];
}

interface Props { 
  courseId: string; 
  title?: string;
  width?: number | string; 
  height?: number | string; 
  style?: any; 
  children?: React.ReactNode; 
}

export default function CourseBokehBg({ courseId, title, width = '100%', height = '100%', style, children }: Props) {
  const gradientColors = useMemo(() => getCourseGradientColors(courseId), [courseId]);


  return (
    <View style={[{ width, height, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      />
      
      {/* MAZA round logo watermark — same semi-transparent tone as the old initials */}
      <Image
        source={require('../../assets/maza-icon-branco.png')}
        style={{
          width: '55%',
          height: '55%',
          opacity: 0.22,
          resizeMode: 'contain',
        }}
      />

      {/* Dark overlay to match CRM's absolute inset-0 rgba(0,0,0,0.08) */}
      <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.08)' }} />

      {children ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
