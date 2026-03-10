// Load OAuth Configuration from Backend
// This allows credentials to be set via .env without hardcoding in frontend

async function loadOAuthConfig() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/config/oauth-config"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch OAuth config");
    }

    const config = await response.json();

    // Set global OAuth credentials
    window.GOOGLE_CLIENT_ID = config.googleClientId;
    window.FACEBOOK_APP_ID = config.facebookAppId;

    // Update Facebook SDK script
    const fbScript = document.getElementById("facebook-jssdk");
    if (fbScript && config.facebookAppId) {
      fbScript.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=${config.facebookAppId}&cookie=true&status=true&xfbml=true`;
      fbScript.async = true;
      fbScript.defer = true;
    }

    console.log("✅ OAuth config loaded from backend:", {
      googleClientId: config.googleClientId ? "SET" : "NOT SET",
      facebookAppId: config.facebookAppId ? "SET" : "NOT SET",
    });

    return config;
  } catch (error) {
    console.warn("⚠️ Could not load OAuth config from backend:", error);
    console.log(
      "You can still manually set credentials in .env and restart the backend"
    );
    return {
      googleClientId: null,
      facebookAppId: null,
    };
  }
}

// Load OAuth config when page loads
document.addEventListener("DOMContentLoaded", loadOAuthConfig);
