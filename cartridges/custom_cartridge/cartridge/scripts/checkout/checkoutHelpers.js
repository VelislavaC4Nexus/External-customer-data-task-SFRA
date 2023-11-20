"use strict";

var server = require("server");


var HookMgr = require("dw/system/HookMgr");
var OrderMgr = require("dw/order/OrderMgr");
var Order = require("dw/order/Order");

var Status = require("dw/system/Status");
var Transaction = require("dw/system/Transaction");

// static functions needed for Checkout Controller logic

var checkoutHelpers = require("app_storefront_base/cartridge/scripts/checkout/checkoutHelpers");
var hookUtils = require("../utils/hookUtils");

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
checkoutHelpers.placeOrder = function (order, fraudDetectionStatus) {
    var result = {
        error: false,
        errorExt: false
    };

    try {
        //add shipping addresses and billing address to external service
        var HookManager = require("dw/system/HookMgr");
        var billingAddress = order.billingAddress;
        var shipments = order.shipments;
        var response;
        if (
            HookManager.hasHook("app.register.requestCustomerToExternalService")
        ) {
            var customerData;
            var hookFunction;
            if (order.customer.profile) {
                customerData = order.customer.profile.custom.v_integrateId;
                hookFunction= hookUtils.addCustomersDataFromCheckoutToExternalService
                // hookFunction = "addCustomersDataFromCheckoutToExternalService";
            } else {
                customerData = order.customerEmail;
                hookFunction=hookUtils.addGuestCustomersDataFromCheckoutToExternalService
            }
            response = HookManager.callHook(
                "app.register.requestCustomerToExternalService",
                hookFunction,
                customerData,
                shipments,
                billingAddress
            );
        }

        if (response.ok) {
            Transaction.begin();
            var placeOrderStatus = OrderMgr.placeOrder(order);
            if (placeOrderStatus === Status.ERROR) {
                throw new Error();
            }

            if (fraudDetectionStatus.status === "flag") {
                order.setConfirmationStatus(
                    Order.CONFIRMATION_STATUS_NOTCONFIRMED
                );
            } else {
                order.setConfirmationStatus(
                    Order.CONFIRMATION_STATUS_CONFIRMED
                );
            }

            order.setExportStatus(Order.EXPORT_STATUS_READY);
            Transaction.commit();
        } else {
            result.error = true;
            result.errorExt = true;
        }
    } catch (e) {
        Transaction.wrap(function () {
            OrderMgr.failOrder(order, true);
        });
        result.error = true;
    }

    return result;
};

module.exports = checkoutHelpers;
