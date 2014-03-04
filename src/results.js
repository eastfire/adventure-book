define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	
	var findCardTemplateByName = function( cardTitle ){
		for ( var i = 0; i < Global.card.length ; i++ ){
			var card = Global.card.at(i);
			if ( card.get("title") === cardTitle ){
				return card;
			}
		}
		return null;
	}

	exports.ResultFuncMap = {
		"getSP":function( result , status ){
			Global.currentUserProfile.firebase.transaction(function(current){
				current.storyPoint = current.storyPoint + result.value;
				return current;
			});
		},
		"getFP":function( result , status ){
			Global.currentUserProfile.firebase.transaction(function(current){
				current.fatePoint = current.fatePoint + result.value;
				return current;
			});
		},
		"getCard":function( result , status ){
			var card = findCardTemplateByName( result.object );
			if ( card ){
				Global.currentPc.firebase.transaction(function(current){
					current.deck = current.deck || [];
					current.deck.push( {cardId: card.id });
					return current;
				});
			}
		},
		"loseCard":function( result , status ){
			var card = findCardTemplateByName( result.object );
			if ( card ){
				Global.currentPc.firebase.transaction(function(current){
					if ( current.deck ){
						for ( var i = 0; i < current.deck.length ; i++)	{
							if ( current.deck[i].cardId === card.id ){
								current.deck.splice(i,1);
							}
						}
					}
					return current;
				});
			}
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