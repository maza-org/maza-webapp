import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const PathScreen = () => {
  const { course } = useLocalSearchParams();
  const courseData = JSON.parse(course);

  // State to track completed modules
  const [completedModules, setCompletedModules] = useState([]);

  // Function to handle module click
  const handleModulePress = (moduleId, moduleTitle, isLocked = false) => {
    if (isLocked) {
      Alert.alert('Módulo Bloqueado', 'Complete os módulos anteriores para desbloquear este.');
      return;
    }

    Alert.alert('Módulo Selecionado', `Você selecionou: ${moduleTitle}`, [
      {
        text: 'Começar a Aprender',
        onPress: () => {
          // Find the module object by ID
          const module = courseData.modules.find((m) => m.id === moduleId);

          // Navigate to module content using router
          router.push({
            pathname: '/room/watch',
            params: {
              module: JSON.stringify(module),
              author: courseData?.author,
              title: courseData?.title,
              imageUrl: courseData?.cover?.formats?.thumbnail?.url,
            },
          });

          // Mark as completed for demo purposes
          if (!completedModules.includes(moduleId)) {
            setCompletedModules([...completedModules, moduleId]);
          }
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  // Function to check if module is completed
  const isModuleCompleted = (moduleId) => {
    return completedModules.includes(moduleId);
  };

  // Get module icons based on index
  const getModuleIcon = (index: number) => {
    const icons = ['book', 'dollar-sign', 'trending-up'];
    return icons[index % icons.length];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with Back button and Course Description */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.courseHeader}
          onPress={() => Alert.alert('Informações do Curso', courseData.title)}
        >
          <View style={styles.courseImageContainer}>
            <Image
              style={styles.courseImage}
              source={{ uri: courseData.picture?.url || courseData.cover?.url }}
              contentFit="cover"
            />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseCategory}>
              {courseData.subjects && courseData.subjects.length > 0 ? courseData.subjects[0].name : 'Curso'}
            </Text>
            <Text style={styles.courseTitle}>{courseData.title}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Green divider */}
      <View style={styles.divider} />

      <ScrollView style={styles.scrollView}>
        {/* First Module - Always Main Module */}
        {courseData.modules && courseData.modules.length > 0 && (
          <TouchableOpacity
            style={styles.moduleContainer}
            onPress={() => handleModulePress(courseData.modules[0].id, courseData.modules[0].title)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.circleModule, isModuleCompleted(courseData.modules[0].id) ? styles.completedModule : {}]}
            >
              <View style={styles.iconContainer}>
                <Feather name={getModuleIcon(0)} size={36} color="#333" />
                {isModuleCompleted(courseData.modules[0].id) && (
                  <View style={styles.checkmarkContainer}>
                    <Feather name="check-circle" size={24} color="#2ecc71" />
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.moduleTitle}>{courseData.modules[0].title}</Text>
          </TouchableOpacity>
        )}

        {/* Dashed line connector */}
        {courseData.modules && courseData.modules.length > 1 && <View style={styles.dashedConnectorRight} />}

        {/* Second Module */}
        {courseData.modules && courseData.modules.length > 1 && (
          <TouchableOpacity
            style={styles.rightAlignedModule}
            onPress={() => handleModulePress(courseData.modules[1].id, courseData.modules[1].title)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.smallCircleModule,
                isModuleCompleted(courseData.modules[1].id) ? styles.completedModule : {},
              ]}
            >
              <View style={styles.iconContainer}>
                <Feather name={getModuleIcon(1)} size={30} color="#333" />
                {isModuleCompleted(courseData.modules[1].id) && (
                  <View style={styles.checkmarkContainer}>
                    <Feather name="check-circle" size={20} color="#2ecc71" />
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.moduleSubtitle}>{courseData.modules[1].title}</Text>
          </TouchableOpacity>
        )}

        {/* Dashed line connector */}
        {courseData.modules && courseData.modules.length > 2 && <View style={styles.dashedConnectorLeft} />}

        {/* Third Module */}
        {courseData.modules && courseData.modules.length > 2 && (
          <TouchableOpacity
            style={styles.leftAlignedModule}
            onPress={() => handleModulePress(courseData.modules[2].id, courseData.modules[2].title)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.smallCircleModule,
                isModuleCompleted(courseData.modules[2].id) ? styles.completedModule : {},
              ]}
            >
              <View style={styles.iconContainer}>
                <Feather name={getModuleIcon(2)} size={30} color="#333" />
                {isModuleCompleted(courseData.modules[2].id) && (
                  <View style={styles.checkmarkContainer}>
                    <Feather name="check-circle" size={20} color="#2ecc71" />
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.moduleSubtitle}>{courseData.modules[2].title}</Text>
          </TouchableOpacity>
        )}

        {/* Final Test Section if exists */}
        {courseData.final_test ? (
          <>
            <TouchableOpacity
              style={styles.sectionHeaderContainer}
              onPress={() => Alert.alert('Teste Final', `Teste seus conhecimentos de ${courseData.title}.`)}
            >
              <Text style={styles.sectionHeaderSubtitle}>Avaliação</Text>
              <Text style={styles.sectionHeaderTitle}>Teste Final</Text>
              <Text style={styles.pointsText}>Nota de aprovação: 70%</Text>
              <Text style={styles.pointsText}>Duração: 8 minutos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moduleContainer}
              onPress={() =>
                Alert.alert('Teste Final', 'Iniciar o teste final?', [
                  {
                    text: 'Iniciar Teste',
                    onPress: () => {
                      // Navigate to quiz screen using the provided pattern
                      router.push({
                        pathname: '/room/quiz',
                        params: {
                          content: JSON.stringify(courseData.final_test),
                        },
                      });
                    },
                  },
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                ])
              }
              activeOpacity={0.7}
            >
              <View style={styles.testModule}>
                <View style={styles.iconContainer}>
                  <Feather name="award" size={36} color="#333" />
                </View>
              </View>
              <Text style={styles.moduleTitle}>Iniciar Teste</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Show completion section if no final test
          <TouchableOpacity
            style={styles.sectionHeaderContainer}
            onPress={() => Alert.alert('Curso Completo', `Parabéns por completar o curso ${courseData.title}!`)}
          >
            <Text style={styles.sectionHeaderSubtitle}>Conclusão</Text>
            <Text style={styles.sectionHeaderTitle}>Curso Completo</Text>
            <Text style={styles.pointsText}>Alunos inscritos: {courseData.subscribed}</Text>
            <Text style={styles.pointsText}>Avaliação: {courseData.rating_avg}/5</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#121214',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1a1f2c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121214',
  },
  courseImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseInfo: {
    marginLeft: 12,
  },
  courseCategory: {
    color: '#00a8e8',
    fontSize: 14,
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 4,
    backgroundColor: '#2ecc71',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  moduleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circleModule: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f7ff',
    borderWidth: 4,
    borderColor: '#00a8e8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  smallCircleModule: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f7ff',
    borderWidth: 4,
    borderColor: '#00a8e8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  testModule: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff3e0',
    borderWidth: 4,
    borderColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  completedModule: {
    borderColor: '#2ecc71',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  moduleSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  rightAlignedModule: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 30,
    marginBottom: 20,
  },
  leftAlignedModule: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginBottom: 20,
  },
  dashedConnectorRight: {
    width: 80,
    height: 1,
    borderWidth: 1,
    borderColor: '#00a8e8',
    borderStyle: 'dashed',
    position: 'absolute',
    top: 190,
    right: 130,
    transform: [{ rotate: '45deg' }],
  },
  dashedConnectorLeft: {
    width: 80,
    height: 1,
    borderWidth: 1,
    borderColor: '#00a8e8',
    borderStyle: 'dashed',
    position: 'absolute',
    top: 310,
    left: 110,
    transform: [{ rotate: '-45deg' }],
  },
  sectionHeaderContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    padding: 10,
  },
  sectionHeaderSubtitle: {
    color: '#00a8e8',
    fontSize: 16,
  },
  sectionHeaderTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
  },
  pointsText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default PathScreen;
