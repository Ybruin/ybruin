/*分析组件*/

var path = require('path');

module.exports = function(compName){
	var jsId = 'components/'+compName+'/'+compName+'.js';
	var cssId = 'components/'+compName+'/'+compName+'.css';
	var jsPath = path.resolve('components',compName,compName+'.js');
	var cssPath = path.resolve('components',compName,compName+'.css');

	function getJSID(){
		return jsId;
	}
	function getCSSID(){
		return cssId;
	}
	function getJSPATH(){
		return jsPath;
	}
	function getCSSPATH(){
		return cssPath;
	}
	return {
		getJSID:getJSID,
		getCSSID:getCSSID,
		getJSPATH:getJSPATH,
		getCSSPATH:getCSSPATH
	}
}