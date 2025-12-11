import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FilterOptions {
  level: string;
  rating: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const LEVELS = ['Iniciante', 'Intermédio', 'Avançado', 'MAZA'];
const RATINGS = ['0-1', '1-2', '2-3', '3-4', '4-5'];

export default function FilterModal({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters 
}: FilterModalProps) {
  const [selectedLevel, setSelectedLevel] = useState(initialFilters?.level || 'Intermédio');
  const [selectedRating, setSelectedRating] = useState(initialFilters?.rating || '4-5');

  const handleApply = () => {
    onApply({ level: selectedLevel, rating: selectedRating });
    onClose();
  };

  const handleReset = () => {
    setSelectedLevel('Intermédio');
    setSelectedRating('4-5');
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar Cursos</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8F8F8F" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Nível</Text>
            <View style={styles.filterOptionsContainer}>
              <View style={styles.filterOptionsRow}>
                {LEVELS.slice(0, 3).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.filterOption, selectedLevel === level && styles.filterOptionSelected]}
                    onPress={() => setSelectedLevel(level)}
                  >
                    <Text
                      style={[styles.filterOptionText, selectedLevel === level && styles.filterOptionTextSelected]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterOptionsRow}>
                <TouchableOpacity
                  style={[styles.filterOption, selectedLevel === 'MAZA' && styles.filterOptionSelected]}
                  onPress={() => setSelectedLevel('MAZA')}
                >
                  <Text style={[styles.filterOptionText, selectedLevel === 'MAZA' && styles.filterOptionTextSelected]}>
                    Maza
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Avaliação</Text>
            <View style={styles.filterOptionsContainer}>
              <View style={styles.filterOptionsRow}>
                {RATINGS.slice(0, 3).map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterOption, selectedRating === rating && styles.filterOptionSelected]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === rating ? '#8257E5' : '#8F8F8F'}
                      style={styles.ratingIcon}
                    />
                    <Text style={[styles.filterOptionText, selectedRating === rating && styles.filterOptionTextSelected]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterOptionsRow}>
                {RATINGS.slice(3).map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterOption, selectedRating === rating && styles.filterOptionSelected]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === rating ? '#8257E5' : '#8F8F8F'}
                      style={styles.ratingIcon}
                    />
                    <Text style={[styles.filterOptionText, selectedRating === rating && styles.filterOptionTextSelected]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Limpar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#29292E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#29292E',
  },
  filterSection: {
    marginBottom: 24,
    backgroundColor: '#29292E',
  },
  filterSectionTitle: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  filterOptionsContainer: {
    backgroundColor: '#29292E',
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#29292E',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#29292E',
    gap: 4,
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
  },
  filterOptionText: {
    color: '#666',
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: '#8257E5',
  },
  ratingIcon: {
    marginRight: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8F8F8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#8F8F8F',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#2EA8FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});