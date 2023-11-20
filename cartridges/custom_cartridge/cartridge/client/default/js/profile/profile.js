'use strict';

var formValidation = require('base/components/formValidation');
var createErrorNotification = require('base/components/errorNotification');
var base = require('base/profile/profile');

base.submitProfile = function () {
    $('form.edit-profile-form').submit(function (e) {
        console.log("CUSTOM");
        var $form = $(this);
        e.preventDefault();
        var url = $form.attr('action');
        $form.spinner().start();
        $('form.edit-profile-form').trigger('profile:edit', e);
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
                    console.log(err.responseJSON.errorMessage);
                    createErrorNotification($('.error-messaging'), err.responseJSON.errorMessage);
                }
                $form.spinner().stop();
            }
        });
        return false;
    });
}

module.exports = base;

