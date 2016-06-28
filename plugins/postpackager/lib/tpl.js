/*替换组件模板*/
'use strict';
var path = require('path');
var fs = require('fs');

var includeExpr = /<%-?\s[\s\S]*?include\s*(?:\(\s*('|")(.*?)\1|([\w\/\\-_\.]+))[\s\S]*?\s-?%>/gi;

module.exports = function (content, file) {
  var compDeps = [];

  var con = content.replace(includeExpr, function(matchStr) {

    var componentPath = arguments[3];
    var filePath = componentPath.split('/');

    if(filePath[0] == 'components'){
      var tplPath = path.resolve(componentPath,filePath[1]+'.tpl');

      if(fis.util.isFile(tplPath)){
        var template = '<% include ../'+componentPath+'/'+filePath[1]+'.tpl %>';
        var tpl = fs.readFileSync(tplPath,'utf-8');
        compDeps.push(filePath[1])
        fis.config.set(file.filename+'.compDeps',compDeps);

        return tpl;

      }else{
        return matchStr;
      }
    }
  });
  file.setContent(con);
};