#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var name = 'ybruin';

var cli = new Liftoff({
  name: name,
  processTitle: name,
  moduleName: name,
  configName: 'ybruin-conf',

  // only js supported!
  extensions: {
    '.js': null
  }
});

cli.launch({
  cwd: argv.r || argv.root,
  configPath: argv.f || argv.file
}, function(env) {
  var fis;
  if (!env.modulePath) {
    fis = require('../');
  } else {
    fis = require(env.modulePath);
  }

  fis.require.paths.push(path.join(env.cwd, 'node_modules', name));
  fis.require.paths.push(path.join(path.dirname(__dirname)));
  fis.cli.run(argv, env);
});
