define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

	var ExpressoService = new function() {

		var service;

		this.startService = function() {
			var that = this;
			this.service.startService(	function(r){ that.handleSuccess(r)},
										function(e){ that.handleError(e)});
		};

		this.stopService = function() {
			var that = this;
 			this.service.stopService(	function(r){ that.handleSuccess(r)},
										function(e){ that.handleError(e)});
		};

		this.enableTimer = function() {
			var that = this;
			// VERIFY NEW MESSAGES EVERY 5 MINUTES - 300000
			this.service.enableTimer(	60000, 
										function(r){ that.handleSuccess(r)},
										function(e){ that.handleError(e)});
		};

		this.disableTimer = function() {
			var that = this;
 			this.service.disableTimer(	function(r){ that.handleSuccess(r)},
										function(e){ that.handleError(e)});
		};
		 			
		this.registerForBootStart = function() {
			var that = this;
			this.service.registerForBootStart(	function(r){ that.handleSuccess(r)},
												function(e){ that.handleError(e)});
		};

		this.deregisterForBootStart = function() {
			var that = this;
			this.service.deregisterForBootStart(	function(r){ that.handleSuccess(r)},
													function(e){ that.handleError(e)});
		};

		this.registerForUpdates = function() {
			var that = this;
			this.service.registerForUpdates(	function(r){ that.handleSuccess(r)},
												function(e){ that.handleError(e)});
		};

		this.deregisterForUpdates = function() {
			var that = this;
			this.service.deregisterForUpdates(	function(r){ that.handleSuccess(r)},
												function(e){ that.handleError(e)});
		};

		this.handleSuccess = function(r) {

		};

		this.handleError = function(e) {

		};

		this.setConfig = function(apiURL,auth,username,password) {

			var that = this;
			
			var config = { 
				"auth" : auth,
				"apiURL" : apiURL,
				"username" : username,
				"password" : password 
			};

			if (this.service != undefined) {
				this.service.setConfiguration(	config,
											function(r){ that.handleSuccess(r)},
											function(e){ that.handleError(e)});
			}
		
			
		};

	}

  	return ExpressoService;
  
});
