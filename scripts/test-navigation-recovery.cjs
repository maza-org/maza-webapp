const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');
const ts = require('typescript');
const moduleResult = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('src/navigation/linking.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(`(function(module,exports){${code}})`)(moduleResult, moduleResult.exports);
const { appLinkingConfig } = moduleResult.exports;
const corePath = pathToFileURL(path.resolve('node_modules/@react-navigation/core/lib/module/getStateFromPath.js')).href;
const routerPath = pathToFileURL(path.resolve('node_modules/@react-navigation/routers/lib/module/index.js')).href;

test('every authenticated secondary deep link has a real Main back destination', async () => {
  const { getStateFromPath } = await import(corePath);
  const { StackRouter, CommonActions } = await import(routerPath);
  const config = appLinkingConfig(true, true);
  const options = { routeNames: Object.keys(config.screens), routeParamList: {}, routeGetIdList: {} };
  const paths = ['certificados', 'notificacoes', 'preferencias/notificacoes', 'definicoes', 'perfil/editar', 'perfil/mudar-senha', 'resultados-profissionais', 'curso/course-1', 'curso/course-1/aula/lesson-1', 'curso/course-1/avaliacao', 'curso/course-1/comunidade', 'oportunidades/job-1', 'como-funciona', 'avaliacao-inicial'];
  for (const url of paths) {
    const parsed = getStateFromPath('/' + url, config);
    assert(parsed, url);
    assert.equal(parsed.routes[0].name, 'Main', url);
    assert.equal(parsed.routes.length, 2, url);
    const router = StackRouter({ initialRouteName: 'Main' });
    const state = router.getRehydratedState(parsed, options);
    const back = router.getStateForAction(state, CommonActions.goBack(), options);
    assert.equal(back.routes[back.index].name, 'Main', url);
  }
});
test('primary tab deep links and existing home aliases survive refresh', async () => {
  const { getStateFromPath } = await import(corePath);
  for (const [url, tab] of [['/', 'Início'], ['/In%C3%ADcio', 'Início'], ['/inicio', 'Início'], ['/Cursos', 'Cursos'], ['/Conquistas', 'Conquistas'], ['/Oportunidades', 'Oportunidades'], ['/Perfil', 'Perfil']]) {
    const state = getStateFromPath(url, appLinkingConfig(true, true));
    assert(state, `Unresolved primary tab URL: ${url}`);
    const main = state.routes[state.index ?? state.routes.length - 1];
    assert.equal(main.name, 'Main');
    if (main.state) assert.equal(main.state.routes[main.state.index ?? main.state.routes.length - 1].name, tab, url);
    else assert.equal(tab, 'Início');
  }
});
test('guest and required-assessment routes retain their access boundary and back destination', async () => {
  const { getStateFromPath } = await import(corePath);
  const guest = appLinkingConfig(false, false);
  for (const url of ['/recuperar-senha', '/nova-senha', '/curso/course-1']) assert.equal(getStateFromPath(url, guest).routes[0].name, 'Login');
  assert.equal(getStateFromPath('/certificados', guest), undefined);
  const pending = appLinkingConfig(true, false);
  assert.equal(getStateFromPath('/curso/course-1', pending).routes[0].name, 'BotAssessment');
  assert.equal(getStateFromPath('/certificados', pending), undefined);
});
