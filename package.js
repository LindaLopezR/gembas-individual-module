Package.describe({
  name: 'igoandsee:gembas-individual-module',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1');
  api.use('blaze-html-templates@1.0.4');
  api.use('ecmascript');
  api.use('templating');
  api.use('session');
  api.use('tap:i18n@1.8.2');
  api.use('igoandsee:categories-collection');
  api.use('igoandsee:locations-collection');
  api.use('igoandsee:tasks-collection');
  api.use('igoandsee:tasks-lists-collection');
  api.mainModule('gembas-individual-module.js', 'client');
});

Npm.depends({
  moment: '2.18.1',
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('gembas-individual-module');
  api.mainModule('gembas-individual-module-tests.js');
});
