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
		},
		getDisplayName:function(){
			return this.get("specialName") || this.get("type")
		}
	});
	exports.NpcCollection = Backbone.Firebase.Collection.extend({
		model : exports.Npc,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/npc")
	});

	exports.Pc = Backbone.Firebase.Model.extend({
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/"+Global.currentPcId),
		defaults:function(){
			return {
				name:"",
				portrait:"./web/images/default-portrait.jpg",
				avatar:"./web/images/default-avatar.png",
				gender: "unknow",//"male", "female", unknow
				userId:0,
				status:"world",
				/*deck:[],
				quest:[],*/
				where:{
					worldId: Global.WORLD_ID,
					x:0,
					y:0
				},
				hand:[],
				adjustment:{},
				currentStory:{
					storyId:0,
					/*state:{},
					hand:[],
					path:[]*/
				}
			};
		}
	});

	exports.UserProfile = Backbone.Firebase.Model.extend({
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/profile"),
		defaults:function(){
			return {
				portrait:"",
				nickname:"",
				fatePoint:0,
				storyPoint:0,
				currentPcId: 1
			};
		}
	});

	exports.Log = Backbone.Model.extend({
		defaults:function(){
			return {
				where:null,
				who:{
					npcId:0,
					attr:""
				},
				timestamp:0,
				storyId:0,
				storyPath:[]
			};
		}
	});

	
	exports.PLACE_TYPE = [
		"城市","山谷","山顶","森林","海洋","小岛","村庄","草原","沙漠","小镇"
		];
	exports.TILE_TYPE_IMAGE_MAP = {
		"城市":""
	};

	exports.CARD_TYPE_MAP = {
		"status":"状态",
		"skill":"技能",
		"item":"物品",
		"company":"同伴"
	};
	exports.BASIC_SKILL = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];

	exports.BASIC_ITEM = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];
	
	exports.BASIC_STATUS = [
		"拳脚","兵器","口才","财力","容貌","骗术","魔法","头脑","运气"
		];
	
	exports.BASIC_COMPANY = [
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

	exports.MapTile = Backbone.Model.extend({
		defaults:function(){
			return {
				placeId:0,
				x:0,
				y:0
			};
		}
	});
	exports.MapTileCollection = Backbone.Firebase.Collection.extend({
		model : exports.MapTile,
		firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/map")
	});

	exports.Story = Backbone.Model.extend({
		defaults:function(){
			return {
				title:"",//标题，可以不要
				meetablePlace:[],
				meetableNpc:[],//{attr:"",id:xx}
				action:[],
				praise:[],
				comment:[],
				createBy:{
					user:null,
					time:0
				}
			};
		},
		
		getSegmentModel : function(){
			if ( !this.segmentModel ){
				this.segmentModel = exports.newSegmentModel(this.id);
			}
			return this.segmentModel;
		}
	});

	exports.newSegmentModel = function(id){
		return new Backbone.Firebase.Model({},{
					firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/segment/"+id)
		});
	};

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
				extend:{}
			};
		}
	});
	exports.CardTemplateCollection = Backbone.Collection.extend({
		model : exports.CardTemplate,
		//firebase: new Firebase(Global.FIREBASE_URL + "/world/"+Global.WORLD_ID + "/cardTemplate")
	});

	exports.Card = Backbone.Model.extend({
		defaults:function(){
			return {
				cardId:0,
				extend:{}
			};
		}
	});

/*	exports.CardCollection = Backbone.Firebase.Collection.extend({
		model : exports.CardTemplate,
		firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUserId+"/cards")
	});
*/

});
