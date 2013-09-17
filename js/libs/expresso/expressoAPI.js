define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){


	function addslashes(string) {
	    return string.replace(/\\/g, '\\\\').
	        replace(/\u0008/g, '\\b').
	        replace(/\t/g, '\\t').
	        replace(/\n/g, '\\n').
	        replace(/\f/g, '\\f').
	        replace(/\r/g, '\\r').
	        replace(/'/g, '\\\'').
	        replace(/"/g, '\\"');
	}

	function stripslashes (str) {
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: Ates Goral (http://magnetiq.com)
	  // +      fixed by: Mick@el
	  // +   improved by: marrtins
	  // +   bugfixed by: Onno Marsman
	  // +   improved by: rezna
	  // +   input by: Rick Waldron
	  // +   reimplemented by: Brett Zamir (http://brett-zamir.me)
	  // +   input by: Brant Messenger (http://www.brantmessenger.com/)
	  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
	  // *     example 1: stripslashes('Kevin\'s code');
	  // *     returns 1: "Kevin's code"
	  // *     example 2: stripslashes('Kevin\\\'s code');
	  // *     returns 2: "Kevin\'s code"
	  return (str + '').replace(/\\(.?)/g, function (s, n1) {
	    switch (n1) {
	    case '\\':
	      return '\\';
	    case '0':
	      return '\u0000';
	    case '':
	      return '';
	    default:
	      return n1;
	    }
	  });
	}

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

	//CHROME DOESN'T HAVE sendAsBinary METHOD FOR FILE UPLOAD, 
	//THIS IS THE WORKAROUND.
 //    try {
	//   if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined') {
	//     XMLHttpRequest.prototype.sendAsBinary = function(text){
	//     	alert('Chrome');
	//       var data = new ArrayBuffer(text.length);
	//       var ui8a = new Uint8Array(data, 0);
	//       for (var i = 0; i < text.length; i++) ui8a[i] = (text.charCodeAt(i) & 0xff);
	//       this.send(ui8a);
	//     }
	//   }
	// } catch (e) {}


	 jQuery.ajaxTransport( 'fileupload', function( options, originalOptions, jqXHR ) {
        return {
            send: function( headers, completeCallback ) {
                jqXHR = new XMLHttpRequest();
                jqXHR.open( options.type, options.url, true );
                var boundary = 'AaB03x';
                var body = '';

                body += "--" + boundary + "\r\n";
			    body += "Content-Disposition: form-data; name=\"id\"\r\n\r\n";
			    body += options.id;
			    body += "\r\n";

			    if (!options.phoneGap) { 

				    for ( var i in options.params ) {
	                    body += "--" + boundary + "\r\n";
	                    body += "Content-Disposition: form-data; name='params["+i+"]'\r\n";
	                    body += "Content-Type: text/plain; charset=UTF-8 \r\n\r\n";
	                    // body += "Content-Transfer-Encoding: utf-8\r\n\r\n";
	                    // if (!options.phoneGap) { 
	                    	body += unescape(encodeURIComponent(options.params[i]));
	                	// } else {
	                		// body += options.params[i];
	                	// }
	                    body += "\r\n";
	                }

                } else {

                	body += "--" + boundary + "\r\n";
				    body += "Content-Disposition: form-data; name=\"params\"\r\n\r\n";
				    body += JSON.stringify(options.params);
				    body += "\r\n";

                }

                for ( var i in options.files ) {
                    body += "--" + boundary + "\r\n";
                    body += "Content-Disposition: form-data; name='upload"+i+"'; filename='"+options.files[i].filename+"'\r\n";
                    body += "Content-Type: application/octet-stream\r\n";
                    body += "Content-Transfer-Encoding: binary\r\n\r\n";
                    if (options.files[i].dataType == "base64") {
                    	body += atob(options.files[i].src) + "\r\n";
                    } else {
                    	body += options.files[i].src + "\r\n";
                    }


                }


                body += "--" + boundary + "--";

                // alert(body);



                jqXHR.onload = function() { options.loadArrayBuffer( jqXHR.response ); };
                jqXHR.onerror = function(e) { console.log('ERROR'); console.log(e); };
                jqXHR.setRequestHeader('content-type', 'multipart/form-data; charset=UTF-8; boundary=' + boundary);
			    var array = new Uint8Array(new ArrayBuffer(body.length));
 
				for(i = 0; i < body.length; i++) {
				  array[i] = body.charCodeAt(i);
				}

				

				//THIS WORKS ON CHROME, FIREFOX AND SAFARI,
				//BUT IS STILL NOT WORKING IN PHONEGAP.
				if (options.phoneGap) {
					// jqXHR.overrideMimeType('text/plain; charset=utf-8');
					// alert('Send ArrayBuffer');
			    	jqXHR.send(array);

					// var bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder)();
					// bb.append(array.buffer);
					// var blob = bb.getBlob("binary");

				} else {
					// alert('new Blob');
					var blob = new Blob([array.buffer], {type: "binary"});

					// alert('Send');
			    	jqXHR.send(blob);
				}
				
				

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

		this.addFile = function(fileData,fileName) {
			_files.push({ "filename": fileName, "src" : fileData});
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
				    //console.log("EXPRESSO table: " + len + " rows found.");
				    for (var i=0; i<len; i++){
				    	//console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
				    	that._tempResult = results.rows.item(i).data;
				    	that._tempCallback(JSON.parse(that._tempResult));
				    }
				}
			}
		    tx.executeSql(query, [], querySuccess, this.errorCB);
		};


		this.setLocalStorageValue = function(c_name,value) {
			if (_phoneGap) {
				_tempName = c_name;
				_tempData = value;
				_db.transaction(this.updatePhonegapDatabase, this.errorCB, this.successCB);
			} else {
				window.localStorage.setItem(c_name, JSON.stringify(value));
			}
			
		};


		this.getLocalStorageValue =  function(name,successCallBack) {

			if (_phoneGap) {
				_tempName = name;
				_tempCallback = successCallBack;

				_db.transaction(this.getPhonegapDatabaseValue, this.errorCB);

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
			_db = window.openDatabase("expresso", "1.0", "Expresso Mobile", 200000);
		    _db.transaction(this.populatePhoneGapDatabase, this.errorCB, this.successCB);

		    _db.transaction(this.getPhonegapDatabaseValue, this.errorCB, this.successCB);
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
				conf.timeout = 10000;
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
				}
				if (this.dataType() == 'fileupload') {
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
				}

			} else {
				conf.id		= _id;
				conf.type	= this.type();
				conf.url	= this.url();
				conf.data	= _data[_id].send;
				conf.params = _data[_id].send.params;
				conf.phoneGap = _phoneGap;
				conf.timeout = 10000;
				if (this.dataType() == 'arraybuffer') {
					conf.dataType = this.dataType();
					conf.loadArrayBuffer = function(arrayBuffer) {
						// var blob = new Blob([arrayBuffer]);
						// console.log(blob.size);
						if (_data[this.id].done) _data[this.id].done(arrayBuffer,_data[this.id].send);
					};
				}
				if (this.dataType() == 'fileupload') {
					conf.dataType = this.dataType();
					conf.files = _files;
					conf.loadArrayBuffer = function(arrayBuffer) {
						if (_data[this.id].done) _data[this.id].done(arrayBuffer,_data[this.id].send);
					};
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

			if (_phoneGap) {
				var networkState = navigator.connection.type;
			    if (networkState == Connection.NONE){
					if (_data[this.id()].fail) _data[this.id()].fail(networkError);
			    }
			} else {
				var online = navigator.onLine;
				if (!online) {
					if (_data[this.id()].fail) _data[this.id()].fail(networkError);
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


