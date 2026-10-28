const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function transpile(source) {
  return ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
}
const utility = { exports: {} };
vm.runInNewContext(transpile(fs.readFileSync(path.join(root, 'src/utils/quizOptionOrder.ts'), 'utf8')), { exports: utility.exports, Math });
const { stableQuizOrder } = utility.exports;
test('shuffle preserves every option without mutating input', () => {
  const input = Object.freeze(['a', 'b', 'c', 'd']);
  assert.deepEqual([...stableQuizOrder(input, 'q1')].sort(), [...input]);
  assert.deepEqual([...input], ['a', 'b', 'c', 'd']);
});
test('matching choices stay stable through timer ticks, selections, locks and navigation', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/QuizRenderer.tsx'), 'utf8');
  const start = source.indexOf('function MatchingQuestion(');
  assert.ok(start > 0);
  const React = { useMemo: fn => fn(), createElement: (type, props, ...children) => ({ type, props, children: children.flat(Infinity) }) };
  const context = { React, stableQuizOrder, View: 'View', Text: 'Text', TouchableOpacity: 'Button', s: {}, Math };
  vm.createContext(context);
  vm.runInContext(transpile(source.slice(start)) + '\nthis.renderMatching = MatchingQuestion;', context);
  const pairs = [{ left: 'Coast', right: 'Waves' }, { left: 'Wildlife', right: 'Habitat' }, { left: 'Carbon', right: 'Storage' }];
  let answer = [];
  let confirmed;
  const buttons = node => [ ...(node.type === 'Button' ? [node] : []), ...node.children.filter(c => c && typeof c === 'object').flatMap(buttons) ];
  const render = (questionKey = 'q1', locked = false) => context.renderMatching({ questionKey, options: JSON.parse(JSON.stringify(pairs)), locked, currentAnswer: answer, onChange: value => { answer = value; }, onConfirm: value => { confirmed = value; } });
  const labels = node => buttons(node).slice(0, 9).map(b => b.children[0].children[0]);
  const original = labels(render());
  for (let tick = 0; tick < 60; tick++) assert.deepEqual(labels(render()), original);
  buttons(render())[1].props.onPress();
  assert.equal(answer[0].left, 'Coast');
  assert.equal(answer[0].right, original[1]);
  assert.deepEqual(labels(render()), original);
  buttons(render()).at(-1).props.onPress();
  assert.equal(confirmed, answer);
  assert.deepEqual(labels(render('q1', true)), original);
  buttons(render('q1', true))[0].props.onPress();
  assert.equal(answer[0].right, original[1]);
  render('q2');
  assert.deepEqual(labels(render('q1')), original);
});
