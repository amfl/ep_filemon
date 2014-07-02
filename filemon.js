var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var fs = require('fs');
var padMessageHandler = require("../../src/node/handler/PadMessageHandler");

// GLOBALS
var watchDir = '/home/user/watch/';
var files = {};

// Perform initial setup. Called once.
function init() {
	var dirContents = fs.readdirSync(watchDir);

	// Process each file.
	for (var i = 0, len = dirContents.length; i < len; i++) {
		processFile(dirContents[i], function(){});
	}

	fs.watch(watchDir, function (event, filename) {
		console.log('Watch dir modified: ' + event + " on " + filename);
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
	console.log("Sending to all: " + json_msg);

	// Let's try sending a custom message.
	var msg = {
		type: "COLLABROOM",
		data: {
			type: "CUSTOM",
			payload: json_msg,
		}
	};

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
	
	var nameArray = Object.keys(files).sort();
	for (var i = 0, len = nameArray.length; i < len; i++) {
		contents = contents + files[nameArray[i]];
	}
	return contents;
}

function processFile(filename, cb) {
	// Read the contents of the changed file and update the bar
	fs.readFile(watchDir + filename, 'utf8', function (err, data) {
		if (err) return cb(filename, err, null)

		// Update the global table of files.
		files[filename] = data;
		return cb(filename, null, data);
	});
}

exports.eejsBlock_styles = function (hook_name, args, cb){
  args.content = args.content + '<link href="../static/plugins/ep_filemon/static/css/filemon.css" rel="stylesheet">';
  return cb();
}

exports.eejsBlock_editbarMenuRight = function(hook_name, args, cb){
	args.content = '<div id="filemon"><div id="filemon_content">'+
		createMessage()+'</div></div>' + args.content;
	return cb();
}

// Set up :D
init();