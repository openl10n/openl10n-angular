(function() {
'use strict';

angular.module('app')
  .controller('TranslateController', TranslateController)
  .controller('TranslateSourceController', TranslateSourceController)
  .controller('TranslateTargetController', TranslateTargetController)
  .controller('TranslateTitleController', TranslateTitleController)
  .controller('TranslateMenuController', TranslateMenuController)
  .controller('TranslateDialogController', TranslateDialogController)

/**
 * @ngInject
 */
function TranslateTitleController($scope, editor) {
  $scope.editor = editor;
}

/**
 * @ngInject
 */
function TranslateMenuController($scope, $mdDialog, $mdSidenav, editor) {
  $scope.showDialog = function(event) {
    $mdDialog.show({
      controller: TranslateDialogController,
      locals: { editor: editor },
      templateUrl: 'views/translate/dialog-menu.html',
      targetEvent: event,
    })
  }

  $scope.openInfo = function() {
    editor.sidebarOpen = !editor.sidebarOpen;
  }
}

/**
 * @ngInject
 */
function TranslateDialogController($scope, $mdDialog, editor) {
  $scope.editor = editor;

  $scope.hide = function() {
    $mdDialog.hide();
  };
}

/**
 * @ngInject
 */
function TranslateController($scope, $state, editor) {
  console.log('TranslateController')

  $scope.editor = editor;

  $scope.$watch('editor.sourceLocale', updateRoute);
  $scope.$watch('editor.targetLocale', updateRoute);

  function updateRoute() {
    var path = 'root.translate.source';
    var params = {source: editor.project.defaultLocale};
    var options = {location: "replace", inherit: true, relative: $state.$current, notify: true};

    if (editor.sourceLocale) {
      params.source = editor.sourceLocale;
    }

    if (editor.targetLocale) {
      path += '.target';
      params.target = editor.targetLocale;
    }

    $state.go(path, params, options);
  }
}

/**
 * @ngInject
 */
function TranslateSourceController($scope, sourceLocale, editor) {
  console.log('TranslateSourceController')
  editor.sourceLocale = sourceLocale;
}

/**
 * @ngInject
 */
function TranslateTargetController($scope, hotkeys, targetLocale, editor) {
  console.log('TranslateTargetController')
  editor.targetLocale = targetLocale;

  editor.resetTranslations();

  // if (editor.translationGroups.length > 0) {
  //   editor.translationGroups[0].resource.expanded = true;
  //   editor.loadMore(editor.translationGroups[0]);
  // }

  hotkeys
    .bindTo($scope)
    .add({
      combo: 'tab',
      description: 'Select next translation',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: function(e) {
        e.preventDefault();
        editor.selectNextTranslation();
      }
    })
    .add({
      combo: 'shift+tab',
      description: 'Select previous translation',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: function(e) {
        e.preventDefault();
        editor.selectPreviousTranslation();
      }
    })
    .add({
      combo: 'esc',
      description: 'Unselected translation',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: function(e) {
        console.log('ESC');
        e.preventDefault();
        editor.activateTranslation(null);
      }
    })
    .add({
      combo: 'mod+enter',
      description: 'Save translation',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: function(e) {
        e.preventDefault();
        // if (!$scope.activedTranslation)
        //   return;
        // $scope.saveTranslation($scope.activedTranslation);
      }
    });
}

})();