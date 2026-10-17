/**
 * Chat-Chat - Real-Time Chat Engine
 * Handles messaging, deduplication, message status dots (• sent, • • delivered, • • • seen),
 * delete message, clear chat, channels, and direct messaging.
 */

const STORAGE_MESSAGES_KEY = 'chatchat_messages_store';
const STORAGE_ROOMS_KEY = 'chatchat_rooms_store';

const Chat = {
  currentRoom: { id: 'general', name: 'general', isPrivate: false, isDM: false },
  unlockedPrivateRooms: new Set(),
  broadcastChannel: null,
  activeTypingTimeouts: {},
  processedMessageIds: new Set(),

  // UI Event Callbacks
  onMessageReceived: null,
  onRoomAdded: null,
  onTypingUpdated: null,
  onReactionUpdated: null,
  onStatusUpdated: null,
  onMessageDeleted: null,
  onRoomCleared: null,

  /**
   * Initialize chat engine
   */
  init() {
    this.initDefaultRooms();
    this.initBroadcastChannel();
    this.initCloudListeners();
  },

  /**
   * Seed channels matching reference image
   */
  initDefaultRooms() {
    try {
      const rooms = this.getAllRooms();
      let changed = false;
      const toRemove = ['tech-talk', 'gaming', 'memes', 'study', 'dev-chat', 'github-projects'];
      toRemove.forEach(id => {
        if (rooms[id]) {
          delete rooms[id];
          changed = true;
        }
      });

      if (!rooms['general']) {
        rooms['general'] = { id: 'general', name: 'general', icon: '#', desc: 'General discussion for all', isPrivate: false };
        changed = true;
      }

      if (changed) {
        localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
      }
    } catch (e) {}
  },

  /**
   * BroadcastChannel for real-time multi-tab & window sync
   */
  initBroadcastChannel() {
    if (window.BroadcastChannel) {
      this.broadcastChannel = new BroadcastChannel('chatchat_bus');
      this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'NEW_MESSAGE') {
          this.handleIncomingMessage(data, false);
        } else if (type === 'MESSAGE_DELIVERED') {
          this.updateMessageStatus(data.messageId, 'delivered');
        } else if (type === 'MESSAGE_SEEN') {
          this.updateMessageStatus(data.messageId, 'seen');
        } else if (type === 'ROOM_SEEN') {
          this.markAllRoomMessagesSeen(data.roomId, data.byUsername);
        } else if (type === 'DELETE_MESSAGE') {
          this.handleRemoteDelete(data.messageId);
        } else if (type === 'CLEAR_ROOM') {
          this.handleRemoteClear(data.roomId);
        } else if (type === 'NEW_ROOM') {
          if (this.onRoomAdded) this.onRoomAdded(data);
        } else if (type === 'TYPING') {
          if (this.onTypingUpdated) this.onTypingUpdated(data);
        } else if (type === 'REACTION') {
          if (this.onReactionUpdated) this.onReactionUpdated(data);
        }
      };
    } else {
      window.addEventListener('storage', (e) => {
        if (e.key === 'chatchat_last_action' && e.newValue) {
          try {
            const action = JSON.parse(e.newValue);
            if (action.type === 'NEW_MESSAGE') {
              this.handleIncomingMessage(action.data, false);
            } else if (action.type === 'DELETE_MESSAGE') {
              this.handleRemoteDelete(action.data.messageId);
            } else if (action.type === 'CLEAR_ROOM') {
              this.handleRemoteClear(action.data.roomId);
            }
          } catch (err) {}
        }
      });
    }
  },

  /**
   * Connect real-time listeners if Firebase is enabled
   */
  initCloudListeners() {
    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref('rooms').on('child_added', (snapshot) => {
        const room = snapshot.val();
        if (room) {
          const localRooms = this.getAllRooms();
          if (!localRooms[room.id]) {
            localRooms[room.id] = room;
            localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(localRooms));
            if (this.onRoomAdded) this.onRoomAdded(room);
          }
        }
      });
    }
  },

  /**
   * Subscribe to messages in active room (Firebase Cloud mode)
   */
  subscribeToRoomMessages(roomId) {
    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref(`messages/${roomId}`).off();
      Config.firebaseDb.ref(`messages/${roomId}`)
        .limitToLast(100)
        .on('child_added', (snapshot) => {
          const msg = snapshot.val();
          if (msg) {
            this.handleIncomingMessage(msg, false);
          }
        });
    }
  },

  /**
   * Rooms management (Default channels matching reference image)
   */
  getAllRooms() {
    try {
      const stored = localStorage.getItem(STORAGE_ROOMS_KEY);
      if (stored) {
        const rooms = JSON.parse(stored);
        const toRemove = ['tech-talk', 'gaming', 'memes', 'study', 'dev-chat', 'github-projects'];
        let changed = false;
        toRemove.forEach(id => {
          if (rooms[id]) {
            delete rooms[id];
            changed = true;
          }
        });
        if (!rooms['general']) {
          rooms['general'] = { id: 'general', name: 'general', icon: '#', desc: 'General discussion for all', isPrivate: false };
          changed = true;
        }
        if (changed) {
          localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
        }
        return rooms;
      }
    } catch (e) {}

    const defaults = {
      'general': { id: 'general', name: 'general', icon: '#', desc: 'General discussion for all', isPrivate: false }
    };
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(defaults));
    return defaults;
  },

  /**
   * Create a new Channel / Room
   */
  async createRoom(name, desc = '', isPrivate = false, password = '') {
    const cleanId = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanId) throw new Error("Room name cannot be empty.");

    const rooms = this.getAllRooms();
    if (rooms[cleanId]) {
      throw new Error(`A channel named #${cleanId} already exists.`);
    }

    let passwordHash = null;
    if (isPrivate) {
      if (!password || password.length < 3) {
        throw new Error("Private channels require a password with at least 3 characters.");
      }
      passwordHash = await Auth.hashPassword(password);
    }

    const newRoom = {
      id: cleanId,
      name: cleanId,
      desc: desc.trim() || `Channel for #${cleanId}`,
      isPrivate: !!isPrivate,
      passwordHash: passwordHash,
      createdBy: Auth.currentUser ? Auth.currentUser.username : 'anonymous',
      createdAt: new Date().toISOString()
    };

    rooms[cleanId] = newRoom;
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));

    if (isPrivate) {
      this.unlockedPrivateRooms.add(cleanId);
    }

    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref(`rooms/${cleanId}`).set(newRoom);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'NEW_ROOM', data: newRoom });
    }

    if (this.onRoomAdded) this.onRoomAdded(newRoom);
    return newRoom;
  },

  /**
   * Unlock private room
   */
  async unlockPrivateRoom(roomId, enteredPassword) {
    const rooms = this.getAllRooms();
    const room = rooms[roomId];
    if (!room || !room.isPrivate) return true;

    const hash = await Auth.hashPassword(enteredPassword);
    if (room.passwordHash === hash) {
      this.unlockedPrivateRooms.add(roomId);
      return true;
    }
    return false;
  },

  isRoomUnlocked(roomId) {
    const rooms = this.getAllRooms();
    const room = rooms[roomId];
    if (!room || !room.isPrivate) return true;
    return this.unlockedPrivateRooms.has(roomId);
  },

  /**
   * Generate Direct Message ID
   */
  getDmRoomId(user1, user2) {
    const sorted = [user1.toLowerCase(), user2.toLowerCase()].sort();
    return `dm_${sorted[0]}_${sorted[1]}`;
  },

  /**
   * Switch active room
   */
  setActiveRoom(roomObj) {
    this.currentRoom = roomObj;
    this.subscribeToRoomMessages(roomObj.id);

    // Notify other tabs that messages in this room have been seen
    if (Auth.currentUser) {
      this.broadcastRoomSeen(roomObj.id);
    }
  },

  /**
   * Messages Database
   */
  getAllMessages() {
    try {
      const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (stored) {
        const msgs = JSON.parse(stored);
        // Automatically purge any dummy seed messages so they never show up
        const cleanMsgs = msgs.filter(m => !m.id || !m.id.startsWith('msg_seed_'));
        if (cleanMsgs.length !== msgs.length) {
          localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(cleanMsgs));
        }
        return cleanMsgs;
      }
    } catch (e) {}

    return [];
  },

  saveMessages(messages) {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  },

  getRoomMessages(roomId) {
    const all = this.getAllMessages();
    return all.filter(m => m.roomId === roomId);
  },

  /**
   * Send a new message
   */
  async sendMessage(text, attachment = null) {
    if (!Auth.currentUser) throw new Error("Must be logged in to send messages.");
    if (!text.trim() && !attachment) return;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      roomId: this.currentRoom.id,
      sender: {
        username: Auth.currentUser.username,
        displayName: Auth.currentUser.displayName,
        avatar: Auth.currentUser.avatar || '👦'
      },
      text: text.trim(),
      attachment: attachment,
      timestamp: new Date().toISOString(),
      status: 'seen',
      reactions: {}
    };

    // Prevent duplicate processing
    this.processedMessageIds.add(message.id);

    // Save to local storage
    const all = this.getAllMessages();
    all.push(message);
    this.saveMessages(all);

    // Broadcast ONLY via BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'NEW_MESSAGE', data: message });
    } else {
      localStorage.setItem('chatchat_last_action', JSON.stringify({
        type: 'NEW_MESSAGE',
        data: message,
        timestamp: Date.now()
      }));
    }

    // Cloud mode sync
    if (Config && Config.isCloudActive && Config.firebaseDb) {
      try {
        await Config.firebaseDb.ref(`messages/${message.roomId}/${message.id}`).set(message);
      } catch (err) {
        console.error("Firebase send failed:", err);
      }
    }

    // Trigger local UI update
    this.handleIncomingMessage(message, true);

    return message;
  },

  /**
   * Handle incoming message (Deduplicated)
   */
  handleIncomingMessage(msg, isSenderSelf = false) {
    if (!msg || !msg.id) return;

    // Check if received message is from another client
    if (!isSenderSelf) {
      // If already processed in this session, don't duplicate
      if (this.processedMessageIds.has(msg.id)) {
        return;
      }
      this.processedMessageIds.add(msg.id);

      // Save to local storage if not already there
      const all = this.getAllMessages();
      const existingIdx = all.findIndex(m => m.id === msg.id);
      if (existingIdx === -1) {
        all.push(msg);
        this.saveMessages(all);
      }

      // Send ACK back to sender:
      // If receiver is currently viewing this room -> MESSAGE_SEEN (• • • green)
      // Else -> MESSAGE_DELIVERED (• •)
      if (Auth.currentUser && msg.sender.username !== Auth.currentUser.username) {
        const isCurrentViewing = this.currentRoom && this.currentRoom.id === msg.roomId;
        if (isCurrentViewing) {
          this.broadcastMessageSeen(msg.id, msg.roomId);
          msg.status = 'seen';
        } else {
          this.broadcastMessageDelivered(msg.id, msg.roomId);
          msg.status = 'delivered';
        }
      }
    }

    if (this.onMessageReceived) {
      this.onMessageReceived(msg);
    }
  },

  /**
   * Message Status: ACK Delivered & Seen
   */
  broadcastMessageDelivered(messageId, roomId) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'MESSAGE_DELIVERED',
        data: { messageId, roomId }
      });
    }
  },

  broadcastMessageSeen(messageId, roomId) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'MESSAGE_SEEN',
        data: { messageId, roomId }
      });
    }
  },

  broadcastRoomSeen(roomId) {
    if (this.broadcastChannel && Auth.currentUser) {
      this.broadcastChannel.postMessage({
        type: 'ROOM_SEEN',
        data: { roomId, byUsername: Auth.currentUser.username }
      });
    }
  },

  updateMessageStatus(messageId, newStatus) {
    const all = this.getAllMessages();
    const msg = all.find(m => m.id === messageId);
    if (msg) {
      // Upgrade status (sent -> delivered -> seen)
      if (newStatus === 'seen' || (newStatus === 'delivered' && msg.status !== 'seen')) {
        msg.status = newStatus;
        this.saveMessages(all);
        if (this.onStatusUpdated) {
          this.onStatusUpdated({ messageId, status: newStatus, roomId: msg.roomId });
        }
      }
    }
  },

  markAllRoomMessagesSeen(roomId, byUsername) {
    const all = this.getAllMessages();
    let updated = false;
    all.forEach(m => {
      if (m.roomId === roomId && m.sender.username !== byUsername) {
        if (m.status !== 'seen') {
          m.status = 'seen';
          updated = true;
          if (this.onStatusUpdated) {
            this.onStatusUpdated({ messageId: m.id, status: 'seen', roomId });
          }
        }
      }
    });
    if (updated) this.saveMessages(all);
  },

  /**
   * Delete a single message
   */
  deleteMessage(messageId) {
    const all = this.getAllMessages();
    const target = all.find(m => m.id === messageId);
    if (!target) return;

    const filtered = all.filter(m => m.id !== messageId);
    this.saveMessages(filtered);

    // Sync cloud
    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref(`messages/${target.roomId}/${messageId}`).remove();
    }

    // Broadcast delete
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'DELETE_MESSAGE',
        data: { messageId, roomId: target.roomId }
      });
    } else {
      localStorage.setItem('chatchat_last_action', JSON.stringify({
        type: 'DELETE_MESSAGE',
        data: { messageId, roomId: target.roomId },
        timestamp: Date.now()
      }));
    }

    if (this.onMessageDeleted) {
      this.onMessageDeleted(messageId);
    }
  },

  handleRemoteDelete(messageId) {
    const all = this.getAllMessages();
    const filtered = all.filter(m => m.id !== messageId);
    this.saveMessages(filtered);

    if (this.onMessageDeleted) {
      this.onMessageDeleted(messageId);
    }
  },

  /**
   * Clear all messages in current chat
   */
  clearRoomMessages(roomId) {
    const all = this.getAllMessages();
    const remaining = all.filter(m => m.roomId !== roomId);
    this.saveMessages(remaining);

    // Sync cloud
    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref(`messages/${roomId}`).remove();
    }

    // Broadcast clear
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CLEAR_ROOM',
        data: { roomId }
      });
    } else {
      localStorage.setItem('chatchat_last_action', JSON.stringify({
        type: 'CLEAR_ROOM',
        data: { roomId },
        timestamp: Date.now()
      }));
    }

    if (this.onRoomCleared) {
      this.onRoomCleared(roomId);
    }
  },

  handleRemoteClear(roomId) {
    const all = this.getAllMessages();
    const remaining = all.filter(m => m.roomId !== roomId);
    this.saveMessages(remaining);

    if (this.onRoomCleared) {
      this.onRoomCleared(roomId);
    }
  },

  /**
   * Reactions on message
   */
  toggleReaction(messageId, emoji) {
    if (!Auth.currentUser) return;
    const username = Auth.currentUser.username;
    const all = this.getAllMessages();
    const msg = all.find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const idx = msg.reactions[emoji].indexOf(username);
    if (idx > -1) {
      msg.reactions[emoji].splice(idx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(username);
    }

    this.saveMessages(all);

    if (Config && Config.isCloudActive && Config.firebaseDb) {
      Config.firebaseDb.ref(`messages/${msg.roomId}/${msg.id}/reactions`).set(msg.reactions);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'REACTION',
        data: { messageId, reactions: msg.reactions, roomId: msg.roomId }
      });
    }

    if (this.onReactionUpdated) {
      this.onReactionUpdated({ messageId, reactions: msg.reactions, roomId: msg.roomId });
    }
  },

  /**
   * Typing broadcast
   */
  broadcastTyping() {
    if (!Auth.currentUser) return;
    const payload = {
      username: Auth.currentUser.username,
      displayName: Auth.currentUser.displayName,
      roomId: this.currentRoom.id
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'TYPING', data: payload });
    }

    if (Config && Config.isCloudActive && Config.firebaseDb) {
      const typingRef = Config.firebaseDb.ref(`typing/${payload.roomId}/${payload.username}`);
      typingRef.set(true);
      setTimeout(() => typingRef.remove(), 2500);
    }
  }
};
