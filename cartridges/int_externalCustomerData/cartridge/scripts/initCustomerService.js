'use strict'

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

function getToken() {
    var getTokenService = LocalServiceRegistry.createService("http.customer.service", {
        createRequest: function (svc, params) {
            svc.setRequestMethod("POST");
            svc.setURL(params.URL);
            svc.addHeader('Content-Type', 'application/json');
            // Logger.getLogger('credPayment', 'credPayment').info('credPayment request: ' + JSON.stringify(params));
            return JSON.stringify({
                email: svc.configuration.credential.user,
                password: svc.configuration.credential.password
            });
        },
        parseResponse: function (svc, response) {
            var data = response;
            return response;
        },
        // getRequestLogMessage(request) {
        //     return JSON.stringify(request);
        // },

    });

    return getTokenService;
}

function postCustomerData() {
    var tokenStorage = require('./tokenStorage');
    var CustomerService = LocalServiceRegistry.createService("http.customer.service", {
        createRequest: function (svc, params) {
            var data = params;
            svc.setRequestMethod("POST");
            svc.setURL(params.URL);
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Authorization', 'Bearer ' + tokenStorage.getToken());
            // Logger.getLogger('credPayment', 'credPayment').info('credPayment request: ' + JSON.stringify(params));
            return JSON.stringify(params.body);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {

            return msg
                .replace(/"id": "[0-9a-z]+"/, "\"id\": \"xxxxxxxxxx\"")
                .replace(/"phone": "\d+"/, "\"phone\": \"xxxxxxxxxx\"")
        }
    });

    return CustomerService;
}
module.exports = {
    postCustomerData: postCustomerData,
    getToken: getToken

};