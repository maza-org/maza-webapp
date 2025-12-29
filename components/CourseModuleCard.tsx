import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Module, UserCourseModule } from '@/types/learning';

// Unified module data for display
export interface CourseModuleData {
  id: number;
  moduleId: number;
  title: string;
  progress: number;
  completedContents: number;
  totalContents: number;
  isCompleted: boolean;
  // Original data for navigation
  originalModule: Module | UserCourseModule;
}

interface CourseModuleCardProps {
  module: CourseModuleData;
  index: number;
  showProgress: boolean;
  onPress: (module: CourseModuleData) => void;
}

export default function CourseModuleCard({
  module,
  index,
  showProgress,
  onPress,
}: CourseModuleCardProps) {
  return (
    <TouchableOpacity
      style={styles.moduleItem}
      onPress={() => onPress(module)}
    >
      <View style={styles.moduleContent}>
        <View style={styles.moduleTopRow}>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleNumber}>{index + 1}.</Text>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>
          <View style={styles.moduleDetails}>
            {module.isCompleted ? (
              <View style={styles.completedIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <Ionicons name="play" size={20} color="#4db5ff" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.moduleMetaRow}>
          <View style={styles.videoCount}>
            <Feather name="film" size={14} color="#A8A8B3" />
            <Text style={styles.videoCountText}>
              {showProgress
                ? `${module.completedContents}/${module.totalContents} aulas`
                : `${module.totalContents} aulas`}
            </Text>
          </View>
        </View>

        {showProgress && !module.isCompleted && (
          <View style={styles.moduleProgressContainer}>
            <View style={styles.moduleProgressBar}>
              <View style={[styles.moduleProgressFill, { width: `${module.progress}%` }]} />
            </View>
            <Text style={styles.moduleProgressText}>{Math.round(module.progress)}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  moduleItem: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  moduleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  moduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#2a2d3e',
    borderRadius: 50,
    padding: 5,
  },
  completedIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginStart: 25,
  },
  videoCountText: {
    color: '#A8A8B3',
    fontSize: 12,
  },
  moduleProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginStart: 25,
    gap: 8,
  },
  moduleProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#323238',
    borderRadius: 2,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 2,
  },
  moduleProgressText: {
    color: '#1fa2df',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});
