type TabColors = {
  background: string;
  border: string;
  activeTint: string;
  inactiveTint: string;
};

export const tabColors = {
  light: {
    background: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.1)',
    activeTint: '#1fa2df',
    inactiveTint: '#7C7C8A',
  },
  dark: {
    background: '#202024',
    border: 'rgba(255, 255, 255, 0.1)',
    activeTint: '#1fa2df',
    inactiveTint: '#7C7C8A',
  },
};

export const tabStyles = {
  screenOptions: (
    insets: { bottom: number },
    baseTabContentHeight: number,
    colors: TabColors = tabColors.dark
  ) => ({
    tabBarActiveTintColor: colors.activeTint,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingTop: 5,
      height: baseTabContentHeight + insets.bottom,
      paddingBottom: insets.bottom,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontFamily: 'ManropeRegular',
      marginTop: 6,
    },
    tabBarInactiveTintColor: colors.inactiveTint,
    tabBarItemStyle: {
      paddingBottom: 0,
    },
  }),
};
