module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Reply Message",

	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------

	section: "Messaging",

	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------

	subtitle: function (data) {
		const list = ["Command Message", "Temp Variable", "Server Variable", "Global Variable"];

		return `Reply to ${list[parseInt(data.msg)]} with "${data.message.toString()}"`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "ZockerNico",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.0.0",

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Replies Message",

	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
	/*depends_on_mods: [
		{name:'WrexMODS',path:'aaa_wrexmods_dependencies_MOD.js'}
	],*/

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

	fields: ["msg", "varName", "message"],

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
		<div>
			<p>
			Made by ${this.author}.
			</p>
		</div>
		<div style="float: left; width: 35%; padding-top: 8px;">
			Source Message:<br>
			<select id="msg" class="round" onchange="glob.messageChange(this, 'varNameContainer')">
				${data.messages[isEvent ? 1 : 0]}
			</select>
		</div>
		<div id="varNameContainer" style="display: none; float: right; width: 60%; padding-top: 8px;">
			Variable Name:<br>
			<input id="varName" class="round" type="text" list="variableList">
		</div><br><br><br>
		<div style="float: left; width: 99%; padding-top: 8px;">
			Message:<br>
			<textarea id="message" rows="9" placeholder="Insert message here..." style="width: 99%; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
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

		glob.memberChange(document.getElementById('member'), 'varNameContainer');
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
		const msg = parseInt(data.msg);
		const text = this.evalMessage(data.message, cache);
		const varName = this.evalMessage(data.varName, cache);
		const target = this.getMessage(msg, varName, cache);

		if(!msg == undefined || !text == undefined) {
			return console.log('Please insert some text!');
		};

		target.reply(`${text}`);
		
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

	}

}; // End of module