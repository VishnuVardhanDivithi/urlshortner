const os = require('os');
const axios = require('axios');

/**
 * Get the local IP address of the server
 * @returns {string} The local IP address
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      // Skip internal and non-IPv4 addresses
      if (!info.internal && info.family === 'IPv4') {
        return info.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no external IP is found
}

/**
 * Get the public IP address of the server using a public API
 * @returns {Promise<string>} The public IP address
 */
async function getPublicIpAddress() {
  try {
    // Try multiple IP detection services in case one fails
    const services = [
      'https://api.ipify.org',
      'https://ifconfig.me/ip',
      'https://icanhazip.com'
    ];
    
    for (const service of services) {
      try {
        const response = await axios.get(service, { timeout: 3000 });
        if (response.data) {
          return response.data.trim();
        }
      } catch (err) {
        console.log(`Failed to get IP from ${service}, trying next service...`);
      }
    }
    
    // If all public IP detection services fail, fall back to local IP
    return getLocalIpAddress();
  } catch (error) {
    console.error('Error getting public IP:', error.message);
    return getLocalIpAddress();
  }
}

/**
 * Generate the base URL for the application
 * @param {number} port The port number
 * @returns {Promise<string>} The base URL
 */
async function generateBaseUrl(port) {
  try {
    // Get the local IP address for LAN access
    const ip = getLocalIpAddress();
    return `http://${ip}:${port}`;
  } catch (error) {
    console.error('Error generating base URL:', error.message);
    // Fall back to localhost if there's an error
    return `http://localhost:${port}`;
  }
}

module.exports = {
  getLocalIpAddress,
  getPublicIpAddress,
  generateBaseUrl
};
