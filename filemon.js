var eejs              = require('ep_etherpad-lite/node/eejs');
var settings          = require('ep_etherpad-lite/node/utils/Settings');
var padMessageHandler = require("../../src/node/handler/PadMessageHandler");
var fs                = require('fs');
var path              = require('path')

// GLOBALS
var watchDir = 'watchDirectory';  // Overridden by anything in settings
var files    = {};  // Filenames and their contents in the watched directory.
										// Used to construct the message displayed.
var TAG      = 'ep_filemon: ';  // Tag used for logging

// Perform initial setup. Called once.
function init() {
	// Read watch directory from settings file
	settingsDir = settings.ep_filemon.watchDirectory;
	if (settingsDir) watchDir = settingsDir;
	else console.warn(TAG+'No settings found for watchDirectory. Using default.')

	watchDir = path.resolve(watchDir) + '/';
	console.log(TAG+'Watching directory: '+watchDir);

	// Populate the 'files' dictionary with the data that's in
	// here at the moment.
	var dirContents = fs.readdirSync(watchDir);
	for (var i = 0, len = dirContents.length; i < len; i++) {
		processFile(dirContents[i], function(){});
	}

	// Now start watching the directory for any changes.
	fs.watch(watchDir, function (event, filename) {
		console.log(TAG+'file '+filename+' modified: '+event);
		if (!filename) return;
		if (event == 'rename') {
			delete files[filename];
		}
		processFile(filename, function(filename, err, data) {
			var jsonMsg = {}
			jsonMsg[filename] = data;
			sendMessageToAll({'contents': jsonMsg});
		});
	});
}

function sendMessageToAll(json_msg) {
	// Put the message in the required packaging
	var msg = {
		type: "COLLABROOM",
		data: {
			type: "CUSTOM",
			payload: json_msg,
		}
	};

	// Ripped from https://github.com/JohnMcLear/ep_stop_writing/blob/master/handleMessage.js
	var sessions = padMessageHandler.sessioninfos;
	// TODO: Optimize me
	Object.keys(sessions).forEach(function(key){
		var session = sessions[key]
		padMessageHandler.handleCustomObjectMessage(msg, key, function(){
			// TODO: Error handling
		}); // Send a message to this session
	});
}

// Given a filename, modify the global file dictionary accordingly.
function processFile(filename, cb) {
	// Read the contents of the changed file and update the bar
	fs.readFile(watchDir + filename, 'utf8', function (err, data) {
		if (err) return cb(filename, err, null)

		// Update the global table of files.
		files[filename] = data;
		return cb(filename, null, data);
	});
}

//////////////////////////////////////////////////////////////////
// CALLBACKS
//////////////////////////////////////////////////////////////////

exports.eejsBlock_styles = function (hook_name, args, cb){
	args.content = args.content + '<link href="../static/plugins/ep_filemon/static/css/filemon.css" rel="stylesheet">';
	return cb();
}

exports.eejsBlock_editbarMenuRight = function(hook_name, args, cb){
	args.content = '<div id="ep_filemon"><div id="ep_filemon_content"></div></div>' + args.content;
	return cb();
}
exports.handleMessage = function(hook, context, cb) {
	// Figure out if we need to deal with this message
	var isFilemonMessage = false;
	if ( context.message.type == 'COLLABROOM' ) {
		if(context.message.data){
			if(context.message.data.type){
				if(context.message.data.type === 'filemon'){
					isFilemonMessage = true;
				}
			}
		}
	}

	if (isFilemonMessage) {
		console.log('filemon message received.');
		sendMessageToAll({'contents': files});
		cb([null]); // Mark the message as dealt with
	}
	cb(false); // This message isn't our problem!
}

//////////////////////////////////////////////////////////////////

// Set up :D
init();