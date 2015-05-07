Package.describe({
  name: 'numtel:pg',
  summary: 'PostgreSQL support with Reactive Select Subscriptions',
  version: '0.0.4',
  git: 'https://github.com/numtel/meteor-pg.git'
});

Npm.depends({
  'pg': '4.3.0',
  'pg-live-select': '0.0.10'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use([
    'underscore',
    'ddp',
    'tracker'
  ]);

  api.addFiles('lib/LivePg.js', 'server');
  api.export('LivePg', 'server');
  api.export('pg', 'server');

  api.addFiles('lib/PgSubscription.js');
  api.export('PgSubscription');
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'templating',
    'underscore',
    'autopublish',
    'insecure',
    'grigio:babel@0.1.1',
    'numtel:pg-server@0.0.1',
    'numtel:pg'
  ]);
  api.use('test-helpers'); // Did not work concatenated above
  api.addFiles([
    'test/helpers/expectResult.js',
    'test/helpers/randomString.js'
  ]);

  api.addFiles([
    'test/fixtures/tpl.html',
    'test/fixtures/tpl.js'
  ], 'client');

  api.addFiles([
    'test/settings/test.pg.json', // Change Postgres port in this file
    'test/helpers/querySequence.js',
    'test/index.es6'
  ], 'server');

  api.addFiles([
    'test/PgSubscription.js'
  ]);
});
