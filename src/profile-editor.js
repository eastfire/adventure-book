define(function(require,exports,module){
	var Global = require("./global");
	var Model = require("./model");

	exports.ProfileEditor = Backbone.View.extend({
		template:_.template(require("../layout/profile-editor.html")),
		events:{
			"click .next-step":"onNextStep"
		},
		initialize:function(options){
			this.options = options;
		},
		render:function(){
			var self = this;
			this.$el.html( this.template() );
			this.$(".user-nickname-edit").viewEditExchangable({
				emptyNote:"用户昵称",
				onBlur:"apply",
				data:this.model.get("nickname"),
				startWith: this.model.get("nickname")?"view":"edit",
				onEdit:function(data){
					self.model.set({
						nickname: data.trim()
					});
				},
				validate:function(data){
					return data && data.trim() != "";
				}
			});
			this.$(".user-portrait-url-edit").viewEditExchangable({
				emptyNote:"用户头像url地址",
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
			if ( !this.model.get("nickname") ){
				this.$(".next-step").show();
			}
			this.renderPortrait()
			return this;
		},
		renderPortrait:function(){
			if ( this.model.get("portrait") ){
				this.$(".user-portrait").attr("src",this.model.get("portrait") );
			}
		},
		onNextStep:function(){
			if ( this.model.get("nickname") ){
				Global.currentPcId = this.model.get("currentPcId");
				if ( Global.currentPcId ){							
					Global.currentPc = new Model.Pc({},{
						firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/"+Global.currentPcId)
					});
					showPCEditor();
				}				
			}
		}
	});
});