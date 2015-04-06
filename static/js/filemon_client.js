function requestAll() {
	var authorId = pad.getUserId();
	var padId = pad.getPadId();

	// Create a REQUEST message to send to the server
	var message = {
		type : 'filemon',
		action : 'requestUPDATE',
		padId : padId,
		authorId : authorId
	}
	pad.collabClient.sendMessage(message); // Send the request through the server to create a tunnel to the client
}

exports.handleClientMessage_shoutMessage = function(hook, context, wut){
	// Create divs and things.
	contents = context.payload.contents

	for (var key in contents) {
		// Check to see if div exists on client
		var id = 'ep_filemon_' + key;
		var elem = $('#'+id);

		if (elem.length) {  // div already exists
			if (contents[key] == null) {
				// Receiving a null signifies the file got deleted, or
				// can't be read.
				elem.remove();
			} else {
				elem.html(contents[key]);
			}
		}
		else {
			// Create the new div
			var elem = $('<div>')
				.attr('id', id)
				.html(contents[key]);

			// Insert it in alphabetical order according to its id
			var added = false;
			$('#ep_filemon_content > div').each(function() {
				if ($(this).attr('id') > id) {
					elem.insertBefore($(this));
					added = true;
				}
			});
			if (!added) {
				$('#ep_filemon_content').append(elem);
			}
		}

	}
}

exports.postAceInit = function(hook, context, wut) {
	// Request the entire filemon toolbar contents upon join
	requestAll();
}
