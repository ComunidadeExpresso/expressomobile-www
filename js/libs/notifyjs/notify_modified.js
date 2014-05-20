define([
  'jquery',
], function($){

    var Notify = new function() {

        this.create = function(title,options) {

            if (typeof title !== 'string') {
                throw new Error('Notify(): first arg (title) must be a string.');
            }

            this.title = title;

            this.options = {
                icon: '',
                body: '',
                tag: '',
                notifyShow: null,
                notifyClose: null,
                notifyClick: null,
                notifyError: null,
                permissionGranted: null,
                permissionDenied: null,
                timeout: null
            };

            this.permission = null;

            if (!this.isSupported()) {
                return;
            }

            //User defined options for notification content
            if (typeof options === 'object') {

                for (var i in options) {
                    if (options.hasOwnProperty(i)) {
                        this.options[i] = options[i];
                    }
                }

                //callback when notification is displayed
                if (typeof this.options.notifyShow === 'function') {
                    this.onShowCallback = this.options.notifyShow;
                }

                //callback when notification is closed
                if (typeof this.options.notifyClose === 'function') {
                    this.onCloseCallback = this.options.notifyClose;
                }

                //callback when notification is clicked
                if (typeof this.options.notifyClick === 'function') {
                    this.onClickCallback = this.options.notifyClick;
                }

                //callback when notification throws error
                if (typeof this.options.notifyError === 'function') {
                    this.onErrorCallback = this.options.notifyError;
                }
            }
        };


        // return true if the browser supports HTML5 Notification
        this.isSupported = function () {
            // if ('Notification' in window) {
            //     return true;
            // }
            return true;
            // return false;
        };

        // returns true if the permission is not granted
        this.needsPermission = function () {
            if (this.isSupported() && Notification.permission === 'granted') {
                return false;
            }
            return true;
        };

        // asks the user for permission to display notifications.  Then calls the callback functions is supplied.
        this.requestPermission = function (onPermissionGrantedCallback, onPermissionDeniedCallback) {
            if (this.isSupported()) {
                w.Notification.requestPermission(function (perm) {
                    switch (perm) {
                        case 'granted':
                            if (typeof onPermissionGrantedCallback === 'function') {
                                onPermissionGrantedCallback();
                            }
                            break;
                        case 'denied':
                            if (typeof onPermissionDeniedCallback === 'function') {
                                onPermissionDeniedCallback();
                            }
                            break;
                    }
                });
            }
        };


        this.show = function () {
            var that = this;

            if (!this.isSupported()) {
                return;
            }

            this.myNotify = new Notification(this.title, {
                'body': this.options.body,
                'tag' : this.options.tag,
                'icon' : this.options.icon
            });

            if (this.options.timeout && !isNaN(this.options.timeout)) {
                setTimeout(this.close.bind(this), this.options.timeout * 1000);
            }

            this.myNotify.addEventListener('show', this.onShowNotification, false);
            this.myNotify.addEventListener('error', this.onErrorNotification, false);
            this.myNotify.addEventListener('close', this.onCloseNotification, false);
            this.myNotify.addEventListener('click', this.onClickNotification, false);
        };

        this.onShowNotification = function (e) {
            if (this.onShowCallback) {
                this.onShowCallback(e);
            }
        };

        this.onCloseNotification = function (e) {
            if (this.onCloseCallback) {
                this.onCloseCallback();
            }
            this.destroy();
        };

        this.onClickNotification = function (e) {
            if (this.onClickCallback) {
                this.onClickCallback();
            }
        };

        this.onErrorNotification = function (e) {
            if (this.onErrorCallback) {
                this.onErrorCallback();
            }
            this.destroy();
        };

        this.destroy = function () {
            this.myNotify.removeEventListener('show', this, false);
            this.myNotify.removeEventListener('error', this, false);
            this.myNotify.removeEventListener('close', this, false);
            this.myNotify.removeEventListener('click', this, false);
        };

        this.close = function () {
            this.myNotify.close();
        };

        this.handleEvent = function (e) {
            console.log(e);
            switch (e.type) {
            case 'show':
                this.onShowNotification(e);
                break;
            case 'close':
                this.onCloseNotification(e);
                break;
            case 'click':
                this.onClickNotification(e);
                break;
            case 'error':
                this.onErrorNotification(e);
                break;
            }
        };

    };


    return Notify;

});