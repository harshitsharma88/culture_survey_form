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
    }
}

module.exports = Helper;