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
    animate: true,
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

      if (this.animate) {
        $(this.elementID).attr("style","position: absolute; top: -" + $(this.elementID).outerHeight() + "px; width: 100%;");

        var mTop = $('#mainAppPageContent').css("margin-top");

        mTop = mTop.split("px");

        $(this.elementID).animate({top: (parseInt(mTop[0], 0) * -1) }, 500);
      } else {
        $(this.elementID).attr("style","top: 0px");
      }

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