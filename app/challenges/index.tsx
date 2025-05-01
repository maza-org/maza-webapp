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
import { Feather } from '@expo/vector-icons';

export default function Index() {
  interface Challenge {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    points: number;
    progress: number;
    currentStep: number;
    totalSteps: number;
    locked: boolean;
  }

  const challenges: Challenge[] = [
    {
      id: 1,
      title: 'Mudanças Climáticas',
      description: 'Lorem ipsum dolor sit amet, consectetur a...',
      imageUrl: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050596/maza/climate_xkuyks.webp',
      points: 100,
      progress: 10,
      currentStep: 1,
      totalSteps: 10,
      locked: false,
    },
    {
      id: 2,
      title: 'Reciclagem',
      description: 'Lorem ipsum dolor sit amet, consectetur a...',
      imageUrl: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050595/maza/trash_xiyohd.webp',
      points: 120,
      progress: 0,
      currentStep: 0,
      totalSteps: 10,
      locked: true,
    },
    {
      id: 3,
      title: 'Energias Renováveis',
      description: 'Lorem ipsum dolor sit amet, consectetur a...',
      imageUrl: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050595/maza/solar_mpxms9.webp',
      points: 120,
      progress: 0,
      currentStep: 0,
      totalSteps: 10,
      locked: true,
    },
  ];

  const renderChallengeCard = (challenge: Challenge) => {
    const progressPercentage = (challenge.currentStep / challenge.totalSteps) * 100;

    return (
      <TouchableOpacity key={challenge.id} style={styles.challengeCard} disabled={challenge.locked}>
        <ImageBackground
          source={{ uri: challenge.imageUrl }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          {/* Points badge */}
          <View style={styles.pointsBadge}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp' }}
              style={styles.coinIcon}
            />
            <Text style={styles.pointsText}>{challenge.points}</Text>
          </View>

          {/* Lock icon if locked */}
          {challenge.locked && (
            <View style={styles.lockContainer}>
              <View style={styles.lockBackground}>
                <Feather name="lock" size={24} color="#FFFFFF" />
              </View>
            </View>
          )}
        </ImageBackground>

        <View style={styles.cardContent}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {challenge.currentStep} /{challenge.totalSteps}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main content */}
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>Escolher Desafio</Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {challenges.map((challenge) => renderChallengeCard(challenge))}

          {/* Add some bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  challengeCard: {
    backgroundColor: '#202024',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    height: 180,
    justifyContent: 'space-between',
    padding: 15,
  },
  cardImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-end',
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
  lockContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  lockBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
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
    height: 6,
    flex: 1,
    backgroundColor: '#323238',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#1fa2df',
  },
  progressText: {
    color: '#A8A8B3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#202024',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: '#A8A8B3',
    marginTop: 5,
  },
  activeNavText: {
    color: '#1fa2df',
  },
});
