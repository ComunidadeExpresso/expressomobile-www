define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/userMessageTemplate.html'
], function($, _, Backbone, userMessageTemplate){

  var UserMessageView = Backbone.View.extend({

    msgType: '',
    msgTitle: '',
    msgDescription: '',
    msgRoute: '',
    msgIcon: '',
    elementID : '',
    timeout: 3000,

    render: function(){

      if (this.timeout == undefined) {
        this.timeout = 3000;
      }

      if (this.msgRoute == undefined) {
        this.msgRoute = "";
      }

      var newData = {
        _: _ ,
        type: this.msgType,
        title: this.msgTitle,
        description: this.msgDescription,
        icon: this.msgIcon,
        route: this.msgRoute,
      };

      var compiledTemplate = _.template( userMessageTemplate, newData );
      this.$el.html(compiledTemplate);

      $(this.elementID).empty().append(this.$el);

      $(this.elementID).animate({top: -$(this.elementID).outerHeight()}, 500);

      var that = this;

      if (that.timeout > 0) {
        setTimeout(function() {
            $(that.elementID).empty();
        },that.timeout);
      }

    },

    events:
    {
      'click .routeMessage': 'clickMessage',
    },

    clickMessage: function(e) {
      e.preventDefault();
      var router = new Backbone.Router();
      router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
      $(this.elementID).empty();
    },

  });

  return UserMessageView;
  
});