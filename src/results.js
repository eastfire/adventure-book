define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");

	exports.ResultFuncMap = {
		"getSP":function( result , status ){
			
		},
	};

	exports.ResultDisplayMap = {
		"getSP":function( result , status ){
			return "获得"+result.value+"故事点。"
		},
		"getFP":function( result , status ){
			return "获得"+result.value+"命运点。"
		},
		"getCard":function( result , status ){
			var line = "获得"+Model.CARD_TYPE_MAP[result.subtype]+":"+result.object+"。";
			if ( result.subtype === "item" )	{
				line += "（使用次数："+result.value+"次）";
			}
			return line;
		},
		"loseCard":function( result, status ){
			return "失去"+Model.CARD_TYPE_MAP[result.subtype]+":"+result.object+"。";
		},
		"getQuest":function( result, status ){
			return "获得任务'"+result.object+"'";
		},
		"questSuccess":function( result, status ){
			return "任务:'"+result.object+"'成功";
		},
		"questFail":function( result, status ){
			return "任务:'"+result.object+"'失败";
		},
		"moveToPlace":function( result, status ){
			return "移动到"+result.object;
		},
		"meet":function( result, status ){
			var line;
			if ( result.object )	{
				line = "与"+result.object;
			}
			line += "发生一次遭遇";
			return line;
		}
	};
});