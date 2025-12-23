import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Subject } from '@/app/types/profile';

interface InterestsSectionProps {
  interests: Subject[];
  isEditing: boolean;
  deletingInterestId: number | null;
  onToggleEditing: () => void;
  onDeleteInterest: (subject: Subject) => void;
  onAddInterest: () => void;
}

export default function InterestsSection({
  interests,
  isEditing,
  deletingInterestId,
  onToggleEditing,
  onDeleteInterest,
  onAddInterest,
}: InterestsSectionProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.headerContainer}>
        <View style={styles.infoHeader}>
          <Feather name="star" size={20} color="#1fa2df" />
          <Text style={styles.infoLabel}>Interesses</Text>
        </View>
        {interests && interests.length > 0 && (
          <TouchableOpacity onPress={onToggleEditing} style={styles.editButton}>
            <Feather name={isEditing ? 'check' : 'edit-2'} size={16} color="#1fa2df" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.interestsContainer}>
        {interests && interests.length > 0 ? (
          <View style={styles.interestsList}>
            {interests.map((subject: Subject) => (
              <View key={subject.id} style={styles.interestTag}>
                <View style={styles.interestIconContainer}>
                  <Feather name="hash" size={14} color="#1fa2df" />
                </View>
                <Text style={styles.interestText}>{subject.name}</Text>
                {isEditing &&
                  (deletingInterestId === subject.id ? (
                    <ActivityIndicator size="small" color="#1fa2df" style={styles.deleteInterestLoading} />
                  ) : (
                    <TouchableOpacity onPress={() => onDeleteInterest(subject)} style={styles.deleteInterestButton}>
                      <Feather name="x" size={14} color="#1fa2df" />
                    </TouchableOpacity>
                  ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum interesse adicionado</Text>
            <TouchableOpacity style={styles.addInterestButton} onPress={onAddInterest}>
              <Feather name="plus" size={16} color="#FFF" />
              <Text style={styles.addInterestText}>Adicionar Interesses</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    gap: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
  },
  interestsContainer: {
    marginLeft: 28,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(31, 162, 223, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 162, 223, 0.2)',
  },
  interestIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteInterestButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteInterestLoading: {
    width: 24,
    height: 24,
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    color: '#A8A8B3',
    fontSize: 14,
    textAlign: 'center',
  },
  addInterestButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1fa2df',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  addInterestText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
