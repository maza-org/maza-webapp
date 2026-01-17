import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

type ThemeColors = typeof Colors.dark;

export const createThemedStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    fontFamily: 'ManropeRegular',
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'ManropeRegular',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'ManropeBold',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'ManropeRegular',
  },
  jobCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  jobHeader: {
    flexDirection: 'row',
  },
  companyLogoContainer: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'ManropeBold',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'ManropeBold',
  },
  companyName: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'ManropeRegular',
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
    fontFamily: 'ManropeRegular',
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadge: {
    top: 12,
    right: 12,
    backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA',
  },
  languageBadgeText: {
    fontSize: 10,
    color: colors.text,
    textTransform: 'uppercase',
    fontFamily: 'ManropeRegular',
  },
  newBadge: {
    bottom: 12,
    right: 12,
    backgroundColor: colors.primary,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'ManropeBold',
  },
});

// Legacy export for backward compatibility
export const styles = createThemedStyles(Colors.dark, true);
