define(function(require,exports,module){
	var Global = require("./global");
	exports.NPC_GENDER = {
		unknow : "他（她）",
		he : "他",
		she : "她",
		it : "它"
	};
	exports.Npc = Backbone.Model.extend({
		defaults:function(){
			return {
				specialName:null,
				type:"nobody",
				gender: "unknow",//"male", "female", null
				attr:[],
				action:[],
				createBy:{
					user: 0,
					time: 0
				}
			};
		}
	});
	exports.NpcCollection = Backbone.Firebase.Collection.extend({
		model : exports.Npc,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/npc")
	});

	exports.Pc = Backbone.Model.extend({
		defaults:function(){
			return {
				name:"",
				gender: null,//"male", "female", null
				user:null,
				hand:[],
				deck:[],
				discard:[],
				log:{},
				where:null,
				status:[]
			};
		}
	});
	exports.PcCollection = Backbone.Firebase.Collection.extend({
		model : exports.Pc,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/pc")
	});

	exports.User = Backbone.Firebase.Model.extend({
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUserId+"/profile"),
		defaults:function(){
			return {
				nickname:"",
				fatePoint:0,
				storyPoint:0,
				playerCharacter:null,
				storyCreated:{},
				npcCreated:{}
			};
		}
	});

	exports.Log = Backbone.Model.extend({
		defaults:function(){
			return {
				where:null,
				who:"",
				timestamp:0,
				how:"",
				story:null
			};
		}
	});

	
	exports.PLACE_TYPE = [
		"城市","山谷","山顶","森林","海洋","小岛","村庄","草原","沙漠","小镇"
		];
	exports.CARD_TYPE_MAP = {
		"status":"状态",
		"skill":"技能",
		"item":"物品",
		"company":"同伴"
	};
	exports.BASE_SKILL = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];

	exports.BASE_ITEM = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];
	
	exports.BASE_STATUS = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];
	
	exports.BASE_COMPANY = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];

	exports.Place = Backbone.Model.extend({
		defaults:function(){
			return {
				name:"",
				type:null,
				position:"c",//c,n,w,e,s
				meetableNpc:[]
			};
		}
	});
	exports.PlaceCollection = Backbone.Firebase.Collection.extend({
		model : exports.Place,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/place")
	});

	exports.PlaceTile = Backbone.Model.extend({
		defaults:function(){
			return {
				place:null,
				x:0,
				y:0
			};
		}
	});
	exports.PlaceTileCollection = Backbone.Firebase.Collection.extend({
		model : exports.PlaceTile,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/placeTile")
	});

	exports.Story = Backbone.Model.extend({
		defaults:function(){
			return {
				title:"",//标题，可以不要
				meetablePlace:[],
				meetableNpc:[],//{attr:"",id:xx}
				action:[],
				segment:[],//text, 
				praise:[],
				comment:[],
				createBy:{
					user:null,
					time:0
				}
			};
		}
	});
	exports.StoryCollection = Backbone.Firebase.Collection.extend({
		model : exports.Story,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/story")
	});

	exports.CardTemplate = Backbone.Model.extend({
		defaults:function(){
			return {
				title:"",//标题，可以不要
				type:"",//skill, status, item, company
				pic:"",
				text:"",
				effect:"",
				cost:0,
				extend:{}
			};
		}
	});
	exports.CardTemplateCollection = Backbone.Firebase.Collection.extend({
		model : exports.CardTemplate,
		firebase: new Firebase(Global.FIREBASE_URL + "/card")
	});

	exports.Card = Backbone.Model.extend({
		defaults:function(){
			return {
				cardId:0,
				position:"",//deck , hand, display, discard
				extend:{}
			};
		}
	});

	exports.CardCollection = Backbone.Firebase.Collection.extend({
		model : exports.CardTemplate,
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUserId+"/cards")
	});

	/*exports.Segment = Backbone.Model.extend({
		defaults:function(){
			return {
				type:"text",//text, result, check, choice
				text:null,
				result:[],
				check:null,//check struct
				choice:null //choice [{choiceLabel:"", segment:null}]
			};
		}
	});

	exports.Check = Backbone.Model.extend({
		defaults:function(){
			return {
				subject:"",
				dice: 0,
				difficulty:0,
				success:null, //success Segment
				fail:null, //success Segment
			};
		}
	});

	exports.Result = Backbone.Model.extend({
		defaults:function(){
			return {
				text:"",
				getStatus:[],
				loseStatus:[],
				pay:[],
				getCard:[],
				getWound:0,
				loseCard:[],
				gotoPlace:null,
				getFate:0
			};
		}
	});*/
});
