define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");

	var TOP_BAR_HEIGHT = 55;

	var TileView = Backbone.View.extend({
		render:function(){
			var placeId = this.model.get("placeId");
			var place;
			var type;
			var name;
			if ( placeId ){
				place = Global.placeCollection.get(this.model.get("placeId"));
				type = place.get("type");
				name = place.get("name")
				pic = place.get("pic") || Model.TILE_TYPE_IMAGE_MAP[type];
			} else {
				type = this.model.get("type");
				name = type;
				pic = Model.TILE_TYPE_IMAGE_MAP[type];
			}
			
			this.$el.html("<div class='map-tile-label'><div>");
			this.$el.addClass("map-tile place-type-"+type);
			this.$el.css( { left: this.model.get("x")* Global.MAP_TILE_WIDTH,
				top: this.model.get("y")* Global.MAP_TILE_HEIGHT });
			if ( pic ){
				this.$el.css( "background-image","url("+pic+")" );
			}
			this.$(".map-tile-label").text(name);
			return this;
		}
	});

	exports.getPlaceId = function(x,y){
		for ( var i = 0 ; i < Global.map.length ; i++){
			var tile = Global.map.at(i);
			if ( tile.get("x") === x && tile.get("y") === y )	{
				return tile.get("placeId");
			}
		}
		return 0;
	};

	var AvatarView = Backbone.View.extend({
		template:_.template(require("../layout/avatar.html")),
		events:{
			"click .walk-direction":"onClickWalk"
		},
		initialize:function(){
			this.initLayout();
			this.down = this.$(".down");
			this.up = this.$(".up");
			this.left = this.$(".left");
			this.right = this.$(".right");
			this.seeDesc = this.$(".see-place-description");

			Global.currentPc.on("change:where",this.render, this);
		},
		initLayout:function(){
			this.$el.addClass("pc-avatar css-animator");
			this.$el.html(this.template());
		},
		render:function(){			
			var where = this.model.get("where");
			this.$el.css( { left: where.x* Global.MAP_TILE_WIDTH + ( Global.MAP_TILE_WIDTH - Global.AVATAR_WIDTH)/2,
				top: where.y * Global.MAP_TILE_HEIGHT + ( Global.MAP_TILE_HEIGHT - Global.AVATAR_HEIGHT)/2,
				width: Global.AVATAR_WIDTH,
				height: Global.AVATAR_HEIGHT});
			this.$el.addClass("moving");

			var self = this;
			setTimeout(function(){
				self.$el.removeClass("moving");
			}, 500);
			this.$el.css( "background-image","url("+this.model.get("avatar")+")" );
			self.renderByPosition();			
			return this;
		},
		renderByPosition:function(){
			var where = Global.currentPc.get("where");
			if ( this.isPlaceHasDescription(where.x, where.y ) ){
				this.seeDesc.addClass("valid");
			} else {
				this.seeDesc.removeClass("valid");
			}
			if ( !this.isPlaceAccessable( where.x, where.y+1 ) )
				this.down.addClass("hide");
			else
				this.down.removeClass("hide");

			if ( !this.isPlaceAccessable( where.x, where.y-1 ) )
				this.up.addClass("hide");
			else
				this.up.removeClass("hide");

			if ( !this.isPlaceAccessable( where.x-1, where.y ) )
				this.left.addClass("hide");
			else
				this.left.removeClass("hide");

			if ( !this.isPlaceAccessable( where.x+1, where.y ) )
				this.right.addClass("hide");
			else
				this.right.removeClass("hide");
		},

		isPlaceHasDescription:function(x,y){
			var placeId = exports.getPlaceId(x,y);
			if ( placeId ){
				var place = Global.placeCollection.get(placeId);
				if ( place ){
					return place.get("desc");
				}
			}
			return false;
		},
		
		isPlaceAccessable:function(x, y){
			var placeId = exports.getPlaceId(x,y);
			if ( placeId ){
				var place = Global.placeCollection.get(placeId);
				if ( place && !place.get("isSecret") ){
					return true;
				}
			}
			return false;
		},
		
		onClickWalk:function(event){
			var target = $(event.currentTarget);
			var direction = target.attr("direction");

			var where = clone(Global.currentPc.get("where"));
			switch ( direction )
			{
			case "left":
				where.x -= 1;
				break;
			case "right":
				where.x += 1;
				break;
			case "up":
				where.y -= 1;
				break;
			case "down":
				where.y += 1;
				break;
			}
			where.placeId = exports.getPlaceId(where.x,where.y);
			Global.currentPc.set({where: where });
		}
	});

	exports.Board = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.map = Global.map;
			this.map.on("reset", this.renderTiles, this);
			this.map.on("add", this.renderTile, this);
			this.initLayout();
		},
		initLayout:function(){
			this.$el.addClass("board-view").css("height",window.innerHeight - TOP_BAR_HEIGHT);
			this.$el.html("<div class='board-border'><div class='board css-animator'></div></div>");

			this.board = this.$(".board");
			if ( this.map.length ){
				this.renderTiles();
			}
			this.avatarView = new AvatarView({model:Global.currentPc});
			this.board.append(this.avatarView.render().el);
		},
		render:function(){
			this.$(".board").css({left: Global.centerX, top:Global.centerY});
			
			return this;
		},	
		
		renderTiles:function(){
			for ( var i = 0 ; i < this.map.length ; i++){
				var tile = this.map.at(i);
				this.renderTile(tile);
			}
		},
		renderTile:function(tile){
			var view = new TileView({model:tile});
			this.board.append(view.render().el);
		}
	});
});