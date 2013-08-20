define([
  'jquery',
  'underscore',
  'backbone',
  'jquery_xmpp',
], function($, _, Backbone, jquery_xmpp){

	var ExpressoIM = new function() {

		var _resource = "";

		var _url = "";

		var _domain = "";

		var _username = "";

		var _password = "";

		var _debug = false;

		var _messages = {};

		var _online_contacts = [];

		var _offline_contacts = [];

		var _away_contacts = [];

		var _busy_contacts = [];

		var _contacts = [];

		var _groups = [];

		var _onMessageDelegate = [];

		var _onComposingDelegate = [];

		var _onPresenceDelegate = [];

		var _onErrorDelegate = [];

		var _qtdUnreadMessages = 0;

		this.resource = function(value) {
			if(value == undefined) return _resource;
			_resource = value;
			return this;
		};

		this.url = function(value) {
			if(value == undefined) return _url;
			_url = value;
			return this;
		};

		this.onMessage= function(message) {
			if (_onMessageDelegate != '') {
				_onMessageDelegate(message);
			}
		};

		this.onComposing= function(message) {
			if (_onComposingDelegate != '') {
				_onComposingDelegate(message);
			}
		};

		this.clearListeners = function() {
			_onMessageDelegate = [];
			_onComposingDelegate = [];
			_onPresenceDelegate = [];
			_onErrorDelegate = [];
		};


		this.executeListenersFromArray = function(_array,params) {
			for (var i in _array) {
				_array[i](params);
			}
		};

		this.addOnMessageListener = function(value) {
			_onMessageDelegate.push(value);
			return this;
		};

		this.addOnPresenceListener = function(value) {
			_onPresenceDelegate.push(value);
			return this;
		};

		this.addOnErrorListener = function(value) {
			_onErrorDelegate.push(value);
			return this;
		};

		this.addOnComposingListener = function(value) {
			_onComposingDelegate.push(value);
			return this;
		};

		this.domain = function(value) {
			if(value == undefined) return _domain;
			_domain = value;
			return this;
		};

		this.username = function(value) {
			if(value == undefined) return _username;
			_username = value;
			return this;
		};

		this.password = function(value) {
			if (value == undefined) return _password;
			_password = value;
			return this;
		};

		this.inArray = function(array,value) { 
		    for(var i=0; i < array.length; i++) { 
		        if(value == array[i]) return true; 
		    }
		    return false; 
		}; 

		this.pushIfNotExist = function(array,value) { 
		    if (!this.inArray(array,value)) {
		        array.push(value);
		        return array;
		    }
		    return array;
		};

		this.getContactsByID = function(id) {
			for (var x=0; x < _contacts.length; x++) {
				if (_contacts[x].id == id) {
					return _contacts[x];
				}
			}
			return false;
		};

		this.getBusyContacts = function() {
			var new_arr = [];
			var _arr = _busy_contacts;
			for(var i=0; i < _arr.length; i++) {
				new_arr.push(this.getContactsByID(_arr[i]));
		    }
		    return new_arr;
		};

		this.getAllContacts = function() {
			var new_arr = [];

			new_arr['online'] = this.getOnlineContacts();
			new_arr['busy'] = this.getBusyContacts();
			new_arr['away'] = this.getAwayContacts();
			new_arr['offline'] = this.getOfflineContacts();

			return new_arr;
		};



		this.getAwayContacts = function() {
			var new_arr = [];
			var _arr = _away_contacts;
			for(var i=0; i < _arr.length; i++) { 
				new_arr.push(this.getContactsByID(_arr[i]));
		    }
		    return new_arr;
		};

		this.getOfflineContacts = function() {
			var new_arr = [];
			var _arr = _offline_contacts;
			for(var i=0; i < _arr.length; i++) { 
				new_arr.push(this.getContactsByID(_arr[i]));
		    }
		    return new_arr;
		};

		this.getOnlineContacts = function() {
			var new_arr = [];
			var _arr = _online_contacts;
			for(var i=0; i < _arr.length; i++) { 
				new_arr.push(this.getContactsByID(_arr[i]));
		    }
		    return new_arr;
		};

		this.getMessagesFromID = function(id) {
			return _messages[id];
		};

		this.removeFromArray = function(arr,id) {
			var new_arr = [];
			for (var i in arr) {
				if (arr[i] != id) {
					new_arr.push(arr[i]);
				}
			}
			return new_arr;
		};

		this.setContactStatus = function(Pid,status) {

			console.log("setContactStatus");
			console.log(Pid);
			_online_contacts = this.removeFromArray(_online_contacts,Pid);

			_offline_contacts = this.removeFromArray(_offline_contacts,Pid);

			_away_contacts = this.removeFromArray(_away_contacts,Pid);

			if (status == "online") {
				console.log("Status: online");
				_online_contacts = this.pushIfNotExist(_online_contacts,Pid);
				//console.log(_online_contacts);
			}
			if (status == "offline") {
				_offline_contacts = this.pushIfNotExist(_offline_contacts,Pid);
				console.log("Status: offline");
				//console.log(_offline_contacts);
			}
			if (status == "away") {
				_away_contacts = this.pushIfNotExist(_away_contacts,Pid);
				console.log("Status: offline");
				//console.log(_away_contacts);
			}
		};

		this.addContact = function(Pid,Pjid,Pname,Pgroup) {
			var contact = {
				id: Pid,
				jid: Pjid,
				name: Pname,
				group: Pgroup,
				qtdUnread: 0,
			};

			_contacts.push(contact);

			_messages[Pid] = [];

		};


		this.addMessage = function(Pid,Pjid,Pbody,Pdate) {
			var message = {
				id: Pid,
				jid: Pjid,
				body: Pbody,
				date: Pdate,
				seen: false,
			};

			_messages[Pid].push(message);

			return message;
		};

		this.getQtdUnreadMessagesFromContact = function(Pid) {
			return _contacts[Pid].qtdUnread;
		};

		this.setAsSeenAllMessagesFromContact = function(Pid) {
			var qtd = 0;
			for (var i in _messages[Pid]) {
				_messages[Pid][i].seen = true;
			}
			for (var x=0; x < _contacts.length; x++) {
				if (_contacts[x].id == Pid) {
					_contacts[x].qtdUnread = 0;
				}
			}
		};

		this.updateQtdUnreadMessagesToContact = function(Pid) {
			console.log("updateQtdUnreadMessagesToContact");
			var qtd = 0;
			if (_messages[Pid] != null) {
				for (var i in _messages[Pid]) {
					if (_messages[Pid][i].seen == false) {
						qtd = qtd + 1;
					}
				}
			}
			for (var x=0; x < _contacts.length; x++) {
				if (_contacts[x].id == Pid) {
					_contacts[x].qtdUnread = qtd;
				}
			}
			return qtd;
		};

		this.debug = function(value) {
			if(value == undefined) return _debug;
			_debug = value;
			return this;
		};

		this.qtdUnreadMessages = function(value) {
			if(value == undefined) return _qtdUnreadMessages;
			_qtdUnreadMessages = value;
			return this;
		};


		this.sendMessage = function(msgTo,message) {

			if ($.trim(message) != "") {

				console.log(msgTo);

				$.xmpp.sendMessage({body: message, to:msgTo, resource:"Chat", otherAttr:"value"},"<error>An error has ocurred</error>");

				msgTo= msgTo.match(/^[\w\W][^\/]+[^\/]/g)[0];
				//var jid = message.from.split("/");
				var id = MD5.hexdigest(msgTo);

				var new_message = this.addMessage(id,"me",message,new Date());

				this.executeListenersFromArray(_onMessageDelegate,new_message);

			}

		};



		this.connect = function() {

			var connection_options = {};
			if($.xmpp){
				var that = this;
				connection_options = {
					"resource":_resource, "username":_username, "password":_password, "url":_url, "domain" : _domain,				
					onDisconnect:function(){
						console.log("onDisconnect");
					},
					onConnect: function(eas){
						console.log("onConnect");
						$.xmpp.getRoster();
						$.xmpp.setPresence(null);
					},
					onIq: function(iq){
						console.log("onIq");
					},
					onMessage: function(message){
						console.log("onMessage");

						message.from = message.from.match(/^[\w\W][^\/]+[^\/]/g)[0];
						var jid = message.from.split("/");
						var id = MD5.hexdigest(message.from);

						var new_message = that.addMessage(id,jid[0],message.body,new Date());

						that.qtdUnreadMessages( that.qtdUnreadMessages() + 1 );

						that.updateQtdUnreadMessagesToContact(id);

						that.executeListenersFromArray(_onMessageDelegate,new_message);

						//that.onMessage(new_message);

					},
					onPresence: function(presence){
						console.log("onPresence");
						console.log(presence);

						presence.from = presence.from.match(/^[\w\W][^\/]+[^\/]/g)[0];
						var md5_contact = MD5.hexdigest(presence.from);

						var statusClass = 
							presence['show'] !== "available" ? ( presence['show'] === "unavailable" ? "offline" : 
							(presence['show'] === "dnd" ? "busy" : 
							(presence['show'] === "away" ? "away" : 
							"online"))) : "online";

						var presence = { id: md5_contact, status: statusClass};

						that.setContactStatus(md5_contact,statusClass);

						that.executeListenersFromArray(_onPresenceDelegate,presence);

					},
					onError: function(error){
						console.log("onError");
					},
	   				onComposing: function(message)
	   				{
	   					console.log("onComposing");

	   					message.from = message.from.match(/^[\w\W][^\/]+[^\/]/g)[0];
						var jid = message.from.split("/");
						message.from = jid[0];

						that.executeListenersFromArray(_onComposingDelegate,message);

	   				},
	   				onRoster: function(roster)
	   				{  			
	   					console.log("onRoster");
	   					console.log(roster);

	   					var _rosterJid = roster.jid;
						_rosterJid = _rosterJid.match(/^[\w\W][^\/]+[^\/]/g)[0]; 
	   					
	   					var md5_contact = MD5.hexdigest(_rosterJid);

	   					that.addContact(md5_contact,roster.jid,roster.name,roster.group);

	   					that.setContactStatus(md5_contact,'offline');


	   				}
			    };

			    $.xmpp.connect(connection_options);

			}

		};

	}

  	return ExpressoIM;
  
});


