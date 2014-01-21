define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	var PlaceCollection = Model.PlaceCollection;
	var NpcCollection = Model.NpcCollection;
	var StoryCollection = Model.StoryCollection;
	var npcNames = [];
	var placeNames = [];
	var actionNames = [];
	var nextBtn;

	var TextSegmentTeller = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.isPreview = this.options.isPreview;
			this.$el.data("view",this);

			this.$el.addClass("text-segment-teller");
			if ( this.preview ){
				this.$el.addClass("segment-preview");
			}
		},
		render:function(){
			var text = this.model;
			text = text.replace("[[地点]]", this.options.status.place);
			text = text.replace("[[角色]]", this.options.status.npc.get("type"));
			text = text.replace("[[形容词]]", this.options.status.attr);
			text = text.replace("[[动作]]", this.options.status.action);
			text = text.replace("[[TA]]", Model.NPC_GENDER[this.options.status.npc.get("gender")]);
			this.$el.text(text);
			
			this.trigger("finish");
			return this;
		}
	});

	var ChoiceSegmentTeller = Backbone.View.extend({
		template:_.template(require("../layout/choice-segment-teller.html")),
		initialize:function(options){
			this.options = options;
			this.isPreview = this.options.isPreview;
			this.$el.data("view",this);

			this.$el.addClass("choice-segment-teller");
			if ( this.preview ){
				this.$el.addClass("segment-preview");
			}

			
		},
		render:function(){
			this.$el.html(this.template());
			this.choiceList = this.$(".choice-segment-teller-choice-list");
			this.choiceHint = this.$(".choice-segment-hint");
			this.choicedSegment = this.$(".choiced-segment");
			var self = this;
			_.each(this.model, function(choice){
				$("<li class='choice-segment-teller-choice-item'>"+choice.name+"</li>")
					.appendTo(this.choiceList)
					.on("click",function(event){
						var target = $(event.currentTarget);
						self.choiceHint.remove();
						var index = $(target).index();
						var segment = self.model[index].segment;
						$(target).siblings().remove();
						var view = new SegmentTeller({el:self.choicedSegment, model:segment, isPreview:self.isPreview, status:self.options.status});
						view.on("finish",function(){
							self.trigger("finish");
						});
					});
			},this);
			return this;
		}
	});

	var SegmentTeller = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.isPreview = this.options.isPreview;
			
			if ( this.model.length > 0 ) {
				this.currentSegmentIndex = 0;
			} else this.currentSegmentIndex = -1;

			this.$el.data("view",this);
			
			this.$el.addClass("segment-teller");
			if ( this.preview ){
				this.$el.addClass("segment-preview");
			}

			this.renderCurrentSegment();
		},
		renderCurrentSegment:function(){
			if ( this.currentSegmentIndex < 0 || this.currentSegmentIndex >= this.model.length) {
				this.trigger("finish");
				return;
			}
			this.currentSegment = this.model[this.currentSegmentIndex];
			var self = this;
			switch ( this.currentSegment.type )	{
				case "text": {
					var view = new TextSegmentTeller({model: this.currentSegment.val, isPreview:this.isPreview, status:this.options.status });
					this.bindViewFinish(view);
					this.$el.append(view.render().el);
					break;
				}
				case "choice": {
					var view = new ChoiceSegmentTeller({model: this.currentSegment.val, isPreview:this.isPreview, status:this.options.status });
					this.bindViewFinish(view);
					this.$el.append(view.render().el);
					break;
				}
			}
		},
		bindViewFinish:function(view){
			var self = this;
			view.on("finish",function(){
				nextBtn.show();
				nextBtn.unbind().bind("click",function(){
					self.renderNextSegment()
				});
			});
		},
		renderNextSegment:function(){
			this.currentSegmentIndex++;
			this.renderCurrentSegment();
			nextBtn.hide();
		},
		render:function(){
			return this;
		}
	});
	exports.StoryTeller = Backbone.View.extend({
		template:_.template(require("../layout/story-teller.html")),
		events:{
			
		},
		initialize:function(options){
			this.$el.data("view",this);

			if ( this.model instanceof Backbone.Model )	{
				this.model = this.model.toJSON();
			}
			this.options = options;
			this.isPreview = options.isPreview;
			var meetable = this.genMeetableNpc();
			this.status = {
				attr : options.attr || meetable.attr || this.genAttr(meetable),
				npc : options.npc || Global.npcCollection.get(meetable.npcId),
				place : options.place || this.genPlace(),
				action : options.action || this.genAction(),
			};
			
			this.initLayout();
		},
		genPlace:function(){
			var meetablePlace = this.model.meetablePlace[Math.floor( this.model.meetablePlace.length * Math.random() )];
			if ( meetablePlace.isType === true ){
				return meetablePlace.type;
			}
			return Global.placeCollection.get(meetablePlace.placeId).get("name");
		},
		genMeetableNpc:function(){
			return this.model.meetableNpc[Math.floor( this.model.meetableNpc.length * Math.random() )];
		},
		genAttr:function(meetable){
			var npc = Global.npcCollection.get(meetable.npcId);
			return npc.get("attr")[Math.floor( npc.get("attr").length * Math.random() )];
		},
		genAction:function(){
			return this.model.action[Math.floor( this.model.action.length * Math.random() )];
		},
		initLayout:function(){
			this.$el.html(this.template());
			nextBtn = this.$(".next-segment").hide();
			this.segment = this.$(".segment-teller");
			this.restartBtn = this.$(".restart-story");
			if ( !this.isPreview ){
				this.restartBtn.remove();
			}
			var self = this;
			this.restartBtn.on("click",function(){
				self.restart();
			});
		},
		
		restart:function(){
			this.$(".segment-teller").empty();
			this.render();
		},
		render:function(){
			var view = new SegmentTeller({el:this.segment, model:this.model.segment, isPreview:this.isPreview, status:this.status});
			var self = this;
			view.on("finish",function(){
				self.trigger("finish");
			});
			return this;
		},
		bindEvents:function(){
		}
	});

});