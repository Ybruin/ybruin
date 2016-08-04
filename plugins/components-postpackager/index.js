var path = require('path');
var fs = require('fs');

var createFrameworkConfig = function(ret, conf, settings, opt){
    var map = {};
    map.deps = {};
    var cacheDeps = {};
    var filePath;
    var deployPath;
    fis.util.map(ret.src, function(subpath, file){
        if(file.deploy){
            deployPath = file.deploy.to;
        }
        if(file.requires && file.requires.length){
            map.deps[file.id] = map.deps[file.id] || [];
            map.deps[file.id] = map.deps[file.id].concat(file.requires);
        }
    });
    var dirPath = path.resolve(process.cwd(),'./components.json');
    if(deployPath){
        fs.readFile(dirPath, function(err,data){
            if(err){
                console.log(err);
            }else{
                var data = JSON.parse(data.toString()),
                    deps = JSON.stringify(map.deps);
                deps = deps.replace(/\"/g,"'");
                var content = '{\n'+
                    '"name": "'+data.name+'",\n'+
                    '"version": "'+data.version+'",\n'+
                    '"description": "'+data.description+'",\n'+
                    '"main": "'+data.main+'",\n'+
                    '"files": "'+data.files+'",\n'+
                    '"deps": "'+deps+'"\n'
                +'}\n';
                var componentsName = data.name.split('.js')[0];
                var componentPath = path.resolve(process.cwd(),
                                    deployPath+'/'+data.name+'/'+data.version+'/components.json');
                fs.writeFile(componentPath, content, function(err){
                    if(err){
                        console.log(err);
                    }
                })
            }
        })
    }
};
module.exports = createFrameworkConfig;
