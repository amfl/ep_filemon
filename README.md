ep_filemon
=======

**ep_filemon** is an etherpad plugin which monitors a directory for changes and constructs a message from file contents to be displayed on the toolbar. These files can be written to by other programs and the etherpad toolbar will update in real time, providing an easy way to get the output of anything into etherpad.

It is inspired by conf.d directories on linux, and the versatility of the text source in Open Broadcaster.

# Settings

The watch directory is customizable, but will default to `watchDirectory` inside the default etherpad installation directory.

To change it, append the following into your `settings.json`:

    "ep_filemon": {  
        "watchDirectory":"/home/user/watch/"
    }

# Example

![Example image](http://i.imgur.com/CXQkkYa.png)

The above image shows an example configuration which could be reading from streaming and mumble servers.

To create an effect similar to above, you might want a directory setup as follows.

    user@ubuntuvm:~/watch$  ls
    10-streaminfo  20-mumble

    user@ubuntuvm:~/watch$  cat 10-streaminfo 
    <img src="http://i.imgur.com/5L8RCuL.png" alt="Streaming" title="Streaming" height="10px" width="18px">
    <a href="#" title="Viewers: 1">amfl</a>, 
    <a href="#" title="Viewers: 2">Joe</a>,
    <a href="#" title="Viewers: 1">Smith</a>

    user@ubuntuvm:~/watch$  cat 20-mumble 
    <img src="http://i.imgur.com/njgtKqa.png" alt="Mumble" title="Mumble" height="12px" width="12px">
    amfl, <span style="text-decoration: line-through; opacity: 0.3">Ben</span>

You'll have to deal with creating these files in the watched directory and updating them yourself, this is just an example!