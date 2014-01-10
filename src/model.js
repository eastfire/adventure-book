define(function(require,exports,module){
	var Global = require("./global");

	exports.Npc = Backbone.Model.extend({
		defaults:function(){
			return {
				specialName:null,
				type:"nobody",
				gender: null,//"male", "female", null
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
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+this.id),
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

	exports.Segment = Backbone.Model.extend({
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
	});
});