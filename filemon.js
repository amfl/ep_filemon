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
			sendMessageToAll({'contents': createMessage()});
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

// Creates the actual message that is displayed.
function createMessage() {
	var contents = '';
	
	// Go through the file dictionary in alphabetical order
	// to construct the final message.
	var nameArray = Object.keys(files).sort();
	for (var i = 0, len = nameArray.length; i < len; i++) {
		contents = contents + files[nameArray[i]];
	}
	return contents;
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
	args.content = '<div id="filemon"><div id="filemon_content">'+
		createMessage()+'</div></div>' + args.content;
	return cb();
}

//////////////////////////////////////////////////////////////////

// Set up :D
init();