const mainTabs = {
  path: '',
  initialRouteName: 'Início',
  screens: {
    'Início': { path: '', alias: ['Início', 'In%C3%ADcio', 'inicio'] },
    Cursos: 'Cursos',
    Oportunidades: 'Oportunidades',
    Conquistas: 'Conquistas',
    Perfil: 'Perfil',
  },
};

export function appLinkingConfig(authenticated: boolean, assessmentDone: boolean) {
  if (!authenticated) return {
    initialRouteName: 'Login',
    screens: { Login: '', Register: 'registar', ForgotPassword: 'recuperar-senha', ResetPassword: 'nova-senha', CourseDetail: 'curso/:courseId' },
  };
  if (!assessmentDone) return {
    initialRouteName: 'BotAssessment',
    screens: { BotAssessment: '', Main: { ...mainTabs, path: 'inicio' }, CourseDetail: 'curso/:courseId' },
  };
  return {
    // Deep links need a real in-app destination for the page's Back action.
    initialRouteName: 'Main',
    screens: {
      Main: mainTabs,
      CourseDetail: 'curso/:courseId',
      ImpactAssessment: 'curso/:courseId/avaliacao',
      LessonViewer: 'curso/:courseId/aula/:lessonId',
      JobDetail: 'oportunidades/:jobId',
      MyCertificates: 'certificados',
      NotificationsInbox: 'notificacoes',
      Notificacoes: 'preferencias/notificacoes',
      Configuracoes: 'definicoes',
      EditProfile: 'perfil/editar',
      ChangePassword: 'perfil/mudar-senha',
      CareerOutcomes: 'resultados-profissionais',
      CourseForum: 'curso/:courseId/comunidade',
      HowItWorksStory: 'como-funciona',
      BotAssessment: 'avaliacao-inicial',
    },
  };
}
