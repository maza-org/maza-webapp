import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface Node {
  id: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  points: number;
  type: 'introduction' | 'information' | 'impact' | 'action';
  isColorful: boolean;
}

export default function Challenge(): React.ReactElement {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 1,
      title: 'Tempo e Clima',
      isActive: true,
      isCompleted: true,
      points: 10,
      type: 'introduction',
      isColorful: true,
    },
    {
      id: 2,
      title: 'Mudanças Climáticas',
      isActive: true,
      isCompleted: true,
      points: 10,
      type: 'information',
      isColorful: true,
    },
    {
      id: 3,
      title: 'Impactos',
      isActive: true,
      isCompleted: false,
      points: 10,
      type: 'impact',
      isColorful: false,
    },
    {
      id: 4,
      title: 'Acções de mitigação',
      isActive: false,
      isCompleted: false,
      points: 10,
      type: 'action',
      isColorful: false,
    },
    {
      id: 5,
      title: 'Impactos',
      isActive: false,
      isCompleted: false,
      points: 10,
      type: 'impact',
      isColorful: false,
    },
    {
      id: 6,
      title: 'Acções de mitigação',
      isActive: false,
      isCompleted: false,
      points: 10,
      type: 'action',
      isColorful: false,
    },
  ]);

  const handleNodePress = (id: number): void => {
    console.log(`Node ${id} pressed`);
  };

  const getNodeImage = (node: Node): string => {
    const baseColor = node.isColorful ? 'colorful' : 'grayscale';

    switch (node.type) {
      case 'introduction':
        return `/api/placeholder/180/100`;
      case 'information':
        return `/api/placeholder/180/100`;
      case 'impact':
        return `/api/placeholder/180/100`;
      case 'action':
        return `/api/placeholder/180/100`;
      default:
        return `/api/placeholder/180/100`;
    }
  };

  // Render a connection line between nodes
  const renderConnectionLine = (index: number): React.ReactElement | null => {
    // Skip if it's the last node
    if (index === nodes.length - 1) return null;

    // Determine if this is an even or odd index for layout
    const isEven = index % 2 === 0;

    // Determine active status
    const isActive = nodes[index].isActive && nodes[index + 1].isActive;

    return (
      <View
        style={[
          styles.connectionLine,
          isEven ? styles.rightCurve : styles.leftCurve,
          isActive ? styles.activeConnectionLine : styles.inactiveConnectionLine,
        ]}
      />
    );
  };

  const renderNode = (node: Node, index: number): React.ReactElement => {
    const isEven = index % 2 === 0;

    return (
      <View key={node.id} style={styles.nodeContainer}>
        <View style={[styles.nodeCardWrapper, isEven ? styles.leftNodeWrapper : styles.rightNodeWrapper]}>
          <TouchableOpacity
            style={[styles.nodeCard, !node.isActive && styles.inactiveNode]}
            onPress={() => handleNodePress(node.id)}
            disabled={!node.isActive}
          >
            <View style={styles.nodeContent}>
              <Text style={styles.nodeTitle}>{node.title}</Text>
              <Image source={{ uri: getNodeImage(node) }} style={styles.nodeImage} />
            </View>

            {!node.isActive && (
              <View style={styles.lockOverlay}>
                <View style={styles.lockIconContainer}>
                  <Feather name="lock" size={24} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Points indicator positioned at the center bottom of the card */}
          <View style={[styles.pointsContainer, !node.isActive && styles.inactivePointsContainer]}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746050593/maza/coin_xtcp3h.webp' }}
              style={styles.coinIcon}
            />
            <Text style={styles.pointsText}>{node.points}</Text>
          </View>
        </View>

        {renderConnectionLine(index)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mudanças Climáticas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {nodes.map((node, index) => renderNode(node, index))}
        <View style={{ height: 100 }} /> {/* Bottom padding */}
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  nodeContainer: {
    marginBottom: 50,
    position: 'relative',
  },
  nodeCardWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  leftNodeWrapper: {
    alignItems: 'flex-start',
  },
  rightNodeWrapper: {
    alignItems: 'flex-end',
  },
  nodeCard: {
    width: '70%',
    backgroundColor: '#202024',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#1fa2df',
  },
  inactiveNode: {
    borderColor: '#323238',
    backgroundColor: '#151517',
  },
  nodeContent: {
    padding: 0,
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nodeImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8E8E8',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1fa2df',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: -15,
    zIndex: 2,
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
  },
  inactivePointsContainer: {
    backgroundColor: '#000000',
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  pointsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  connectionLine: {
    position: 'absolute',
    borderWidth: 15,
    borderColor: '#1fa2df',
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  activeConnectionLine: {
    borderColor: '#1fa2df',
  },
  inactiveConnectionLine: {
    borderColor: '#323238',
  },
  rightCurve: {
    width: '60%',
    height: 60,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 80,
    top: '80%',
    left: '65%',
  },
  leftCurve: {
    width: '60%',
    height: 60,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 80,
    top: '80%',
    right: '65%',
  },
});
