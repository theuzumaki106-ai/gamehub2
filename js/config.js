/**
 * GitPulse Chat - Configuration Manager
 * Handles Firebase Cloud credentials and fallback to Local Sync (BroadcastChannel + LocalStorage)
 */

const CONFIG_STORAGE_KEY = 'gitpulse_cloud_config';

const Config = {
  // Option 1: Hardcode your Firebase project credentials here if you like,
  // OR paste them in the in-app Settings modal!
  defaultFirebaseConfig: null,
  /*
  Example Firebase Config:
  defaultFirebaseConfig: {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  */

  firebaseApp: null,
  firebaseDb: null,
  isCloudActive: false,

  /**
   * Load active Firebase configuration from localStorage or default
   */
  getFirebaseConfig() {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read stored Firebase config:", e);
    }
    return this.defaultFirebaseConfig;
  },

  /**
   * Save Firebase configuration to localStorage
   */
  setFirebaseConfig(configObj) {
    if (!configObj) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      this.isCloudActive = false;
      this.firebaseDb = null;
      return;
    }
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configObj));
  },

  /**
   * Initialize Firebase SDK if config is present and valid
   */
  initFirebase() {
    const config = this.getFirebaseConfig();
    if (!config || !config.apiKey || !config.databaseURL) {
      this.isCloudActive = false;
      return false;
    }

    try {
      if (window.firebase) {
        if (!firebase.apps.length) {
          this.firebaseApp = firebase.initializeApp(config);
        } else {
          this.firebaseApp = firebase.app();
        }
        this.firebaseDb = firebase.database();
        this.isCloudActive = true;
        console.log("GitPulse: Connected to Firebase Realtime Database!");
        return true;
      }
    } catch (err) {
      console.error("GitPulse: Firebase initialization error:", err);
      this.isCloudActive = false;
    }
    return false;
  }
};

// Check if Firebase is available on startup
Config.initFirebase();
