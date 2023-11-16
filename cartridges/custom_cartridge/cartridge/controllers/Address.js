'use strict';

/**
 * @namespace Address
 */

var server = require('server');
server.extend(module.superModule);

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');



/**
 * Address-SaveAddress : Save a new or existing address
 * @name Base/Address-SaveAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {httpparameter} - dwfrm_address_addressId - An existing address id (unless new record)
 * @param {httpparameter} - dwfrm_address_firstName - A person’s first name
 * @param {httpparameter} - dwfrm_address_lastName - A person’s last name
 * @param {httpparameter} - dwfrm_address_address1 - A person’s street name
 * @param {httpparameter} - dwfrm_address_address2 -  A person’s apartment number
 * @param {httpparameter} - dwfrm_address_country - A person’s country
 * @param {httpparameter} - dwfrm_address_states_stateCode - A person’s state
 * @param {httpparameter} - dwfrm_address_city - A person’s city
 * @param {httpparameter} - dwfrm_address_postalCode - A person’s united states postel code
 * @param {httpparameter} - dwfrm_address_phone - A person’s phone number
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();

            //request to external data
            var profile = customer.getProfile();
            var HookManager = require('dw/system/HookMgr');
            if (req.querystring.addressId) {
                var updatingAddress = addressBook.getAddress(req.querystring.addressId);
                var result;
                if (HookManager.hasHook('app.register.requestCustomerToExternalService')) {
                    result = HookManager.callHook(
                        'app.register.requestCustomerToExternalService',
                        'editCustomersAddressToExternalService',
                        formInfo,
                        updatingAddress.custom.v_integrateAddressId,
                        profile.custom.v_integrateId
                    );
                }
                if (!result.ok) {
                    return;
                }
            } else {
                var UUIDUtils = require('dw/util/UUIDUtils');
                var integrationAddressId = UUIDUtils.createUUID();
                    if (HookManager.hasHook('app.register.requestCustomerToExternalService')) {
                        result = HookManager.callHook(
                            'app.register.requestCustomerToExternalService',
                            'addCustomersAddressToExternalService',
                            formInfo,
                            integrationAddressId,
                            profile.custom.v_integrateId
                        );
                    }
                    if (!result.ok) {
                        return;
                    }
            }

            Transaction.wrap(function () {
                var address = null;
                if (formInfo.addressId.equals(req.querystring.addressId) || !addressBook.getAddress(formInfo.addressId)) {
                    address = req.querystring.addressId
                        ? addressBook.getAddress(req.querystring.addressId)
                        : addressBook.createAddress(formInfo.addressId);
                }

                if (address) {
                    if (req.querystring.addressId) {
                        address.setID(formInfo.addressId);
                    }

                    // Save form's address
                    //extend form with integrateAddressId
                    if (!address.custom.v_integrateAddressId) {
                        formInfo.integrateAddressId = integrationAddressId;
                    }
                    addressHelpers.updateAddressFields(address, formInfo);

                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Address-List').toString()
                    });
                } else {
                    formInfo.addressForm.valid = false;
                    formInfo.addressForm.addressId.valid = false;
                    formInfo.addressForm.addressId.error =
                        Resource.msg('error.message.idalreadyexists', 'forms', null);
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(addressForm)
                    });
                }
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }
    return next();
});

/**
 * Address-DeleteAddress : Delete an existing address
 * @name Base/Address-DeleteAddress
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedInAjax
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {querystringparameter} - isDefault - true if this is the default address. false otherwise
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.replace('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var addressId = req.querystring.addressId;
    var isDefault = req.querystring.isDefault;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    var UUID = address.getUUID();

    //delete customer`s address from external service
    var integrationAddressId = address.custom.v_integrateAddressId;
    var result;
    var HookManager = require('dw/system/HookMgr');
    if (HookManager.hasHook('app.register.requestCustomerToExternalService')) {
        result = HookManager.callHook(
            'app.register.requestCustomerToExternalService',
            'deleteCustomersAddressFromExternalService',
            integrationAddressId
        );
    }
    if (!result.ok) {
        return;
    }

    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        var length;
        Transaction.wrap(function () {
            addressBook.removeAddress(address);
            length = addressBook.getAddresses().length;
            if (isDefault && length > 0) {
                var newDefaultAddress = addressBook.getAddresses()[0];
                addressBook.setPreferredAddress(newDefaultAddress);
            }
        });

        // Send account edited email
        accountHelpers.sendAccountEditedEmail(customer.profile);

        if (length === 0) {
            res.json({
                UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null),
                message: Resource.msg('msg.no.saved.addresses', 'address', null)
            });
        } else {
            res.json({
                UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null)
            });
        }
    });
    return next();
});

module.exports = server.exports();
