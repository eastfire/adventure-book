// JavaScript Document
(function($){
    $.widget( "ui.viewEditExchangable", {
    	version: "@VERSION",
    	options: {
            viewClass:"",
            editClass:"",
            viewTitle:"",
            editTitle:"",
            viewCursor:"pointer",
            editCursor:"auto",
            emptyNote:"",
            disabledTitle:"",
            disabledCursor:"auto",
            editType:"input",//input, textarea, select
            selects:[],
            toEdit:"click",//click,dblclick
            onBlur:"cancel",//"apply", "cancel", null
            onEscape:"cancel",//"cancel",null
            onEnter :"apply",//"apply", null
            onEdit : null,
            startWith:"view",//view, edit
            showLink:false,
            data: "",
            disabled: false,
            validate:null,
            invalidClass:"",
            onInvalid:null
    	},
    	_renderView:function(){
            var o = this.options;
            var el = this.element;
            var view = el.find(".exchangable-view");
            if ( o.editType == "select" ) {                
                var edit = el.find(".exchangable-edit");
                var selected = edit.find("option:selected[value="+o.data+"]")[0];
                view[0].innerHTML = (selected && selected.innerHTML) || o.emptyNote;
            } else if ( o.editType == "date" ) {
				view[0].innerHTML = o.data ? (new Date(o.data).toLocaleDateString()) : o.emptyNote;
            } else
                view[0].innerHTML = o.data || o.emptyNote;
            if ( o.showLink && o.data)
                view.linker({target:"blank"});
    	},
    	_renderEdit:function(){
            var o = this.options;
            var edit = this.element.find(".exchangable-edit");
            if ( o.editType=="select" ) {
                edit.empty();
                var index = -1;
                for ( var i = 0; i < o.selects.length; i++ ) {
					var opt = $("<option class='exchangable-edit-option' value="+o.selects[i].value+">"+o.selects[i].label+"</option>");
					if (o.selects[i].extra !== undefined )	{
						opt.data("extra",o.selects[i].extra);
					}
                    edit.append(opt);
                    if ( o.data == o.selects[i].value )
                        index = i;
                }
                edit.prop("selectedIndex",index);
            } else if ( o.editType=="date" ) {
				edit.val(o.data ? (new Date(o.data).toLocaleDateString()) : "");
            } else {
                edit.val(o.data);
            }
    	},
    	_create: function() {
            var self = this;
            var o = self.options;
            var el = self.element;
            var view = $("<label class='exchangable-view "+o.viewClass+"' style='display:"+(o.startWith=="view"?"block":"none")+"'></label>");
			var widget;
			if ( o.editType == "date" ){
				editWidget = "input";
			} else editWidget = o.editType
            var edit = $("<"+editWidget+" placeholder='"+o.emptyNote+"' class='exchangable-edit "+o.editClass+"' style='display:"+(o.startWith=="view"?"none":"block")+"' title='"+o.editTitle+"'/>");
            
            el.append(view);
            el.append(edit);

			if ( o.editType == "date") {
				edit.datepicker({
					onSelect:function(dateText, inst){
						edit.datepicker("hide");
					},
					onClose:function(dateText, inst){
						var date = edit.datepicker("getDate");
						if ( date ){
							o.data =Math.floor( (date.getTime()-new Date().getTimezoneOffset()*1000*60) / (1000*60*60*24))* 1000 * 60*60*24;
						} else {
							o.data = null;
						}
						self._renderView();
						self._renderEdit();
						view.show();
                        edit.hide();
						if (o.onEdit){
							o.onEdit(o.data);
						}
					},
				});
            }
            
            var applyEdit = function(){
                var d = edit.val();
                if ( o.validate && !o.validate(d) ) {
                    el.addClass(o.invalidClass);
                    if ( o.onInvalid )
                        o.onInvalid(d);
                    return false;
                }
                el.removeClass(o.invalidClass);
                o.data = d;
                self._renderView();
                if (o.onEdit){
                    o.onEdit(o.data);
                }
                return true;
            }
            this._renderEdit();
            this._renderView();
			if ( o.startWith == "edit" ){
				setTimeout(function(){
					edit.focus().select();
					edit.outerWidth(el.width());
					if ( o.editType == "textarea" )
						edit.outerHeight(el.height());
				},10);
			} else {
	            view.css({width:"100%",height:"100%"});
			}

            if ( o.editType == "textarea" ) {
                edit.css({"resize":"none"});
            }
            if ( o.disabled ) {
                edit.prop("disabled",true);
                view.attr({"title":o.disabledTitle,"cursor":o.disabledCursor});
            } else {
                view.attr({"title":o.viewTitle,"cursor":o.viewCursor});
            }
            view.bind(o.toEdit, function(event){
                if ( event.target.tagName == "A" )
                    return;
                if ( o.disabled )
                    return;                
                edit.outerWidth(el.width());
				if ( o.editType == "textarea" )
					edit.outerHeight(el.height());
                view.hide();
                edit.show();
                edit.focus();
                event.stopPropagation();
                event.preventDefault();
            });
            edit.bind("blur",function(event){
                if ( !o.onBlur || o.editType=="date") {
                    return;
                }

                if ( o.onBlur == "apply" ) {
                    if ( ! applyEdit() )
                        return;
                }
                if ( o.onBlur == "cancel" ) {
                    self._renderEdit();
                }
                view.show();
				view.css({width:"100%",height:"100%",display:"block"});
                edit.hide();
            });
            edit.bind("keypress",function(event){
                if ( event.keyCode == 13 ) {
                    if ( event.altKey && o.editType=="textarea") {
                        var val = this.value;
                        if ( typeof this.selectionStart == "number" && typeof this.selectionEnd == "number" ) {
                            var start = this.selectionStart;
                            this.value = val.slice(0,start)+"\n"+val.slice(this.selectionEnd);
                            this.selectionStart = this.selectionEnd = start + 1;
                        } else if ( document.selection && document.selection.createRange ) {
                            this.focus();
                            var range = document.selection.createRange();
                            range.text = "\r\n";
                            range.collapse(false);
                            range.select();
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        return;
                    }
                    if ( o.onEnter == "apply" ) {
                        if ( ! applyEdit() )
                            return;
                        view.show();
                        edit.hide();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                } else if ( event.keyCode == 27 ) {
                    if ( o.onEscape == "cancel" ) {
                        self._renderEdit();
                        view.show();
                        edit.hide();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }                
            });
        },
        val:function(){
			if ( this.options.data === undefined )
				return null;
            return this.options.data;
        },
		extraVal:function(){
			var o = this.options;
			var el = this.element;
			if ( o.editType !== "select" ){
				return null;
			}
			var extraData = el.find("option:selected").data("extra");
			if ( extraData !== undefined )
				return extraData;
			return null;
        },
        disable:function(){
            var self = this;
            var o = self.options;
            var el = self.element;
            var view = el.find(".exchangable-view");
            var edit = el.find(".exchangable-edit");
            o.disabled = true;
            edit.prop("disabled",true);
            view.attr({"title":o.disabledTitle,"cursor":o.disabledCursor});
        },
        enable:function(){            
            var self = this;
            var o = self.options;
            var el = self.element;
            var view = el.find(".exchangable-view");
            var edit = el.find(".exchangable-edit");
            o.disabled = false;
            edit.prop("disabled",false);
            view.attr({"title":o.viewTitle,"cursor":o.viewCursor});
        },
        _setOptions:function(option,value){
            $.Widget.prototype._setOptions.call(this,option,value);
            var self = this;
            var o = self.options;
            var el = self.element;
            var edit = el.find(".exchangable-edit");
            if ( option.data )
                o.data=option.data;
            if ( o.editType == "select" && option.selects) {
                o.selects = option.selects;                
                var found = false;
                for ( var i=0; i < o.selects.length; i++) {
                    if ( o.data == o.selects[i].value ) {
                        found = true;
                        break;
                    }
                }
                if ( !found )
                    o.data = null;
            }
            this._renderEdit();
            this._renderView();
        },
        _destroy : function() {
            var self = this;
            var o = self.options;
            var el = self.element;
            var view = el.find(".exchangable-view");
            var edit = el.find(".exchangable-edit");
            view.unbind(o.view2Edit);
            edit.unbind("blur");
            edit.unbind("keypress");
        }
    });
})(jQuery);
