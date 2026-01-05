import React, { useMemo } from 'react';
import { ScrollView, View, Text, Dimensions } from 'react-native';
import HTML, { MixedStyleDeclaration } from 'react-native-render-html';
import { Job } from '@/types/job';
import { createJobDetailsStyles } from '@/app/styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobContentProps {
  job: Job;
  children?: React.ReactNode;
}

const windowWidth = Dimensions.get('window').width;

export default function JobContent({ job, children }: JobContentProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  const renderHTMLContent = (htmlContent: string) => {
    const baseStyle: MixedStyleDeclaration = {
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    };

    const tagsStyles: Record<string, MixedStyleDeclaration> = {
      body: { ...baseStyle },
      p: { ...baseStyle, marginBottom: 16, lineHeight: 22, fontSize: 16 },
      h1: { ...baseStyle, fontSize: 24, fontWeight: '700', marginVertical: 16 },
      h2: { ...baseStyle, fontSize: 22, fontWeight: '700', marginVertical: 14 },
      h3: { ...baseStyle, fontSize: 20, fontWeight: '700', marginVertical: 12 },
      h4: { ...baseStyle, fontSize: 18, fontWeight: '700', marginVertical: 10 },
      h5: { ...baseStyle, fontSize: 16, fontWeight: '700', marginVertical: 8, color: colors.primary },
      h6: { ...baseStyle, fontSize: 15, fontWeight: '700', marginVertical: 6, color: colors.primary },
      a: { ...baseStyle, color: colors.primary, textDecorationLine: 'underline' },
      ul: { ...baseStyle, marginBottom: 16 },
      ol: { ...baseStyle, marginBottom: 16 },
      li: { ...baseStyle, marginBottom: 8, lineHeight: 22 },
    };

    return (
      <HTML
        source={{ html: htmlContent }}
        contentWidth={windowWidth - 32}
        tagsStyles={tagsStyles}
        defaultTextProps={{
          style: { color: colors.text },
        }}
      />
    );
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {children}

      {job.excerpt && (
        <View style={styles.excerptContainer}>
          <Text style={styles.excerptText}>{job.excerpt}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Descrição da Vaga</Text>
        {job.content && renderHTMLContent(job.content)}
      </View>
    </ScrollView>
  );
}
