define(function(require,exports,module){
	exports.MAX_CHECK_DIFFICULTY = 13;
	exports.MAX_CHOICE_ITEM_NUMBER = 4;
	var insertToTextarea=function(textarea,text){
		var val = textarea.value;
		if ( typeof textarea.selectionStart == "number" && typeof textarea.selectionEnd == "number" ){
			var start = textarea.selectionStart;
			textarea.value = val.slice(0, start) + text+val.slice(textarea.selectionEnd);
			textarea.selectionStart = textarea.selectionEnd = start + text.length;
			textarea.focus();
		} else if ( document.selection && document.selection.createRange){
			textarea.focus();
			var range = document.selection.createRange();
			range.text = text;
			range.collapse(false);
			range.select();
		}
	};
	var TextSegmentEditor = Backbone.View.extend({
		template : _.template(require("../layout/text-segment-editor.html")),
		events:{
			"click .text-segment-insert-place":"onInsertPlace",
			"click .text-segment-insert-npc":"onInsertNPC",
			"click .text-segment-insert-attr":"onInsertAttr",
			"click .text-segment-insert-action":"onInsertAction",
			"click .text-segment-insert-ta":"onInsertTA",
		},
		initialize:function(options){
			this.options = options;
			this.initLayout();
		},
		initLayout:function(){
			this.$el.addClass("text-segment-editor segment-editor");
			this.$el.html(this.template());
			this.$el.data("view",this);
			this.textarea = this.$(".text-segment-text");
			this.textarea.html(this.model);
		},
		onInsertPlace:function(e){
			e.stopPropagation();
			insertToTextarea(this.textarea[0], "[[地点]]");
		},
		onInsertNPC:function(e){
			e.stopPropagation();
			insertToTextarea(this.textarea[0], "[[角色]]");
		},
		onInsertAttr:function(e){
			e.stopPropagation();
			insertToTextarea(this.textarea[0], "[[形容词]]的");
		},
		onInsertAction:function(e){
			e.stopPropagation();
			insertToTextarea(this.textarea[0], "[[动作]]");
		},
		onInsertTA:function(e){
			e.stopPropagation();
			insertToTextarea(this.textarea[0], "[[TA]]");
		},
		val:function(){
			return {type:"text",val:this.textarea.val()};
		}
	});
	var ChoiceSegmentEditor = Backbone.View.extend({
		template : _.template(require("../layout/choice-segment-editor.html")),
		choice_item_template : _.template(require("../layout/choice-item.html")),
		events:{
			"click .choice-item-toggle":"onToggleChoice",
		},
		initialize:function(options){
			this.options = options;
			this.initLayout();
			this.bindEvent();
		},
		initLayout:function(){
			this.$el.addClass("choice-segment-editor segment-editor");
			this.$el.html(this.template());
			this.$el.data("view",this);
			this.choice_list = this.$(".choice-list");
		},
		bindEvent:function(){
			var self = this;
			this.$(".choice-segment-add-choice").on("click",function(e){
				self.onAddChoice(e);
			});
		},
		onAddChoice:function(e){
			var self = this;
			e.stopPropagation();
			if ( this.choice_list.children().length >= exports.MAX_CHOICE_ITEM_NUMBER )
				return;
			var el = $("<div class='choice-item'></div>");
			el.html(this.choice_item_template());
			this.choice_list.append(el);
			var view = new exports.SegmentEditor();
			el.find(".choice-item-number").text("选项"+(el.index()+1)+":");
			el.find(".choice-item-name").viewEditExchangable({
				onBlur:"apply",
				emptyNote:"请填写选项内容"
			});
			el.children(".choice-item-content").append(view.render().el);
			el.find(".delete-choice-item").on("click",function(e){
				self.onDeleteChoice(e);
			});
			this.renderList();
		},
		onDeleteChoice:function(e){
			e.stopPropagation();
			var target = $(e.currentTarget);
			var choice_item = target.parent().parent();
			choice_item.remove();
			this.renderList();			
		},
		renderList:function(){
			if ( this.choice_list.children().length >= exports.MAX_CHOICE_ITEM_NUMBER ){
				this.choice_list.siblings(".choice-segment-add-choice").hide();
			} else 
				this.choice_list.siblings(".choice-segment-add-choice").show();
			_.each(this.choice_list.children(), function(el){
				el = $(el);
				el.children(".choice-item-title").children(".choice-item-toggle").children(".choice-item-number").text("选项"+(el.index()+1)+":");
			});
		},
		onToggleChoice:function(e){
			e.stopPropagation();
			var target = $(e.currentTarget);
			target.parent().siblings(".choice-item-content").toggle("drop");
			var icon = target.children(".toggle-icon");
			icon.toggleClass("glyphicon-chevron-down");
			icon.toggleClass("glyphicon-chevron-up");
		},
		val:function(){
			var allChoice = this.choiceList.children(".choice-item");
			var choice = [];
			_.each(allChoice,function(choice){
				var choiceName = $(choice).children(".choice-item-title").children(".choice-item-toggle").children(".choice-item-name").viewEditExchangable("val");
				var choiceSegment = $(choice).children(".choice-item-content").children().data("view").val();
				choice.push({name:choiceName,segment:choiceSegment});
			},this);			
			var ret = {type:"choice",choice:choice}
			return ;
		}
	});
	var CheckSegmentEditor = Backbone.View.extend({
		template : _.template(require("../layout/check-segment-editor.html")),
		events:{
			
		},
		initialize:function(options){
			this.options = options;
			this.initLayout();
			this.bindEvent();
		},
		initLayout:function(){
			this.$el.data("view",this);
			this.$el.addClass("check-segment-editor segment-editor");
			this.$el.html(this.template());
			this.checkSuccessTab = this.$('.check-success-tab');
			this.checkFailTab = this.$('.check-fail-tab');
			this.checkSuccessPane = this.$('.check-success-pane');
			this.checkFailPane = this.$('.check-fail-pane');
			this.checkSubjectSelect = this.$(".check-subject-select");
			this.generateSubjectSelect();
			this.checkDiceNumberSelect = this.$(".check-dice-number-select");
			this.checkDifficultySelect = this.$(".check-difficulty-select");
			this.generateDifficultySelect();
			this.checkHideSubjectCheck = this.$(".check-hide-subject-check");
			this.checkCardUsableCheck = this.$(".check-card-usable-check");
			this.checkFailPane.hide();
			this.checkSuccessRate = this.$(".check-success-rate");
			this.checkFailRate = this.$(".check-fail-rate");
			var view = new exports.SegmentEditor();
			this.checkSuccessPane.append(view.render().el);
			var view2 = new exports.SegmentEditor();
			this.checkFailPane.append(view2.render().el);
		},
		generateSubjectSelect:function(){

		},
		generateDifficultySelect:function(){
			for ( var i = 0 ; i <= exports.MAX_CHECK_DIFFICULTY; i++){
				this.checkDifficultySelect.append("<option class='check-difficulty-option' value='"+i+"'>"+i+"</option>");
			}
		},
		bindEvent:function(){
			var self = this;
			this.checkSuccessTab.click(function (e) {
				e.preventDefault()
				self.checkSuccessPane.show();
				self.checkFailPane.hide();
			});
			this.checkFailTab.click(function (e) {
				e.preventDefault()
				self.checkSuccessPane.hide();
				self.checkFailPane.show();
			});
			this.checkDiceNumberSelect.on("change",function(e){
				self.renderSuccessRate();
			});
			this.checkDifficultySelect.on("change",function(e){
				self.renderSuccessRate();	
			});
		},
		renderSuccessRate:function(){
			var diceNumber = this.checkDiceNumberSelect.val();
			var difficulty = this.checkDifficultySelect.val();
			if ( diceNumber == 0 ){
				if ( difficulty > 0 ) {
					successRate = 0;
				} else successRate = 100;
			} else if ( diceNumber == 1 ){
				successRate = Math.max(0,Math.round((7 - Math.max(1,difficulty) )/6*100));
			} else if ( diceNumber == 2 ){
				var rate = [36,35,33,30,26,21,15,10,6,3,1,0];
				successRate = Math.max(0,Math.round(rate[Math.min(11,Math.max(2,difficulty)-2)]/36*100));
			}
			var failRate = 100 - successRate;
			this.checkSuccessRate.html("成功("+successRate+"%)");
			this.checkFailRate.html("失败("+failRate+"%)");
		},
		val:function(){
			var type = this.checkSubjectSelect.val();
			var diceNumber = this.checkDiceNumberSelect.val();
			var difficulty = this.checkDifficultySelect.val();
			var hide = this.checkHideSubjectCheck.val();
			var card = this.checkCardUsableCheck.val();
			var success = this.checkSuccessPane.children().data("view").val();
			var fail = this.checkFailPane.children().data("view").val();
			var ret = {
				type: "check",
				hide: hide,
				card: card,
				type: type,
				dice: diceNumber,
				difficulty: difficulty,
				success: success,
				fail: fail
			}
		}
	});

	var ResultItemView = Backbone.View.extend({
		tagName:"li",
		template : _.template(require("../layout/result-item.html")),
		initialize:function(options){
			this.options = options;
			this.initLayout();
		},
		initLayout:function(){
			var resultTypes = [
				{label:"获得故事点",value:"getSP"},
				{label:"获得命运点",value:"getFP"},
				{label:"获得卡牌",value:"getCard"},
				{label:"失去卡牌",value:"loseCard"},
				{label:"获得任务",value:"getQuest"},
				{label:"任务成功",value:"questSuccess"},
				{label:"任务失败",value:"questFail"},
				{label:"移动到",value:"moveToPlace"},
				{label:"遭遇",value:"meet"}];
			var cardTypes = [
				{label:"技能",value:"skill"},
				{label:"状态",value:"status"},
				{label:"道具",value:"item"},
				{label:"同伴",value:"company"}];
			var numbers = [
				{label:"1",value:"1"},
				{label:"2",value:"2"},
				{label:"3",value:"3"},
				{label:"4",value:"4"}];
			this.$el.data("view",this);
			this.$el.addClass("result-item list-group-item");
			this.$el.html(this.template());
			var self = this;
			this.resultTypeSelect = this.$(".result-type-select");
			this.resultSubTypeSelect = this.$(".result-subtype-select").hide();
			this.resultObjectSelect = this.$(".result-object-select").hide();
			this.resultValueSelect = this.$(".result-value-select").hide();
			this.$(".delete-result-item").on("click",function(e){
				e.stopPropagation();
				self.$el.remove();
			});
			this.resultTypeSelect.viewEditExchangable({
				onBlur:"apply",
				editType: "select",
				emptyNote:"奖励类型",
				selects:resultTypes,
				onEdit:function(resultType){
					switch (resultType)	{
						case "getSP":
						case "getFP":
							self.resultSubTypeSelect.hide();
							self.resultObjectSelect.hide();
							self.resultValueSelect.show();
							break;
						case "getCard":
						case "loseCard":
							self.resultSubTypeSelect.show();
							self.resultObjectSelect.hide();
							self.resultValueSelect.hide();
							break;
					}
				}
			});

			this.resultSubTypeSelect.viewEditExchangable({
				onBlur:"apply",
				editType: "select",
				emptyNote:"请选择卡牌类型",
				selects:cardTypes,
				onEdit:function(cardType){
					switch (cardType)	{
						case "skill":
							self.resultObjectSelect.show();
							self.resultValueSelect.hide();
							break;
						case "status":
							self.resultObjectSelect.show();
							self.resultValueSelect.hide();
							break;
						case "item":
							self.resultObjectSelect.show();
							self.resultValueSelect.show();
						case "company":
							self.resultObjectSelect.show();
							self.resultValueSelect.hide();
							break;
					}
				}
			});

			this.resultValueSelect.viewEditExchangable({
				onBlur:"apply",
				editType: "select",
				emptyNote:"请选择数字",
				selects:numbers,
			});
		},
	});
	var ResultSegmentEditor = Backbone.View.extend({
		template : _.template(require("../layout/result-segment-editor.html")),
		events:{
			"click .result-segment-add-result":"onAddResultItem"
		},
		initialize:function(options){
			this.options = options;
			this.initLayout();			
		},
		initLayout:function(){
			this.$el.data("view",this);
			this.$el.addClass("result-segment-editor segment-editor");
			this.$el.html(this.template());
			this.resultList = this.$(".result-list");
		},
		onAddResultItem:function(e){
			var view = new ResultItemView({model:null});
			this.resultList.append(view.render().el);
		},
		val:function(){
			
		}
	});
	exports.SegmentEditor = Backbone.View.extend({
		template : _.template(require("../layout/segment-editor.html")),
		events:{
			"click .segment-toggler":"onToggleSegment",
			"click .delete-segment":"onDeleteSegment"
		},
		initialize:function(options){
			this.options = options || {};
			this.initLayout();
			this.bindEvent();
		},
		initLayout:function(){
			this.$el.addClass("col-sm-offset-1 segment-editor list-group-item");
			this.$el.html(this.template());
			this.$el.data("view",this);
			this.segmentList = this.$(".segment-list");
			if ( !this.model && this.options.isFirstSegment){
				var view = new TextSegmentEditor({model:"你在[[地点]]遇到了[[形容词]]的[[角色]]，决定[[动作]][[TA]]。"});
				this.segmentList.append(view.render().el);
			}
		},
		bindEvent:function(){
			var self = this;
			this.$(".create-text-segment").on("click",function(e){
				self.onCreateTextSegment(e)
			});
			this.$(".create-result-segment").on("click",function(e){
				self.onCreateResultSegment(e)
			});
			this.$(".create-choice-segment").on("click",function(e){
				self.onCreateChoiceSegment(e)
			});
			this.$(".create-check-segment").on("click",function(e){
				self.onCreateCheckSegment(e)
			});
		},
		onToggleSegment:function(e){
			e.stopPropagation();
			var target = $(e.currentTarget);
			target.siblings(".segment-content").toggle("drop");
			var icon = target.children(".toggle-icon");
			icon.toggleClass("glyphicon-chevron-down");
			icon.toggleClass("glyphicon-chevron-up");
		},
		onDeleteSegment:function(e){
			e.stopPropagation();
			var target = $(e.currentTarget);
			target.parent().parent().remove();
		},
		onCreateTextSegment:function(e){
			e.stopPropagation();
			var view = new TextSegmentEditor();
			this.segmentList.append(view.render().el);
		},
		onCreateChoiceSegment:function(e){
			e.stopPropagation();
			var view = new ChoiceSegmentEditor();
			this.segmentList.append(view.render().el);
		},
		onCreateCheckSegment:function(e){
			e.stopPropagation();
			var view = new CheckSegmentEditor();
			this.segmentList.append(view.render().el);
		},
		onCreateResultSegment:function(e){
			e.stopPropagation();
			var view = new ResultSegmentEditor();
			this.segmentList.append(view.render().el);
		},
		val:function(){
			var ret = [];
			_.each(this.segmentList, function(seg){
				ret.push($(seg).data("view").val());
			}, this);
			return ret;
		}
	});
});