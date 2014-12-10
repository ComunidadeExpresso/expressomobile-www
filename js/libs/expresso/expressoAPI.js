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

		var _debug = true;

		var _dataType = '';

		var _data = {};

		var _files = [];

		var _phoneGap = false;

		var _android = false;

		var _cache = [];

		var _isOffline = false;

		var _ignoreCache = false;

		// var _cachedResources = [
		// 	"/ExpressoVersion",
		// 	"/Catalog/ContactPicture",
		// 	"/Catalog/Contacts"];

		// var _cachedParams = [
		// "",
		// "contactID,contactType",
		// "search,contactType"];

		//SECONDS
		var timeToLive0 = 0;
		var timeToLive5Minutes = 300;
		var timeToLive1Hour = 3600;
		var timeToLive1Day = 86400;
		var timeToLive1Week = 604800;
		var timeToLive1Month = 2419200;

		var DontCache = [
			"/Login",
			"/Logout",
			"/Mail/Send",
			"/Mail/AddFolder",
			"/Mail/DelFolder",
			"/Mail/RenameFolder",
			"/Mail/DelMessage",
			"/Mail/CleanTrash",
			"/Mail/SendSupportFeedback",
			"/Preferences/ChangePassword",
			"/Preferences/ChangeUserPreferences",
			"/Services/Chat",
			"/Catalog/ContactAdd",
			"/Catalog/ContactDelete",
			"/Calendar/AddEvent",
			"/Calendar/DelEvent",
		];

		var KeepCacheFor5Minutes = [
			"/Mail/Messages",
			"/Mail/Folders",
			"/Mail/Attachment",
		];

		var KeepCacheFor1Hour = [
			"/Preferences/UserPreferences",
		];

		var KeepCacheFor1Day = [
			"/Catalog/Contacts",
			"/Calendar/Events",
			"/Calendar/EventCategories",
		];

		var KeepCacheFor1Week = [
			"/ExpressoVersion",
			"/Catalog/ContactPicture",
		];

		var KeepCacheFor1Month = [
		//	""
		];

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
			this._isOffline = false;
			this._ignoreCache = false;
			return this;
		};

		this.defaultErrorCallback = function(response) {
			//if(response && response.error && response.error.message) alert(response.error.message);
		};



		// this.isCachedResource = function(request) {
		// 	var resourceRoute = request.resource;
		// 	var requestParams = request.params;
		// 	var retVal = false;
		// 	for ( var i in _cachedResources ) {
		// 		if (_cachedResources[i] == resourceRoute) {

		// 			var equal = false;
		// 			for (var x in requestParams) {
		// 				if (x != 'auth') {	
		// 					console.log(x + ":" + requestParams[x]);
		// 				}
		// 			}
		// 			//var cachedParams = _cachedParams[i];

		// 			retVal = true;
		// 		}
		// 	}
		// 	return retVal;
		// };

		this.getRequest = function(response) {
			var request = {};

			request.resource = this.resource();
			request.params = this.params();
			request.date = Date.now();
			
			var paramsKeys = Object.keys(request.params);
			request.response = response;

			request.timeToLive = 0;

			if (DontCache.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive0; }
			if (KeepCacheFor5Minutes.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive5Minutes; }
			if (KeepCacheFor1Hour.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive1Hour; }
			if (KeepCacheFor1Day.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive1Day; }
			if (KeepCacheFor1Week.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive1Week; }
			if (KeepCacheFor1Month.indexOf(request.resource) >= 0) { request.timeToLive = timeToLive1Month; }

			if (request.resource == "/Mail/Messages") {
				if (request.params.msgID != undefined) {
					request.timeToLive = timeToLive1Month;
				}
			}

			return request;

		};

		this.getCacheResponse = function(request,finishCallBack) {

			var that = this;

			var requestResource = request.resource;
			var requestParams = request.params;
			var requestTimeToLive = request.timeToLive * 1000;

			var foundCallBack = function(cacheResponse) {
				that._cache = cacheResponse;

				var found = false;
				
				for (var i in cacheResponse) {
					if (requestResource == cacheResponse[i].resource) {
						var equal = true;
						for (var x in requestParams) {
							if (x != 'auth') {
								if (requestParams[x] != cacheResponse[i].params[x]) {
									equal = false;
								}
							}
						}
						if (equal) {
							if (that._isOffline == false) {
								var rightnow = new Date();
								if ((requestTimeToLive) > (rightnow - cacheResponse[i].date)) {
									found = cacheResponse[i];
								}
							} else {
								found = cacheResponse[i];
							}
						}
					}
				}
				finishCallBack(found);
			};

			var erroCB = function() {
				finishCallBack(false);
			};
			
			this.getLocalStorageValue("expressoCache",foundCallBack,erroCB);
		};

		this.createRequest = function(Presource,Pparams,PemptyParams) {
			var request = {};
			request.params = {};
			request.resource = Presource;
			request.params = Pparams;
			return request;
		};

		// this.addTrigger = function(resource,filterRequest) { 
		// 	var trigger = {};
		// 	trigger.resource = resource;
		// 	trigger.filter = filterRequest;
		// 	_triggers.push(trigger);
		// };

		this.triggerCacheRequest = function(currentCache,currentRequest) {

			var filterRequests = [];

			if ((currentRequest.resource == "/Mail/AddFolder") || 
				(currentRequest.resource == "/Mail/RenameFolder")  || 
				(currentRequest.resource == "/Mail/DelFolder")) {

				filterRequests.push(this.createRequest("/Mail/Folders",{}));
				filterRequests.push(this.createRequest("/Mail/Messages",{folderID: currentRequest.params.folderID}));
				filterRequests.push(this.createRequest(currentRequest.resource,{}));

			}

			if (currentRequest.resource == "/Mail/DelMessage") {

				filterRequests.push(this.createRequest("/Mail/Messages",{folderID: currentRequest.params.folderID, msgID: ""}));
				filterRequests.push(this.createRequest("/Mail/Messages",{folderID: currentRequest.params.folderID, msgID: currentRequest.params.msgID}));
				filterRequests.push(this.createRequest("/Mail/DelMessage",{folderID: currentRequest.params.folderID, msgID: currentRequest.params.msgID}));

			}

			if (currentRequest.resource == "/Preferences/ChangeUserPreferences") {
				filterRequests.push(this.createRequest("/Preferences/UserPreferences",{}));
				filterRequests.push(this.createRequest("/Preferences/ChangeUserPreferences",{}));
			}

		
			var debug = false;
			var removeFromCache = [];
			var newCache = [];

			if (debug) {
				console.log("request: " + currentRequest.resource + " - " + JSON.stringify(currentRequest.params));
			}

			
			if (filterRequests.length != 0) {

				for (var i in filterRequests) {

					if (debug) {
						console.log("filter: " + filterRequests[i].resource + " - " + JSON.stringify(filterRequests[i].params));
					}

					for (var x in currentCache) {
						if (debug) {
							console.log("Cache " + x + ":" + currentCache[x].resource + " - " + JSON.stringify(currentCache[x].params));
						}

						//Se o recurso filtrado for igual ao que estiver no cache
			 			if (currentCache[x].resource == filterRequests[i].resource) {

		 					//console.log("Comparando parâmetros do Recurso: " + currentCache[x].resource)
		 					var equal = true;

							//COMPARANDO OS PARAMETROS DA INVALIDAÇÃO DE CACHE COM OS PARAMETROS DO CACHE
							for (var y in filterRequests[i].params) {

								for (var z in currentCache[x].params) {

									if (z == y) {

										if (currentCache[x].params[z] != filterRequests[i].params[y]) {
											//console.log(y + " - " + z + ":" + currentCache[x].params[z] + "->" + filterRequests[i].params[y]);
											equal = false;
										}
									}

								}
								
							}


							if (equal) {
								//console.log("Remove: " + x + ":" + currentCache[x].resource + " - " + JSON.stringify(currentCache[x].params));
								//if (!$.inArray(x,removeFromCache)) {
									removeFromCache.push(x);
								//}
							}

			 			}


					}


				}

				if (debug) {
					console.log("WillRemoveFromCache");
					console.log(removeFromCache);
				}

				for (var i in currentCache) {

					//var found = false;

					if (removeFromCache.indexOf(i) < 0) {
						newCache.push(currentCache[i]);
					}

					// for (var x in removeFromCache) {
					// 	if (removeFromCache[x] == i) {
					// 		found = true;
					// 	}
					// }

					// if (!found) {
					// 	newCache.push(currentCache[i]);
					// }

				}

			} else {
				newCache = currentCache;
			}

			return newCache;
			
		};

		this.addToCache = function(request,response) {

			var that = this;

			var saveCache = function(request,response,currentCache) {

				
				//console.log(currentCache);

				if (currentCache == undefined) {
					currentCache = [];
				}

				that._cache = currentCache;

				var requestParams = request.params;

				var found = false;
				
				for (var i in that._cache) {
					if (request.resource == that._cache[i].resource)  {

						var equal = true;
						for (var x in requestParams) {
							if (x != 'auth') {
								if (requestParams[x] != that._cache[i].params[x]) {
									equal = false;
								}
							}
						}
						if (equal) {
							if (response.result) {
								that._cache[i].date = Date.now();
								that._cache[i].response = response; 
								found = request;
							}
						}

					}
				}

				if (!found) {
					if (response.result) {
						request.response = response;
						//if (DontCache.indexOf(request.resource) < 0) { 
							that._cache.push(request);
						//}
					}
				}

				that._cache = that.triggerCacheRequest(that._cache,request);

				that.setLocalStorageValue("expressoCache",that._cache);
			};

			var foundCallBack = function(cacheResponse) {
				saveCache(request,response,cacheResponse);
			};

			var erroCB = function() {
				saveCache(request,response,that._cache);
			};
			
			this.getLocalStorageValue("expressoCache",foundCallBack,erroCB);
		};

		this.ignoreCache = function(value) {
			if(value == undefined) return _ignoreCache;
			_ignoreCache = value;
			return this;
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
			//var exdate=new Date();
			//exdate.setDate(exdate.getDate() + exdays);
			//var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
			//document.cookie=c_name + "=" + c_value;
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

		this.removeLocalStorageValue = function(c_name) {
			//console.log("removeLocalStorageValue:" + c_name);
			window.localStorage.removeItem(c_name);
		}


		this.getLocalStorageValue =  function(name,successCallBack,failCallBack) {

			var that = this;

			if (_phoneGap && _android) {
				that._tempName = name;
				that._tempCallback = successCallBack;

				_db.transaction(this.getPhonegapDatabaseValue, this.errorCB,successCallBack);

			} else {

				var value = window.localStorage.getItem(name);
				if (value) {
					successCallBack(JSON.parse(value));
				} else {
					if (failCallBack) {
						failCallBack();
					}
					
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

			conf.headers = {},
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

			this._data = _data;


			var that = this;

			conf.error = function(x, t, m) {
		        if(t==="timeout") {
		        	that._isOffline = true;
					if (_data[that.id()].fail) _data[that.id()].fail(networkTimeoutError);
		            // alert("Timeout");
		        } else {
		        	that._isOffline = true;
		            // alert(t);
		        }
		    };

			var CacheRequest = this.getRequest();

			//if (this.isCachedResource(CacheRequest)) {

				if ((that._isOffline == false) || (that._isOffline == undefined)) {
					$("#isOffline").hide();
				} else {
					$("#isOffline").show();
				}


				var successCallBackCache = function(foundCache) {


					if (that.ignoreCache() == true) {
						foundCache = false;
					}

					if ( (foundCache != false) && ((foundCache.response.result != undefined) && (foundCache.response != undefined)) ) {
						if ((foundCache.response.result) && (foundCache.response)) {
							if (that._data[that.id()].done) that._data[that.id()].done(foundCache.response.result,that._data[that.id()].send);
						} else {
							if (that._data[that.id()].fail) that._data[that.id()].fail(foundCache.response,that.data[that.id()].send);
						}
						
					} else {
					//if ( (foundCache == false) || (!that.isCachedResource(CacheRequest)) ) {

						if ((that._isOffline == false) || (that._isOffline == undefined)) {
		    
							jQuery.ajax(conf).done(function(response) {

								if ((!response.result) && (!response.error)) {
									response = JSON.parse(response);
								}

								//if (that.isCachedResource(CacheRequest)) {
								that.addToCache(CacheRequest,response);
								//}

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
									if (response.error.code == 100) {

										if (_debug) {
											console.log('ExpressoAPI - OFFLINE ERROR');
											console.log(JSON.stringify(response));
										}


										$("#isOffline").show();
										that._isOffline = true;

										var thot = that;


										var _tempData = _data;
										var _tempId = this.id;

										var forceCache = function(forcedCacheResponse) {
											if (forcedCacheResponse) {
												if ((forcedCacheResponse.response.result) && (forcedCacheResponse.response)) {
													if (_tempData[_tempId].done) _tempData[_tempId].done(forcedCacheResponse.response.result,_tempData[_tempId].send);
												}
											} else {
												if (_tempData[_tempId].fail) _tempData[_tempId].fail(response,_tempData[_tempId].send);
											}
										};

										that.getCacheResponse(CacheRequest,forceCache);

									} else {
										if (_data[this.id].fail) _data[this.id].fail(response,_data[this.id].send);
									}
									
								}

								that.ignoreCache(false);

							}).fail(function(response) {
								if (_debug) {

									console.log('ExpressoAPI - FAIL callback');
									console.log(JSON.stringify(response));
								}
								if (_data[this.id].fail) _data[this.id].fail(response,_data[this.id].send);

								that.ignoreCache(false);

							}).always(function() {
								if (_debug) console.log('ExpressoAPI - ALWAYS callback');
								if (_data[this.id]) {
									if (_data[this.id].always) _data[this.id].always(_data[this.id].send);
									delete _data[this.id];
								}

								that.ignoreCache(false);
							});

						} else {
							// $("#isOffline").show();
						}
					}

				};

			
			

			this.getCacheResponse(CacheRequest,successCallBackCache);


			this.id(_id+1);

			return this;
		};
	}

  	return ExpressoAPI;
  
});


