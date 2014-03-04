define(function(require,exports,module){
	var Global = require("./global");
	
	exports.initCards = function(){
		var normalAjustmentFunc = function( ){
					var adjustment = Global.currentPc.get("adjustment");
					if ( !adjustment ){
						adjustment = {};
					} else adjustment = clone( adjustment );

					if ( adjustment[this.get("extend").type] ){
						adjustment[this.get("extend").type] += this.get("extend").value;
					} else adjustment[this.get("extend").type] = this.get("extend").value;

					Global.currentPc.set({adjustment: adjustment});
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
				title:"武功",
				text:"武功+1",
				pic:null,
				extend:{
					type:"武功",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:3,
				title:"魔法",
				text:"魔法+1",
				pic:null,
				extend:{
					type:"魔法",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:4,
				title:"魅力",
				text:"魅力+1",
				pic:null,
				extend:{
					type:"魅力",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:5,
				title:"偷窃",
				text:"偷窃+1",
				pic:null,
				extend:{
					type:"偷术",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:6,
				title:"骗术",
				text:"骗术+1",
				pic:null,
				extend:{
					type:"骗术",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:7,
				title:"口才",
				text:"口才+1",
				pic:null,
				extend:{
					type:"口才",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:8,
				title:"幸运",
				text:"幸运+1",
				pic:null,
				extend:{
					type:"幸运",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:9,
				title:"学识",
				text:"学识+1",
				pic:null,
				extend:{
					type:"学识",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:10,
				title:"伪装",
				text:"伪装+1",
				pic:null,
				extend:{
					type:"伪装",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:11,
				title:"野外知识",
				text:"野外知识+1",
				pic:null,
				extend:{
					type:"野外知识",
					value:1
				},
				func:normalAjustmentFunc
			},
			{
				id:12,
				title:"航海术",
				text:"航海术+1",
				pic:null,
				extend:{
					type:"航海术",
					value:1
				},
				func:normalAjustmentFunc
			}
		]);
	}
});