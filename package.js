Package.describe({
  name: 'meteorengine:payments',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Payments package for meteorengine:shop. Currently only supports Stripe',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  'shelljs': '0.5.3'
});

Package.onUse(function (api) {
  var path = Npm.require('path');

  var clientFiles = [];
  var libFiles = [];
  var serverFiles = [];

  var client = 'client';
  var lib = 'lib';
  var server = 'server';

  api.versionsFrom('1.1.0.3');
  api.use(['mongo', 'templating', 'tracker', 'reactive-var']);
  api.use(['aldeed:collection2@2.3.3', 'grigio:babel@0.1.6', 'iron:router@1.0.9']);
  api.use('alanning:roles@1.2.13');

  //  Maybe make a sub-package 'meteorengine:payments-stripe', 'meteorengine:payments-paypal' to be able to support paypal, bitcoin, etc
  api.imply('mrgalaxy:stripe@2.1.0');

  // Depend on core shop package
  api.use('meteorengine:shop', {unordered: true});

  //  Push files
  var templates = path.join(client, 'templates');
  var app = {
    client: path.join(client, 'app'),
    lib: path.join(lib, 'app')
  };


  //  Client files
  // clientFiles.push(path.join(app.client, 'stripe.es6.js'));
  clientFiles.push(path.join(app.client, 'global.es6.js'));
  clientFiles.push(path.join(app.client, 'helpers.es6.js'));
  clientFiles.push(path.join(client, 'routes.es6.js'));

  //  Client - templates
  clientFiles.push(path.join(templates, 'buynow', 'buynow.html'));
  clientFiles.push(path.join(templates, 'buynow', 'buynow.es6.js'));
  clientFiles.push(path.join(templates, 'checkout', 'checkout.html'));
  clientFiles.push(path.join(templates, 'checkout', 'checkout.es6.js'));
  clientFiles.push(path.join(templates, 'checkout', 'gotocheckout.html'));
  clientFiles.push(path.join(templates, 'checkout', 'gotocheckout.js'));
  clientFiles.push(path.join(templates, 'purchase', 'purchase.html'));
  clientFiles.push(path.join(templates, 'purchase', 'purchase.es6.js'));
  clientFiles.push(path.join(templates, 'receipt', 'receipt.html'));
  clientFiles.push(path.join(templates, 'receipt', 'receipt.es6.js'));
  clientFiles.push(path.join(templates, 'setup', 'setup.html'));
  clientFiles.push(path.join(templates, 'setup', 'setup.es6.js'));

  //  Lib files
  libFiles.push(path.join(app.lib, 'app.js'));
  libFiles.push(path.join(lib, 'collections.js'));
  libFiles.push(path.join(lib, 'schema.js'));

  // Server files
  serverFiles.push(path.join(server, 'methods.es6.js'));
  serverFiles.push(path.join(server, 'publications.es6.js'));

  //  Add all files
  api.addFiles(libFiles, ['client', 'server']);
  api.addFiles(clientFiles, 'client');
  api.addFiles(serverFiles, 'server');

  api.export('ME', ['client', 'server']);
});
