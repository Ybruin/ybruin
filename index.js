var fis = module.exports = require('fis3');

fis.cli.name = 'ybruin';
fis.cli.info = require('./package.json');
fis.require.prefixes.unshift('ybruin', 'fis3');
fis.cli.version = require('./lib/version.js');
fis.cli.help = require('./lib/help.js');
fis.cli.run = require('./lib/run.js');
fis.file = require('./lib/file.js');

fis.config.set('project.ignore',['node_modules/**', 'output/**', '.git/**', 'ybruin-conf.js'])

//mount scene
fis.runConf = require('./configs/default.js');

//alias
Object.defineProperty(global, 'ybruin', {
  enumerable : true,
  writable : false,
  value : fis
});