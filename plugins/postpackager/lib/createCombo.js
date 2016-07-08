/*生成并替换链接*/
'use strict';

var path = require('path');
var fs = require('fs');
var projectConf = fis.config.get('projectConf');
var compConfPath = path.resolve('components.json');
var compConf = fs.readFileSync(compConfPath,'utf-8');
var compConfJson = JSON.parse(compConf);
var slice = Array.prototype.slice;
var rStyle = /<!--([\s]*)STYLE_COMP_PLACEHOLDER([\s]*)-->/ig;
var rScript = /<!--([\s]*)SCRIPT_COMP_PLACEHOLDER([\s]*)-->/ig;
var rEntry = /<!--([\s]*)SCRIPT_ENTRY_PLACEHOLDER([\s]*)-->/ig;
var argv = fis.get('options');

var settings = {
	ret:{},
	file:{},
	hash:projectConf.hash || '',
	alias:{},
	deps:{},
	combo:projectConf.combo || false,
	maxUrlLength:2000,
	staticDomain:projectConf.domainList[0]+'/'+projectConf.name+'/'+projectConf.terminal+'/??' || null,
	compDomain:projectConf.compDomain+'/components/??' || null,
	entry:[]
};

var ycombo = function(ret, file, deps){
	settings.ret = ret || {};
	settings.file = file || {};
	settings.deps = deps || {};
	settings.entry = ['js/'+settings.file.filename+'.js'];
	var reactor = new Reactor();
	reactor.run();
};

ycombo.getHash = function(ids){
	var content = '';
    if(typeof ids == 'string'){
        ids = ids.split(' ');
    }
	each(ids,function (value,key){
		var filePath = path.resolve(value);
		if(fis.util.isFile(filePath)){
			content += fs.readFileSync(filePath,'utf-8');
		}
	})
	return fis.util.md5(content);
};

ycombo.getScript = function(url,hash){
    var hash = hash == undefined ? '' : '?'+hash;
    var scriptArrs = [
        '<script',
        'src="'+url+hash+'"',
        'type="text/javascript"',
        '></script>'
    ];
    return url ? scriptArrs.join(' ') : '';
};

ycombo.getLink = function(url,hash){
    var hash = hash == undefined ? '' : '?'+hash;
    var linkArrs = [
        '<link',
        'rel="stylesheet"',
        'type="text/css"',
        'href="'+url+hash+'"',
        '/>'
    ];
    return url ? linkArrs.join(' ') : '222';
};

ycombo.replaceComp = function(url){
	var t = fileType(url),
        isScript = t === 'js',
        isCss = t === 'css';

    fis.util.map(settings.ret.src, function(subpath, file){
        //有isViews标记，并且html类文件，才需要做替换
        if(file.isViews && file.isHtmlLike && file.filename == settings.file.filename){
            var content = file.getContent();
            //替换文件内容
            if (isScript) {
            	content = content.replace(rScript, ycombo.getScript(url));
            }else if(isCss){
            	content = content.replace(rStyle, ycombo.getLink(url));                	
            }
            file.setContent(content);
        }
    });
}

ycombo.replaceJs = function(ids){
    var replaceContext = '';

    if(argv._[1] === 'dev'){
        each(ids,function (id,i){
            var url = '../'+id;
            var hash = ycombo.getHash(id);
            var t = fileType(url);
            var isScript = t === 'js';
            if(isScript){
                replaceContext += ycombo.getScript(url,hash) + '\n';
            }
        })
    }else if(argv._[1] === 'build'){
        var url = genUrl(ids);
        var hash = ycombo.getHash(ids);
        var t = fileType(url);
        var isScript = t === 'js';
        if(isScript){
            replaceContext = ycombo.getScript(url,hash);
        }
    }

    fis.util.map(settings.ret.src, function(subpath, file){
        //有isViews标记，并且html类文件，才需要做替换
        if(file.isViews && file.isHtmlLike && file.filename == settings.file.filename){
            var content = file.getContent();
            //替换文件内容
            content = content.replace(rEntry, replaceContext);
            file.setContent(content);
        }
    });
}

var Reactor = function (names, callback) {
    this.length = 0;
    this.depends = {};
    this.push.apply(this, settings.entry);
};

Reactor.prototype = {
	constructor:Reactor,
	push:function(){
		var that = this;
        var args = slice.call(arguments);

        each(args, function (arg) {
            var id = that.alias(arg);
            var type = fileType(id);
            var isComp = fileComponents(id);
            var res = {
                    id: id
                };
            type = type === 'css' && isComp ? 'compcss' : (type === 'js' && isComp ? 'compjs' : type);

            that.push.apply(that, settings.deps[id]);

            if ((type === 'css') || (type === 'js') || (type === 'compcss') || (type === 'compjs')) {
                (that.depends[type] || (that.depends[type] = [])).push(res);
                ++that.length;
            }
        });
	},
	run: function () {
        var that = this,
            combo = settings.combo,
            depends = this.depends;

        if (this.length === 0) return ;

        function resourceCombo(resdeps) {
            var urlLength = 0;
            var idsHash = {};
            var ids = [];
            var url = [];

            each(resdeps, function (res, i) {
                if (urlLength + res.id.length < settings.maxUrlLength || true) {
                    urlLength += res.id.length;
                    if(!idsHash[res.id]){
                        idsHash[res.id] = true;
                        ids.push(res.id);
                    }
                } else {
                    ycombo.replaceComp(genUrl(ids));
                    urlLength = res.id.length;
                    ids = [res.id];
                }
                if (i === resdeps.length - 1) {
                    ycombo.replaceComp(genUrl(ids,true));
                }
            });
        }

        function resourceLoad(resdeps){
            var ids = [];
            each(resdeps,function (res,i){
                ids.push(res.id);
            })
            ycombo.replaceJs(ids);
        }

        resourceLoad(depends.js || []);
        resourceCombo(depends.compcss || []);
        resourceCombo(depends.compjs || []);
    },
    alias:function(name, alias){
		var aliasMap = settings.alias;

        if (arguments.length > 1) {
            aliasMap[name] = alias;
            return settings.alias(name);
        }

        while (aliasMap[name] && name !== aliasMap[name]) {
            switch (type(aliasMap[name])) {
            case 'function':
                name = aliasMap[name](name);
                break;
            case 'string':
                name = aliasMap[name];
                break;
            }
        }
        return name;
	}
};

function type(obj) {
    var t;
    if (obj == null) {
        t = String(obj);
    } else {
        t = Object.prototype.toString.call(obj).toLowerCase();
        t = t.substring(8, t.length - 1);
    }
    return t;
};

var TYPE_RE = /\.(js|css)(?=[?&,]|$)/i;
function fileType(str) {
    var ext = 'js';
    str.replace(TYPE_RE, function (m, $1) {
        ext = $1;
    });
    if (ext !== 'js' && ext !== 'css') ext = 'unknown';
    return ext;
}

var TYPE_COMP = /(components)\/.+\.(js|css)/i;
function fileComponents(str) {
    var ext = false;
    str.replace(TYPE_COMP, function (m, $1) {
        if($1 == 'components'){
            ext = true;
        }
    });
    return ext;
}

function genUrl(ids,isComp) {
    if (type(ids) === 'string') ids = ids.split(' ');

    var hash = ycombo.getHash(ids);
    var url = isComp === true ? settings.compDomain : settings.staticDomain;

    isComp&&each(ids,function (value,key){
        var compName = value.split('/')[1];
        if(compConfJson[compName] != undefined){
            ids[key] =  value.replace(/components\/(\S+)\/(.+)/,'$1/'+compConfJson[compName]+'/$2');
        }else{
            ids[key] =  value.replace(/components\/(\S+)\/(.+)/,'$1/$2');
        }
        
    })

    switch (type(url)) {
    case 'string':
        url = url + ids.join(',');
        break;
    case 'function':
        url = url(ids);
        break;
    default:
        url = ids.join(',');
    }

    // The omission of `_hash=` might cause problem in wechat's webview
    return url + (~url.indexOf('?') ? '&' : '?') + '_hash=' + hash;
}

function each(obj, iterator, context) {
    if (typeof obj !== 'object') return;

    var i, l, t = type(obj);
    context = context || obj;
    if (t === 'array' || t === 'arguments' || t === 'nodelist') {
        for (i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === false) return;
        }
    } else {
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (iterator.call(context, obj[i], i, obj) === false) return;
            }
        }
    }
};

module.exports = ycombo
