module.exports = function(options){
    var projectConf = fis.config.get('projectConf');
    var spriteDefault = {
        to:'/images/sprites'
    };
    var spriteConf = fis.config.get('projectConf.useSprite') || spriteDefault;
    var domainList = projectConf.domainList || false;
    var name = projectConf.name || '';
    var terminal = projectConf.terminal || '';
    var outputPath = projectConf.outputPath || '../dist';
    var compressCss = typeof projectConf.compressCss != false ? true : projectConf.compressCss;
    var compressImg = typeof projectConf.compressImg != false ? true : projectConf.compressImg;
    var compressJs = typeof projectConf.compressJs != false ? true : projectConf.compressJs;
    var useSprite = typeof projectConf.useSprite != false ? true : projectConf.useSprite;
    var useHash = typeof projectConf.useHash != false ? true : projectConf.useHash;

	var plugins = {
		postpackager:require('../plugins/postpackager/index.js')
	};
 	fis.hook('commonjs')
	fis.match('::package', {
	    postpackager: plugins.postpackager,
        spriter: fis.plugin('csssprites-group')
	})
	// 默认产出路径
	fis.match('/(**)',{
        release:'/'+name+'/'+terminal+'/$1'
    })
    .match('/views/(**)',{
        isViews:true
    })
    .match('::image', {
        useHash:useHash
    })
    .match('**.{js,css,scss}',{
        useHash:useHash
    })
    .match('**.{css,scss}',{
        useSprite:useSprite
    })
    .match('/(js/**)', {
        isMod:true,
        moduleId:'$1',
        id:'$1'
    })
    .match('/sass/(**).scss',{
        id:'css/$1.css',
        parser: fis.plugin('node-sass'),
        rExt: '.css',
        release:'/'+name+'/'+terminal+'/css/$1'
    })
    .match('/sass/(_**.scss)',{
        release:false
    })
    .match('/(components/**)',{
        isMod:true,
        moduleId:'$1',
        id:'$1',
        release:false
    })
    fis.config.set('settings.spriter.csssprites-group',spriteConf);
    
	// 发布本地开发版本
	fis.media('dev')
    // 启动 fis3-hook-relative 插件
    .hook('relative')
    .match('**', {
        relative:true, // 让所有文件，都使用相对路径
        deploy :fis.plugin('local-deliver',{
            to :"../local"
        })
    })

	// 发布线上开发版本：样式压缩，图片合并，png压缩
	fis.media('build')
    .match('**.js', {
        optimizer: compressJs && fis.plugin('uglify-js'),
        domain:domainList
    })
    // 对scss进行编译，压缩，图片合并
    .match('**.scss',{
        optimizer: compressCss && fis.plugin('clean-css',{
            'keepBreaks': true //保持一个规则一个换行
        }),
        domain:domainList
    })
    // 对css进行压缩，图片合并
    .match('**.css', {
        optimizer: compressCss && fis.plugin('clean-css',{
            'keepBreaks': true //保持一个规则一个换行
        }),
        domain:domainList
    })
    // 对图片进行png压缩
    .match('**.png', {
        optimizer: compressImg && fis.plugin('png-compressor',{
            'type':'pngquant'
        })
    })
    .match('::image', {
        domain:domainList
    })
    .match('*/**',{
        deploy :fis.plugin('local-deliver',{
            to :outputPath
        })
    })
}