var ybruin = module.exports = require('fis3');

ybruin.cli.name = 'ybruin';
ybruin.cli.info = require('./package.json');
ybruin.require.prefixes.unshift('ybruin', 'ybruin3');
ybruin.cli.version = require('./lib/version.js');
ybruin.cli.help = require('./lib/help.js');
ybruin.cli.run = require('./lib/run.js');
ybruin.file = require('./lib/file.js');

ybruin.config.set('project.ignore',['node_modules/**', 'output/**', '.git/**', 'ybruin-conf.js'])

ybruin.runComponentConf = require('./configs/componentDefault.js');
//alias
Object.defineProperty(global, 'ybruin', {
  enumerable : true,
  writable : false,
  value : ybruin
});
