module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Control Member Data",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Deprecated",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const channels = ['Mentioned User', 'Command Author', 'Temp Variable', 'Server Variable', 'Global Variable'];
	switch(parseInt(data.changeType)) {
		case 0:
			return `${channels[parseInt(data.member)]}: Set "${data.value}" to "${data.dataName}"`;
		case 1:
			return `${channels[parseInt(data.member)]}: Add "${data.value}" to "${data.dataName}"`;
		case 2:
			return `${channels[parseInt(data.member)]}: Clear All Data`;
	};
},

//---------------------------------------------------------------------
// DBM Mods Manager Variables (Optional but nice to have!)
//
// These are variables that DBM Mods Manager uses to show information
// about the mods for people to see in the list.
//---------------------------------------------------------------------

// Who made the mod (If not set, defaults to "DBM Mods")
author: "DBM & ZockerNico",

// The version of the mod (Defaults to 1.0.0)
version: "1.9.5", //Added in 1.9.5

// A short description to show on the mod line for this mod (Must be on a single line)
short_description: "Added more options to default action and changed UI.",

// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods


//---------------------------------------------------------------------


//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["member", "varName", "dataName", "changeType", "value"],

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

html: function(isEvent, data) {
	return `
<div>
	<div>
		<p>
			This action has been modified by DBM Mods.<br><br>
		</p>
	</div>
	<div>
	<div style="float: left; width: 35%;">
		Member:<br>
		<select id="member" class="round" onchange="glob.memberChange(this, 'varNameContainer')">
			${data.members[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text" list="variableList">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 40%;">
		Control Type:<br>
		<select id="changeType" class="round" onchange="glob.onChange(this)">
			<option value="0" selected>Set Value</option>
			<option value="1">Add Value</option>
			<option value="2">Clear Data</option>
		</select>
	</div>
	<div id="dataDiv" style="display: none; float: right; width: 55%;">
		Data Name:<br>
		<input id="dataName" class="round" type="text">
	</div>
</div><br><br><br>
<div id="valueDiv" style="display: none; padding-top: 8px; width: 105%;">
	Value:<br>
	<input id="value" class="round" type="text" name="is-eval"><br>
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
	const dataDiv = document.getElementById('dataDiv');
	const valueDiv = document.getElementById('valueDiv');
	const changeType = document.getElementById('changeType');

	glob.onChange = function() {
		switch(parseInt(changeType.value)) {
			case 0:
			case 1:
				dataDiv.style.display = null;
				valueDiv.style.display = null;
				break;
			case 2:
				dataDiv.style.display = 'none';
				valueDiv.style.display = 'none';
				break;
		};
	};

	switch(parseInt(changeType.value)) {
		case 0:
		case 1:
			dataDiv.style.display = null;
			valueDiv.style.display = null;
			break;
		case 2:
			dataDiv.style.display = 'none';
			valueDiv.style.display = 'none';
			break;
	};

	glob.memberChange(document.getElementById('member'), 'varNameContainer')
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const type = parseInt(data.member);
	const varName = this.evalMessage(data.varName, cache);
	const member = this.getMember(type, varName, cache);
	if(member && member.setData) {
		const dataName = this.evalMessage(data.dataName, cache);
		const changeType = parseInt(data.changeType);
		let val = this.evalMessage(data.value, cache);
		try {
			val = this.eval(val, cache);
		} catch(e) {
			this.displayError(data, cache, e);
		};
		if(Array.isArray(member)) {
			switch(changeType) {
				case 0:
					if(val !== undefined) {
						member.forEach(function(mem) {
							if(mem && mem.setData) {mem.setData(dataName, val)};
						});
					};
					break;
				case 1:
					if(val !== undefined) {
						member.forEach(function(mem) {
							if(mem && mem.addData) {mem.addData(dataName, val)};
						});
					};
					break;
				case 2:
					if(isClear) {
						member.forEach(function(mem) {
							if(mem && mem.addData) {mem.clearData(mem.id)};
						});
					};
					break;
			};
		} else {
			switch(changeType) {
				case 0:
					member.setData(dataName, val);
					break;
				case 1:
					member.addData(dataName, val);
					break;
				case 2:
					member.clearData(member.id);
					break;
			};
		};
	};
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

mod: function(DBM) {
	DBM.DiscordJS.GuildMember.prototype.clearData = function(id) {
		DBM.Files.data.players[id] = {};
		DBM.Files.data['players'] = DBM.Files.data.players;
		DBM.Files.saveData('players');
	};

	DBM.DiscordJS.User.prototype.clearData = DBM.DiscordJS.GuildMember.prototype.clearData;
}

}; // End of module