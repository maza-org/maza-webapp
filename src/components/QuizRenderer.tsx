import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomSafeSpace } from '../utils/safeArea';

type Question = {
  id: string; questionType: string; text: string;
  options: string; explanation?: string | null; points: number;
};

export default function QuizRenderer({
  quiz, onComplete, submitEndpoint, mode = 'quiz',
}: {
  quiz: { id: string; timeLimit?: number; questions: Question[] };
  onComplete: (result?: any) => void;
  submitEndpoint?: string;
  mode?: 'quiz' | 'impact';
}) {
  const insets = useSafeAreaInsets();
  const total = quiz.questions.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  // Overall Quiz Timer
  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit && quiz.timeLimit > 0 ? quiz.timeLimit : 15) * 60);
  const [phase, setPhase] = useState<'quiz' | 'submitting' | 'done'>('quiz');
  const [result, setResult] = useState<any>(null);
  const timerRef = useRef<any>(null);
  const currentQ = total > 0 ? quiz.questions[idx] : null;

  useEffect(() => {
    if (phase !== 'quiz') {
      clearInterval(timerRef.current);
      return;
    }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { 
          clearInterval(timerRef.current); 
          submit(); // Time's up! Submit quiz
          return 0; 
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const shuffledOptions = React.useMemo(() => {
    if (!currentQ || currentQ.questionType !== 'ORDERING') return [];
    const arr = (() => { try { return JSON.parse(currentQ.options); } catch { return []; } })();
    return arr.map((text: string, i: number) => ({ text, index: i })).sort(() => Math.random() - 0.5);
  }, [currentQ?.id]);

  const pick = (val: string) => {
    if (!currentQ) return;
    setAnswers((p) => ({ ...p, [currentQ.id]: val }));
    setConfirmed((p) => ({ ...p, [currentQ.id]: true }));
  };

  const goNext = () => {
    if (idx < total - 1) setIdx((i) => i + 1);
    else submit();
  };

  const goPrevious = () => {
    if (idx > 0) setIdx((i) => i - 1);
  };

  const reviseCurrent = () => {
    if (!currentQ) return;
    setConfirmed((p) => ({ ...p, [currentQ.id]: false }));
  };

  const submit = async () => {
    clearInterval(timerRef.current);
    setPhase('submitting');
    try {
      const final: Record<string, string> = { ...answers };
      quiz.questions.forEach((q) => { if (!final[q.id]) final[q.id] = ''; });
      const res = await api.post(submitEndpoint ?? `/quizzes/${quiz.id}/submit`, {
        answers: quiz.questions.map((q) => ({ questionId: q.id, answerData: final[q.id] })),
      });
      setResult(res.data);
      setPhase('done');
    } catch (err: any) {
      const detail = err?.response?.data?.message || err?.response?.data?.error;
      Alert.alert(
        'Erro',
        detail || (mode === 'impact'
          ? 'Não foi possível guardar a avaliação. Tente novamente.'
          : 'Não foi possível submeter o quiz.')
      );
      setPhase('quiz');
    }
  };

  if (total === 0) return (
    <View style={s.center}><Text style={s.muted}>Quiz sem perguntas ainda.</Text></View>
  );

  if (phase === 'submitting') return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={s.muted}>A submeter...</Text>
    </View>
  );

  // ── Results ──
  if (phase === 'done' && result) {
    if (mode === 'impact') {
      const impactValue = result.impact?.impactPercent;
      return (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: bottomSafeSpace(insets.bottom, 24) }}>
          <View style={[s.scoreCard, { backgroundColor: '#E0F2FE' }]}>
            <View style={s.scoreEmoji}>
              <Ionicons name="analytics-outline" size={56} color="#0284C7" />
            </View>
            <Text style={[s.scoreTitle, { color: '#075985' }]}>Avaliação registada</Text>
            <Text style={s.scorePct}>{result.percentage}%</Text>
            <Text style={[s.scorePts, { textAlign: 'center', lineHeight: 22 }]}>
              Não se preocupe com a pontuação. Isto ajuda-nos a perceber o seu ponto de partida para aprender melhor.
            </Text>
            {impactValue !== null && impactValue !== undefined ? (
              <Text style={[s.scorePts, { marginTop: 10, color: '#047857', fontWeight: '800' }]}>
                Impacto de aprendizagem: {impactValue}%
              </Text>
            ) : null}
          </View>

          <View style={s.impactNoteCard}>
            <Text style={s.impactNoteTitle}>Pode começar a aprender</Text>
            <Text style={s.impactNoteText}>
              O objetivo é ganhar novas competências ao longo do curso. No fim, fará a mesma avaliação para vermos a sua evolução.
            </Text>
          </View>

          <TouchableOpacity style={s.bigBtn} onPress={() => onComplete(result)}>
            <Text style={s.bigBtnTxt}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: bottomSafeSpace(insets.bottom, 24) }}>
        <View style={[s.scoreCard, { backgroundColor: result.passed ? '#DCFCE7' : '#FEF2F2' }]}>
          <View style={s.scoreEmoji}>
            <Ionicons name={result.passed ? 'ribbon-outline' : 'sad-outline'} size={56} color={result.passed ? '#166534' : '#991B1B'} />
          </View>
          <Text style={[s.scoreTitle, { color: result.passed ? '#166534' : '#991B1B' }]}>
            {result.passed ? 'Parabéns! Passou!' : 'Não passou desta vez'}
          </Text>
          <Text style={s.scorePct}>{result.percentage}%</Text>
          <Text style={s.scorePts}>+{result.earnedPoints} pontos ganhos</Text>
        </View>

        <Text style={s.reviewTitle}>Revisão das Respostas</Text>
        {quiz.questions.map((q, i) => {
          const qr = result.results?.find((r: any) => r.questionId === q.id) ?? result.results?.[i];
          return (
            <View key={q.id} style={[s.reviewCard, { borderLeftColor: qr?.isCorrect ? '#22C55E' : '#EF4444' }]}>
              <Text style={s.muted}>Pergunta {i + 1}</Text>
              <Text style={s.reviewQ}>{q.text}</Text>
              <Text style={{ color: qr?.isCorrect ? '#16A34A' : '#DC2626', fontWeight: '600', marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={qr?.isCorrect ? 'checkmark-circle' : 'close-circle'} size={14} color={qr?.isCorrect ? '#16A34A' : '#DC2626'} />
                {qr?.isCorrect ? ' Correto' : ' Incorreto'}
                {qr?.earnedPoints > 0 ? `  +${qr.earnedPoints} pts` : ''}
              </Text>
              {q.explanation ? (
                <Text style={s.explanation}>
                  <Ionicons name="bulb-outline" size={13} color="#64748B" /> {q.explanation}
                </Text>
              ) : null}
            </View>
          );
        })}

        {result.passed
          ? <TouchableOpacity style={s.bigBtn} onPress={() => onComplete(result)}><Text style={s.bigBtnTxt}>Continuar</Text></TouchableOpacity>
          : <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#64748B' }]} onPress={() => {
              setIdx(0); setAnswers({}); setConfirmed({}); setPhase('quiz'); setResult(null);
            }}><Text style={s.bigBtnTxt}>Tentar Novamente</Text></TouchableOpacity>
        }
      </ScrollView>
    );
  }

  // ── Question ──
  if (!currentQ) return null;
  const opts: string[] = (() => { try { return JSON.parse(currentQ.options); } catch { return []; } })();
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  const timerColor = timeLeft <= 60 ? '#EF4444' : timeLeft <= 180 ? '#F59E0B' : '#22C55E';
  const actionLabel = idx < total - 1 ? 'Próxima Pergunta' : mode === 'impact' ? 'Guardar avaliação' : 'Submeter Quiz';
  const currentAnswer = answers[currentQ.id] ?? '';
  const currentConfirmed = confirmed[currentQ.id] === true;

  return (
    <View style={s.outer}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.muted}>Pergunta {idx + 1} / {total}</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${((idx + 1) / total) * 100}%` as any }]} />
          </View>
        </View>
        <View style={[s.timerCircle, { backgroundColor: timerColor }]}>
          <Text style={s.timerNum}>{timeStr}</Text>
        </View>
      </View>

      <ScrollView
        style={s.body}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.ptsBadge}><Text style={s.ptsText}>+{currentQ.points} pts</Text></View>
        <Text style={s.qText}>{currentQ.text}</Text>

        {/* MULTIPLE_CHOICE */}
        {currentQ.questionType === 'MULTIPLE_CHOICE' && opts.map((opt, i) => {
          const sel = currentAnswer === String(i);
          return (
            <TouchableOpacity key={i} onPress={() => pick(String(i))} disabled={currentConfirmed}
              style={[s.optCard, sel && s.optSel, currentConfirmed && !sel && { opacity: 0.45 }]}>
              <View style={[s.radio, sel && s.radioSel]}>{sel && <View style={s.radioInner} />}</View>
              <Text style={[s.optTxt, sel && s.optTxtSel]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {/* TRUE_FALSE */}
        {currentQ.questionType === 'TRUE_FALSE' && (
          <View style={s.tfRow}>
            {[{ l: ' Verdadeiro', v: '0', c: '#22C55E', i: 'checkmark-circle-outline' }, { l: ' Falso', v: '1', c: '#EF4444', i: 'close-circle-outline' }].map(({ l, v, c, i }) => (
              <TouchableOpacity key={v} onPress={() => pick(v)} disabled={currentConfirmed}
                style={[s.tfCard, currentAnswer === v && { backgroundColor: c, borderColor: c }]}>
                <Text style={[s.tfTxt, currentAnswer === v && { color: '#fff' }]}>
                  <Ionicons name={i as any} size={16} color={currentAnswer === v ? '#fff' : c} />{l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FILL_IN_THE_BLANK / SHORT_ANSWER */}
        {(currentQ.questionType === 'FILL_IN_THE_BLANK' || currentQ.questionType === 'SHORT_ANSWER') && (
          <>
            <TextInput
              style={[s.input, currentQ.questionType === 'SHORT_ANSWER' && { height: 100, textAlignVertical: 'top' }]}
              placeholder={currentQ.questionType === 'SHORT_ANSWER' ? 'Escreve a tua resposta' : 'Escreve a resposta'}
              placeholderTextColor={colors.textMuted}
              value={currentAnswer}
              onChangeText={(v) => !currentConfirmed && setAnswers((p) => ({ ...p, [currentQ.id]: v }))}
              multiline={currentQ.questionType === 'SHORT_ANSWER'}
              editable={!currentConfirmed}
            />
            {!currentConfirmed && (
              <TouchableOpacity style={s.confirmBtn} onPress={() => pick(currentAnswer)}>
                <Text style={s.confirmTxt}>Confirmar Resposta</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ORDERING */}
        {currentQ.questionType === 'ORDERING' && shuffledOptions.length > 0 && (
          <>
            <Text style={s.hint}>Toque nos itens pela ordem correcta:</Text>
            {shuffledOptions.map((item: { index: number; text: string }) => {
              const cur: number[] = (() => { try { return JSON.parse(currentAnswer || '[]'); } catch { return []; } })();
              const isSel = cur.includes(item.index);
              return (
                <TouchableOpacity key={item.index} disabled={currentConfirmed}
                  onPress={() => {
                    const c: number[] = (() => { try { return JSON.parse(currentAnswer || '[]'); } catch { return []; } })();
                    setAnswers((p) => ({ ...p, [currentQ.id]: JSON.stringify(isSel ? c.filter((x) => x !== item.index) : [...c, item.index]) }));
                  }}
                  style={[s.optCard, isSel && s.optSel]}>
                  {isSel && <Text style={s.orderNum}>{cur.indexOf(item.index) + 1}</Text>}
                  <Text style={[s.optTxt, isSel && s.optTxtSel]}>{item.text}</Text>
                </TouchableOpacity>
              );
            })}
            {!currentConfirmed && (
              <TouchableOpacity style={s.confirmBtn} onPress={() => pick(currentAnswer || '[]')}>
                <Text style={s.confirmTxt}>Confirmar Ordem</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* MATCHING */}
        {currentQ.questionType === 'MATCHING' && (
          <MatchingQuestion
            options={(() => { try { return JSON.parse(currentQ.options); } catch { return []; } })()}
            locked={currentConfirmed}
            currentAnswer={(() => { try { return JSON.parse(currentAnswer || '[]'); } catch { return []; } })()}
            onChange={(val: any) => setAnswers(p => ({ ...p, [currentQ.id]: JSON.stringify(val) }))}
            onConfirm={(val: any) => pick(JSON.stringify(val))}
          />
        )}

        {currentConfirmed && (
          <View style={s.answeredBanner}>
            <Text style={s.answeredTxt}>Resposta registada <Ionicons name="checkmark" size={14} color="#16A34A" /></Text>
          </View>
        )}
        {currentConfirmed && (
          <TouchableOpacity style={s.reviseBtn} onPress={reviseCurrent}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={s.reviseTxt}>Alterar resposta</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[s.footerNav, { paddingBottom: bottomSafeSpace(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[s.navBtn, s.prevBtn, idx === 0 && s.navBtnDisabled]}
          onPress={goPrevious}
          disabled={idx === 0}
        >
          <Ionicons name="arrow-back" size={16} color={idx === 0 ? '#94A3B8' : '#1E293B'} />
          <Text style={[s.prevTxt, idx === 0 && { color: '#94A3B8' }]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.navBtn, s.nextBtn, !currentConfirmed && s.navBtnDisabled]}
          onPress={goNext}
          disabled={!currentConfirmed}
        >
          <Text style={s.nextTxt}>{actionLabel}</Text>
          <Ionicons name={idx < total - 1 ? "arrow-forward" : "checkmark"} size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  scroll: { flex: 1, padding: 16 },
  muted: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  track: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  timerCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  timerNum: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  body: { flex: 1, padding: 20 },
  ptsBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  ptsText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  qText: { fontSize: 18, fontWeight: '700', color: '#0F172A', lineHeight: 26, marginBottom: 20 },
  optCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 10, backgroundColor: '#fff' },
  optSel: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  radioSel: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optTxt: { flex: 1, fontSize: 15, color: '#334155' },
  optTxtSel: { color: colors.primary, fontWeight: '600' },
  tfRow: { flexDirection: 'row', gap: 12 },
  tfCard: { flex: 1, padding: 18, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#fff' },
  tfTxt: { fontSize: 15, fontWeight: '700', color: '#334155' },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1e293b', backgroundColor: '#fff', marginBottom: 10 },
  confirmBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: 30, alignItems: 'center', marginBottom: 10 },
  confirmTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontStyle: 'italic' },
  orderNum: { color: '#fff', fontWeight: 'bold', fontSize: 13, minWidth: 22, textAlign: 'center', marginRight: 8, backgroundColor: colors.primary, borderRadius: 11, paddingVertical: 2, paddingHorizontal: 4 },
  answeredBanner: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  answeredTxt: { color: '#16A34A', fontWeight: '600' },
  reviseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginTop: 8 },
  reviseTxt: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  footerNav: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#F8FAFC' },
  navBtn: { minHeight: 52, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  prevBtn: { width: 118, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0' },
  nextBtn: { flex: 1, backgroundColor: '#1E293B' },
  navBtnDisabled: { opacity: 0.45 },
  prevTxt: { color: '#1E293B', fontWeight: 'bold', fontSize: 15 },
  nextTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Results
  scoreCard: { borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 20 },
  scoreEmoji: { fontSize: 48, marginBottom: 8 },
  scoreTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  scorePct: { fontSize: 52, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  scorePts: { fontSize: 16, color: '#64748B' },
  reviewTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, elevation: 1 },
  reviewQ: { fontSize: 14, color: '#1E293B', fontWeight: '600', lineHeight: 20, marginTop: 2 },
  explanation: { fontSize: 13, color: '#64748B', marginTop: 6, fontStyle: 'italic' },
  bigBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 12 },
  bigBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  impactNoteCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  impactNoteTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  impactNoteText: { fontSize: 14, color: '#475569', lineHeight: 22 },
});

function MatchingQuestion({ options, locked, currentAnswer, onChange, onConfirm }: any) {
  const rights = React.useMemo(() => {
    return options.map((o: any) => o.right).sort(() => Math.random() - 0.5);
  }, [options]);

  const getSelectedRight = (left: string) => currentAnswer.find((a: any) => a.left === left)?.right;

  const handleSelect = (left: string, right: string) => {
    if (locked) return;
    const filtered = currentAnswer.filter((a: any) => a.left !== left);
    onChange([...filtered, { left, right }]);
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={s.hint}>Para cada item, toque na opção correspondente:</Text>
      {options.map((pair: any, i: number) => {
        const selected = getSelectedRight(pair.left);
        return (
          <View key={i} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 }}>{pair.left}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {rights.map((r: string, ri: number) => {
                const isSel = selected === r;
                return (
                  <TouchableOpacity key={ri} onPress={() => handleSelect(pair.left, r)} disabled={locked}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: isSel ? '#3B82F6' : '#E2E8F0', backgroundColor: isSel ? '#EFF6FF' : '#F8FAFC' }}>
                    <Text style={{ color: isSel ? '#2563EB' : '#475569', fontWeight: isSel ? '700' : '500', fontSize: 14 }}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
      {!locked && (
        <TouchableOpacity style={[s.confirmBtn, { marginTop: 8 }]} onPress={() => onConfirm(currentAnswer)}>
          <Text style={s.confirmTxt}>Confirmar Correspondência</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
