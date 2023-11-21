'use strict'

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

function getToken() {
    var getTokenService = LocalServiceRegistry.createService("http.customer.service", {
        createRequest: function (svc, params) {
            svc.setRequestMethod("POST");
            svc.setURL(`${svc.configuration.credential.URL}${params.URL}`);
            svc.addHeader('Content-Type', 'application/json');
            return JSON.stringify({
                email: svc.configuration.credential.user,
                password: svc.configuration.credential.password
            });
        },
        parseResponse: function (svc, response) {
            var data = response;
            return response;
        },
        filterLogMessage: function (msg) {
            return msg
                .replace(/("accessToken": ")[^"]+"/, "\"accessToken\": \"xxxxxxxxxx\"")
                .replace(/("email": ")[^"@]+@[^"]+"/, "\"email\": \"xxxxxxxxxx\"")
                .replace(/("username": ")[^"]+"/, "\"username\": \"xxxxxxxxxx\"")
        }
    });
    return getTokenService;
}

function requestCustomerDataToExternalService() {
    var tokenStorage = require('./tokenStorage');
    var CustomerService = LocalServiceRegistry.createService("http.customer.service", {
        createRequest: function (svc, params) {
            svc.setRequestMethod(params.method);
            svc.setURL(`${svc.configuration.credential.URL}${params.URL}`);
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Authorization', 'Bearer ' + tokenStorage.getToken());
            return JSON.stringify(params.body);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg
                .replace(/"phone": "\d+"/g, "\"phone\": \"xxxxxxxxxx\"")
        }
    });
    return CustomerService;
}

module.exports = {
    requestCustomerDataToExternalService: requestCustomerDataToExternalService,
    getToken: getToken

};