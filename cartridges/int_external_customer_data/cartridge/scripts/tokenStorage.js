'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var utils = require('./utils/constantsUtils');

function getToken() {

    var tokenObject = getExistingToken();
    if (tokenObject) {
        var currentTime = new Date().getTime();

        if (currentTime < Number(tokenObject.expiryTime)) {
            return tokenObject.token;
        }
    }

    tokenObject = generateToken();
    saveTokenToCustomObject(tokenObject);

    return tokenObject.token;
}

function saveTokenToCustomObject(tokenObject) {
    var tokenCustomObject = CustomObjectMgr.getCustomObject(utils.type, utils.keyValue);

    Transaction.begin();
    if (!tokenCustomObject) {
        tokenCustomObject = CustomObjectMgr.createCustomObject(utils.type, utils.keyValue);
    }
    var currentTime = new Date().getTime();
    var tokenExpiryTime = (tokenObject.expiryTime * 1000) + Number(currentTime);


    tokenCustomObject.custom.token = tokenObject.token;
    tokenCustomObject.custom.tokenExpiryTime = tokenExpiryTime.toString();
    Transaction.commit();
}

function generateToken(count) {
    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.getToken();
    var url = `${utils.login}`;
    var params = {};
    params.URL = url;
    var result = svc.call(params);

    if (!result.ok) {
        var Logger = require('dw/system/Logger');
        var Resource = require('dw/web/Resource');
        Logger.error(Resource.msg('message.error.external.service', 'error', null));
    }
    var responseBody = JSON.parse(result.object.text);

    return {
        token: responseBody.accessToken,
        expiryTime: utils.tokenExpiryTime
    }

}

function getExistingToken() {
    var tokenCustomObject = CustomObjectMgr.getCustomObject(utils.type, utils.keyValue);
    var tokenObject;

    if (tokenCustomObject) {

        tokenObject = {
            token: tokenCustomObject.custom.token,
            expiryTime: tokenCustomObject.custom.tokenExpiryTime
        };
        return tokenObject;

    }
    return null;
}

module.exports = {
    getToken: getToken
};