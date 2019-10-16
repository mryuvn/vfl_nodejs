const axios = require('axios');

var request = function (url, headers, xml, timeout) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url,
            headers,
            data: xml,
            timeout,
        }).then((response) => {
            resolve({
                response: {
                    body: response.data,
                    statusCode: response.status,
                },
            });
        }).catch((error) => {
            if (error.response) {
                console.log(`SOAP FAIL: ${error}`);
                reject(error.response.data);
            } else {
                console.log(`SOAP ERROR: ${error}`);
                reject(error);
            }
        });
    });
}

module.exports = {
    request: request
}