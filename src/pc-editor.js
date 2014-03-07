define(function(require,exports,module){
	var Global = require("./global");

	exports.PCEditor = Backbone.View.extend({
		template:_.template(require("../layout/pc-editor.html")),
		events:{
			"click .next-step":"onNextStep"
		},
		initialize:function(options){
			this.options = options;
		},
		render:function(){
			var self = this;
			this.$el.html( this.template() );
			this.$(".pc-name-edit").viewEditExchangable({
				emptyNote:"角色名称",
				onBlur:"apply",
				data:this.model.get("name"),
				startWith: this.model.get("name")?"view":"edit",
				onEdit:function(data){
					self.model.set({
						name: data.trim()
					});
				},
				validate:function(data){
					return data && data.trim() != "";
				}
			});
			this.$(".pc-portrait-url-edit").viewEditExchangable({
				emptyNote:"角色头像url地址",
				onBlur:"apply",
				data:this.model.get("portrait"),
				startWith: this.model.get("portrait")?"view":"edit",
				onEdit:function(data){
					self.model.set({
						portrait: data
					});
					self.renderPortrait();
				},
				validate:function(data){
					return data;
				}
			});
			this.$(".pc-avatar-url-edit").viewEditExchangable({
				emptyNote:"角色化身url地址",
				onBlur:"apply",
				data:this.model.get("avatar"),
				startWith: this.model.get("avatar")?"view":"edit",
				onEdit:function(data){
					self.model.set({
						avatar: data
					});
					self.renderAvatar();
				},
				validate:function(data){
					return data;
				}
			});
			var self = this;
			this.$(".pc-gender .btn").on("click",function(event){
				var target = $(event.currentTarget);
				var gender = target.find("input").attr("id");
				self.model.set({gender:gender});
			});
			if ( !this.model.get("name") ){
				this.$(".next-step").show();
			}
			this.renderPortrait();
			this.renderAvatar();
			this.renderGender();

			if ( this.model.get("deck") && this.model.get("deck").length ){
				this.$(".deck-block").show();
				this.$(".deck-count").html = this.model.get("deck").length+"张";
			} else {
				this.$(".deck-block").hide();
			}
			return this;
		},
		renderGender:function(){
			this.$(".pc-gender .active").removeClass("active");
			var gender = this.model.get("gender");
			this.$(".pc-gender #"+gender).parent().addClass("active");
		},
		renderPortrait:function(){
			if ( this.model.get("portrait") ){
				this.$(".pc-portrait").attr("src",this.model.get("portrait") );
			}
		},
		renderAvatar:function(){
			if ( this.model.get("avatar") ){
				this.$(".pc-avatar").attr("src",this.model.get("avatar") );
			}
		},
		onNextStep:function(){
			if ( this.model.get("name") ){
				this.model.set({
					status:"world",
					where:{
						world: Global.WORLD_ID,
						x:0,
						y:0
						}
					});
				$("#adventure-book-action-bar").show();
				showAdventureView();
			}
		}
	});
});