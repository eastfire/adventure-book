define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	var HandView = require("./player-hand").HandView;
	var AdjustmentView = require("./player-hand").AdjustmentView;

	var genHand = function(){
		var deck = Global.currentPc.get("deck");
		var handLimit = Global.currentPc.get("handLimit");
		var hand = [];
		if ( deck != null ){
			if ( deck.length > handLimit ){
				var nums = {};
				for ( var i = 0 ; i < handLimit ; i++ )	{
					var num
					do
					{
						num = Math.floor( Math.random() * deck.length );
					} while (nums[num]);
					nums[num] = true;
					hand.push( deck[num] );
				}
			} else {
				_.each( deck , function( card ) {
					hand.push( card );
				});
			}
		}
		return hand;
	}

	var generateStoryStatus = function(pc){
		var place = Global.placeCollection.get(pc.get("where").placeId);
		var type = place.get("type");
		var meetableNpcs = place.get("meetableNpc");
		
		var meetable = meetableNpcs[Math.floor( meetableNpcs.length * Math.random() )];
		var npc = Global.npcCollection.get(meetable.npcId);
		if ( pc.get("status") === "before-encounter") {
			pc.set({"currentStory": {
					npcId: meetable.npcId,
					attr : npc.get("attr")[Math.floor( npc.get("attr").length * Math.random() )],
					gender : npc.get("gender") === "unknow" ? (Math.random() > 0.5 ? "he" : "she") : npc.get("gender"),
					adjustment: {},
					hand : genHand(),
					placeId : pc.get("where").placeId
				}, status:"encounter"
			});
		}
		return clone(pc.get("currentStory"));
	};

	var generateStoryId = function(status){
		var candidates = [];
		var allWeight = 0;

		var placeId = Global.currentPc.get("where").placeId;
		var placeType = Global.placeCollection.get(placeId).get("type");

		var checkPlace = function(story){
			var places = story.get("meetablePlace");
			for ( var i = 0; i < places.length ; i++ ) {
				if ( placeId === places[i].placeId ){
					return 3;
				} else if ( placeType === places[i].type ){
					return 1;
				}
			}
			return 0;
		}

		var checkNpc = function(story){
			var npcs = story.get("meetableNpc");
			for ( var i = 0; i < npcs.length ; i++ ) {
				if ( status.npcId === npcs[i].npcId ){
					if ( status.attr === npcs[i].attr )	{
						return 3;
					}
					return 1;
				}
			}
			return 0;
		}

		var checkAction = function(story){
			var actions = story.get("action");
			for ( var i = 0; i < actions.length ; i++ ) {
				if ( status.action === actions[i] ){
					return 2;
				}
			}
			return 0;
		}

		Global.storyCollection.each( function(story){			
			var candidate = {
				weight: 0,
				storyId : story.get("id")
			};
			
			var placeWeight = checkPlace( story );

			var npcWeight = checkNpc( story );

			var actionWeight = checkAction( story );

			candidate.weight = placeWeight * npcWeight * actionWeight;

			if ( candidate.weight ) {
				candidates.push( candidate );
				allWeight += candidate.weight;
			}
		}, this);

		//random generate from candidates
		if ( allWeight == 0 ){
			//not story found
		} else {
			var point = Math.floor( Math.random() * allWeight );
			var currentCandidate = null;
			var i = 0;
			while ( point >= 0 ){
				currentCandidate = candidates[i];
				i++;
				point -= currentCandidate.weight;
			}
			return currentCandidate.storyId;
		}
		return 0;
	}
	
	exports.AdventureView = Backbone.View.extend({
		encounterTemplate:_.template(require("../layout/encounter.html")),
		events:{
			"click .action-select-item":"onSelectAction",
			"click .start-encounter":"onStartEncounter",
			"click .move-avatar":"onMoveAvatar"
		},
		initialize:function(){
			this.$el.html("<div class='encounter-view'></div><div class='story-view'></div><div class='map-view'></div>");
		},
		render:function(){
			this.$(".encounter-view").hide();
			this.$(".story-view").hide();
			this.$(".map-view").hide();
			switch( Global.currentPc.get("status") ){
				case "world":
					this.renderMap();
					break;
				case "before-encounter":
					this.renderEncounter();
					break;
				case "encounter":
					this.renderEncounter();
					break;
				case "story":
					this.renderStory();
					break;
			}
			
			$(".hand").remove();				
			var handView = new HandView({model:Global.currentPc});
			$("body").append(handView.render().el);
			handView.renderCards();

			$(".adjustment-view").remove();				
			var adjustmentView = new AdjustmentView({model:Global.currentPc});
			$("body").append(adjustmentView.render().el);
			return this;
		},
		renderEncounter:function(){
			this.$(".map-view").empty();
			this.$(".encounter-view").show();

			this.status = generateStoryStatus(Global.currentPc);
			var place = Global.placeCollection.get(this.status.placeId);
			var npc = Global.npcCollection.get(this.status.npcId);

			this.$(".encounter-view").html(this.encounterTemplate({
				placeName:place.get("name"),
				npcAttr:this.status.attr,
				npcName:npc.getDisplayName()
			}));
			var actionList = this.$(".action-select-list");
			_.each( npc.get("action"), function(action){
				actionList.append("<li class='action-select-item list-group-item' id="+action+">"+action+"</li>");
			},this);	
		},
		renderStory:function(){
			this.$(".encounter-view").empty();
			this.$(".story-view").show();
			
			this.status = clone(Global.currentPc.get("currentStory"));
			this.currentStory = Global.storyCollection.get(this.status.storyId);
			
			var segmentModel = this.currentStory.getSegmentModel();
			if ( segmentModel.get("segment") != null ){
				this.renderStorySegment(segmentModel);
			} else {
				segmentModel.once("change",function(){
					this.renderStorySegment(segmentModel);
				},this);
			}
		},
		onSelectAction:function(event){
			var target = $(event.currentTarget);
			this.status.action = target.attr("id");
			this.status.storyId = generateStoryId(this.status);

			if ( this.status.storyId == 0 )	{
				toastr["warning"]("没有找到对应的故事");
				//TODO user edit
				return;
			}
			
			Global.currentPc.set({
				currentStory:this.status,
				status:"story"
			} );

			this.renderStory();
		},
		renderStorySegment:function(segmentModel){
			var StoryTeller = require("./story-teller").StoryTeller;

			var storyView = new StoryTeller({model:segmentModel, isPreview:false, pc: Global.currentPc, status:this.status});
			
			this.$(".story-view").append(storyView.render().el);
			var self = this;
			storyView.on("finish",function(){
				Global.currentPc.set({
					currentStory: {},
					status:"world"} );
				self.renderMap();
			});
		},
		renderMap:function(){
			this.$(".story-view").empty();
			this.$(".map-view").show();

			this.$(".map-view").html("<button class='start-encounter'>新的遭遇</button>");
		},
		onStartEncounter:function(){
			Global.currentPc.set({
				status:"before-encounter"} );
			this.renderEncounter();
		}
	});
});