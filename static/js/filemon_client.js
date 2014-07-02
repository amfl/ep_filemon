exports.handleClientMessage_CUSTOM = function(hook, context, wut){
	$('#filemon_content').html(context.payload.contents);
}