var path = require('path');
var fs = require('fs');
var createCombo = require('./lib/createCombo');
var replaceTpl = require('./lib/tpl');
var analyzeComp = require('./lib/analyzeComp');

var createFrameworkConfig = function(ret, conf, settings, opt){
    var map = {};
    map.deps = {};
    var cacheDeps = {};
    var filePath;

    fis.util.map(ret.src, function(subpath, file){
        if(file.requires && file.requires.length){
            map.deps[file.id] = map.deps[file.id] || [];
            map.deps[file.id] = map.deps[file.id].concat(file.requires);
            file.requires.forEach(function(req){
                filePath = req.split('/');
                if(filePath[0] == 'components'){
                    var comp = analyzeComp(filePath[1]);
                    var cssPath = comp.getCSSPATH();
                    var jsId = comp.getJSID();
                    var cssId = comp.getCSSID();
                    if(fis.util.isFile(cssPath)){
                        map.deps[jsId] = map.deps[jsId] || [];
                        map.deps[jsId].push(cssId);
                    }
                }
            })
        }
    });
    
    //再次遍历文件，找到isViews标记的文件
     fis.util.map(ret.src, function(subpath, file){
        //有isViews标记，并且html类文件，才需要做替换
        if(file.isViews && file.isHtmlLike){
            var content = file.getContent();
           //替换tpl
            replaceTpl(content,file);
            //获取依赖组件
            var compArrs = fis.config.get(file.filename+'.compDeps') || [];
            //组件css和js加入依赖表
            compArrs.forEach(function(compName){
                var comp = analyzeComp(compName);
                var jsId = comp.getJSID();
                var cssId = comp.getCSSID();
                var jsPath = comp.getJSPATH();
                var cssPath = comp.getCSSPATH();
                var entryId = 'js/'+file.filename+'.js';
                map.deps[entryId] = map.deps[entryId] || [];
                if(fis.util.isFile(jsPath)){
                    add(map.deps[entryId],jsId);
                }
                if(fis.util.isFile(cssPath)){
                    add(map.deps[entryId],cssId);
                }  
            })
            //创建combo连接,替换钩子
            createCombo(ret,file,map.deps);
        }
    });

    function add(arrs,newItem){
        var isExist = false;
        arrs.forEach(function(i){
            if(arrs[i] === newItem){
                isExist = true;
            }
        });
        !isExist && arrs.push(newItem);
    };
};
module.exports = createFrameworkConfig;
