cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "org.apache.cordova.inappbrowser.inappbrowser",
        "file": "plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",
        "pluginId": "org.apache.cordova.inappbrowser",
        "clobbers": [
            "window.open"
        ]
    },
    {
        "id": "es6-promise-plugin.Promise",
        "file": "plugins/es6-promise-plugin/www/promise.js",
        "pluginId": "es6-promise-plugin",
        "runs": true
    },
    {
        "id": "cordova-plugin-x-socialsharing.SocialSharing",
        "file": "plugins/cordova-plugin-x-socialsharing/www/SocialSharing.js",
        "pluginId": "cordova-plugin-x-socialsharing",
        "clobbers": [
            "window.plugins.socialsharing"
        ]
    },
    {
        "id": "cordova-plugin-google-analytics.UniversalAnalytics",
        "file": "plugins/cordova-plugin-google-analytics/www/analytics.js",
        "pluginId": "cordova-plugin-google-analytics",
        "clobbers": [
            "analytics",
            "ga"
        ]
    },
    {
        "id": "cordova-plugin-x-toast.Toast",
        "file": "plugins/cordova-plugin-x-toast/www/Toast.js",
        "pluginId": "cordova-plugin-x-toast",
        "clobbers": [
            "window.plugins.toast"
        ]
    },
    {
        "id": "cordova-plugin-x-toast.tests",
        "file": "plugins/cordova-plugin-x-toast/test/tests.js",
        "pluginId": "cordova-plugin-x-toast"
    },
    {
        "id": "cordova-plugin-globalization.GlobalizationError",
        "file": "plugins/cordova-plugin-globalization/www/GlobalizationError.js",
        "pluginId": "cordova-plugin-globalization",
        "clobbers": [
            "window.GlobalizationError"
        ]
    },
    {
        "id": "cordova-plugin-globalization.globalization",
        "file": "plugins/cordova-plugin-globalization/www/globalization.js",
        "pluginId": "cordova-plugin-globalization",
        "clobbers": [
            "navigator.globalization"
        ]
    },
    {
        "id": "cordova-plugin-googleplus.GooglePlus",
        "file": "plugins/cordova-plugin-googleplus/www/GooglePlus.js",
        "pluginId": "cordova-plugin-googleplus",
        "clobbers": [
            "window.plugins.googleplus"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.inappbrowser": "0.6.0",
    "es6-promise-plugin": "4.1.0",
    "cordova-plugin-x-socialsharing": "5.1.8",
    "cordova-plugin-google-analytics": "1.8.3",
    "cordova-plugin-x-toast": "2.6.0",
    "cordova-plugin-globalization": "1.0.7",
    "cordova-plugin-whitelist": "1.3.2",
    "cordova-plugin-googleplus": "5.1.1"
};
// BOTTOM OF METADATA
});