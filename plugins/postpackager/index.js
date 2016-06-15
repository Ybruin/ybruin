var createFrameworkConfig = function(ret, conf, settings, opt){
    var map = {};
    map.deps = {};
 
    fis.util.map(ret.src, function(subpath, file){
        if(file.requires && file.requires.length){
            console.log(file.requires)
            map.deps[file.id] = file.requires;
        }
    });
    //把配置文件序列化
    var stringify = JSON.stringify(map.deps, null, opt.optimize ? null : 4);
    //再次遍历文件，找到isViews标记的文件
    //替换里面的__FRAMEWORK_CONFIG__钩子
    fis.util.map(ret.src, function(subpath, file){
        //有isViews标记，并且是js或者html类文件，才需要做替换
        if(file.isViews && (file.isJsLike || file.isHtmlLike)){
            var content = file.getContent();
            //替换文件内容
            content = content.replace(/\b__FRAMEWORK_CONFIG__\b/g, stringify);
            file.setContent(content);
        }
    });
};
module.exports = createFrameworkConfig;