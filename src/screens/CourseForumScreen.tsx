import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Trash2, Star, Edit2 } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { bottomSafeSpace } from '../utils/safeArea';
import { compactActionShadow } from '../theme/shadows';
import * as Network from 'expo-network';
import { queueOfflineRequest } from '../services/offlineQueue';

type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name?: string; phone: string };
};

function initials(name?: string, phone?: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (phone ?? '?').slice(-2);
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return new Date(dateStr).toLocaleDateString('pt-PT');
}

export default function CourseForumScreen({ route, navigation }: any) {
  const { courseId, courseTitle } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const sendingRef = useRef(false);

  // Rating state
  const [myRating, setMyRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const res = await api.get(`/forum/courses/${courseId}/posts`);
      setPosts(res.data);
    } catch {}
    setLoading(false);
  }, [courseId]);

  const loadRating = useCallback(async () => {
    try {
      const res = await api.get(`/forum/courses/${courseId}/rating`);
      setAvgRating(res.data.average);
      setRatingCount(res.data.count);
      setMyRating(res.data.myRating);
    } catch {}
  }, [courseId]);

  useEffect(() => {
    loadPosts();
    loadRating();
  }, [loadPosts, loadRating]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    const content = text.trim();
    try {
      const networkState = await Network.getNetworkStateAsync().catch(() => null);
      if (networkState?.isConnected === false || networkState?.isInternetReachable === false) {
        Alert.alert('Sem ligação', 'As mensagens da comunidade precisam de internet. O texto ficará aqui para enviar quando voltar a estar online.');
        return;
      }
      if (editingPostId) {
        const res = await api.put(`/forum/posts/${editingPostId}`, { content });
        setPosts(prev => prev.map(p => p.id === editingPostId ? res.data : p));
        setEditingPostId(null);
      } else {
        const res = await api.post(`/forum/courses/${courseId}/posts`, { content });
        setPosts(prev => prev.some(p => p.id === res.data.id) ? prev : [...prev, res.data]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 200);
      }
      setText('');
    } catch {
      Alert.alert('Erro', 'Não foi possível guardar a mensagem.');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setText(post.content);
  };

  const handleDelete = async (postId: string) => {
    Alert.alert('Apagar mensagem', 'Tem a certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/forum/posts/${postId}`);
            setPosts(prev => prev.filter(p => p.id !== postId));
          } catch {
            Alert.alert('Erro', 'Não foi possível apagar.');
          }
        },
      },
    ]);
  };

  const handleRate = async (star: number) => {
    if (submittingRating) return;
    const previousRating = myRating;
    setMyRating(star); // optimistic update
    setSubmittingRating(true);
    try {
      const endpoint = `/forum/courses/${courseId}/rating`;
      const networkState = await Network.getNetworkStateAsync().catch(() => null);
      if (networkState?.isConnected === false || networkState?.isInternetReachable === false) {
        await queueOfflineRequest({ method: 'post', url: endpoint, data: { rating: Number(star) } });
        Alert.alert('Avaliação guardada', 'Será enviada automaticamente quando voltar a ter internet.');
        return;
      }
      const res = await api.post(endpoint, { rating: Number(star) });
      setAvgRating(res.data.average ?? res.data.newAverage ?? star);
      setRatingCount(res.data.count ?? ratingCount);
      setMyRating(res.data.myRating ?? star);
    } catch (error: any) {
      if (!error?.response) {
        await queueOfflineRequest({
          method: 'post',
          url: `/forum/courses/${courseId}/rating`,
          data: { rating: Number(star) },
        });
        Alert.alert('Avaliação guardada', 'Será enviada automaticamente quando voltar a ter internet.');
      } else {
        setMyRating(previousRating); // revert only when the server rejects the rating
        Alert.alert('Erro', 'Não foi possível enviar a avaliação. Tente de novo.');
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isMe = item.user.id === user?.id;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {!isMe && (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(item.user.name, item.user.phone)}</Text>
          </View>
        )}
        <View style={[styles.bubbleContent, isMe ? styles.bubbleContentMe : styles.bubbleContentOther]}>
          {!isMe && (
            <Text style={styles.bubbleName}>{item.user.name ?? item.user.phone}</Text>
          )}
          <Text style={styles.bubbleText}>{item.content}</Text>
          <Text style={styles.bubbleTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        {isMe && (
          <View style={styles.actionBtns}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
              <Edit2 size={14} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Trash2 size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Comunidade</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{courseTitle}</Text>
        </View>
      </View>

      <View style={styles.ratingBar}>
        <Text style={styles.ratingPrompt}>{myRating ? 'A sua avaliação:' : 'Avaliar este curso:'}</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRate(star)}
              disabled={submittingRating}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              activeOpacity={0.6}
              style={{ opacity: submittingRating ? 0.5 : 1 }}
            >
              <Star
                size={30}
                color="#F59E0B"
                fill={(myRating ?? 0) >= star ? '#F59E0B' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingInfo}>
          {avgRating > 0 ? `${avgRating.toFixed(1)} ★ · ${ratingCount} avaliações` : 'Sem avaliações ainda'}
        </Text>
        {submittingRating && <Text style={styles.ratingMine}>A enviar...</Text>}
        {myRating && !submittingRating && <Text style={styles.ratingMine}>A sua avaliação: {'\u2605'.repeat(myRating)}</Text>}
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      {/* Messages */}
      <View style={styles.messagesArea}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyEmoji}><Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} /></View>
            <Text style={styles.emptyTitle}>Seja o primeiro a partilhar!</Text>
            <Text style={styles.emptySub}>Partilhe dúvidas, ideias ou feedback sobre este curso.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={posts}
            keyExtractor={i => i.id}
            renderItem={renderPost}
            contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          />
        )}
      </View>

      {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: keyboardVisible ? 12 : bottomSafeSpace(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            onFocus={() => setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.white} />
              : editingPostId ? <Edit2 size={18} color={colors.white} /> : <Send size={18} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { marginRight: 10, padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textMuted },

  ratingBar: {
    backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center',
  },
  ratingPrompt: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  ratingStars: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  ratingInfo: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  ratingMine: { fontSize: 11, color: colors.primary, marginTop: 2 },

  chatArea: { flex: 1 },
  messagesArea: { flex: 1 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  bubbleMe: { justifyContent: 'flex-end' },
  bubbleOther: { justifyContent: 'flex-start' },

  avatarCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center',
    marginRight: 8, flexShrink: 0,
  },
  avatarText: { fontSize: 11, fontWeight: 'bold', color: colors.primary },

  bubbleContent: {
    maxWidth: '75%', borderRadius: 16, padding: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bubbleContentOther: { backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  bubbleContentMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },

  bubbleName: { fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 3 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },

  actionBtns: { flexDirection: 'row', marginLeft: 6 },
  actionBtn: { padding: 4, marginLeft: 2 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
    padding: 12, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: colors.background, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.text, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, ...compactActionShadow,
  },
  sendBtnDisabled: { backgroundColor: colors.textMuted, shadowOpacity: 0 },
});
