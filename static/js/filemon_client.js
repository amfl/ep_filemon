exports.handleClientMessage_CUSTOM = function(hook, context, wut){
	// if(context.payload.authorId !== pad.getUserId()){ // if its not sending to self
	// 	if(context.payload.action === 'requestSTOP'){ // someone has requested we approve their stop_writing request - we recieved an offer
	// 		stop_writing.showStop();
	// 	}
	// 	if(context.payload.action === 'requestCONTINUE'){ // someone has requested we approve their stop_writing request - we recieved an offer
	// 		stop_writing.hideStop();
	// 	}
	// }

	console.log(context);

	// Adjust the contents of the fielmon div with jquery.
	$('#filemon_content').html(context.payload.contents);
}