'use strict';

var urlUtils = require('../utils/urlUtils');

function getCustomersFromExternalService(method) {
    var url = `${urlUtils.host}${urlUtils.customers}`
    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();

    var params = {};
    params.URL = url;
    params.method = method;
    var result = svc.call(params);
    
    return JSON.parse(result.object.text);
}

function getCustomerAddressesFromExternalService(method) {
    var url = `${urlUtils.host}${urlUtils.addressBook}`
    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();

    var params = {};
    params.URL = url;
    params.method = method;
    var result = svc.call(params);
    
    return JSON.parse(result.object.text);
}

function requestCustomerToExternalService(method, registrationForm, integrationId) {
    var url;
    method === "POST" ? url = `${urlUtils.host}${urlUtils.customers}`
        : url = `${urlUtils.host}${urlUtils.customers}/${integrationId}`

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();

    var body = {};

    method === "POST" ? body.id = integrationId : "";
    body.firstName = registrationForm.firstName;
    body.lastName = registrationForm.lastName;
    body.phone = registrationForm.phone;
    body.email = registrationForm.email;

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = method
    var result = svc.call(params);
    return result;
}

function addCustomersAddressToExternalService(formInfo, integrationAddressId, customerId) {

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();
    var url = `${urlUtils.host}${urlUtils.addressBook}`

    var body = {};

    body.id = integrationAddressId;
    if (formInfo.addressId) {
        body.addressTitle = formInfo.addressId;
    }else{
        body.addressTitle=`${formInfo.address1} - ${formInfo.city} - ${formInfo.postalCode}`
    }
    body.firstName = formInfo.firstName;
    body.lastName = formInfo.lastName;
    body.phone = formInfo.phone;
    body.city = formInfo.city;
    body.address1 = formInfo.address1;
    body.address2 = formInfo.address2;
    if (formInfo.country.value) {
        body.country = formInfo.country.value;
    } else if (formInfo.country) {
        body.country = formInfo.country;
    }
    body.postalCode = formInfo.postalCode;
    body.stateCode = formInfo.states.stateCode;
    body.customerId = customerId;

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = "POST";
    var result = svc.call(params);
    return result;
}

function editCustomersAddressToExternalService(formInfo, updatingAddressId, customerId) {

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();
    var url = `${urlUtils.host}${urlUtils.addressBook}/${updatingAddressId}`;
    var body = {};

    body.addressTitle = formInfo.addressId;
    body.firstName = formInfo.firstName;
    body.lastName = formInfo.lastName;
    body.phone = formInfo.phone;
    body.city = formInfo.city;
    body.address1 = formInfo.address1;
    body.address2 = formInfo.address2;
    body.country = formInfo.country;
    body.postalCode = formInfo.postalCode;
    body.stateCode = formInfo.states.stateCode;
    body.customerId = customerId;

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = "PUT";
    var result = svc.call(params);
    return result;
}

function deleteCustomersAddressFromExternalService(integrationAddressId) {

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();
    var url = `${urlUtils.host}${urlUtils.addressBook}/${integrationAddressId}`;
    var body = {};

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = "DELETE"
    var result = svc.call(params);
    return result;
}

function addGuestCustomersDataFromCheckoutToExternalService(customerEmail, shipments, billingAddress) {

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();
    var url = `${urlUtils.host}${urlUtils.guestCustomers}`;

    var body = {};
    body.customerEmail = customerEmail;
    body.shipping = [];

    for (var element of Array.from(shipments)) {
        body.shipping.push({
            firstName: element.shippingAddress.firstName,
            lastName: element.shippingAddress.lastName,
            fullName: element.shippingAddress.fullName,
            phone: element.shippingAddress.phone,
            city: element.shippingAddress.city,
            address1: element.shippingAddress.address1,
            address2: element.shippingAddress.address2,
            countryCode: element.shippingAddress.countryCode.value,
            postalCode: element.shippingAddress.postalCode,
            stateCode: element.shippingAddress.stateCode,
        });
    }

    body.billing = {
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        fullName: billingAddress.fullName,
        phone: billingAddress.phone,
        city: billingAddress.city,
        address1: billingAddress.address1,
        address2: billingAddress.address2,
        postalCode: billingAddress.postalCode,
        stateCode: billingAddress.stateCode,
    }

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = "POST";
    var result = svc.call(params);
    return result;
}

function addCustomersDataFromCheckoutToExternalService(customerId, shipments, billingAddress) {

    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.requestCustomerDataToExternalService();
    var url = `${urlUtils.host}${urlUtils.shippingAndBillingAddress}`;

    var body = {};
    body.customerId = customerId;
    body.shipping = [];

    for (var element of Array.from(shipments)) {
        body.shipping.push({
            firstName: element.shippingAddress.firstName,
            lastName: element.shippingAddress.lastName,
            fullName: billingAddress.fullName,
            phone: element.shippingAddress.phone,
            city: element.shippingAddress.city,
            address1: element.shippingAddress.address1,
            address2: element.shippingAddress.address2,
            countryCode: element.shippingAddress.countryCode.value,
            postalCode: element.shippingAddress.postalCode,
            stateCode: element.shippingAddress.stateCode,
        })
    }

    body.billing = {
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        fullName: billingAddress.fullName,
        phone: billingAddress.phone,
        city: billingAddress.city,
        address1: billingAddress.address1,
        address2: billingAddress.address2,
        postalCode: billingAddress.postalCode,
        stateCode: billingAddress.stateCode,
    }

    var params = {};
    params.body = body;
    params.URL = url;
    params.method = "POST";
    var result = svc.call(params);
    return result;
}

module.exports = {
    getCustomersFromExternalService:getCustomersFromExternalService,
    getCustomerAddressesFromExternalService:getCustomerAddressesFromExternalService,
    requestCustomerToExternalService: requestCustomerToExternalService,
    editCustomersAddressToExternalService: editCustomersAddressToExternalService,
    addCustomersAddressToExternalService: addCustomersAddressToExternalService,
    deleteCustomersAddressFromExternalService: deleteCustomersAddressFromExternalService,
    addGuestCustomersDataFromCheckoutToExternalService: addGuestCustomersDataFromCheckoutToExternalService,
    addCustomersDataFromCheckoutToExternalService: addCustomersDataFromCheckoutToExternalService
}
