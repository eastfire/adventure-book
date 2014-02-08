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
			this.$el.css( { left: Global.centerX + this.model.get("x")* Global.MAP_TILE_WIDTH,
				top: Global.centerY + this.model.get("y")* Global.MAP_TILE_HEIGHT });
			if ( pic ){
				this.$el.css( "background-image","url("+pic+")" );
			}
			this.$(".map-tile-label").text(name);
			return this;
		}
	});

	var AvatarView = Backbone.View.extend({
		render:function(){
			this.$el.addClass("pc-avatar");
			var where = this.model.get("where");
			this.$el.css( { left: Global.centerX + where.x* Global.MAP_TILE_WIDTH + ( Global.MAP_TILE_WIDTH - Global.AVATAR_WIDTH)/2,
				top: Global.centerY + where.y * Global.MAP_TILE_HEIGHT + ( Global.MAP_TILE_HEIGHT - Global.AVATAR_HEIGHT)/2,
				width: Global.AVATAR_WIDTH,
				height: Global.AVATAR_HEIGHT});
			this.$el.css( "background-image","url("+this.model.get("avatar")+")" );

			return this;
		}
	});

	exports.Board = Backbone.View.extend({
		initialize:function(options){
			this.options = options;
			this.map = Global.map;
			this.map.on("reset", this.renderTiles, this);
			this.map.on("add", this.renderTile, this);
		},
		
		render:function(){
			this.$el.addClass("board-view").css("height",window.innerHeight - TOP_BAR_HEIGHT);
			this.$el.html("<div class='board'></div>");
			this.board = this.$(".board");
			if ( this.map.length ){
				this.renderTiles();
			}
			var avatarView = new AvatarView({model:Global.currentPc});
			this.board.append(avatarView.render().el);
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