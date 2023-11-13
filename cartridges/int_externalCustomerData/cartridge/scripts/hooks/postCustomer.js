function postCustomerToExternalService(registrationForm, indegrationID) {
    var customerService = require("*/cartridge/scripts/initCustomerService");
    var svc = customerService.postCustomerData();
    var url = "https://json-server-app-707ded616226.herokuapp.com/recipes";

    var body = {};
    body.id = indegrationID;
    body.firstName = registrationForm.firstName;
    body.lastName = registrationForm.lastName;
    body.phone = registrationForm.phone;
    body.email = registrationForm.email;

    var params = {};
    params.body = body;
    params.URL = url;
    var result = svc.call(params);
    return result;
}

exports.postCustomer = postCustomer;