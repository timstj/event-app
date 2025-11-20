/**
 * Environment configuration
 * Automatically detects if running locally or in production
 */

function getEnvironmentConfig() {
    const hostname = window.location.hostname;

    // Check if running localy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            API_BASE_URL: 'http://localhost:5001/api',
            ENV: 'development',
            DEBUG: true
        };
    }

    // If running in prod
    return {
        API_BASE_URL: 'https://event-app-frontend-c3il.onrender.com', // Update to correct
        ENV: 'production',
        DEBUG: false
    };

}

export const config = getEnvironmentConfig();

// To confirm dev environment
if (config.DEBUG) {
    console.log('Running in:', config.ENV);
    console.log('API URL: ', config.API_BASE_URL);
}