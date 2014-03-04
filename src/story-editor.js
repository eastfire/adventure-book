define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	var PlaceCollection = Model.PlaceCollection;
	var NpcCollection = Model.NpcCollection;
	var StoryCollection = Model.StoryCollection;
	var npcNames = [];
	var placeNames = [];
	var actionNames = [];
	var SegmentEditor = require("./segment-editor").SegmentEditor;
	var StoryTeller = require("./story-teller").StoryTeller;

	var StoryItem = Backbone.View.extend({
		tagName:"li",
		initialize:function(){
			this.model.on("change",this.render,this);
		},
		render:function(){
			var m = this.model.toJSON();
			var title = m.title;
			if ( !title ){
				title = "";
				if ( m.meetablePlace && m.meetablePlace.length ){
					title += "在";
					title += (_.map(m.meetablePlace, function(place){
						if ( place.isType === true ){
							return place.type;
						} else
							return Global.placeCollection.get(place.placeId).get("name");
					})).join("或");
				}
				if ( m.meetableNpc.length ){
					title += "遇到";
					title += (_.map(m.meetableNpc, function(meetable){
						var npcStr = meetable.attr ? (meetable.attr + "的") :"";
						return npcStr + Global.npcCollection.get(meetable.npcId).get("type");
					})).join("或");
				}
				if ( m.action.length ){
					title += "时";
					title += m.action.join("或");
				}
			}
			this.$el.attr("id",m.id).addClass('story-item list-group-item').html(title);
			return this;
		}
	});
	var MeetablePlaceItem = Backbone.View.extend({
		tagName:"li",
		render:function(){
			var m = this.model;
			var selectedData = m.placeId || 0;
			if ( m.isType === true ){
				selectedData = m.type;
			}
			var self = this;
			this.$el.addClass("list-group-item col-sm-3 meetable-place-item-wrap");
			this.$el.append("<div class='meetable-place-item'></div>");
			this.$(".meetable-place-item").viewEditExchangable({
				editType: "select",
				selects: placeNames,
				data:selectedData,
				viewClass:"story-meetable-place-view",
				editClass:"story-meetable-place-edit",
				onBlur:"apply",
				emptyNote:"请选择地点"
			});

			return this;
		},
	});
	var MeetableNpcItem = require("./place-editor").MeetableNpcItem;
	var ActionItem = Backbone.View.extend({
		tagName:"li",
		render:function(){
			var m = this.model;			
			var self = this;
			this.$el.addClass("list-group-item col-sm-3 story-action-item-wrap");
			this.$el.append("<div class='story-action-item'></div>");
			this.$(".story-action-item").viewEditExchangable({
				editType: "select",
				selects: actionNames,
				data:m,
				viewClass:"story-action-item-view",
				editClass:"story-action-item-edit",
				onBlur:"apply",
				emptyNote:"请选择行动"
			});

			return this;
		},
	});

	exports.StoryEditor = Backbone.View.extend({
		template : _.template(require("../layout/story-editor.html")),
		events:{
			"click .story-item":"onSelectStoryItem",
			"click .create-story":"onCreateStoryItem",
			"click .create-story-confirm":"onConfirmCreateStory",
			"click .create-story-cancel":"onCancelCreateStory",
			"click .create-story-preview":"onPreviewStory",
			"click .add-meetable-npc":"onAddMeetableNpc",
			"click .add-meetable-place":"onAddMeetablePlace",
			"click .add-action":"onAddAction"
		},
		initialize:function(){
			Global.placeCollection = this.placeCollection = Global.placeCollection || new PlaceCollection();
			Global.npcCollection = this.npcCollection = Global.npcCollection || new NpcCollection();
			Global.storyCollection = this.storyCollection = Global.storyCollection || new StoryCollection();
			this.$el.data("view",this);
			this.$el.addClass("story-editor");
			this.initLayout();
			this.placeCollection.on("add",this.onAddPlace, this);
			this.placeCollection.on("reset",this.onAddAllPlace, this);
			this.placeCollection.on("all",this.render, this);
			this.npcCollection.on("add",this.onAddNpc, this);
			this.npcCollection.on("reset",this.onAddAllNpc, this);
			this.npcCollection.on("all",this.render, this);
			this.storyCollection.on("add",this.onAddStory, this);
			this.storyCollection.on("reset",this.onAddAllStory, this);
			this.storyCollection.on("all",this.render, this);
			this.onAddAllPlace();
			this.onAddAllNpc();
			this.onAddAllStory();

			if ( window.currentEncounterStatus ){
				this.$(".story-detail").show();
				this.currentStory = null;
				var view = new MeetablePlaceItem({model:{
						placeId: window.currentEncounterStatus.placeId
					}});
				this.$(".story-meetable-place-list").append(view.render().el);
				
				view = new MeetableNpcItem({model:{
					npcId: window.currentEncounterStatus.npcId,
					attr: window.currentEncounterStatus.attr
				}, npcNames:npcNames});
				this.$(".story-meetable-npc-list").append(view.render().el);	
				this.refreshActionNames();
				view.on("npc-selected",function(npcId){
					self.refreshActionNames();
				});
				
				var view = new ActionItem({model:window.currentEncounterStatus.action});
				this.$(".story-action-list").append(view.render().el);

				var view = new SegmentEditor({isFirstSegment:true});
				this.$(".segment-editor-block").append(view.render().el);

				window.currentEncounterStatus = null;
			}
		},
		initLayout:function(){
			this.$el.html(this.template());
			this.$(".story-detail").hide();
			this.$('.btn').button();
		},
		onAddPlace:function(place){
			placeNames.push({label:place.get("name"), value:place.id});
		},
		onAddAllPlace:function(){
			placeNames = _.map(Model.PLACE_TYPE,function(type){
				return {label:"类型:"+type, value:type, extra:{isType:true} };
			});
			this.placeCollection.each(this.onAddPlace, this);
		},
		onAddNpc:function(npc){
			npcNames.push({label:npc.get("type"), value:npc.id});
		},
		onAddAllNpc:function(){
			npcNames = [];
			this.npcCollection.each(this.onAddNpc, this);
		},
		onAddStory:function(story){
			var storyItem = new StoryItem({model:story});
			this.$(".story-list").append(storyItem.render().el);
		},
		onAddAllStory:function(){
			this.$(".story-list").empty();
			this.storyCollection.each(this.onAddStory, this);
		},
		render:function(){
			this.$(".story-name-input").viewEditExchangable({
				emptyNote:"故事名（可不填）",
				onBlur:"apply"
			});
			return this;
		},
		onCreateStoryItem:function(){
			this.$(".story-detail").show();
			this.currentStory = null;
			this.renderStoryDetail(null);
		},
		onSelectStoryItem:function(event){
			var target = $(event.currentTarget);
			var id = target.attr("id");
			this.$(".story-detail").show();
			this.$(".story-preview").empty().hide();
			this.currentStory = this.storyCollection.get(id);
			this.renderStoryDetail(this.currentStory.toJSON());
			this.renderSegment(this.currentStory.getSegmentModel());
		},
		renderSegment:function(segmentModel){
			if ( segmentModel.get("segment") != null ){
				var v = new SegmentEditor({model:segmentModel.get("segment"), isFirstSegment:true});
				this.$(".segment-editor-block").append(v.render().el);
			} else {
				segmentModel.once("change",function(){
					var v = new SegmentEditor({model:segmentModel.get("segment"), isFirstSegment:true});
					this.$(".segment-editor-block").append(v.render().el);
				},this);
			}
		},
		renderStoryDetail:function(story){
			this.$(".story-name-input").viewEditExchangable("option",{data:story?story.title:null});
			var v;
			this.$(".story-meetable-place-list").empty();
			this.$(".story-meetable-npc-list").empty();
			this.$(".story-action-list").empty();
			this.$(".segment-editor-block").empty();
			if ( story ){
				this.renderMeetablePlaces();
				this.renderMeetableNpcs();
				this.renderAction();
				
			} else {
				v = new SegmentEditor({isFirstSegment:true});
				this.$(".segment-editor-block").append(v.render().el);
			}
		},
		
		renderMeetablePlaces:function(){
			var story = this.currentStory.toJSON();
			
			_.each(story.meetablePlace, function(meetablePlace){
				var view = new MeetablePlaceItem({model:meetablePlace});
				this.$(".story-meetable-place-list").append(view.render().el);
			},this);
		},

		renderMeetableNpcs:function(){
			var story = this.currentStory.toJSON();
			
			var self = this;
			_.each(story.meetableNpc, function(meetableNpc){
				var view = new MeetableNpcItem({model:meetableNpc, npcNames:npcNames});
				this.$(".story-meetable-npc-list").append(view.render().el);	
				this.refreshActionNames();
				view.on("npc-selected",function(npcId){
					self.refreshActionNames();
				});
			},this);
		},
		
		renderAction:function(){
			var story = this.currentStory.toJSON();
			
			_.each(story.action, function(action){
				var view = new ActionItem({model:action});
				this.$(".story-action-list").append(view.render().el);
			},this);
		},
		
		getStory:function(){
			var storyName = this.$(".story-name-input").viewEditExchangable("val");
			if ( storyName )
				storyName = storyName.trim();
			var meetablePlace =this.getMeetablePlace();
			var meetableNpc = this.getMeetableNpcs();
			var actions = this.getActions();
			var self = this;
			return {
					title:storyName,
					meetablePlace:meetablePlace,
					meetableNpc:meetableNpc,
					action:actions,
					segment:this.$(".segment-editor-block").children().data("view").val()
				}
		},

		onConfirmCreateStory:function(){
			var opt = this.getStory();
			var segment = opt.segment;
			delete opt.segment;
			var self = this;
			this.$(".create-story-confirm").button("loading");
			if ( this.currentStory ) {
				this.currentStory.set(opt);
				this.currentStory.getSegmentModel().set({segment: segment});
				self.onCancelCreateStory();
				this.$(".create-story-confirm").button("reset");
			} else {
				opt.createBy = {
						user:Global.currentUser.id,
						time:Firebase.ServerValue.TIMESTAMP
					};
				var newStory = this.storyCollection.create(opt,
				{success:function(model){
					Model.newSegmentModel(newStory.id).set({segment: segment});
					self.onCancelCreateStory();
					self.$(".create-story-confirm").button("reset");
					toastr["success"]("保存故事成功");
				},error:function(){
					self.$(".create-story-confirm").button("reset");
					toastr["error"]("保存故事失败");
				}});
			}
		},

		onPreviewStory:function(){
			var opt = this.getStory();
			this.$(".story-detail").hide();
			this.$(".story-preview").empty().show();
			var previewView = new StoryTeller({model:opt, isPreview:true});
			this.$(".story-preview").append(previewView.render().el);
			var self = this;
			previewView.on("finish",function(){
				self.$(".story-detail").show();
				self.$(".story-preview").empty().hide();
			});
			previewView.on("submit",function(){
				self.$(".story-detail").show();
				self.onConfirmCreateStory();
				self.$(".story-preview").empty().hide();
			});
		},

		getMeetablePlace:function(){
			var array = this.$(".meetable-place-item");
			var ret = [];
			_.each(array, function(el){
				var id = $(el).viewEditExchangable("val");
				if ( id ) {
					var extra = $(el).viewEditExchangable("extraVal");
					if ( extra && extra.isType ){
						ret.push({ isType: true, type: id });
					} else
						ret.push({ placeId: id });
				}
			},this);
			return ret;
		},
		getMeetableNpcs:function(){
			var array = this.$(".story-meetable-npc-list .meetable-npc-item");
			var ret = [];
			_.each(array, function(el){
				var id = $(el).find(".meetable-npc-name").viewEditExchangable("val");
				if ( id ) {
					var attr = $(el).find(".meetable-npc-attr").viewEditExchangable("val");
					if ( attr )	{
						ret.push({ attr:attr, npcId: id });
					} else {
						ret.push({ npcId: id });
					}
				}
			},this);
			return ret;
		},
		getActions:function(){
			var array = this.$(".story-action-list .story-action-item");
			var ret = [];
			_.each(array, function(el){
				var id = $(el).viewEditExchangable("val");
				if ( id ) {
					ret.push(id);
				}
			},this);
			return ret;
		},
		onCancelCreateStory:function(){
			this.$(".story-detail").hide();
		},
		onAddMeetableNpc:function(){
			var view = new MeetableNpcItem({model:{}, npcNames:npcNames });
			this.$(".story-meetable-npc-list").append(view.render().el);

			var self = this;
			view.on("npc-selected",function(npcId){
				self.refreshActionNames();
			});
		},
		onAddMeetablePlace:function(){
			var view = new MeetablePlaceItem({model:{}});
			this.$(".story-meetable-place-list").append(view.render().el);
		},
		onAddAction:function(){
			var view = new ActionItem({model:null});
			this.$(".story-action-list").append(view.render().el);
		},
		refreshActionNames:function(){
			actionNames = [];
			var array = this.$(".story-meetable-npc-list .meetable-npc-item");
			var ret = [];
			_.each(array, function(el){
				var id = $(el).find(".meetable-npc-name").viewEditExchangable("val");
				if ( id ) {
					_.each( this.npcCollection.get(id).get("action"), function(action){
						if ( !_.filter(actionNames, function(a){
							return a.value === action;
							}).length )	
							actionNames.push( { label: action, value: action} );
					}, this);
				}
			},this);

			var array2 = this.$(".story-action-list .story-action-item");
			_.each(array2, function(el){
				$(el).viewEditExchangable("option",{
					selects:actionNames
				});
			});
		}
	});
});
