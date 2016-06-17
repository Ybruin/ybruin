var cli = module.exports = {};
var _ = require('fis3/lib/util.js');
var util = require('util');
fis.config.set('modules.commands',[ 'release', 'install', 'server'])

module.exports = function(cmdName, options, commands) {
  var strs = [
    '',
    ' Usage: ' + cli.name + ' ' + (cmdName ? cmdName : '<command>')
  ];
  if (!cmdName) {
    commands = {};
    fis.media().get('modules.commands', []).forEach(function(name) {
      var cmd = fis.require('command', name);
      name = cmd.name || name;
      name = fis.util.pad(name, 12);
      commands[name] = cmd.desc || '';
    });
    options =  {
      '-h, --help': 'print this help message',
      '-v, --version': 'print product version and exit',
      '-r, --root <path>': 'specify project root',
      '-f, --file <filename>': 'specify the file path of `ybruin-conf.js`',
      '--no-color': 'disable colored output',
      '--verbose': 'enable verbose mode'
    };
  }
  options = options || {};
  commands = commands || {};
  var optionsKeys = Object.keys(options);
  var commandsKeys = Object.keys(commands);
  var maxWidth;
  if (commandsKeys.length) {
    maxWidth = commandsKeys.reduce(function(prev, curr) {
      return curr.length > prev ? curr.length : prev;
    }, 0) + 4;
    strs.push(null, ' Commands:', null);
    commandsKeys.forEach(function(key) {
      strs.push(util.format('   %s %s', _.pad(key, maxWidth), commands[key]));
    });
  }
  if (optionsKeys.length) {
    maxWidth = optionsKeys.reduce(function(prev, curr) {
      return curr.length > prev ? curr.length : prev;
    }, 0) + 4;
    strs.push(null, ' Options:', null);
    optionsKeys.forEach(function(key) {
      strs.push(util.format('   %s %s', _.pad(key, maxWidth), options[key]));
    });
    strs.push(null);
  }
  console.log(strs.join('\n'));
};