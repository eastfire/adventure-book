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

	var resultFuncMap = require("./results").ResultFuncMap;
	var resultDisplayMap = require("./results").ResultDisplayMap;

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

	var CheckSegmentTeller = Backbone.View.extend({
		template:_.template(require("../layout/check-segment-teller.html")),
		events:{
			"click .jump-to-check-success":"toSuccess",
			"click .jump-to-check-fail":"toFail",
			"click .start-check":"toCheck",
		},
		initialize:function(options){
			this.options = options;
			this.isPreview = this.options.isPreview;
			this.$el.data("view",this);

			this.$el.addClass("check-segment-teller");
			if ( this.preview ){
				this.$el.addClass("segment-preview");
			}

		},
		render:function(){
			this.$el.html(this.template());
			this.checkHint = this.$(".check-segment-hint");
			this.checkCardHint = this.$(".check-segment-card-hint");
			this.checkResultSegment = this.$(".check-result-segment");
			this.$(".check-result-label").hide();

			var self = this;
			if ( !this.isPreview ){
				this.jumpToSuccess.remove();
				this.jumpToFail.remove();
			}

			if ( this.model.hide ){
				this.checkHint.html("即将发生某种检定。");
			} else {
				var str; 
				if ( this.model.dice === 0 ){
					str = "即将检定你是否有"+this.model.difficulty+"或以上的"+this.model.type+"。";
				} else {
					str = "即将发生"+this.model.type+"检定。扔"+this.model.dice+"颗骰子的结果加你的"+this.model.type+"值是否大于等于"+this.model.difficulty;
				}
				this.checkHint.html(str);
			}
			if ( this.model.card === "play_card" ){
				this.checkCardHint.html("你可以使用手中的卡牌");
			}

			return this;
		},
		
		toSuccess:function(){
			var self = this;
			this.$(".check-actions").remove();
			this.$(".check-result-success-label").show();
			var view = new SegmentTeller({el:self.checkResultSegment, model:this.model.success, isPreview:self.isPreview, status:self.options.status});
			view.on("finish",function(){
				self.trigger("finish");
			});
			view.render();
		},
		
		toFail:function(){
			var self = this;
			this.$(".check-actions").remove();
			this.$(".check-result-fail-label").show();
			var view = new SegmentTeller({el:self.checkResultSegment, model:this.model.fail, isPreview:self.isPreview, status:self.options.status});
			view.on("finish",function(){
				self.trigger("finish");
			});
			view.render();
		},

		toCheck:function(){
			this.$(".check-actions").remove();
			var total = 0;
			if ( !this.isPreview ){
				var adjust = Global.currentUser.adjustment[this.model.type];
				if ( adjust != 0){
					total = adjust;
				}
			}
			for (var i = 0; i < this.model.dice; i++ ){
				total += ( Math.floor( Math.random() * 6 )+1 );
			}
			if ( total >= this.model.difficulty )
				this.toSuccess();
			else this.toFail();
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
						view.render();
					});
			},this);
			return this;
		}
	});

	var ResultSegmentTeller = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.isPreview = this.options.isPreview;
			this.$el.data("view",this);

			this.$el.addClass("result-segment-teller");
			if ( this.preview ){
				this.$el.addClass("segment-preview");
			}

			
		},
		render:function(){
			var self = this;
			_.each(this.model, function(result){
				var line = null;
				if (resultDisplayMap[result.type] !== undefined ) {
					line = resultDisplayMap[result.type].call(this, result, this.options.status);
				}
				
				if ( !this.isPreview ){
					if ( resultFuncMap[result.type] !== undefined) {
						resultFuncMap[result.type].call(this, result, this.options.status);
					}
				}
				if ( line )
					this.$el.append("<li class='result-item-line'><label>"+line+"</label></li>");
			},this);
			this.trigger("finish");
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
				case "check": {
					var view = new CheckSegmentTeller({model: this.currentSegment.val, isPreview:this.isPreview, status:this.options.status });
					this.bindViewFinish(view);
					this.$el.append(view.render().el);
					break;
				}
				case "result": {
					var view = new ResultSegmentTeller({model: this.currentSegment.val, isPreview:this.isPreview, status:this.options.status });
					this.bindViewFinish(view);
					this.$el.append(view.render().el);
					break;
				}
			}
		},
		bindViewFinish:function(view){
			var self = this;
			view.on("finish",function(){
				if ( self.currentSegmentIndex < 0 || self.currentSegmentIndex >= self.model.length - 1) {
					self.trigger("finish");
					return;
				}
				nextBtn.show();
				nextBtn.unbind().bind("click",function(){
					self.renderNextSegment()
				});
			});
		},
		renderNextSegment:function(){
			nextBtn.hide();
			this.currentSegmentIndex++;
			this.renderCurrentSegment();			
		},
		render:function(){
			this.renderCurrentSegment();
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
				this.$(".preview-btn").remove();
			} else {
				var self = this;
				this.restartBtn.on("click",function(){
					self.restart();
				});
				this.$(".submit-story").on("click",function(){
					self.trigger("submit");
				});
				this.$(".quit-preview").on("click",function(){
					self.trigger("finish");
				});
			}
		},
		
		restart:function(){
			this.$(".segment-teller").empty();
			this.render();
		},
		render:function(){
			var view = new SegmentTeller({el:this.segment, model:this.model.segment, isPreview:this.isPreview, status:this.status});
			var self = this;
			view.on("finish",function(){
				nextBtn.show();
				nextBtn.unbind().bind("click",function(){
					self.trigger("finish");
				});
			});
			view.render();
			return this;
		},
		bindEvents:function(){
		}
	});

});