module.exports = {

    //---------------------------------------------------------------------
    // Action Name
    //
    // This is the name of the action displayed in the editor.
    //---------------------------------------------------------------------

    name: "Manage Server Integration",

    //---------------------------------------------------------------------
    // Action Section
    //
    // This is the section the action will fall into.
    //---------------------------------------------------------------------

    section: "Server Control",

    //---------------------------------------------------------------------
    // Action Subtitle
    //
    // This function generates the subtitle displayed next to the name.
    //---------------------------------------------------------------------

    subtitle: function (data) {
        const servers = ['Current Server', 'Temp Variable', 'Server Variable', 'Global Variable'];
        const info = ['Store YouTube/Twitch Name', 'Is syncing enabled?', 'Is YouTube?', 'Is Twitch?', 'Store Subscriber Role ID', 'Store Author ID', 'Sync Subscribers now', 'Store last sync timestamp'];
        return `${servers[parseInt(data.server)]} - ${info[parseInt(data.info)]}`;
    },

    //---------------------------------------------------------------------
    // DBM Mods Manager Variables (Optional but nice to have!)
    //
    // These are variables that DBM Mods Manager uses to show information
    // about the mods for people to see in the list.
    //---------------------------------------------------------------------

    // Who made the mod (If not set, defaults to "DBM Mods")
    author: "Lasse",

    // The version of the mod (Defaults to 1.0.0)
    version: "1.9.5", //Added in 1.9.5

    // A short description to show on the mod line for this mod (Must be on a single line)
    short_description: "Manages a servers Integrations (Twitch/YouTube).",

    // If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
    depends_on_mods: [{ name: 'WrexMods', path: 'aaa_wrexmods_dependencies_MOD.js' }],

	//---------------------------------------------------------------------

    //---------------------------------------------------------------------
    // Action Storage Function
    //
    // Stores the relevant variable info for the editor.
    //---------------------------------------------------------------------

    variableStorage: function (data, varType) {
        const type = parseInt(data.storage);
        if (type !== varType) return;
        const info = parseInt(data.info);
        let dataType = 'Unknown Type';
        switch (info) {
            case 0:
                dataType = 'String';
                break;
            case 1:
            case 2:
            case 3:
                dataType = 'Boolean';
                break;
            case 4:
            case 5:
                dataType = 'Role ID';
                break;
            case 7:
                dataType = 'Timestamp';
                break;
        }
        return ([data.varName2, dataType]);
    },
	
	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------
	
    fields: ["server", "varName", "info", "storage", "varName2"],
	
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
		<div>
			<p>
				<u>Mod Info:</u><br>
				Created by Lasse!
			</p>
		</div><br>
	<div>
		<div style="float: left; width: 35%;">
			Source Server:<br>
			<select id="server" class="round" onchange="glob.serverChange(this, 'varNameContainer')">
				${data.servers[isEvent ? 1 : 0]}
			</select>
		</div>
		<div id="varNameContainer" style="display: none; float: right; width: 60%;">
			Variable Name:<br>
			<input id="varName" class="round" type="text" list="variableList"><br>
		</div>
	</div><br><br><br>
	<div>
		<div style="float: left; width: 75%;">
			Source Info/Action:<br>
			<select id="info" class="round">
				<option value="0" selected>Store Twitch/YouTube Username</option>
				<option value="1">Is syncing enabled?</option>
				<option value="2">Is YouTube?</option>
				<option value="3">Is Twitch?</option>
				<option value="4">Subscriber Role ID</option>
				<option value="5">Store Author ID</option>
				<option value="6">Sync Subscribers now</option>
				<option value="7">Store Last Synced At Timestamp</option>
			</select>
		</div><br><br><br>
	</div>
    <div>
			<div style="float: left; width: 35%;">
				Store In:<br>
				<select id="storage" class="round">
					${data.variables[1]}
				</select>
			</div>
			<div id="varNameContainer2" style="float: right; width: 60%;">
				Variable Name:<br>
				<input id="varName2" class="round" type="text"><br>
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
	
	init: function() {
		const {glob, document} = this;
	
        glob.serverChange(document.getElementById('server'), 'varNameContainer');
	},
	
	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter,
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------
	
    action: function (cache) {
        const data = cache.actions[cache.index];
        const server = parseInt(data.server);
        const varName = this.evalMessage(data.varName, cache);
        const info = parseInt(data.info);
        var WrexMODS = this.getWrexMods();
        const targetServer = this.getServer(server, varName, cache);

        if (!targetServer) {
            this.callNextAction(cache);
            return;
        }

        console.log("Let's do it! " + targetServer.name);

        WrexMODS.require('snekfetch').get({
            url: 'https://discordapp.com/api/guilds/${targetServer.id}/integrations',
            headers: 'Authorization : Bot ' + this.getDBM().Files.data.settings.token
        }, (error, res, jsonData) => storeData(error, res, jsonData));	

            function storeData(error, res, jsonData) {

                var statusCode = res ? res.statusCode : 200;

                if (error) {
                    var errorJson = JSON.stringify({ error, statusCode })
                    _this.storeValue(errorJson, storage, varName, cache);

                    console.error("WebAPI: Error: " + errorJson + " stored to: [" + varName + "]");
                } else {

                    if (path) {
                        var outData = WrexMODS.jsonPath(jsonData, path);

                        if (_DEBUG) console.dir(outData);

                        try {
                            var test = JSON.parse(JSON.stringify(outData));
                        } catch (error) {
                            var errorJson = JSON.stringify({ error: error, statusCode: statusCode, success: false })
                            _this.storeValue(errorJson, storage, varName, cache);
                            console.error(error.stack ? error.stack : error);
                        }

                        var outValue = eval(JSON.stringify(outData), cache);

                        if (outData.success != null) {
                            var errorJson = JSON.stringify({ error: error, statusCode: statusCode, success: false })
                            _this.storeValue(errorJson, storage, varName, cache);
                            console.log("WebAPI: Error Invalid JSON, is the Path set correctly? [" + path + "]");
                        } else {
                            if (outValue.success != null || !outValue) {
                                var errorJson = JSON.stringify({ error: error, statusCode: statusCode, success: false })
                                _this.storeValue(errorJson, storage, varName, cache);
                                console.log("WebAPI: Error Invalid JSON, is the Path set correctly? [" + path + "]");
                            } else {
                                _this.storeValue(outValue, storage, varName, cache);
                                _this.storeValue(jsonData, 1, url, cache);
                                _this.storeValue(url, 1, url + "_URL", cache);
                                if (_DEBUG) console.log("WebAPI: JSON Data values starting from [" + path + "] stored to: [" + varName + "]");
                            }
                        }

                    } else {
                        if (_DEBUG) console.dir(jsonData);
                        _this.storeValue(jsonData, storage, varName, cache);
                        _this.storeValue(jsonData, 1, url, cache);
                        _this.storeValue(url, 1, url + "_URL", cache);
                        if (_DEBUG) console.log("WebAPI: JSON Data Object stored to: [" + varName + "]");
                    }
                }
                _this.callNextAction(cache);
            }




        if (info != 6) {

            console.log("Data is working! " + datatouse.text);

            let result;
            switch (info) {
                case 0:
                    result = datatouse.name;
                    break;
                case 1:
                    result = datatouse.syncing;
                    break;
                case 2:
                    result = Boolean(datatouse.type == "youtube");
                    break;
                case 3:
                    result = Boolean(datatouse.type == "twitch");
                    break;
                case 4:
                    result = datatouse.role_id;
                    break;
                case 5:
                    result = datatouse.user.id;
                    break;
                case 7:
                    result = datatouse.synced_at;
                    break;
                default:
                    break;
            }

            if (result !== undefined) {
                const storage = parseInt(data.storage);
                const varName2 = this.evalMessage(data.varName2, cache);
                this.storeValue(result, storage, varName2, cache);
            }
            this.callNextAction(cache);
        }
        else if (info == 6) {
            new Promise((resolve, _reject) => {
                WrexMODS.require('snekfetch').post('https://discordapp.com/api/guilds/${targetServer.id}/integrations/' + datatouse.id + '/sync')
                    .set('Authorization', `Bot ${this.getDBM().Files.data.settings.token}`)
                    .catch();
            });
            this.callNextAction(cache);
        }
        else { this.callNextAction(cache) }

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

    }

}; // End of module

