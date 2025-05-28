const axios = require("axios");


const Helper = {
        getIP_DeviceIfoOfRequest(req) {
        const xForwardedFor = req.headers['x-forwarded-for'];
        let ip = xForwardedFor
            ? xForwardedFor.split(',')[0].trim()
            : req.connection?.remoteAddress ||
              req.socket?.remoteAddress ||
              req.connection?.socket?.remoteAddress ||
              null;
    
        // Remove IPv6 prefix if present (e.g., ::ffff:192.168.0.1)
        ip = ip?.replace(/^.*:/, '') || null;
        // Device Information
        const ua = req.useragent || {};
        const deviceType = ua.isMobile ? 'Mobile' : ua.isTablet ? 'Tablet' : 'Desktop';
        const deviceInfo = `${deviceType}-${ua.browser}-${ua.os}-${ua.platform}`;
        return {ipAddress: ip, deviceInfo };
    },
        async getRequest(url, headers) {
        return await axios({
            method : "GET",
            url,
            headers : {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    },
    async postRequest(url, data, headers, options){
        return await axios({
            method : "POST",
            url,
            data, 
            headers : {
                'Content-Type': 'application/json',
                ...headers
            },
            config : options
        });
    },
    catchBlock(error, errorMessage, res){
        console.log("-- INSIDE CATCHBLOCK --")
        let error_message;
        try {
            if(error.response){
                if(error.response.data){
                    error_message = error.response.data
                    console.log(errorMessage, error.response.data);
                }
                else{
                    error_message = error.response
                    console.log(errorMessage, error.response);
                }
            }else{
                error_message = error
                console.log(errorMessage,error);
            }
        } catch (error) {
            error_message = error
            console.log(errorMessage,error);
        }
        console.log(error_message);
    }
}

module.exports = Helper;