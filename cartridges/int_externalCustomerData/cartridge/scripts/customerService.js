'use strict'

function postCustomerData() {
    var CustomerService = dw.svc.LocalServiceRegistry.createService("http.customer.service", {
        createRequest: function (svc, params) {
            var data = params;
            svc.setRequestMethod("POST");
            svc.setURL(params.URL);
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFubmFiZWxsQGFidi5iZyIsImlhdCI6MTY5OTU2OTA3NywiZXhwIjoxNjk5NTcyNjc3LCJzdWIiOiIyIn0.zYDCz3hdIuwa8tT_Ybya9owAQpQ38CdNyytvcus68Ho");
            // Logger.getLogger('credPayment', 'credPayment').info('credPayment request: ' + JSON.stringify(params));
            return JSON.stringify(params.body);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        // filterLogMessage: function (msg) {

        //     return msg.replace(/"cost_in_credits":"\d+"/,"cost_in_credits:$$$$$$$$$$$$$$$$$$$");
        // }
    });
    
    return CustomerService;
}
module.exports = {
    postCustomerData: postCustomerData
};