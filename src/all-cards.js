define(function(require,exports,module){
	var Global = require("./global");
	
	exports.initCards = function(){
		var normalAjustmentFunc = function( currentStory ){
					var adjustment = currentStory.adjustment;
					if ( !adjustment ){
						adjustment = currentStory.adjustment = {};
					}
					if ( adjustment[this.get("extend").type] ){
						adjustment[this.get("extend").type] += this.get("extend").value;
					} else adjustment[this.get("extend").type] = this.get("extend").value;
				}
		Global.card.reset([
			{
				id:1,
				title:"智慧",
				text:"智慧+1",
				pic:null,
				extend:{
					type:"智慧",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:2,
				title:"拳脚",
				text:"拳脚+1",
				pic:null,
				extend:{
					type:"拳脚",
					value:1
				},
				func:normalAjustmentFunc
			}

		]);
	}
});