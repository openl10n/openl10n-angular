app.config(function($stateProvider, $urlRouterProvider) {
  // Redirect 404 to homepage
  $urlRouterProvider.otherwise('/');

  // Routing
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'LoginController',
    })
    .state('dashboard', {
      url: '/',
      menu: 'dashboard',
      templateUrl: 'partials/dashboard.html',
      controller: 'DashboardController',
      resolve: {
        projects: function(ProjectService) {
          return ProjectService.getProjects();
        },
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileController',
      resolve: {
        user: function(AuthenticationService) {
          return AuthenticationService.getCurrentUser();
        }
      }
    })
    .state('project', {
      url: '/project/{slug:[a-zA-Z0-9\-\.\_]+}',
      menu: 'translate',
      templateUrl: 'partials/project.html',
      controller: 'ProjectController',
      resolve: {
        project: function($stateParams, ProjectService) {
          return ProjectService.getProject($stateParams.slug);
        },
        languages: function($stateParams, LanguageService) {
          return LanguageService.getLanguages($stateParams.slug);
        },
        resources: function($stateParams, ResourceService) {
          return ResourceService.getResources($stateParams.slug);
        },
      }
    })
    .state('translate', {
      url: '/project/:slug/translate',
      menu: 'translate',
      templateUrl: 'partials/translate.html',
      controller: 'EditorController',
      resolve: {
        project: function($stateParams, ProjectService) {
          return ProjectService.getProject($stateParams.slug);
        },
        languages: function($stateParams, LanguageService) {
          return LanguageService.getLanguages($stateParams.slug);
        },
        resources: function($stateParams, ResourceService) {
          return ResourceService.getResources($stateParams.slug);
        },
      }
    })
    .state('translate.source', {
      url: '/{source:[a-zA-Z\-_]+}',
      menu: 'translate',
      controller: 'EditorSourceController',
      // Setting the source locale doesn't change the UI so let's put an empty template
      template: '<ui-view/>'
    })
    .state('translate.source.target', {
      url: '/{target:[a-zA-Z\-_]+}',
      menu: 'translate',
      controller: 'EditorTargetController',
      template: '<ui-view/>'
    })
    .state('translate.source.target.phrase', {
      url: '/{id:[0-9]+}',
      menu: 'translate',
      templateUrl: 'partials/translate-phrase.html',
      controller: 'EditorPhraseController',
    })
    .state('glossary', {
      url: '/glossary',
      menu: 'glossary',
      templateUrl: 'partials/glossary.html',
      controller: 'GlossaryController',
    })
});

app.run(function($rootScope) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log(event);
  })
})
