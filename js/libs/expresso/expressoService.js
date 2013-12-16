define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

	var ExpressoService = new function() {

		var service;

		this.startService = function() {
			this.service.startService(	function(r){handleSuccess(r)},
										function(e){handleError(e)});
		};

		this.stopService = function() {
 			this.service.stopService(	function(r){handleSuccess(r)},
										function(e){handleError(e)});
		};

		this.enableTimer = function() {
			// VERIFY NEW MESSAGES EVERY 5 MINUTES - 300000
			this.service.enableTimer(	60000, 
										function(r){handleSuccess(r)},
										function(e){handleError(e)});
		};

		this.disableTimer = function() {
 			this.service.disableTimer(	function(r){handleSuccess(r)},
										function(e){handleError(e)});
		};
		 			
		this.registerForBootStart = function() {
			this.service.registerForBootStart(	function(r){handleSuccess(r)},
												function(e){handleError(e)});
		};

		this.deregisterForBootStart = function() {
			this.service.deregisterForBootStart(	function(r){handleSuccess(r)},
													function(e){handleError(e)});
		};

		this.registerForUpdates = function() {
			this.service.registerForUpdates(	function(r){handleSuccess(r)},
												function(e){handleError(e)});
		};

		this.deregisterForUpdates = function() {
			this.service.deregisterForUpdates(	function(r){handleSuccess(r)},
												function(e){handleError(e)});
		};

		this.setConfig = function(apiURL,auth,username,password) {

			var config = { 
				"auth" : auth,
				"apiURL" : apiURL,
				"username" : username,
				"password" : password 
			};
		
			this.service.setConfiguration(	config,
											function(r){handleSuccess(r)},
											function(e){handleError(e)});
		};

	}

  	return ExpressoService;
  
});
