define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

	var ExpressoAPI = new function() {

		var _id = "0";

		var _context = "";

		var _crossdomain = "";

		var _auth = "";

		var _debug = false;

		var _data = {};

		var _phoneGap = true;

		this.id = function(value) {
			if(value == undefined) return _id;
			var int = parseInt(String(value))
			_id = (isNaN(int))? 0 : int;
			_data[_id] = {};
			this.resource('').type('POST').params({}).done().always().fail(this.defaultErrorCallback);
			return this;
		};

		this.defaultErrorCallback = function(response) {
			if(response && response.error && response.error.message) alert(response.error.message);
		};

		this.crossdomain = function(value) {
			if(value == undefined) return _crossdomain;
			_crossdomain = String(value);
			return this;
		};

		this.context = function(value) {
			if(value == undefined) return _context;
			_context = (!value)?'.':((value=='/')?'':String(value).replace(/\/+$/g,''));
			return this;
		};

		this.auth = function(value) {
			if(value == undefined) return _auth;
			_auth = String(value);
			return this;
		};

		this.phoneGap = function(value) {
			if(value == undefined) return _phoneGap;
			_phoneGap = value;
			return this;
		};

		this.debug = function(value) {
			if(value == undefined) return _debug;
			_debug = (String(value).toLowerCase() == 'true');
			return this;
		};

		this.resource = function(value) {
			if(value == undefined) return _data[_id].resource;
			_data[_id].resource = '/' + String(value).replace(/^\/*|\/*$/g,'');
			return this;
		};

		this.type = function(value) {
			if(value == undefined) return _data[_id].type;
			_data[_id].type = (value.toUpperCase() == 'GET')? 'GET' : 'POST';
			return this;
		};

		this.params = function(value) {
			if(value == undefined) return _data[_id].params;
			_data[_id].params = value;
			return this;
		};

		this.done = function(value) {
			_data[_id].done = value;
			return this;
		};

		this.fail = function(value) {
			_data[_id].fail = value;
			return this;
		};

		this.always = function(value) {
			_data[_id].always = value;
			return this;
		};

		this.url = function() {

			if (_phoneGap) {
				return this.context() + this.resource();
			} else {
				return this.context() + this.resource() + ((_crossdomain)? '?crossdomain=' + _crossdomain : '');
			}
		};

		this.setCookie = function(c_name,value,exdays)
		{
			window.localStorage.setItem(c_name, value);
			var exdate=new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
			document.cookie=c_name + "=" + c_value;
		}

		this.read_cookie =  function(key)
		{
		    var result;
		    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
		}

		this.readCookie =  function(name) {  
		  
			var value = window.localStorage.getItem(name);
			if (value) {
				return value;
			}

		    var cookiename = name + "=";  
		  
		    var ca = document.cookie.split(';');  
		  
		    for(var i=0;i < ca.length;i++)  
		    {  
		  
		        var c = ca[i];  
		  
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);  
		  
		        if (c.indexOf(cookiename) == 0) return c.substring(cookiename.length,c.length);  
		  
		    }  
		  
		    return '';  
		}

		this.options = function(value) {
			for (var method in value)
				if(this.hasOwnProperty(method))
					this[method](value[method]);
			return this;
		};

		this.conf = function() {
			
			_data[_id].send = {};
			_data[_id].send.id = _id;
			_data[_id].send.params = this.params();
			if (_auth) _data[_id].send.params.auth = _auth;

			var conf = {};

			if (_phoneGap) {
				

				//alert(JSON.stringify(_data[_id].send.params));
				conf.id = _id;
				conf.type = this.type();
				conf.url = this.url();
				conf.data = {
					id: 	_id,
					params: JSON.stringify(_data[_id].send.params)
				};
				conf.crossDomain =  true;

			} else {
				conf.id		= _id;
				conf.type	= this.type();
				conf.url	= this.url();
				conf.data	= _data[_id].send;
				
			}
			
			return conf;
		};

		this.execute = function() {
			var conf = this.conf();
			
			if (_debug) {
				console.log('ExpressoAPI - Execute:' + this.resource());
				console.log(conf);
			}
			
			jQuery.ajax(conf).done(function(response) {
				if (response && response.result) {
					if (_debug) {
						console.log('ExpressoAPI - DONE callback');
						console.log(JSON.stringify(response));
					}
					if (response.result.auth) ExpressoAPI.auth(response.result.auth);
					if (_data[this.id].resource=='/Logout') ExpressoAPI.auth("");
					if (_data[this.id].done) _data[this.id].done(response.result,_data[this.id].send);
				} else {
					if (_debug) {
						console.log('ExpressoAPI - ERROR callback');
						console.log(JSON.stringify(response));
					}
					if (_data[this.id].fail) _data[this.id].fail(response,_data[this.id].send);
				}
			}).fail(function(response) {
				if (_debug) {
					console.log('ExpressoAPI - FAIL callback');
					console.log(JSON.stringify(response));
				}
				if (_data[this.id].fail) _data[this.id].fail(response,_data[this.id].send);
			}).always(function() {
				if (_debug) console.log('ExpressoAPI - ALWAYS callback');
				if (_data[this.id].always) _data[this.id].always(_data[this.id].send);
				delete _data[this.id];
			});
			this.id(_id+1);
			return this;
		};
	}

  	return ExpressoAPI;
  
});


