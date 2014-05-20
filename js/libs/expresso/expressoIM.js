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

		var _isConnected = false;

		var _online_contacts = [];

		var _offline_contacts = [];

		var _away_contacts = [];

		var _busy_contacts = [];

		var _contacts = [];

		var _groups = [];

		var _onMessageDelegate = [];

		var _onIqDelegate = [];

		var _onDisconnectDelegate = [];

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
			if (_onComposingDelegate.length > 1) {
				_onComposingDelegate(message);
			}
		};

		this.clearListeners = function() {
			_onMessageDelegate = [];
			_onComposingDelegate = [];
			_onPresenceDelegate = [];
			_onErrorDelegate = [];
			_onDisconnectDelegate = [];
			_onIqDelegate = [];
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

		this.addOnIqListener = function(value) {
			_onIqDelegate.push(value);
			return this;
		};

		this.addOnDisconnectListener = function(value) {
			_onDisconnectDelegate.push(value);
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

		this.isConnected = function() { 
			return _isConnected;
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

			var sort_arr = [];
			for(var i=0; i < _arr.length; i++) { 
				var contact = this.getContactsByID(_arr[i]);
				sort_arr[i] = contact.jid + ":" + _arr[i];
		    }
		    sort_arr.sort();
			
			for(var i=0; i < sort_arr.length; i++) { 

				var splited = sort_arr[i].split(":");
				new_arr.push(this.getContactsByID(splited[1]));
		    }
		    return new_arr;

		};

		this.getOfflineContacts = function() {
			var new_arr = [];
			var _arr = _offline_contacts;

			var sort_arr = [];
			for(var i=0; i < _arr.length; i++) { 
				var contact = this.getContactsByID(_arr[i]);
				sort_arr[i] = contact.jid + ":" + _arr[i];
		    }
		    sort_arr.sort();
			
			for(var i=0; i < sort_arr.length; i++) { 

				var splited = sort_arr[i].split(":");
				new_arr.push(this.getContactsByID(splited[1]));
		    }
		    return new_arr;
		};

		this.getOnlineContacts = function() {
			var new_arr = [];
			var _arr = _online_contacts;

			var sort_arr = [];
			for(var i=0; i < _arr.length; i++) { 
				var contact = this.getContactsByID(_arr[i]);
				sort_arr[i] = contact.jid + ":" + _arr[i];
		    }
		    sort_arr.sort();

			for(var i=0; i < sort_arr.length; i++) { 
				var splited = sort_arr[i].split(":");
				new_arr.push(this.getContactsByID(splited[1]));
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

			_online_contacts = this.removeFromArray(_online_contacts,Pid);

			_offline_contacts = this.removeFromArray(_offline_contacts,Pid);

			_busy_contacts = this.removeFromArray(_busy_contacts,Pid);

			_away_contacts = this.removeFromArray(_away_contacts,Pid);

			if (status == "online") {
				_online_contacts = this.pushIfNotExist(_online_contacts,Pid);
			}
			if (status == "offline") {
				_offline_contacts = this.pushIfNotExist(_offline_contacts,Pid);
			}
			if (status == "away") {
				_away_contacts = this.pushIfNotExist(_away_contacts,Pid);
			}
			if (status == "busy") {
				_busy_contacts = this.pushIfNotExist(_busy_contacts,Pid);
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
			var qtdUnread = 0;
			for (var x=0; x < _contacts.length; x++) {
				qtdUnread = qtdUnread + _contacts[x].qtdUnread;
			}
			this._qtdUnreadMessages = qtdUnread;

			return qtdUnread;
		};


		this.sendMessage = function(msgTo,message) {

			if ($.trim(message) != "") {


				$.xmpp.sendMessage({body: message, to:msgTo, resource:"Chat", otherAttr:"value"},"<error>An error has ocurred</error>");

				msgTo= msgTo.match(/^[\w\W][^\/]+[^\/]/g)[0];
				//var jid = message.from.split("/");
				var id = MD5.hexdigest(msgTo);

				var new_message = this.addMessage(id,"me",message,new Date());

				this.executeListenersFromArray(_onMessageDelegate,new_message);

			}

		};

		this.disconnect = function() {
			var callbackFunction = function() {

			};

			if($.xmpp){
				$.xmpp.disconnect(callbackFunction);
			}
		};



		this.connect = function(connectionDelegate) {

			var connection_options = {};
			if($.xmpp){
				var that = this;
				connection_options = {
					"resource":_resource, "username":_username, "password":_password, "url":_url, "domain" : _domain,				
					onDisconnect:function(){
						_isConnected = false;
						that.executeListenersFromArray(_onDisconnectDelegate,[]);
					},
					onConnect: function(eas){

						_isConnected = true;
						$.xmpp.getRoster();
						$.xmpp.setPresence(null);

						if (connectionDelegate != null) {
							connectionDelegate();
						}

					},
					onIq: function(iq){

					},
					onMessage: function(message){

						message.from = message.from.match(/^[\w\W][^\/]+[^\/]/g)[0];
						var jid = message.from.split("/");
						var id = MD5.hexdigest(message.from);
						var new_message = that.addMessage(id,jid[0],message.body,new Date());

						that.updateQtdUnreadMessagesToContact(id);

						that.executeListenersFromArray(_onMessageDelegate,new_message);

					},
					onPresence: function(presence){

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

						_isConnected = false;
						$.xmpp.listening = false;
						$.xmpp.connected = false;
						that.executeListenersFromArray(_onErrorDelegate,error);
					},
	   				onComposing: function(message)
	   				{


	   					message.from = message.from.match(/^[\w\W][^\/]+[^\/]/g)[0];
						var jid = message.from.split("/");
						message.from = jid[0];

						that.executeListenersFromArray(_onComposingDelegate,message);

	   				},
	   				onRoster: function(roster)
	   				{  			

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


