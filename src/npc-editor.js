define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	var NpcCollection = Model.NpcCollection;
	var NpcItem = Backbone.View.extend({
		tagName:"li",
		initialize:function(options){
			this.model.on("change",this.render,this);
		},
		render:function(){
			var m = this.model.toJSON();
			this.$el.attr("id",m.id).addClass('npc-item list-group-item').html(m.type);
			return this;
		}
	});
	var NpcAttrItem = Backbone.View.extend({		
		initialize:function(options){
			this.options = options;
		},
		render:function(){
			this.$el.addClass("npc-attr-item-view");
			this.$el.viewEditExchangable({
				viewClass:"npc-attr-item",
				editClass:"npc-attr-item-editing",
				data:this.model,
				startWith: this.options.startWith,
				onBlur:"apply"
			});
			return this;
		}
	});
	var NpcActionItem = Backbone.View.extend({		
		initialize:function(options){
			this.options = options;
		},
		render:function(){
			var m = this.model;
			this.$el.addClass("npc-action-item-view");
			this.$el.viewEditExchangable({
				viewClass:"npc-action-item",
				editClass:"npc-action-item-editing",
				data:this.model,
				startWith: this.options.startWith,
				onBlur:"apply"
			});
			return this;
		}
	});

	exports.NpcEditor = Backbone.View.extend({
		template : _.template(require("../layout/npc-editor.html")),
		events:{
			"click .npc-item":"onSelectNpcItem",
			"click .create-npc":"onCreateNpcItem",
			"click .create-npc-confirm":"onConfirmCreateNpc",
			"click .create-npc-cancel":"onCancelCreateNpc",
			"click .create-npc-attr":"onCreateAttr",
			"click .create-npc-action":"onCreateAction"
		},
		initialize:function(){
			Global.npcCollection = this.npcCollection = Global.npcCollection || new NpcCollection();
			this.$el.data("view",this);
			this.$el.addClass("npc-editor");
			this.initLayout();
			this.npcCollection.on("add",this.onAddNpc, this);
			this.npcCollection.on("reset",this.onAddAllNpc, this);
			this.npcCollection.on("all",this.render, this);

			this.onAddAllNpc();
		},
		initLayout:function(){
			this.$el.html(this.template());
			this.$(".npc-detail").hide();
			this.$(".npc-type-input").viewEditExchangable({
				onBlur:"apply",
				emptyNote:"角色名"
			});
		},
		onAddNpc:function(npc){
			var npcItem = new NpcItem({model:npc});
			this.$(".npc-list").append(npcItem.render().el);
		},
		onAddAllNpc:function(){
			this.$(".npc-list").empty();
			this.npcCollection.each(this.onAddNpc, this);
		},
		render:function(){
			return this;
		},
		onCreateNpcItem:function(){
			this.$(".npc-detail").show();
			this.$(".npc-attr-list").empty();
			this.$(".npc-action-list").empty();
			this.$(".npc-type-input").viewEditExchangable("option",{
				data:null
			});
			//this.$(".npc-type-input").val("");
			this.currentNpc = null;
		},
		onSelectNpcItem:function(event){
			var target = $(event.currentTarget);
			var id = target.attr("id");

			this.$(".npc-detail").show();
			this.currentNpc = this.npcCollection.get(id);
			this.renderNpcDetail(this.currentNpc.toJSON());
		},
		renderNpcDetail:function(npc){
			this.$(".npc-type-input").viewEditExchangable("option",{
				data:npc.type
			});
			this.$(".npc-gender .active").removeClass("active");
			var gender = npc ? (npc.gender || "unknow"):"unknow";
			this.$(".npc-gender #"+gender).parent().addClass("active");
//			this.$(".npc-type-input").val(npc.type);
			this.renderAttr(npc);
			this.renderAction(npc);
		},
		validateNpc:function(npcType){
			return npcType != "";
		},
		onConfirmCreateNpc:function(){
			var npcType = this.$(".npc-type-input").viewEditExchangable("val");
			if ( !npcType )
				return;
			npcType = npcType.trim();
			if ( !this.validateNpc(npcType) ) {
				return;
			}
			if ( this.npcCollection.filter(function(npc){
				return npc.type == npcType;
			}).length )
				return;
			var attrs = this.getAllAttr();
			var actions = this.getAllAction();
			var gender = this.$(".npc-gender .active input").attr("id");
			var self = this;
			var opt = {".priority":npcType, 
					type:npcType,
					attr:attrs,
					action:actions,
					gender:gender
				};
			if ( this.currentNpc )	{
				this.currentNpc.set(opt);
				self.onCancelCreateNpc();
			} else {
				opt.createBy={
						user:Global.currentUser.id,
						time:Firebase.ServerValue.TIMESTAMP
					}
				this.npcCollection.create(opt,
				{success:function(){
					self.onCancelCreateNpc();
				}});
			}
		},
		onCancelCreateNpc:function(){
			this.$(".npc-detail").hide();
		},
		renderAttr:function(npc){
			this.$(".npc-attr-list").empty();
			_.each(npc.attr, function(a){
				var view = new NpcAttrItem({model:a, startWith:"view"});
				this.$(".npc-attr-list").append(view.render().el);
			});
		},
		renderAction:function(npc){
			this.$(".npc-action-list").empty();
			_.each(npc.action, function(a){
				var view = new NpcActionItem({model:a, startWith:"view"});
				this.$(".npc-action-list").append(view.render().el);
			});
		},
		getAllAttr:function(npc){
			var attrEls = this.$(".npc-attr-item-view");
			var attrs = [];
			_.each(attrEls ,function(el){
				attrs.push($(el).viewEditExchangable("val"));
			});
			return attrs;
		},
		getAllAction:function(npc){
			var actionEls = this.$(".npc-action-item-view");
			var actions = [];
			_.each(actionEls,function(el){
				actions.push($(el).viewEditExchangable("val"));
			});
			return actions;
		},
		onCreateAttr:function(){
			var view = new NpcAttrItem({model:"形容词", startWith:"edit"});
			this.$(".npc-attr-list").append(view.render().el);
		},
		onCreateAction:function(){
			var view = new NpcActionItem({model:"动词", startWith:"edit"});
			this.$(".npc-action-list").append(view.render().el);
		}
	});
});