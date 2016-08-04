module.exports = function(options){
    var projectConf = fis.config.get('projectConf');
    var spriteDefault = {
        to:'/images/sprites'
    };
    var spriteConf = fis.config.get('projectConf.useSprite') || spriteDefault;
    var domainList = projectConf.domainList || false;
    var name = projectConf.name || '';
    var version = projectConf.version || '';
    var outputPath = projectConf.outputPath || '../dist';
    var compressCss = typeof projectConf.compressCss != false ? true : projectConf.compressCss;
    var compressImg = typeof projectConf.compressImg != false ? true : projectConf.compressImg;
    var compressJs = typeof projectConf.compressJs != false ? true : projectConf.compressJs;
    var useSprite = typeof projectConf.useSprite != false ? true : projectConf.useSprite;
    var useHash = typeof projectConf.useHash != false ? true : projectConf.useHash;
    var useModule = projectConf.useModule || false;

    fis.hook('commonjs')
    fis.match('::package', {
        postpackager:require('../plugins/components-postpackager/index.js'),
        spriter: fis.plugin('csssprites-group')
    })
    // 默认产出路径
    fis.match('(**)',{
        release:'/'+name+'/'+version+'/$1'
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
    .match('**.js',{
        parser: fis.plugin('react')
    })
    .match('(**).js',{
        isMod: true
    })
    .match('commons/(**).js', {
        isMod: true
    })
    .match('(*).scss',{
        id:'css/$1.css',
        parser: fis.plugin('node-sass'),
        rExt: '.css',
        release:'/'+name+'/'+version+'/$1'
    })
    .match('(_**.scss)',{
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
            to :"../../../local"
        })
    })

    // 发布线上开发版本：样式压缩，图片合并，png压缩
    fis.media('build')
    .match('**.js', {
        optimizer: compressJs && fis.plugin('uglify-js'),
        moduleId: 'components/'+name+'/'+version+'$1.js',
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
    .match('**.html', {
        release: false
    })
    .match('commons/(**).js', {
        isMod: true,
        moduleId: 'components/commons/$1.js',
        release: false
    })
    .match('**',{
        deploy :fis.plugin('local-deliver',{
            to :outputPath
        })
    })
}
