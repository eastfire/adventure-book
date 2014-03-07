define(function(require,exports,module){
	var Model = require("./model");
	var Global = require("./global");
	var PlaceCollection = Model.PlaceCollection;
	var NpcCollection = Model.NpcCollection;
	var npcNames = [];

	var PlaceItem = Backbone.View.extend({
		tagName:"li",
		initialize:function(){
			this.model.on("change",this.render,this);
		},
		render:function(){
			var m = this.model.toJSON();
			this.$el.attr("id",m.id).addClass('place-item list-group-item').html(m.name);
			return this;
		}
	});
	exports.MeetableNpcItem = Backbone.View.extend({
		template:_.template(require("../layout/meetable-npc-item.html")),
		tagName:"li",
		events:{
			"click .delete":"onDelete"
		},
		initialize:function(options){
			this.options = options;
		},
		render:function(){
			var m = this.model;
			var self = this;
			this.$el.addClass("meetable-npc-item list-group-item col-sm-5");
			this.$el.html(this.template());
			this.$(".meetable-npc-name").viewEditExchangable({
				editType: "select",
				selects: this.options.npcNames,
				data:m.npcId||0,
				viewClass:"meetable-npc-name-view",
				editClass:"meetable-npc-name-edit",
				onBlur:"apply",
				emptyNote:"请选择角色",
				onEdit:function(){
					self.renderAttrSelect();
				}
			});

			this.renderAttrSelect();

			return this;
		},
		renderAttrSelect:function(){
			var npcId = this.$(".meetable-npc-name").viewEditExchangable("val");
			if ( !npcId ) {
				this.$(".meetable-npc-de").hide();
				return;
			}
			this.trigger("npc-selected",npcId);
			var self = this;
			var attrs = [{value:0,label:"任意形容词"}];
			_.each(Global.npcCollection.get(npcId).get("attr"), function(attr){
				attrs.push({value:attr,label:attr});
			},this);
			this.$(".meetable-npc-attr").viewEditExchangable({
				editType: "select",
				selects: attrs,
				data:this.model.attr,
				viewClass:"meetable-npc-attr-view",
				editClass:"meetable-npc-attr-edit",
				onBlur:"apply",
				emptyNote:"+形容词",
				onEdit:function(){
					self.renderDe();
				}
			});
			this.renderDe();
		},
		renderDe:function(){
			var v = this.$(".meetable-npc-attr").viewEditExchangable("val");
			if ( v && v!=0 ){
				this.$(".meetable-npc-de").show();
			}else{
				this.$(".meetable-npc-de").hide();
				this.$(".meetable-npc-attr").viewEditExchangable("option",{data:null});
			}
		},
		onDelete:function(){
			this.remove();
		}
	});
	exports.PlaceEditor = Backbone.View.extend({
		template : _.template(require("../layout/place-editor.html")),
		events:{
			"click .place-item":"onSelectPlaceItem",
			"click .create-place":"onCreatePlaceItem",
			"click .create-place-confirm":"onConfirmCreatePlace",
			"click .create-place-cancel":"onCancelCreatePlace",
			"click .add-meetable-npc":"onAddMeetableNpc"
		},
		initialize:function(){
			Global.placeCollection = this.placeCollection = Global.placeCollection || new PlaceCollection();
			Global.npcCollection = this.npcCollection = Global.npcCollection || new NpcCollection();
			this.$el.data("view",this);
			this.$el.addClass("place-editor");
			this.initLayout();
			this.placeCollection.on("add",this.onAddPlace, this);
			this.placeCollection.on("reset",this.onAddAllPlace, this);
			this.placeCollection.on("all",this.render, this);
			this.npcCollection.on("add",this.onAddNpc, this);
			this.npcCollection.on("reset",this.onAddAllNpc, this);
			this.npcCollection.on("all",this.render, this);

			this.onAddAllPlace();
			this.onAddAllNpc();
		},
		initLayout:function(){
			this.$el.html(this.template());
			this.$(".place-detail").hide();
			this.$('.btn').button();
		},
		onAddPlace:function(place){
			var placeItem = new PlaceItem({model:place});
			this.$(".place-list").append(placeItem.render().el);
		},
		onAddAllPlace:function(){
			this.$(".place-list").empty();
			this.placeCollection.each(this.onAddPlace, this);
		},
		onAddNpc:function(npc){
			npcNames.push({label:npc.get("type"), value:npc.id});
		},
		onAddAllNpc:function(){
			npcNames = [];
			this.npcCollection.each(this.onAddNpc, this);
		},
		render:function(){
			this.$(".place-type-select").empty();
			this.$(".place-type-select").append("<option class='place-type-option'>未定义</option>");
			_.each(Model.PLACE_TYPE,function(name){
				this.$(".place-type-select").append("<option class='place-type-option' id='"+name+"'>"+name+"</option>");
			}, this);			
			return this;
		},
		onCreatePlaceItem:function(){
			this.$(".place-detail").show();
			this.currentPlace = null;
			this.renderPlaceDetail(null);
		},
		onSelectPlaceItem:function(event){
			var target = $(event.currentTarget);
			var id = target.attr("id");
			this.$(".place-detail").show();
			this.currentPlace = this.placeCollection.get(id);
			this.renderPlaceDetail(this.currentPlace.toJSON());
		},
		renderPlaceDetail:function(place){
			this.$(".place-name-input").val(place?place.name:"");
			this.$(".place-description-input").val(place?place.desc:"");
			this.$(".place-position .active").removeClass("active");
			var position = place ? (place.position || "unknow"):"unknow";
			this.$(".place-position #"+position).parent().addClass("active");
			var index = 0;
			if ( place && place.type)
				index = this.$(".place-type-select #"+place.type).index();
			this.$(".place-type-select").prop("selectedIndex",index);

			this.$(".meetable-npc-list").empty();
			this.$(".place-is-secret-check")[0].checked = false;
			if ( place ){
				_.each(place.meetableNpc, function(meetable){
					var view = new exports.MeetableNpcItem({model:meetable, npcNames: npcNames});
					this.$(".meetable-npc-list").append(view.render().el);
				},this);
				if ( place.isSecret )
					this.$(".place-is-secret-check")[0].checked = true;
			}
		},
		onConfirmCreatePlace:function(event){
			var placeName = this.$(".place-name-input").val();
			if ( !placeName )
				return;
			placeName = placeName.trim();
			if ( placeName == "") {
				return;
			}
			var placeDescription = this.$(".place-description-input").val();
			placeDescription = placeDescription && placeDescription.trim();
			if ( this.placeCollection.filter(function(place){
				return place.name == placeName;
			}).length )
				return;
			var placeType = this.$(".place-type-select option:selected").attr("id");
			var placePosition = this.$(".place-position .active input").attr("id");
			var isSecret = this.$(".place-is-secret-check").prop("checked");
			var npcs = this.getMeetableNpcs();
			var self = this;
			var opt = {".priority":placeName, 
					name:placeName,
					desc:placeDescription,
					type:placeType,
					position:placePosition,
					isSecret:isSecret,
					meetableNpc: npcs	
				};
			var target = $(event.currentTarget);
			target.button("loading");
			if ( this.currentPlace ) {
				this.currentPlace.set(opt);
				self.onCancelCreatePlace();
				target.button("reset");
			} else {
				opt.createBy = {
					user:Global.currentUser.id,
					time:Firebase.ServerValue.TIMESTAMP
				};
				this.placeCollection.create(opt,
				{success:function(){
					target.button("reset");
					self.onCancelCreatePlace();
					toastr["success"]("保存地点成功");
				},error:function(){
					target.button("reset");
					toastr["error"]("无法保存地点");
				}});
			}
		},
		getMeetableNpcs:function(){
			var array = this.$(".meetable-npc-list .meetable-npc-item");
			var ret = [];
			_.each(array, function(el){
				var npcId = $(el).find(".meetable-npc-name").viewEditExchangable("val");
				if ( npcId ) {
					var attr = $(el).find(".meetable-npc-attr").viewEditExchangable("val");
					if ( attr )	{
						ret.push({ attr:attr, npcId: npcId });
					} else {
						ret.push({ npcId: npcId });
					}
				}
			},this);
			return ret;
		},
		onCancelCreatePlace:function(){
			this.$(".place-detail").hide();
		},
		onAddMeetableNpc:function(){
			var view = new exports.MeetableNpcItem({model:{}, npcNames:npcNames});
			this.$(".meetable-npc-list").append(view.render().el);
		}
	});
});
