var fis = module.exports = require('fis3');
fis.cli.name = 'ybruin';
fis.cli.info = require('./package.json');
fis.require.prefixes.unshift('ybruin', 'fis3');
fis.cli.version = require('./version.js');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];

//mount scene
fis.runConf = require('./configs/default.js');

//alias
Object.defineProperty(global, 'ybruin', {
  enumerable : true,
  writable : false,
  value : fis
});