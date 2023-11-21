var addressHelpers = require('app_storefront_base/cartridge/scripts/helpers/addressHelpers');

addressHelpers.updateAddressFields = function (newAddress, address) {
    newAddress.setAddress1(address.address1 || '');
    newAddress.setAddress2(address.address2 || '');
    newAddress.setCity(address.city || '');
    newAddress.setFirstName(address.firstName || '');
    newAddress.setLastName(address.lastName || '');
    newAddress.setPhone(address.phone || '');
    newAddress.setPostalCode(address.postalCode || '');
    if (address.integrateAddressId) {
        newAddress.getCustom().v_integrateAddressId = address.integrateAddressId;
    }

    if (address.states && address.states.stateCode) {
        newAddress.setStateCode(address.states.stateCode);
    }

    if (address.country) {
        newAddress.setCountryCode(address.country);
    }

    newAddress.setJobTitle(address.jobTitle || '');
    newAddress.setPostBox(address.postBox || '');
    newAddress.setSalutation(address.salutation || '');
    newAddress.setSecondName(address.secondName || '');
    newAddress.setCompanyName(address.companyName || '');
    newAddress.setSuffix(address.suffix || '');
    newAddress.setSuite(address.suite || '');
    newAddress.setTitle(address.title || '');
}

addressHelpers.saveAddress = function (address, customer, addressId) {
    var HookManager = require('dw/system/HookMgr');
    var UUIDUtils = require('dw/util/UUIDUtils');
    var integrationAddressId = UUIDUtils.createUUID();
    address.integrateAddressId = integrationAddressId;
    var profileintegrateId = customer.raw.profile.custom.v_integrateId
    var result;

    if (HookManager.hasHook('app.register.requestCustomerToExternalService')) {
        result = HookManager.callHook(
            'app.register.requestCustomerToExternalService',
            'addCustomersAddressToExternalService',
            address,
            integrationAddressId,
            profileintegrateId
        );
    }
    if (result.ok) {
        var Transaction = require('dw/system/Transaction');

        var addressBook = customer.raw.getProfile().getAddressBook();
        Transaction.wrap(function () {
            var newAddress = addressBook.createAddress(addressId);
            addressHelpers.updateAddressFields(newAddress, address);
        });
    }else{
        var Resource = require('dw/web/Resource');
        res.setStatusCode(500);
        res.json({
            success: false,
            errorMessage: Resource.msg('message.error.external.service', 'error', null)
        });
    }
}

module.exports = addressHelpers;