'use strict';

var url;
var isDefault;

/**
 * Create an alert to display the error message
 * @param {Object} message - Error message to display
 */
function createErrorNotification(message) {
    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
        'fade show" role="alert">' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' + message + '</div>';

    $('.error-messaging').append(errorHtml);
}


var formValidation = require('base/components/formValidation');
var base = require('base/addressBook/addressBook');

base.submitAddress = function () {
    $('form.address-form').submit(function (e) {
        console.log('CUSTOM');
        var $form = $(this);
        e.preventDefault();
        url = $form.attr('action');
        $form.spinner().start();
        $('form.address-form').trigger('address:submit', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: $form.serialize(),
            success: function (data) {
                $form.spinner().stop();
                if (!data.success) {
                    formValidation($form, data);
                } else {
                    location.href = data.redirectUrl;
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                } else {
                    console.log('createErrorNotification Address');
                    createErrorNotification(err.responseJSON.errorMessage);
                }
                $form.spinner().stop();
            }
        });
        return false;
    });
}

module.exports = base;
