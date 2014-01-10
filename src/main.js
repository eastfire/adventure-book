define(function(require,exports,module){
	var template = _.template(require("../layout/main.html"));
	$("body").html(template());

	$("#edit-npc").on("click",function(){
		$("#main-board").empty();
		var NpcEditor = require("./npc-editor").NpcEditor;
		var npcEditor = new NpcEditor();
		$("#main-board").append(npcEditor.render().el);
	});

	$("#edit-place").on("click",function(){
		$("#main-board").empty();
		var PlaceEditor = require("./place-editor").PlaceEditor;
		var placeEditor = new PlaceEditor();
		$("#main-board").append(placeEditor.render().el);
	});

	$("#edit-story").on("click",function(){
		$("#main-board").empty();
		var StoryEditor = require("./story-editor").StoryEditor;
		var storyEditor = new StoryEditor();
		$("#main-board").append(storyEditor.render().el);
	});
});