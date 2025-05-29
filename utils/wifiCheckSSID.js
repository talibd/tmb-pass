// utils/wifiCheckSSID.js
const wifi = require("node-wifi");

// Initialize wifi module
wifi.init({ iface: null });

async function isConnectedToAuthorizedWifi() {
  try {
    const connections = await wifi.getCurrentConnections();
    if (!connections || connections.length === 0) {
      return { authorized: false, bssid: null };
    }

    const bssid = connections[0].bssid || null;

    // Replace this with your allowed BSSID(s)
    const allowedBssids = ["THE MEDIA BUDDY-5G","unknown"]  ; // case-sensitive

    const authorized = allowedBssids.includes(bssid);

    return { authorized, bssid };
  } catch (err) {
    console.error("WiFi check failed:", err);
    return { authorized: false, bssid: null };
  }
}

module.exports = isConnectedToAuthorizedWifi;
