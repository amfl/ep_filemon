ep_filemon
=======

**ep_filemon** is an etherpad plugin which monitors a given folder for changes, and constructs a message from file contents is displayed on the toolbar.

These files can be written to by other programs, providing an easy way to get the output of anything into etherpad.

Inspired by conf.d directories on linux, and the versatility of the text source in Open Broadcaster.

# Settings

The watch directory is customizable, but will default to `watchDirectory` inside the default etherpad installation directory.

To change, append the following into your `settings.json`:

    "ep_filemon": {  
        "watchDirectory":"/home/user/watch/"
    }

# Example

![Example image](http://i.imgur.com/OuTgrP9.png)

To create an effect similar to above, you might want a folder setup as follows.

	user@ubuntuvm:~/watch  ls
	10-streaminfo  20-motd
	user@ubuntuvm:~/watch  cat 10-streaminfo 
	Now streaming: <a href="#">amfl</a>, <a href="#">joe</a><br>
	user@ubuntuvm:~/watch  cat 20-motd 
	Message of the day: Hello github
