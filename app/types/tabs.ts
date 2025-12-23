export const tabStyles = {
  screenOptions: (insets: { bottom: number }, baseTabContentHeight: number) => ({
    tabBarActiveTintColor: '#3485FF',
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#202024',
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
    tabBarInactiveTintColor: '#7C7C8A',
    tabBarItemStyle: {
      paddingBottom: 0,
    },
  }),
};
