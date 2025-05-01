import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Challenge() {
  // Challenge nodes with progression data
  const [nodes, setNodes] = useState([
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
      title: 'Mudanças Climaticas',
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

  // Function to handle node click
  const handleNodePress = (id) => {
    // Handle node activation, completion, etc.
    console.log(`Node ${id} pressed`);
  };

  // Get image based on node type and status
  const getNodeImage = (node) => {
    // Placeholder function - in a real app, you would use actual images
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
  const renderConnectionLine = (index) => {
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

  // Render challenge node
  const renderNode = (node, index) => {
    const isEven = index % 2 === 0;

    return (
      <View key={node.id} style={styles.nodeContainer}>
        <TouchableOpacity
          style={[styles.nodeCard, !node.isActive && styles.inactiveNode, isEven ? styles.leftNode : styles.rightNode]}
          onPress={() => handleNodePress(node.id)}
          disabled={!node.isActive}
        >
          <View style={styles.nodeContent}>
            <Text style={styles.nodeTitle}>{node.title}</Text>
            <Image source={{ uri: getNodeImage(node) }} style={styles.nodeImage} />
            <View style={styles.pointsContainer}>
              <Image
                source={{ uri: '/api/placeholder/20/20' }} // Coin icon placeholder
                style={styles.coinIcon}
              />
              <Text style={styles.pointsText}>{node.points}</Text>
            </View>
          </View>

          {!node.isActive && (
            <View style={styles.lockOverlay}>
              <View style={styles.lockIconContainer}>
                <Feather name="lock" size={24} color="#FFFFFF" />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {renderConnectionLine(index)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
    marginBottom: 30,
    position: 'relative',
  },
  nodeCard: {
    width: '70%', // Reduced from 80% to make cards smaller
    backgroundColor: '#202024',
    borderRadius: 16, // Smaller border radius
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2, // Thinner border
    borderColor: '#1fa2df',
  },
  inactiveNode: {
    borderColor: '#323238',
  },
  leftNode: {
    alignSelf: 'flex-start',
  },
  rightNode: {
    alignSelf: 'flex-end',
  },
  nodeContent: {
    padding: 0,
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontSize: 14, // Smaller font
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8, // Less padding
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nodeImage: {
    width: '100%',
    height: 100, // Smaller height for the image
    backgroundColor: '#323238',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffc107',
    paddingVertical: 3,
    borderRadius: 10,
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
  },
  coinIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  pointsText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    borderWidth: 3, // Thinner line
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
    width: '60%', // Width of the connection
    height: 60, // Height/length of the connection
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 40,
    top: '50%', // Position at the middle of the card
    left: '65%', // Start position (from the left card)
  },
  leftCurve: {
    width: '60%', // Width of the connection
    height: 60, // Height/length of the connection
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 40,
    top: '50%', // Position at the middle of the card
    right: '65%', // Start position (from the right card)
  },
});
