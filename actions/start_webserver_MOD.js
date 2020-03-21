module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Start Webserver",

	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------

	section: "Website Control",

	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------

	subtitle: function (data) {
		return `Webserver on Port ${parseInt(data.port)}`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "ZockerNico & xSehrMotiviert",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.9.5", //Added in 1.9.5

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "This mod is able to start a webserver on which port you want.",

	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
	depends_on_mods: [
		{name:'WrexMODS',path:'aaa_wrexmods_dependencies_MOD.js'}
	],

	//---------------------------------------------------------------------

	//---------------------------------------------------------------------
	// Action Storage Function
	//
	// Stores the relevant variable info for the editor.
	//---------------------------------------------------------------------

	variableStorage: function () {
	},

	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------

	fields: ["port", "folder", "index", "debug"],

	//---------------------------------------------------------------------
	// Command HTML
	//
	// This function returns a string containing the HTML used for
	// editting actions.
	//
	// The "isEvent" parameter will be true if this action is being used
	// for an event. Due to their nature, events lack certain information,
	// so edit the HTML to reflect this.
	//
	// The "data" parameter stores constants for select elements to use.
	// Each is an array: index 0 for commands, index 1 for events.
	// The names are: sendTargets, members, roles, channels,
	//                messages, servers, variables
	//---------------------------------------------------------------------

	html: function (isEvent, data) {
		return `
	<div id ="wrexdiv" style="width: 550px; height: 350px; overflow-y: scroll; overflow-x: hidden;">
	<div>
		<p>
		Made by ${this.author}.
		</p>
		<div style="padding-top: 8px; float: left; width: 20%;">
			Port:<br>
			<input id="port" class="round" type="text" placeholder="8080">
		</div>
		<div style="padding-top: 8px; float: left; width: 78%;">
			Website Folder:<br>
			<input id="folder" class="round" type="text" placeholder="./web">
		</div>
		<div style="padding-top: 8px; float: left; width: 18%;">
			Index File:<br>
			<select id="index" class="round">
				<option value="true">Yes</option>
				<option value="false" selected>No</option>
			</select>
		</div>
		<div style="padding-top: 8px; padding-left: 10px; float: left; width: 18%;">
			Debug Data:<br>
			<select id="debug" class="round">
				<option value="true" selected>Yes</option>
				<option value="false">No</option>
			</select>
		</div>
		<div style="padding-top: 8px; float: left; width: 100%;">
			<br><h2><u>Explanations:</u></h2>
			<h3>Index File:</h3> If you have a file called "index.html" in a position like "./web/text/index.html" it wont load at "/test/index.html" rather at "/test/".<br>
			<h3>Debug Data:</h3> It will log many useful informations in your bot's console. Activate this if you are experiencing issues.<br>
		</div>
	</div>
	</div>`
	},

	//---------------------------------------------------------------------
	// Action Editor Init Code
	//
	// When the HTML is first applied to the action editor, this code
	// is also run. This helps add modifications or setup reactionary
	// functions for the DOM elements.
	//---------------------------------------------------------------------

	init: function () {
		const { glob, document } = this;
	},

	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter,
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------

	action: function (cache) {
		//Load data
		const data = cache.actions[cache.index];
		const DBM = this.getDBM();
		const WrexMods = this.getWrexMods();//As always.
		const fs = require('fs');
		var port = this.evalMessage(data.port, cache);
		var folder = this.evalMessage(data.folder, cache);

		//Check input
		if(this.evalMessage(data.index, cache) == 'true') {
			var index = true;
		} else {
			var index = false;
		};
		if(this.evalMessage(data.debug, cache) == 'true') {
			var debug = true;
		} else {
			var debug = false;
		};
		if(parseInt(port) < 1025 || parseInt(port) > 9999) {
			DBM.Webserver.genError('log', 'Invalid port! It needs to be a number between 1024 and 9999.');
			return;
		};

		var dir;
		try {
			dir = fs.readdirSync(folder);
		} catch(error) {
			if(error || !dir) {
				DBM.Webserver.genError('log', 'Please insert a valid directory! It needs to be inside your bot\'s folder.');
				return;
			};
		};
	
		DBM.Webserver.loadServer(WrexMods, folder, port, index, debug);

		this.callNextAction(cache);
	},

	//---------------------------------------------------------------------
	// Action Bot Mod
	//
	// Upon initialization of the bot, this code is run. Using the bot's
	// DBM namespace, one can add/modify existing functions if necessary.
	// In order to reduce conflictions between mods, be sure to alias
	// functions you wish to overwrite.
	//---------------------------------------------------------------------

	mod: function (DBM) {
		DBM.Webserver = {};
		DBM.Webserver.connections = [];
		DBM.Webserver.apps = [];

		DBM.Webserver.loadServer = function(WrexMods, folder, newport, index, debug) {
			//Convert input
			port = DBM.Webserver.checkPort(newport);

			//Check port
			if(port == 'occupied' || port == false) {
				DBM.Webserver.genError('log', `Port ${newport} is already occupied!`);
				return;
			};
			

			//Log all avaible adresses
			if(debug) {
				console.log('');
				console.log('Starting Webserver...');
				console.log('---------------------');
			};
			DBM.Webserver.logConnections(port, debug);

			//Start Webserver
			try {
				//Create new Webinterface
				DBM.Webserver.createApp(WrexMods, port);
			
				if(debug) {
					console.log('');
					console.log('Open Port:')
					console.log('---------------------');
					console.log(`${port}`);
					console.log('---------------------');
				};
			
				//GET events
				if(debug) {
					console.log('');
					console.log(`Loading Website Data:`);
					console.log('---------------------');
				};
			
				var path = `${folder}`;
				var webpath = `${DBM.Webserver.connections[port][0].address}:${port}`;
				DBM.Webserver.checkFolder(path, webpath, index, debug);
			
				//Start Webserver
				DBM.Webserver.startApp(port);
				if(debug) {
					console.log('');
					console.log(`Website is online!`);
					console.log('---------------------');
				} else {
					console.log(`Website is online!`);
				};
			} catch(error) {
				if(error) {
					DBM.Webserver.genError('error', error);
				};
			};
		};

		DBM.Webserver.createApp = function(WrexMods, port) {
			if(!WrexMods || !port) {//Check input
				return false;
			};
			const express = WrexMods.require('express');
			const image = require('express-image');
			DBM.Webserver.express = express;
			DBM.Webserver.image = image;
			var app = express();//Create a new web application
			DBM.Webserver.apps[port] = app;
			return app;
		};

		DBM.Webserver.startApp = function(port) {
			if(!port || DBM.Webserver.apps[port] === undefined) {//Check input
				return false;
			};
			var app = DBM.Webserver.apps[port];//Start application
			app.listen(port, function() {
			});
		};

		DBM.Webserver.genError = function(type, error) {
			if(!type || !error) {//Check input
				return false;
			};
			console.log('');
			console.log('Webserver: ERROR!');
			console.log('---------------------');
			console.log('');
			switch(type) {
				case 'error':
					console.error(error);
					break;
				case 'log':
					console.log(error);
					break;
			};
			console.log('');
			console.log('---------------------');
		};

		DBM.Webserver.logConnections = function(port, debug) {
			try {
				const os = require('os');
				const NetworkInterfaces = os.networkInterfaces();//Get all connections
				if(debug) {
					console.log('');
					console.log('Open Connections:');
					console.log('---------------------');
				};
				Object.keys(NetworkInterfaces).forEach(function(ifname) {
					var alias = 0;
					
					NetworkInterfaces[ifname].forEach(function (iface) {//Check for IPv4
						if ('IPv4' !== iface.family || iface.internal !== false) {
							return;//Sort IPv6 out
						};
				
						DBM.Webserver.connections[port] = [];//Push connection into a list for the current port
						DBM.Webserver.connections[port].push({'ifname': `${ifname}`, 'address': `${iface.address}`});

						if(debug) {
							if(alias >= 1) {
								//If there are multible IPv4 adresses
								console.log(`${ifname} [${alias}]: ${iface.address}`);
							} else {
								//If there is only one IPv4 adress
								console.log(`${ifname}: ${iface.address}`);
							};
						};
						++alias;
					});
				});
				if(debug) {
					console.log('---------------------');
				};
			} catch(error) {
				if(error) {
					console.error(error);
				};
			};
		};

		DBM.Webserver.checkPort = function(port) {
			if(port === undefined || parseInt(port) === NaN) {//Check input
				return false;
			};
			if(DBM.Webserver.connections[port] !== undefined) {
				return 'occupied';
			};
			var checkPort = parseInt(port).toString();//Convert port
			switch(checkPort.length) {
				case 1:
					return `000${checkPort}`;
				case 2:
					return `00${checkPort}`;
				case 3:
					return `0${checkPort}`;
				case 4:
				default:
					return `${checkPort}`;
			};
		};

		DBM.Webserver.checkFolder = function(path, webpath, index, debug, cache) {
			if(!path || webpath === undefined) {//Check input
				return false;
			};
			if(index === undefined) {
				index = false;
			};
			var app = DBM.Webserver.apps[port];
			const fs = require('fs');
			if(debug) {
				console.log(`Loading files in [${path}]...`);
			};
			if(!path) {return false};
			fs.readdirSync(path).forEach(entry => {
				if(fs.lstatSync(`${path}/${entry}`).isDirectory()) {//Check for Directory
					if(cache !== undefined) {//Create new Cache
						var newcache = `${cache}/${entry}`;
					} else {
						var newcache = `/${entry}`;
					};
					DBM.Webserver.checkFolder(`${path}/${entry}`, `${webpath}/${entry}`, index, debug, newcache);//Check next Directory with new Cache
				} else {
					if(index === true && entry == 'index.html') {
						if(debug) {
							console.log(`Loaded [${path}/${entry}] at [${webpath}/]!`);
						};
						if(!cache) {//Image
							if(/.png/igm.test(entry)) {
								app.get(`/`, function expressImage(req, res) {
									res.writeHead(200, {'Content-Type': 'image/png' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.jpg/igm.test(entry)) {
								app.get(`/`, function expressImage(req, res) {
									res.writeHead(200, {'Content-Type': 'image/jpg' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.jpeg/igm.test(entry)) {
								app.get(`/`, function expressImage(req, res) {
									res.writeHead(200, {'Content-Type': 'image/jpeg' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.gif/igm.test(entry)) {
								app.get(`/`, function expressImage(req, res) {
									res.writeHead(200, {'Content-Type': 'image/gif' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else {//File
								app.get(`/`, function(req, res) {
									res.send(fs.readFileSync(`${path}/${entry}`, 'utf8'));
								});
							};
						} else {//Image & Cache
							if(/.png/igm.test(entry)) {
								app.get(`${cache}/`, function(req, res) {
									res.writeHead(200, {'Content-Type': 'image/png' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.jpg/igm.test(entry)) {
								app.get(`${cache}/`, function(req, res) {
									res.writeHead(200, {'Content-Type': 'image/jpg' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.jpeg/igm.test(entry)) {
								app.get(`${cache}/`, function(req, res) {
									res.writeHead(200, {'Content-Type': 'image/jpeg' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else if(/.gif/igm.test(entry)) {
								app.get(`${cache}/`, function(req, res) {
									res.writeHead(200, {'Content-Type': 'image/gif' });
									res.send(fs.readFileSync(`${path}/${entry}`), 'binary');
								});
							} else {//File & Cache
								app.get(`${cache}/`, function(req, res) {
									res.send(fs.readFileSync(`${path}/${entry}`, 'utf8'));
								});
							};
						};
					} else {//Index Files
						if(debug) {
							console.log(`Loaded [${path}/${entry}] at [${webpath}/${entry}]!`);
						};
						app.get(`${cache}/${entry}`, function(req, res) {
							res.send(fs.readFileSync(`${path}/${entry}`, 'utf8'));
						});
					};
				};
			});
		};
	}

}; // End of module