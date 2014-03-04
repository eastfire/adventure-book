define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");

	exports.CardView = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.$el.data("view",this);
		},
		render:function(){
			var cardId = this.model.cardId;
			var cardModel = Global.card.get(cardId);
			if ( !cardModel ){
				return;
			}
			var text = cardModel.get("text");
			var title = cardModel.get("title");
			
			this.$el.html("<div class='card-title unselectable'></div><div class='card-text unselectable'></div>");
			this.$el.addClass("card css-animator unselectable");

			var pic = cardModel.get("pic");
			if ( pic ){
				this.$el.css("background-image", "url("+pic+")");
			}

			this.$(".card-title").text(title);
			this.$(".card-text").text(text);
			return this;
		},
		setX:function(x){
			this.$el.css("left",x+"px");
		}
	});

	exports.HandView = Backbone.View.extend({
		template:_.template(require("../layout/player-hand.html")),
		events:{
			"click .card":"onSelectCard",
			"click .play-card-btn":"onPlayCard",
			"click .hand-toggle":"onToggle"
		},
		initialize:function(options){
			this.options = options;
			this.model.on("change:hand",this.renderCards, this);
		},
		render:function(){
			this.$el.html(this.template());
			this.$el.addClass("hand css-animator");
			return this;
		},
		renderCards:function(){
			this.$(".card-row").empty();
			if ( !this.model.get("hand") || !this.model.get("hand").length  ){
				return;
			}
			var width = this.$el.width();
			var cardWidth = 100;
			var cardNumber = this.model.get("hand").length;
			var gap = cardNumber >= 2 ? Math.min( (width - cardWidth) / (cardNumber-1) , cardWidth + 20) : 0;
			var x = 0;
			_.each( this.model.get("hand"), function(card){
				var cardView = new exports.CardView({model:card});
				this.$(".card-row").append(cardView.render().el);
				cardView.setX(x);
				x += gap;
			},this);
		},
		rerenderCards:function(){
			if ( !this.model.get("hand") || !this.model.get("hand").length  ){
				return;
			}
			var width = this.$el.width();
			var cardWidth = 100;
			var cardNumber = this.model.get("hand").length;
			var gap = cardNumber >= 2 ? Math.min( (width - cardWidth) / (cardNumber-1) , cardWidth + 20) : 0;
			var x = 0;
			var i = 0;
			_.each( this.model.get("hand"), function(card){
				var cardView = $(this.$(".card")[i]).data("view");
				if ( cardView )	{
					cardView.setX(x);
				}				
				x += gap;
				i ++;
			},this);
		},
		onToggle:function(){
			this.$el.toggleClass("hide-hand");
		},
		onSelectCard:function(event){
			var target = $(event.currentTarget);
			this.$(".card").removeClass("selected");
			target.addClass("selected");
			this.$(".play-card-btn").show().css("left", target.position().left );
		},
		onPlayCard:function(){
			this.$(".play-card-btn").hide();
			var view = $(this.$(".card.selected")[0]).data("view");
			var templateCard = Global.card.get(view.model.cardId);
			if ( !templateCard ) {
				return;
			}
			var func = Global.card.get(view.model.cardId).get("func");
			var index = view.$el.index();
			
			var newHand = JSON.parse(JSON.stringify(this.model.get("hand")));
			if ( $.isFunction(func) ){
				func.call(templateCard);
			}
			newHand.splice( index, 1);
			this.model.set({
				hand : newHand
			});
			view.$el.remove();
			this.rerenderCards();
		}
	});

	exports.AdjustmentView = Backbone.View.extend({
		events:{
			"click .adjustment-toggle":"onToggle"
		},
		initialize:function(options){
			this.options = options;
			this.model.on("change",this.render, this);
		},
		render:function(){				
			this.$el.html("<ul class='adjustment-list group-list unselectable'></ul><div class='adjustment-toggle unselectable'>当前修正值</div>");
			this.$el.addClass("adjustment-view css-animator");
			if ( this.model.get("currentStory") ){
				var adjustments = this.model.get("adjustment");
				for ( var key in adjustments ){
					if ( adjustments[key] ){
						this.$(".adjustment-list").append("<li class='list-group-item'>"+key+" "+(adjustments[key]>0?"+":"")+adjustments[key]+"</li>");
					}
				}
			} else {
				this.$(".adjustment-list").empty();
			}
			return this;
		},
		onToggle:function(){
			this.$el.toggleClass("hide-adjustment");
		},
	});
});