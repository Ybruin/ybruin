module.exports = function(options){
    var projectConf = fis.config.get('projectConf');
    var domainList = projectConf.domainList;
    var name = projectConf.name;
    var terminal = projectConf.terminal;

	var plugins = {
		postpackager:require('../plugins/postpackager/index.js')
	};
 	fis.hook('commonjs',{
        ignoreDependencies:[
            'components/**'
        ]
    })
	fis.match('::package', {
	    postpackager: plugins.postpackager
	})
	// 默认产出路径
	fis.match('/(*)/(**)',{
        release:'/'+name+'/'+terminal+'/$1/$2'
    })
    .match('/views/(**)',{
        isViews:true
    })
    .match('/js/(**)', {
        isMod:true,
        moduleId:'$1',
        id:'$1'
    })
    .match('/sass/(**.scss)',{
        parser: fis.plugin('node-sass'),
        rExt: '.css',
        release:'/'+name+'/'+terminal+'/css/$1'
    })
    .match('/sass/(_**.scss)',{
        release:false
    })
    .match('/components/(**)',{
        //release:false
    })

	// 发布本地开发版本
	fis.media('local')
    // 启动 fis3-hook-relative 插件
    .hook('relative')
    .match('*/**', {
        relative:true, // 让所有文件，都使用相对路径
        deploy :fis.plugin('local-deliver',{
            to :"../local"
        })
    })

	// 发布线上开发版本：样式压缩，图片合并，png压缩
	fis.media('online')
    .match('**.js', {
        domain:domainList
    })
    // 启用 fis-spriter-csssprites 插件
    /*.match('::package', {
        spriter: fis.plugin('csssprites')
    })*/
    // 对scss进行编译，压缩，图片合并
    .match('**.scss',{
        optimizer: fis.plugin('clean-css',{
            'keepBreaks': true //保持一个规则一个换行
        }),
        useSprite: true,
        domain:domainList
    })
    // 对css进行压缩，图片合并
    .match('**.css', {
        optimizer: fis.plugin('clean-css',{
            'keepBreaks': true //保持一个规则一个换行
        }),
        useSprite:true,
        domain:domainList
    })
    // 对图片进行png压缩
    .match('**.png', {
        optimizer: fis.plugin('png-compressor',{
            'type':'pngquant'
        })
    })
    .match('::image', {
        domain:domainList
    })
    .match('*/**',{
        deploy :fis.plugin('local-deliver',{
            to :"../online"
        })
    })
}