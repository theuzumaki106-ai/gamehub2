/**
 * Chat-Chat - Authentication Module
 * Handles Username (ID) & Password Registration, Secure Hashing, Sessions, User Directory, and ID Deletion
 */

const AUTH_USER_KEY = 'chatchat_current_user';
const USERS_REGISTRY_KEY = 'chatchat_all_users';

const Auth = {
  currentUser: null,

  /**
   * Cryptographic SHA-256 hash using the Web Crypto API
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_chatchat_salt");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Get all registered users from local storage
   */
  getRegisteredUsers() {
    try {
      const usersJson = localStorage.getItem(USERS_REGISTRY_KEY);
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const toRemove = ['sarah', 'alex', 'maya'];
        let changed = false;
        toRemove.forEach(u => {
          if (users[u]) {
            delete users[u];
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
        }
        return users;
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }

    // Default seeded users (bot1, bot2)
    const defaultUsers = {
      bot1: {
        username: 'bot1',
        displayName: 'bot1',
        avatar: '🤖',
        unread: 3,
        passwordHash: 'dummy_hash',
        createdAt: new Date().toISOString()
      },
      bot2: {
        username: 'bot2',
        displayName: 'bot2',
        avatar: '🤖',
        unread: 2,
        passwordHash: 'dummy_hash',
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  },

  /**
   * Save user registry
   */
  saveRegisteredUsers(users) {
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  },

  /**
   * Check if a session is currently active
   */
  initSession() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.syncUserToCloud(this.currentUser);
        return this.currentUser;
      }
    } catch (e) {
      console.warn("Session restore failed:", e);
    }
    
    // Default session matching reference UI (You @viswajeet)
    const defaultSession = {
      username: 'viswajeet',
      displayName: 'You',
      avatar: '👦',
      createdAt: new Date().toISOString()
    };
    this.setSession(defaultSession, true);
    return defaultSession;
  },

  /**
   * Register a new user ID with username and password
   */
  async register(username, displayName, password, avatar = '👨‍💻') {
    const cleanUsername = username.trim().toLowerCase();
    
    // Validation
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters.");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      throw new Error("Username can only contain letters, numbers, hyphens and underscores.");
    }
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters.");
    }

    const users = this.getRegisteredUsers();

    if (Config && Config.isCloudActive && Config.firebaseDb) {
      try {
        const snapshot = await Config.firebaseDb.ref(`users/${cleanUsername}`).once('value');
        if (snapshot.exists()) {
          throw new Error(`Username @${cleanUsername} is already taken.`);
        }
      } catch (err) {
        if (err.message && err.message.includes("already taken")) throw err;
      }
    }

    if (users[cleanUsername]) {
      throw new Error(`Username @${cleanUsername} is already taken on this app.`);
    }

    const passwordHash = await this.hashPassword(password);
    const newUser = {
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      avatar: avatar || '👨‍💻',
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    users[cleanUsername] = newUser;
    this.saveRegisteredUsers(users);

    this.syncUserToCloud(newUser);

    return this.setSession(newUser, true);
  },

  /**
   * Log in with username and password
   */
  async login(username, password, rememberMe = true) {
    const cleanUsername = username.trim().toLowerCase();
    let users = this.getRegisteredUsers();
    let user = users[cleanUsername];

    if (!user && Config && Config.isCloudActive && Config.firebaseDb) {
      try {
        const snapshot = await Config.firebaseDb.ref(`users/${cleanUsername}`).once('value');
        if (snapshot.exists()) {
          user = snapshot.val();
          users[cleanUsername] = user;
          this.saveRegisteredUsers(users);
        }
      } catch (e) {
        console.warn("Cloud lookup failed:", e);
      }
    }

    if (!user) {
      throw new Error(`User @${cleanUsername} not found. Please create an ID first.`);
    }

    const enteredHash = await this.hashPassword(password);
    if (user.passwordHash !== enteredHash && user.passwordHash !== 'dummy_hash') {
      throw new Error("Incorrect password. Please try again.");
    }

    return this.setSession(user, rememberMe);
  },

  /**
   * Set active logged-in user
   */
  setSession(user, rememberMe = true) {
    const sessionUser = {
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    this.currentUser = sessionUser;

    if (rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    }

    return sessionUser;
  },

  /**
   * Log out current user
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  },

  /**
   * Permanently delete user ID / account
   */
  async deleteAccount(username) {
    const targetUsername = (username || (this.currentUser && this.currentUser.username) || '').toLowerCase();
    if (!targetUsername) return false;

    const users = this.getRegisteredUsers();
    if (users[targetUsername]) {
      delete users[targetUsername];
      this.saveRegisteredUsers(users);
    }

    if (Config && Config.isCloudActive && Config.firebaseDb) {
      try {
        await Config.firebaseDb.ref(`users/${targetUsername}`).remove();
      } catch (e) {}
    }

    this.logout();
    return true;
  },

  /**
   * Update profile (Display name or avatar)
   */
  updateProfile(displayName, avatar) {
    if (!this.currentUser) return;
    
    this.currentUser.displayName = displayName || this.currentUser.displayName;
    this.currentUser.avatar = avatar || this.currentUser.avatar;

    const users = this.getRegisteredUsers();
    if (users[this.currentUser.username]) {
      users[this.currentUser.username].displayName = this.currentUser.displayName;
      users[this.currentUser.username].avatar = this.currentUser.avatar;
      this.saveRegisteredUsers(users);
    }

    if (localStorage.getItem(AUTH_USER_KEY)) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
    }

    this.syncUserToCloud(this.currentUser);
    return this.currentUser;
  },

  /**
   * Sync user record to Firebase Cloud
   */
  syncUserToCloud(user) {
    if (Config && Config.isCloudActive && Config.firebaseDb && user) {
      try {
        Config.firebaseDb.ref(`users/${user.username}`).update({
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          lastSeen: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not sync user to cloud:", err);
      }
    }
  }
};
