import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo and notification */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746484585/maza/maza_bqsdy2.webp' }}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
      </View>

      {/* Main content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeHeading}>Bem-vindo de volta, Clayton!</Text>
          <Text style={styles.welcomeSubheading}>Estás prontos para o desafio de hoje? 😉</Text>

          <View style={styles.statsContainer}>
            {/* Stats column - Modified to be vertical */}
            <View style={styles.statsColumn}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746082962/maza/fire_r4iaes.webp',
                    }}
                    style={styles.statIcon}
                  />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>3 dias</Text>
                  <Text style={styles.statLabel}>Sequência</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp',
                    }}
                    style={styles.statIcon}
                  />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>4263</Text>
                  <Text style={styles.statLabel}>Pontos</Text>
                </View>
              </View>
            </View>

            {/* Rank card */}
            <View style={styles.rankCard}>
              <Image
                source={{
                  uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746484475/maza/ctldpyy3f6dtyd7x5rri.webp',
                }}
                style={{ width: 90, height: 90 }}
                resizeMode="contain"
              />
              <View style={styles.rankBadge}>
                <Image
                  source={{
                    uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746484475/maza/ctldpyy3f6dtyd7x5rri.webp',
                  }}
                  style={styles.rankIcon}
                />
                <Text style={styles.rankText}>Gold Rank</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Continue section */}
        <View style={styles.continueSection}>
          <Text style={styles.sectionTitle}>Continue de onde parou...</Text>

          <View style={styles.challengeCard}>
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050596/maza/climate_xkuyks.webp' }}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <View style={styles.pointsBadge}>
                <Image
                  source={{
                    uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp',
                  }}
                  style={styles.coinIcon}
                />
                <Text style={styles.pointsText}>100</Text>
              </View>
            </ImageBackground>

            <View style={styles.cardContent}>
              <Text style={styles.challengeTitle}>Mudanças Climáticas</Text>
              <Text style={styles.challengeDescription}>Lorem ipsum dolor sit amet, consectetur adip...</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '10%' }]} />
                </View>
                <Text style={styles.progressText}>1/10</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              router.push('/missions/questions');
            }}
          >
            <Text style={styles.changeButtonTitle}>Mudar desafio</Text>
            <Text style={styles.changeButtonChallenge}>Mudanças Climáticas</Text>
          </TouchableOpacity>
        </View>

        {/* Add some bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginRight: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    backgroundColor: 'red',
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: '#202024',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  welcomeHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  welcomeSubheading: {
    fontSize: 14,
    color: '#A8A8B3',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // New style for the vertical column
  statsColumn: {
    flexDirection: 'column',
    width: '45%',
    gap: 10, // Add space between the stat cards
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#323238',
    borderRadius: 15,
    padding: 15,
  },
  statIconContainer: {
    marginRight: 10,
  },
  statIcon: {
    width: 30,
    height: 30,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#A8A8B3',
  },
  rankCard: {
    width: '45%',
    backgroundColor: '#FDD663',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  rankIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  rankText: {
    color: '#202024',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueSection: {
    marginTop: 25,
    backgroundColor: '#202024',
    padding: 14,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  challengeCard: {
    backgroundColor: '#202024',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 15,
    height: 130,
  },
  cardImageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 15,
    backgroundColor: '#242429',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 10,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  challengeDescription: {
    color: '#A8A8B3',
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    height: 8,
    flex: 1,
    backgroundColor: '#323238',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#1fa2df',
  },
  progressText: {
    color: '#A8A8B3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  changeButton: {
    backgroundColor: '#24B0F2',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  changeButtonTitle: {
    color: '#267DA7',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  changeButtonChallenge: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
