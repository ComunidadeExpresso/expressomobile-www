define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){




	jQuery.ajaxTransport( 'arraybuffer', function( options, originalOptions, jqXHR ) {
        return {
            send: function( headers, completeCallback ) {
                jqXHR = new XMLHttpRequest();
                jqXHR.open( options.type, options.url );
                jqXHR.responseType = options.dataType;
                jqXHR.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                jqXHR.timeout = options.xdrTimeout || Number.MAX_VALUE;
                jqXHR.onload = function() { options.loadArrayBuffer( jqXHR.response ); };
                jqXHR.send( ( options.hasContent && options.data ) || null );

            },
            abort: function() { if ( jqXHR ) { jqXHR.onerror = jQuery.noop; jqXHR.abort(); } }
        };
    });

	jQuery.ajaxTransport( 'fileupload', function( options, originalOptions, jqXHR ) {
		return {
			send: function( headers, completeCallback ) {
				jqXHR = new XMLHttpRequest();
				jqXHR.open( options.type, options.url, true );

				var boundary = 'AaB03x03923248232482';
				var body = '';
				var data = {
					id: options.id,
					params: options.params,
				};

				body += "--" + boundary + "\r\n";
			    body += "Content-Disposition: form-data; name=\"id\"\r\n\r\n";
			    body += options.id;
			    body += "\r\n";

				for ( var i in options.params ) {
                    body += "--" + boundary + "\r\n";
                    body += "Content-Disposition: form-data; name=\"params["+i+"]\"\r\n";
                    body += "Content-Type: text/plain; charset=UTF-8 \r\n\r\n";
                    body += unescape(encodeURIComponent(options.params[i].replace(/\t/g,'')));
                    body += "\r\n";
                }

				for ( var i in options.files ) {
					var file = options.files[i];
					body += "--" + boundary + "\r\n";
					body += "Content-Disposition: form-data; name='upload"+i+"'; filename='"+file.filename+"'\r\n";
					body += "Content-Type: application/octet-stream\r\n";
					body += "Content-Transfer-Encoding: binary\r\n\r\n";
					if (options.files[i].dataType == "base64") {
						body += (file.data)? file.data : atob(file.src.replace(/[^A-Za-z0-9\+\/\=]/g,"")) + "\r\n";
					} else {
					 	body += options.files[i].src + "\r\n";
				    }
				}
				body += "--" + boundary + "--";
				jqXHR.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
				jqXHR.onload = function() { options.loadArrayBuffer( jqXHR.response ); };
				jqXHR.onerror = function() { };
				if ( typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined' ) {
					var ui8a = new Uint8Array( Array.prototype.map.call( body, function (x) { return x.charCodeAt(0) & 0xff; } ) );
					jqXHR.send( ui8a.buffer );
				} else jqXHR.sendAsBinary( body );
			},
			abort: function() { if ( jqXHR ) { jqXHR.onerror = jQuery.noop; jqXHR.abort(); } }
		};
	});

	
	var ExpressoAPI = new function() {

		var _id = "0";

		var _context = "";

		var _crossdomain = "";

		var _auth = "";

		var _debug = false;

		var _dataType = '';

		var _data = {};

		var _files = [];

		var _phoneGap = false;

		var _android = false;

		//USED IN PHONEGAP DATABASE
		var _db;
		var _tempData;
		var _tempName;
		var _tempResult;

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

		this.android = function(value) {
			if(value == undefined) return _android;
			_android = value;
			return this;
		};

		this.debug = function(value) {
			if(value == undefined) return _debug;
			_debug = (String(value).toLowerCase() == 'true');
			return this;
		};

		this.dataType = function(value) {
			if(value == undefined) return _dataType;
			_dataType = value;
			return this;
		};

		this.resource = function(value) {
			if(value == undefined) return _data[_id].resource;
			_dataType = '';
			_data[_id].resource = '/' + String(value).replace(/^\/*|\/*$/g,'');
			return this;
		};

		this.type = function(value) {
			if(value == undefined) return _data[_id].type;
			_data[_id].type = (value.toUpperCase() == 'GET')? 'GET' : 'POST';
			return this;
		};

		this.clearFiles = function() {
			_files = [];
			return this;
		};

		this.addFile = function(fileData,fileName,dataType) {
			_files.push({ "filename": fileName, "src" : fileData,"dataType" : dataType});
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
		    // var result;
		    // return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
		}

		this.updatePhonegapDatabase = function(tx) {

			var str = JSON.stringify(_tempData);
		    var query = 'UPDATE expresso set data = \'' + str + '\' where id = 1';
		    tx.executeSql(query);
		};

		this.getPhonegapDatabaseValue = function(tx) {

			var that = this;

			var query = 'SELECT * FROM expresso where id = 1';

			var querySuccess = function(tx, results) {
				if (results) {
					var len = results.rows.length;
				    for (var i=0; i<len; i++){
				    	that._tempResult = results.rows.item(i).data;
				    	if (that._tempCallback != undefined) {
				    		that._tempCallback(JSON.parse(that._tempResult));
				    	}
				    }
				}
			}
		    tx.executeSql(query, [], querySuccess, this.errorCB);
		};


		this.setLocalStorageValue = function(c_name,value) {
			if (_phoneGap && _android) {
				_tempName = c_name;
				_tempData = value;
				_db.transaction(this.updatePhonegapDatabase, this.errorCB, this.successCB);
			} else {
				window.localStorage.setItem(c_name, JSON.stringify(value));
			}
			
		};


		this.getLocalStorageValue =  function(name,successCallBack) {

			var that = this;

			if (_phoneGap && _android) {
				that._tempName = name;
				that._tempCallback = successCallBack;

				_db.transaction(this.getPhonegapDatabaseValue, this.errorCB,successCallBack);

			} else {

				var value = window.localStorage.getItem(name);
				if (value) {
					successCallBack(JSON.parse(value));
				}
			}
		  
		};

		this.errorCB = function(err) {
	        //alert("Erro processando SQL: "+err);
	    };

	    this.successCB = function() {
	        // alert("success running query database!");
	    };


		this.populatePhoneGapDatabase = function(tx) {
			//tx.executeSql('DROP TABLE IF EXISTS expresso');

			var expressovalue = {
	          auth: "", 
	          profile: "",
	          username: "", 
	          password: "",
	          phoneGap: true,
	          serverAPI: "",
	          settings: { 
	            resultsPerPage: 30,
	            automaticLogin: false,
	            mailSignature: 'Mensagem enviada pelo Expresso Mobile.',
	          }
	        };

	        var str = JSON.stringify(expressovalue);

		    tx.executeSql('CREATE TABLE IF NOT EXISTS expresso (id unique, data)');
		    var query = 'INSERT INTO expresso (id, data) VALUES (1, \'' + str + '\')';
		    tx.executeSql(query);

		};

		this.createPhoneGapDatabase = function() {
			if (_phoneGap && _android) {
				_db = window.openDatabase("expresso", "1.0", "Expresso Mobile", 200000);
			    _db.transaction(this.populatePhoneGapDatabase, this.errorCB, this.successCB);
			    _db.transaction(this.getPhonegapDatabaseValue, this.errorCB, this.successCB);
		    }
		};

		this.readCookie =  function(name) {  
		  
			var value = window.localStorage.getItem(name);
			if (value) {
				return value;
			}

		};

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

			conf.headers = {'Cookie' : '' },
			conf.xhrFields = { withCredentials: false };

			if (_phoneGap) {

				// alert(JSON.stringify(_data[_id].send.params));
				
				conf.id = _id;
				conf.type = this.type();
				conf.url = this.url();
				conf.data = {
					id: 	_id,
					params: JSON.stringify(_data[_id].send.params)
				};
				conf.params = _data[_id].send.params;
				conf.crossDomain =  true;
				conf.phoneGap = _phoneGap;
				if (this.dataType() == 'arraybuffer') {
					conf.dataType = this.dataType();
					conf.loadArrayBuffer = function(arrayBuffer) {
						if (_data[this.id].done) _data[this.id].done(arrayBuffer,_data[this.id].send);
					};
				}  else if (this.dataType() == 'fileupload') {
					conf.dataType = this.dataType();
					conf.files = _files;
					conf.loadArrayBuffer = function(response) {
						var jsonResponse = JSON.parse(response);

						if(jsonResponse && jsonResponse.error && jsonResponse.error.message) {
							if (_data[this.id].fail) _data[this.id].fail(jsonResponse.error,_data[this.id].send);
						} else {
							if (_data[this.id].done) _data[this.id].done(jsonResponse.result,_data[this.id].send);
						}

					};
				} else {
					conf.timeout = 30000;
				}

			} else {
				conf.id		= _id;
				conf.type	= this.type();
				conf.url	= this.url();
				conf.data	= _data[_id].send;
				conf.params = _data[_id].send.params;
				conf.phoneGap = _phoneGap;
				
				if (this.dataType() == 'arraybuffer') {
					conf.dataType = this.dataType();
					conf.loadArrayBuffer = function(arrayBuffer) {
						if (_data[this.id].done) _data[this.id].done(arrayBuffer,_data[this.id].send);
					};
				} else if (this.dataType() == 'fileupload') {

					conf.dataType = this.dataType();
					conf.files = _files;
					conf.loadArrayBuffer = function(arrayBuffer) {
						if (_data[this.id].done) _data[this.id].done(arrayBuffer,_data[this.id].send);
					};
				} else {
					conf.timeout = 30000;
				}
				
			}
			
			return conf;
		};

		this.execute = function() {
			var conf = this.conf();
			
			if (_debug) {
				console.log('ExpressoAPI - Execute:' + this.resource());
				console.log(conf);
			}

			var networkError = { error: { code: 100, message: "Verifique sua conexão com a Internet."} };
			var networkTimeoutError = { error: { code: 100, message: "Esgotou-se o tempo limite da solicitação."} };

			if (_phoneGap && _android) {
				var networkState = navigator.connection.type;
			    if (networkState == Connection.NONE){
					if (_data[this.id()].fail) _data[this.id()].fail(networkError);
			    }
			} else {
				if (!_phoneGap) {
					var online = navigator.onLine;
					if (!online) {
						if (_data[this.id()].fail) _data[this.id()].fail(networkError);
					}
				}
				
			}

			var that = this;

			conf.error = function(x, t, m) {
		        if(t==="timeout") {
					if (_data[that.id()].fail) _data[that.id()].fail(networkTimeoutError);
		            //alert("Timeout");
		        } else {
		            // alert(t);
		        }
		    };
			
			jQuery.ajax(conf).done(function(response) {

				if ((!response.result) && (!response.error)) {
					response = JSON.parse(response);
				}

				if (response && response.result) {
					if (_debug) {
						console.log('ExpressoAPI - DONE callback');
						console.log(JSON.stringify(response));
					}
					if (response.result.auth) that.auth(response.result.auth);
					if (_data[this.id]) {
						if (_data[this.id].resource=='/Logout') that.auth("");
						if (_data[this.id].done) _data[this.id].done(response.result,_data[this.id].send);
					}
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
				if (_data[this.id]) {
					if (_data[this.id].always) _data[this.id].always(_data[this.id].send);
					delete _data[this.id];
				}
			});
			this.id(_id+1);
			return this;
		};
	}

  	return ExpressoAPI;
  
});


