/**
 * Chat-Chat - UI Controller & DOM Orchestration
 * Handles Left/Right message alignment, status dots (•, • •, • • • green),
 * Dark/Light theme switching, WhatsApp wallpapers, friend/username search,
 * chat deletion, ID deletion, and direct messaging.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const authModal = document.getElementById('authModal');
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authNotice = document.getElementById('authNotice');
  
  // Profile Footer
  const currentUserCard = document.getElementById('currentUserCard');
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userDisplayName = document.getElementById('userDisplayName');
  const userHandle = document.getElementById('userHandle');
  const btnLogout = document.getElementById('btnLogout');
  const btnOpenSettings = document.getElementById('btnOpenSettings');

  // Sidebars & Lists
  const sidebar = document.getElementById('sidebar');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const channelsList = document.getElementById('channelsList');
  const dmList = document.getElementById('dmList');
  const btnOpenCreateRoom = document.getElementById('btnOpenCreateRoom');
  const btnOpenNewDM = document.getElementById('btnOpenNewDM');
  
  // Friend / Username Search
  const friendSearchInput = document.getElementById('friendSearchInput');
  const btnClearFriendSearch = document.getElementById('btnClearFriendSearch');
  const friendSearchResults = document.getElementById('friendSearchResults');

  // Chat View Elements
  const currentRoomTitle = document.getElementById('currentRoomTitle');
  const currentRoomDesc = document.getElementById('currentRoomDesc');
  const currentRoomAvatar = document.getElementById('currentRoomAvatar');
  const roomPrivacyBadge = document.getElementById('roomPrivacyBadge');
  const messagesContainer = document.getElementById('messagesContainer');
  const messagesList = document.getElementById('messagesList');
  const channelWelcomeBanner = document.getElementById('channelWelcomeBanner');
  const welcomeBannerTitle = document.getElementById('welcomeBannerTitle');
  const welcomeBannerSub = document.getElementById('welcomeBannerSub');
  const searchInput = document.getElementById('searchInput');
  const btnClearChat = document.getElementById('btnClearChat');

  // Chat Input
  const messageInput = document.getElementById('messageInput');
  const btnSendMessage = document.getElementById('btnSendMessage');
  const btnAttachFile = document.getElementById('btnAttachFile');
  const fileInput = document.getElementById('fileInput');
  const attachmentPreviewBar = document.getElementById('attachmentPreviewBar');
  const previewImage = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const btnRemoveAttachment = document.getElementById('btnRemoveAttachment');
  const btnEmojiToggle = document.getElementById('btnEmojiToggle');
  const emojiPopup = document.getElementById('emojiPopup');
  const typingIndicator = document.getElementById('typingIndicator');
  const typingText = document.getElementById('typingText');

  // Modals
  const createRoomModal = document.getElementById('createRoomModal');
  const btnCloseCreateRoom = document.getElementById('btnCloseCreateRoom');
  const btnCancelCreateRoom = document.getElementById('btnCancelCreateRoom');
  const createRoomForm = document.getElementById('createRoomForm');
  const chkRoomPrivate = document.getElementById('chkRoomPrivate');
  const roomPasswordGroup = document.getElementById('roomPasswordGroup');

  const unlockRoomModal = document.getElementById('unlockRoomModal');
  const btnCloseUnlockRoom = document.getElementById('btnCloseUnlockRoom');
  const btnCancelUnlockRoom = document.getElementById('btnCancelUnlockRoom');
  const unlockRoomForm = document.getElementById('unlockRoomForm');
  const unlockError = document.getElementById('unlockError');

  const newDmModal = document.getElementById('newDmModal');
  const btnCloseNewDm = document.getElementById('btnCloseNewDm');
  const btnCancelNewDm = document.getElementById('btnCancelNewDm');
  const newDmForm = document.getElementById('newDmForm');
  const quickUsersList = document.getElementById('quickUsersList');

  // Settings & Theme Elements
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const editProfileForm = document.getElementById('editProfileForm');
  const editDisplayName = document.getElementById('editDisplayName');
  const btnThemeDark = document.getElementById('btnThemeDark');
  const btnThemeLight = document.getElementById('btnThemeLight');
  const wallpaperPicker = document.getElementById('wallpaperPicker');
  const btnDeleteAccount = document.getElementById('btnDeleteAccount');

  const imageLightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');

  // State
  let pendingAttachmentBase64 = null;
  let pendingRoomToUnlock = null;
  let typingDebounceTimer = null;
  let activeDMs = new Set();

  /* ==========================================================================
     THEME (DARK DEFAULT / LIGHT) & WHATSAPP CHAT WALLPAPERS
     ========================================================================== */
  function initThemeAndWallpaper() {
    // 1. App Theme (Default Dark)
    const savedTheme = localStorage.getItem('chatchat_theme_mode') || 'dark';
    applyTheme(savedTheme);

    // 2. Chat Wallpaper (Default Cyber Blue Theme)
    const savedWallpaper = localStorage.getItem('chatchat_chat_wallpaper') || 'wallpaper-cyber';
    applyWallpaper(savedWallpaper);
  }

  function applyTheme(mode) {
    if (mode === 'light') {
      document.body.className = 'light-theme';
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
    } else {
      document.body.className = 'dark-theme';
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
    }
    localStorage.setItem('chatchat_theme_mode', mode);
  }

  function applyWallpaper(wallpaperClass) {
    // Remove existing wallpaper classes
    messagesContainer.classList.remove(
      'wallpaper-cyber', 'wallpaper-doodle-dark', 'wallpaper-doodle-light',
      'wallpaper-emerald', 'wallpaper-midnight', 'wallpaper-doodle'
    );
    messagesContainer.classList.add(wallpaperClass);
    localStorage.setItem('chatchat_chat_wallpaper', wallpaperClass);

    // Update selected chip in settings
    document.querySelectorAll('#wallpaperPicker .wallpaper-chip').forEach(chip => {
      if (chip.dataset.wallpaper === wallpaperClass) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });
  }

  btnThemeDark.addEventListener('click', () => applyTheme('dark'));
  btnThemeLight.addEventListener('click', () => applyTheme('light'));

  document.querySelectorAll('#wallpaperPicker .wallpaper-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      applyWallpaper(chip.dataset.wallpaper);
    });
  });

  initThemeAndWallpaper();

  /* ==========================================================================
     INITIALIZATION & SESSION
     ========================================================================== */
  // Ensure any dummy seed messages from previous sessions are purged
  try {
    const rawMsgs = localStorage.getItem('chatchat_messages_store');
    if (rawMsgs) {
      const msgs = JSON.parse(rawMsgs);
      const cleaned = msgs.filter(m => !m.id || !m.id.startsWith('msg_seed_'));
      if (cleaned.length !== msgs.length) {
        localStorage.setItem('chatchat_messages_store', JSON.stringify(cleaned));
      }
    }
  } catch (e) {}

  Chat.init();
  const sessionUser = Auth.initSession();

  if (sessionUser) {
    onUserLoggedIn(sessionUser);
  } else {
    showAuthModal();
  }

  /* ==========================================================================
     AUTHENTICATION UI
     ========================================================================== */
  function showAuthModal() {
    authModal.classList.remove('hidden');
  }

  function hideAuthModal() {
    authModal.classList.add('hidden');
    clearAuthNotice();
  }

  function showAuthNotice(text, isSuccess = false) {
    authNotice.textContent = text;
    authNotice.className = `auth-notice ${isSuccess ? 'success' : ''}`;
    authNotice.classList.remove('hidden');
  }

  function clearAuthNotice() {
    authNotice.classList.add('hidden');
    authNotice.textContent = '';
  }

  tabBtnLogin.addEventListener('click', () => {
    tabBtnLogin.classList.add('active');
    tabBtnRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    clearAuthNotice();
  });

  tabBtnRegister.addEventListener('click', () => {
    tabBtnRegister.classList.add('active');
    tabBtnLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearAuthNotice();
  });

  /* ==========================================================================
     CUSTOM DP & ALL EMOJIS PICKER LOGIC
     ========================================================================== */
  const ALL_EMOJIS = [
    // Smileys & Emotion
    { emoji: '😀', cat: 'smileys', name: 'grinning face happy smile' },
    { emoji: '😃', cat: 'smileys', name: 'big eyes smile happy' },
    { emoji: '😄', cat: 'smileys', name: 'laughing happy eyes smile' },
    { emoji: '😁', cat: 'smileys', name: 'beaming teeth grin' },
    { emoji: '😆', cat: 'smileys', name: 'squinting laughing giggle' },
    { emoji: '😅', cat: 'smileys', name: 'sweat smile relief nervous' },
    { emoji: '🤣', cat: 'smileys', name: 'rofl rolling floor laughing' },
    { emoji: '😂', cat: 'smileys', name: 'joy tears laughing lol' },
    { emoji: '🙂', cat: 'smileys', name: 'slightly smiling calm' },
    { emoji: '🙃', cat: 'smileys', name: 'upside down silly sarcasm' },
    { emoji: '😉', cat: 'smileys', name: 'wink subtle flirt' },
    { emoji: '😊', cat: 'smileys', name: 'blush warm happy' },
    { emoji: '😇', cat: 'smileys', name: 'angel halo innocent' },
    { emoji: '🥰', cat: 'smileys', name: 'hearts love affectionate' },
    { emoji: '😍', cat: 'smileys', name: 'heart eyes love admire' },
    { emoji: '🤩', cat: 'smileys', name: 'star struck excited wow' },
    { emoji: '😘', cat: 'smileys', name: 'blow kiss love heart' },
    { emoji: '😗', cat: 'smileys', name: 'kissing calm' },
    { emoji: '😋', cat: 'smileys', name: 'yum delicious tongue' },
    { emoji: '😛', cat: 'smileys', name: 'tongue playful cheeky' },
    { emoji: '😜', cat: 'smileys', name: 'wink tongue wacky crazy' },
    { emoji: '🤪', cat: 'smileys', name: 'zany goofy wild' },
    { emoji: '😝', cat: 'smileys', name: 'squint tongue tease' },
    { emoji: '🤑', cat: 'smileys', name: 'money rich dollar cash' },
    { emoji: '🤗', cat: 'smileys', name: 'hugging open hands warm' },
    { emoji: '🤭', cat: 'smileys', name: 'hand over mouth giggle oops' },
    { emoji: '🤫', cat: 'smileys', name: 'shushing quiet secret shh' },
    { emoji: '🤔', cat: 'smileys', name: 'thinking wonder hm ponder' },
    { emoji: '🤐', cat: 'smileys', name: 'zipper mouth shut secret' },
    { emoji: '🤨', cat: 'smileys', name: 'raised eyebrow skeptic suspicious' },
    { emoji: '😐', cat: 'smileys', name: 'neutral blank face' },
    { emoji: '😑', cat: 'smileys', name: 'expressionless deadpan' },
    { emoji: '😶', cat: 'smileys', name: 'no mouth silent quiet' },
    { emoji: '😏', cat: 'smileys', name: 'smirk sly confident' },
    { emoji: '😒', cat: 'smileys', name: 'unamused annoyed displeased' },
    { emoji: '🙄', cat: 'smileys', name: 'face with rolling eyes whatever' },
    { emoji: '😬', cat: 'smileys', name: 'grimacing awkward yikes' },
    { emoji: '🤥', cat: 'smileys', name: 'lying pinocchio nose' },
    { emoji: '😌', cat: 'smileys', name: 'relieved peaceful zen' },
    { emoji: '😔', cat: 'smileys', name: 'pensive sad reflective' },
    { emoji: '😪', cat: 'smileys', name: 'sleepy tired snot bubble' },
    { emoji: '🤤', cat: 'smileys', name: 'drooling hungry crave' },
    { emoji: '😴', cat: 'smileys', name: 'sleeping tired zzz' },
    { emoji: '😷', cat: 'smileys', name: 'medical mask sick protect' },
    { emoji: '🤒', cat: 'smileys', name: 'thermometer fever sick' },
    { emoji: '🤕', cat: 'smileys', name: 'head bandage hurt injury' },
    { emoji: '🤢', cat: 'smileys', name: 'nauseated disgusted gross' },
    { emoji: '🤮', cat: 'smileys', name: 'vomiting puke sick' },
    { emoji: '🤧', cat: 'smileys', name: 'sneezing tissue cold' },
    { emoji: '🥵', cat: 'smileys', name: 'hot face sweating summer' },
    { emoji: '🥶', cat: 'smileys', name: 'cold face freezing blue winter' },
    { emoji: '🥴', cat: 'smileys', name: 'woozy dizzy tipsy intoxicated' },
    { emoji: '😵', cat: 'smileys', name: 'dizzy dead stunned knockout' },
    { emoji: '🤯', cat: 'smileys', name: 'exploding head mind blown shock' },
    { emoji: '🤠', cat: 'smileys', name: 'cowboy hat western sheriff' },
    { emoji: '🥳', cat: 'smileys', name: 'party horn celebrate confetti' },
    { emoji: '🥸', cat: 'smileys', name: 'disguise glasses mustache undercover' },
    { emoji: '😎', cat: 'smileys', name: 'sunglasses cool stylish boss' },
    { emoji: '🤓', cat: 'smileys', name: 'nerd geek glasses smart' },
    { emoji: '🧐', cat: 'smileys', name: 'monocle classy fancy inspect' },
    { emoji: '😕', cat: 'smileys', name: 'confused puzzle hm' },
    { emoji: '😟', cat: 'smileys', name: 'worried concerned anxious' },
    { emoji: '🙁', cat: 'smileys', name: 'slightly frowning sad' },
    { emoji: '😮', cat: 'smileys', name: 'open mouth wow surprise' },
    { emoji: '😯', cat: 'smileys', name: 'hushed quiet surprised' },
    { emoji: '😲', cat: 'smileys', name: 'astonished shocked gasp' },
    { emoji: '😳', cat: 'smileys', name: 'flushed embarrassed wide eyes' },
    { emoji: '🥺', cat: 'smileys', name: 'pleading puppy eyes please beggar' },
    { emoji: '😦', cat: 'smileys', name: 'frowning open mouth distress' },
    { emoji: '😧', cat: 'smileys', name: 'anguished shock worry' },
    { emoji: '😨', cat: 'smileys', name: 'fearful scared afraid' },
    { emoji: '😰', cat: 'smileys', name: 'anxious sweat blue worry' },
    { emoji: '😥', cat: 'smileys', name: 'sad relieved sweat drop' },
    { emoji: '😢', cat: 'smileys', name: 'crying tear sad' },
    { emoji: '😭', cat: 'smileys', name: 'loudly crying sobbing tears bawling' },
    { emoji: '😱', cat: 'smileys', name: 'screaming fear terror scream' },
    { emoji: '😖', cat: 'smileys', name: 'confounded frustration quivering' },
    { emoji: '😣', cat: 'smileys', name: 'persevering struggle grimace' },
    { emoji: '😞', cat: 'smileys', name: 'disappointed down sad' },
    { emoji: '😓', cat: 'smileys', name: 'downcast face with sweat stress' },
    { emoji: '😩', cat: 'smileys', name: 'weary tired fed up whine' },
    { emoji: '😫', cat: 'smileys', name: 'tired exhausted strain' },
    { emoji: '🥱', cat: 'smileys', name: 'yawning bored sleepy' },
    { emoji: '😤', cat: 'smileys', name: 'triumph steam huff proud mad' },
    { emoji: '😡', cat: 'smileys', name: 'pouting angry red rage mad' },
    { emoji: '😠', cat: 'smileys', name: 'angry furrowed brow mad' },
    { emoji: '🤬', cat: 'smileys', name: 'cursing swearing symbols censor' },
    { emoji: '😈', cat: 'smileys', name: 'smiling devil horns purple naughty' },
    { emoji: '👿', cat: 'smileys', name: 'angry devil demon purple villain' },
    { emoji: '💀', cat: 'smileys', name: 'skull skeleton dead death haha' },
    { emoji: '☠️', cat: 'smileys', name: 'crossbones pirate danger dead' },
    { emoji: '💩', cat: 'smileys', name: 'poop poo funny smile' },
    { emoji: '🤡', cat: 'smileys', name: 'clown circus costume goofy' },
    { emoji: '👹', cat: 'smileys', name: 'ogre japanese mask red monster' },
    { emoji: '👺', cat: 'smileys', name: 'goblin tengu long nose red' },
    { emoji: '👻', cat: 'smileys', name: 'ghost spooky halloween boo' },
    { emoji: '👽', cat: 'smileys', name: 'alien ufo extraterrestrial space' },
    { emoji: '👾', cat: 'smileys', name: 'alien monster 8-bit retro arcade pixel' },
    { emoji: '🤖', cat: 'smileys', name: 'robot bot android cyber ai' },

    // People & Avatars
    { emoji: '👦', cat: 'people', name: 'boy kid male young user' },
    { emoji: '👧', cat: 'people', name: 'girl kid female young user' },
    { emoji: '👨', cat: 'people', name: 'man adult male guy' },
    { emoji: '👩', cat: 'people', name: 'woman adult female lady' },
    { emoji: '🧑', cat: 'people', name: 'person gender neutral adult' },
    { emoji: '👶', cat: 'people', name: 'baby infant toddler' },
    { emoji: '👱‍♂️', cat: 'people', name: 'blond man hair' },
    { emoji: '👱‍♀️', cat: 'people', name: 'blonde woman hair' },
    { emoji: '👴', cat: 'people', name: 'old man grandfather elder' },
    { emoji: '👵', cat: 'people', name: 'old woman grandmother elder' },
    { emoji: '👮‍♂️', cat: 'people', name: 'police officer cop law' },
    { emoji: '👷‍♂️', cat: 'people', name: 'construction worker helmet hardhat' },
    { emoji: '🕵️‍♂️', cat: 'people', name: 'detective sleuth secret agent spy' },
    { emoji: '👩‍⚕️', cat: 'people', name: 'doctor nurse healthcare medicine' },
    { emoji: '👨‍⚕️', cat: 'people', name: 'male doctor healthcare hospital' },
    { emoji: '👩‍🎓', cat: 'people', name: 'student graduate college degree' },
    { emoji: '👨‍🎓', cat: 'people', name: 'male student graduate university' },
    { emoji: '👩‍🏫', cat: 'people', name: 'teacher professor school tutor' },
    { emoji: '👨‍🏫', cat: 'people', name: 'male teacher professor educator' },
    { emoji: '👩‍🍳', cat: 'people', name: 'chef cook bakery restaurant' },
    { emoji: '👨‍🍳', cat: 'people', name: 'male chef cook restaurant' },
    { emoji: '👩‍🔧', cat: 'people', name: 'mechanic engineer tools repair' },
    { emoji: '👨‍🔧', cat: 'people', name: 'male mechanic technician repair' },
    { emoji: '👩‍💼', cat: 'people', name: 'business woman office suit corporate' },
    { emoji: '👨‍💼', cat: 'people', name: 'business man office corporate executive' },
    { emoji: '👩‍🔬', cat: 'people', name: 'scientist chemist lab research' },
    { emoji: '👨‍🔬', cat: 'people', name: 'male scientist physics laboratory' },
    { emoji: '👩‍💻', cat: 'people', name: 'technologist woman developer coder programming hacker' },
    { emoji: '👨‍💻', cat: 'people', name: 'technologist man developer coder programming hacker' },
    { emoji: '👩‍🎨', cat: 'people', name: 'artist painter creative palette' },
    { emoji: '👨‍🎨', cat: 'people', name: 'male artist painting artwork' },
    { emoji: '👩‍🚀', cat: 'people', name: 'astronaut space nasa cosmonaut' },
    { emoji: '👨‍🚀', cat: 'people', name: 'male astronaut space nasa cosmonaut' },
    { emoji: '🦸‍♂️', cat: 'people', name: 'superhero hero cape justice brave' },
    { emoji: '🦸‍♀️', cat: 'people', name: 'female superhero wonder woman hero' },
    { emoji: '🦹‍♂️', cat: 'people', name: 'supervillain villain evil dark master' },
    { emoji: '🦹‍♀️', cat: 'people', name: 'female supervillain evil queen' },
    { emoji: '🧙‍♂️', cat: 'people', name: 'wizard mage sorcerer magic gandalf' },
    { emoji: '🧙‍♀️', cat: 'people', name: 'witch enchantress magic sorceress' },
    { emoji: '🧚‍♂️', cat: 'people', name: 'fairy wings magical sprite' },
    { emoji: '🧛‍♂️', cat: 'people', name: 'vampire dracula fangs blood gothic' },
    { emoji: '🧜‍♂️', cat: 'people', name: 'merman ocean sea triton poseidon' },
    { emoji: '🧜‍♀️', cat: 'people', name: 'mermaid sea ocean ariel' },
    { emoji: '🧝‍♂️', cat: 'people', name: 'elf pointy ears lord of the rings' },
    { emoji: '🧞‍♂️', cat: 'people', name: 'genie magic lamp wishes blue' },
    { emoji: '🧟‍♂️', cat: 'people', name: 'zombie undead walking dead apocalypse' },
    { emoji: '🥷', cat: 'people', name: 'ninja shinobi martial arts assassin stealth' },
    { emoji: '🕺', cat: 'people', name: 'man dancing disco groove fun' },
    { emoji: '💃', cat: 'people', name: 'woman dancing salsa red dress flamenco' },

    // Animals & Nature
    { emoji: '🐶', cat: 'animals', name: 'dog puppy canine pet' },
    { emoji: '🐱', cat: 'animals', name: 'cat kitten feline pet meow' },
    { emoji: '🐭', cat: 'animals', name: 'mouse rodent pet squeak' },
    { emoji: '🐹', cat: 'animals', name: 'hamster rodent cute cheeks' },
    { emoji: '🐰', cat: 'animals', name: 'rabbit bunny ears easter cute' },
    { emoji: '🦊', cat: 'animals', name: 'fox clever orange animal wildlife' },
    { emoji: '🐻', cat: 'animals', name: 'bear grizzly wildlife honey' },
    { emoji: '🐼', cat: 'animals', name: 'panda bear bamboo cute china' },
    { emoji: '🐨', cat: 'animals', name: 'koala australia eucalyptus cute' },
    { emoji: '🐯', cat: 'animals', name: 'tiger face wild stripes roar' },
    { emoji: '🦁', cat: 'animals', name: 'lion king predator mane safari roar' },
    { emoji: '🐮', cat: 'animals', name: 'cow moo farm milk dairy' },
    { emoji: '🐷', cat: 'animals', name: 'pig snout oink farm piggy' },
    { emoji: '🐸', cat: 'animals', name: 'frog toad ribbit pond amphibian' },
    { emoji: '🐵', cat: 'animals', name: 'monkey ape cheeky jungle banana' },
    { emoji: '🐔', cat: 'animals', name: 'chicken rooster bird farm cluck' },
    { emoji: '🐧', cat: 'animals', name: 'penguin ice antarctica cold waddle' },
    { emoji: '🐦', cat: 'animals', name: 'bird blue twitter chirp fly' },
    { emoji: '🐤', cat: 'animals', name: 'baby chick yellow bird easter' },
    { emoji: '🦅', cat: 'animals', name: 'eagle raptor bird predator majestic' },
    { emoji: '🦉', cat: 'animals', name: 'owl wise night nocturnal bird' },
    { emoji: '🦇', cat: 'animals', name: 'bat night vampire cave batman' },
    { emoji: '🐺', cat: 'animals', name: 'wolf wild howl alpha pack predator' },
    { emoji: '🐗', cat: 'animals', name: 'boar wild pig tusk jungle' },
    { emoji: '🐴', cat: 'animals', name: 'horse stallion pony equestrian' },
    { emoji: '🦄', cat: 'animals', name: 'unicorn magic horn mythical fantasy sparkle' },
    { emoji: '🐝', cat: 'animals', name: 'bee honeybee buzz insect honey' },
    { emoji: '🦋', cat: 'animals', name: 'butterfly colorful insect wings transformation' },
    { emoji: '🐢', cat: 'animals', name: 'turtle tortoise shell slow marine' },
    { emoji: '🐍', cat: 'animals', name: 'snake serpent reptile hiss' },
    { emoji: '🦎', cat: 'animals', name: 'lizard gecko reptile camouflage' },
    { emoji: '🦖', cat: 'animals', name: 't-rex dinosaur prehistoric tyrannosaurus jurassic' },
    { emoji: '🦕', cat: 'animals', name: 'sauropod dinosaur brontosaurus dino' },
    { emoji: '🐙', cat: 'animals', name: 'octopus tentacles sea ocean kraken' },
    { emoji: '🦑', cat: 'animals', name: 'squid ocean calamari sea monster' },
    { emoji: '🐬', cat: 'animals', name: 'dolphin ocean flipper marine mammal smart' },
    { emoji: '🐳', cat: 'animals', name: 'spouting whale ocean giant marine' },
    { emoji: '🦈', cat: 'animals', name: 'shark jaws predator ocean fin' },
    { emoji: '🐊', cat: 'animals', name: 'crocodile alligator swamp predator reptile' },
    { emoji: '🐆', cat: 'animals', name: 'leopard cheetah spots fast predator' },
    { emoji: '🦓', cat: 'animals', name: 'zebra stripes safari africa wildlife' },
    { emoji: '🦍', cat: 'animals', name: 'gorilla silverback ape king kong strong' },
    { emoji: '🐘', cat: 'animals', name: 'elephant trunk giant safari africa tusks' },
    { emoji: '🦏', cat: 'animals', name: 'rhinoceros rhino horn armor heavy' },
    { emoji: '🦘', cat: 'animals', name: 'kangaroo australia hop joey outback' },
    { emoji: '🦚', cat: 'animals', name: 'peacock feathers proud colorful bird' },
    { emoji: '🦜', cat: 'animals', name: 'parrot tropical colorful pirate bird speak' },
    { emoji: '🐉', cat: 'animals', name: 'dragon mythical fantasy fire monster beast' },
    { emoji: '🐲', cat: 'animals', name: 'dragon face oriental legend fantasy' },

    // Gaming, Tech & Cool
    { emoji: '🎮', cat: 'gaming', name: 'video game controller playstation xbox console gamer' },
    { emoji: '🕹️', cat: 'gaming', name: 'joystick arcade retro gaming play' },
    { emoji: '👾', cat: 'gaming', name: 'alien monster space invaders retro 8bit' },
    { emoji: '🎲', cat: 'gaming', name: 'dice game luck roll gamble tabletop' },
    { emoji: '🎯', cat: 'gaming', name: 'bullseye target darts direct goal hit' },
    { emoji: '♟️', cat: 'gaming', name: 'chess pawn strategy game tactics' },
    { emoji: '🏆', cat: 'gaming', name: 'trophy champion win gold victory award' },
    { emoji: '🥇', cat: 'gaming', name: 'first place medal gold winner #1' },
    { emoji: '👑', cat: 'gaming', name: 'crown king queen royal royalty boss gold' },
    { emoji: '💎', cat: 'gaming', name: 'gem stone diamond crystal precious rich jewelry' },
    { emoji: '🔥', cat: 'gaming', name: 'fire flame lit hot trend burn' },
    { emoji: '⚡', cat: 'gaming', name: 'high voltage lightning bolt thunder electric energy power' },
    { emoji: '✨', cat: 'gaming', name: 'sparkles star shine magic glitter clean' },
    { emoji: '🚀', cat: 'gaming', name: 'rocket ship blast off space launch crypto moon fast' },
    { emoji: '🛸', cat: 'gaming', name: 'flying saucer ufo alien spaceship scifi' },
    { emoji: '🛰️', cat: 'gaming', name: 'satellite space communication orbit tech' },
    { emoji: '💻', cat: 'gaming', name: 'laptop computer tech software coding macbook' },
    { emoji: '🖥️', cat: 'gaming', name: 'desktop computer monitor pc screen battlestation' },
    { emoji: '📱', cat: 'gaming', name: 'mobile phone smartphone iphone tech cell' },
    { emoji: '🎧', cat: 'gaming', name: 'headphones headset music gamer sound audio' },
    { emoji: '🎤', cat: 'gaming', name: 'microphone sing voice podcast audio artist' },
    { emoji: '🎸', cat: 'gaming', name: 'guitar rock electric instrument music' },
    { emoji: '🎹', cat: 'gaming', name: 'musical keyboard piano instrument melodies' },
    { emoji: '🥁', cat: 'gaming', name: 'drum rhythm beat percussion rock' },
    { emoji: '🛹', cat: 'gaming', name: 'skateboard skate ollie kickflip street cool' },
    { emoji: '🥊', cat: 'gaming', name: 'boxing glove punch fighter combat mma' },
    { emoji: '🥋', cat: 'gaming', name: 'martial arts uniform karate judo taekwondo blackbelt' },
    { emoji: '🏎️', cat: 'gaming', name: 'racing car formula1 f1 speed sports drift' },
    { emoji: '🏍️', cat: 'gaming', name: 'motorcycle motorbike speed biker cool' },
    { emoji: '⚔️', cat: 'gaming', name: 'crossed swords combat fight duel warrior rpg' },
    { emoji: '🛡️', cat: 'gaming', name: 'shield defense protect armor guard knight' },
    { emoji: '🗡️', cat: 'gaming', name: 'dagger blade knife stealth assassin rpg' },
    { emoji: '🏹', cat: 'gaming', name: 'bow and arrow archery robin hood hunter rpg' },
    { emoji: '🔮', cat: 'gaming', name: 'crystal ball fortune psychic future magic' },
    { emoji: '🪄', cat: 'gaming', name: 'magic wand wizard spell harry potter fairy' },
    { emoji: '🧬', cat: 'gaming', name: 'dna biology genetics science code life' },
    { emoji: '🧪', cat: 'gaming', name: 'test tube chemistry science laboratory experiment' },
    { emoji: '🪐', cat: 'gaming', name: 'ringed planet saturn astronomy space cosmos' },
    { emoji: '🌙', cat: 'gaming', name: 'crescent moon night dark lunar dream' },
    { emoji: '☀️', cat: 'gaming', name: 'sun bright day sunny sunshine energy' },
    { emoji: '⭐', cat: 'gaming', name: 'star gold favorite rate rating' },
    { emoji: '🌟', cat: 'gaming', name: 'glowing star shine success celebrity' },
    { emoji: '💥', cat: 'gaming', name: 'collision boom pow bang explode action' },
    { emoji: '💯', cat: 'gaming', name: 'hundred points 100 percent perfect real true' },

    // Symbols & Badges
    { emoji: '❤️', cat: 'symbols', name: 'red heart love romance passion' },
    { emoji: '💙', cat: 'symbols', name: 'blue heart trust cyber cosmic loyalty' },
    { emoji: '💜', cat: 'symbols', name: 'purple heart luxury magical vibe' },
    { emoji: '🖤', cat: 'symbols', name: 'black heart dark emo shadow cool' },
    { emoji: '🤍', cat: 'symbols', name: 'white heart pure clean peace' },
    { emoji: '💖', cat: 'symbols', name: 'sparkling heart love romance shine' },
    { emoji: '💘', cat: 'symbols', name: 'heart with arrow cupid fallen in love' },
    { emoji: '💝', cat: 'symbols', name: 'heart with ribbon present gift surprise' },
    { emoji: '☮️', cat: 'symbols', name: 'peace sign hippie calm harmony' },
    { emoji: '☯️', cat: 'symbols', name: 'yin yang balance tao harmony' },
    { emoji: '☣️', cat: 'symbols', name: 'biohazard danger toxic virus' },
    { emoji: '☢️', cat: 'symbols', name: 'radioactive nuclear atomic energy danger' },
    { emoji: '⚜️', cat: 'symbols', name: 'fleur de lis royal symbol french lily' },
    { emoji: '🔱', cat: 'symbols', name: 'trident emblem poseidon sea fork emblem' },
    { emoji: '🧿', cat: 'symbols', name: 'nazar amulet evil eye protection lucky' },
    { emoji: '💠', cat: 'symbols', name: 'diamond with a dot cute jewel blue flower' },
    { emoji: '🌀', cat: 'symbols', name: 'cyclone spiral hurricane vortex portal' },
    { emoji: '🪬', cat: 'symbols', name: 'hamsa hand protection luck blessing' },
    { emoji: '♾️', cat: 'symbols', name: 'infinity eternal endless loop forever' },
    { emoji: '✔️', cat: 'symbols', name: 'check mark check tick verified correct' },
    { emoji: '✅', cat: 'symbols', name: 'check mark button green white ok done' },
    { emoji: '🔑', cat: 'symbols', name: 'key secret unlock access password security' },
    { emoji: '🗝️', cat: 'symbols', name: 'old key antique vintage clue treasure' }
  ];

  function setupEmojiPicker(gridEl, previewEl, inputEl, searchInputEl, clearSearchBtnEl, categoryPillsContainerEl) {
    if (!gridEl || !previewEl || !inputEl) return;
    let currentCategory = 'all';
    let currentSearch = '';

    function render() {
      gridEl.innerHTML = '';
      const query = currentSearch.toLowerCase().trim();

      const filtered = ALL_EMOJIS.filter(item => {
        const matchesCat = (currentCategory === 'all' || item.cat === currentCategory);
        const matchesQuery = (!query || item.name.includes(query) || item.emoji.includes(query));
        return matchesCat && matchesQuery;
      });

      if (filtered.length === 0) {
        gridEl.innerHTML = `<div style="grid-column: 1/-1; padding: 14px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">No emojis found matching "${escapeHtml(query)}"</div>`;
        return;
      }

      filtered.forEach(item => {
        const btn = document.createElement('div');
        btn.className = `custom-dp-emoji-item ${inputEl.value === item.emoji ? 'selected' : ''}`;
        btn.textContent = item.emoji;
        btn.title = item.name;

        btn.addEventListener('click', () => {
          inputEl.value = item.emoji;
          previewEl.textContent = item.emoji;
          gridEl.querySelectorAll('.custom-dp-emoji-item').forEach(el => el.classList.remove('selected'));
          btn.classList.add('selected');
        });

        gridEl.appendChild(btn);
      });
    }

    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      previewEl.textContent = val || '👦';
      gridEl.querySelectorAll('.custom-dp-emoji-item').forEach(el => {
        if (el.textContent === val) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      });
    });

    if (searchInputEl) {
      searchInputEl.addEventListener('input', () => {
        currentSearch = searchInputEl.value;
        if (clearSearchBtnEl) {
          if (currentSearch) clearSearchBtnEl.classList.remove('hidden');
          else clearSearchBtnEl.classList.add('hidden');
        }
        render();
      });
    }

    if (clearSearchBtnEl) {
      clearSearchBtnEl.addEventListener('click', () => {
        searchInputEl.value = '';
        currentSearch = '';
        clearSearchBtnEl.classList.add('hidden');
        render();
      });
    }

    if (categoryPillsContainerEl) {
      categoryPillsContainerEl.querySelectorAll('.emoji-cat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          categoryPillsContainerEl.querySelectorAll('.emoji-cat-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentCategory = pill.dataset.cat;
          render();
        });
      });
    }

    render();
  }

  // Initialize Registration Emoji Picker
  const regAllEmojisGrid = document.getElementById('regAllEmojisGrid');
  const regDpPreview = document.getElementById('regDpPreview');
  const regCustomDpInput = document.getElementById('regCustomDpInput');
  const regEmojiSearch = document.getElementById('regEmojiSearch');
  const btnClearRegEmojiSearch = document.getElementById('btnClearRegEmojiSearch');
  const regEmojiCategoryPills = document.getElementById('regEmojiCategoryPills');

  setupEmojiPicker(
    regAllEmojisGrid,
    regDpPreview,
    regCustomDpInput,
    regEmojiSearch,
    btnClearRegEmojiSearch,
    regEmojiCategoryPills
  );

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthNotice();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    try {
      const user = await Auth.login(username, password, rememberMe);
      onUserLoggedIn(user);
      hideAuthModal();
    } catch (err) {
      showAuthNotice(err.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthNotice();
    const username = document.getElementById('regUsername').value;
    const displayName = document.getElementById('regDisplayName').value;
    const password = document.getElementById('regPassword').value;
    const regDpInput = document.getElementById('regCustomDpInput');
    const avatar = regDpInput ? (regDpInput.value.trim() || '👦') : '👦';

    try {
      const user = await Auth.register(username, displayName, password, avatar);
      onUserLoggedIn(user);
      hideAuthModal();
    } catch (err) {
      showAuthNotice(err.message);
    }
  });

  btnLogout.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
      Auth.logout();
      location.reload();
    }
  });

  function onUserLoggedIn(user) {
    userAvatarImg.textContent = user.avatar || '👦';
    userDisplayName.textContent = user.displayName || 'You';
    userHandle.textContent = `@${user.username || 'viswajeet'}`;

    renderChannels();
    loadActiveDMs();
    
    // Default to general channel
    switchRoom('general');
  }

  /* ==========================================================================
     FRIEND / USERNAME SEARCH
     ========================================================================== */
  friendSearchInput.addEventListener('input', () => {
    const query = friendSearchInput.value.trim().toLowerCase();
    
    if (!query) {
      friendSearchResults.classList.add('hidden');
      btnClearFriendSearch.classList.add('hidden');
      friendSearchResults.innerHTML = '';
      return;
    }

    btnClearFriendSearch.classList.remove('hidden');

    const users = Auth.getRegisteredUsers();
    const currentUsername = Auth.currentUser ? Auth.currentUser.username : '';

    const matches = Object.values(users).filter(u => {
      if (u.username === currentUsername) return false;
      return u.username.toLowerCase().includes(query) || 
             (u.displayName && u.displayName.toLowerCase().includes(query));
    });

    friendSearchResults.innerHTML = '';

    if (matches.length === 0) {
      friendSearchResults.innerHTML = `
        <div style="padding: 10px; font-size: 0.8rem; color: var(--text-dim); text-align: center;">
          No users matching "@${query}"
        </div>
      `;
    } else {
      matches.forEach(u => {
        const item = document.createElement('div');
        item.className = 'friend-search-item';
        item.innerHTML = `
          <div class="friend-search-avatar">${u.avatar || '👤'}</div>
          <div class="friend-search-details">
            <div class="friend-search-name">${escapeHtml(u.displayName)}</div>
            <div class="friend-search-handle">@${escapeHtml(u.username)}</div>
          </div>
          <button class="friend-search-chat-btn" title="Chat">💬 Chat</button>
        `;

        item.addEventListener('click', () => {
          openDirectMessageWith(u.username);
          clearFriendSearch();
        });

        friendSearchResults.appendChild(item);
      });
    }

    friendSearchResults.classList.remove('hidden');
  });

  function clearFriendSearch() {
    friendSearchInput.value = '';
    btnClearFriendSearch.classList.add('hidden');
    friendSearchResults.classList.add('hidden');
    friendSearchResults.innerHTML = '';
  }

  btnClearFriendSearch.addEventListener('click', clearFriendSearch);

  document.addEventListener('click', (e) => {
    if (!friendSearchInput.contains(e.target) && !friendSearchResults.contains(e.target)) {
      friendSearchResults.classList.add('hidden');
    }
  });

  /* ==========================================================================
     CHANNELS & ROOMS
     ========================================================================== */
  function renderChannels() {
    const rooms = Chat.getAllRooms();
    channelsList.innerHTML = '';

    Object.values(rooms).forEach(room => {
      const item = document.createElement('div');
      item.className = `nav-item ${Chat.currentRoom && Chat.currentRoom.id === room.id ? 'active' : ''}`;
      item.dataset.roomId = room.id;

      const icon = room.icon || (room.isPrivate ? '🔒' : '#');
      item.innerHTML = `
        <span class="nav-item-icon">${icon}</span>
        <span class="nav-item-label">${room.name}</span>
      `;

      item.addEventListener('click', () => {
        handleChannelClick(room);
      });

      channelsList.appendChild(item);
    });
  }

  function handleChannelClick(room) {
    if (room.isPrivate && !Chat.isRoomUnlocked(room.id)) {
      pendingRoomToUnlock = room;
      unlockError.classList.add('hidden');
      document.getElementById('unlockPassword').value = '';
      unlockRoomModal.classList.remove('hidden');
      document.getElementById('unlockPassword').focus();
    } else {
      switchRoom(room.id);
    }
  }

  btnOpenCreateRoom.addEventListener('click', () => {
    createRoomModal.classList.remove('hidden');
    document.getElementById('newRoomName').focus();
  });

  const closeCreateRoom = () => {
    createRoomModal.classList.add('hidden');
    createRoomForm.reset();
    roomPasswordGroup.classList.add('hidden');
  };

  btnCloseCreateRoom.addEventListener('click', closeCreateRoom);
  btnCancelCreateRoom.addEventListener('click', closeCreateRoom);

  chkRoomPrivate.addEventListener('change', () => {
    if (chkRoomPrivate.checked) {
      roomPasswordGroup.classList.remove('hidden');
      document.getElementById('newRoomPassword').setAttribute('required', 'required');
    } else {
      roomPasswordGroup.classList.add('hidden');
      document.getElementById('newRoomPassword').removeAttribute('required');
    }
  });

  createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newRoomName').value;
    const desc = document.getElementById('newRoomDesc').value;
    const isPrivate = chkRoomPrivate.checked;
    const password = document.getElementById('newRoomPassword').value;

    try {
      const newRoom = await Chat.createRoom(name, desc, isPrivate, password);
      closeCreateRoom();
      renderChannels();
      switchRoom(newRoom.id);
    } catch (err) {
      alert(err.message);
    }
  });

  const closeUnlockModal = () => {
    unlockRoomModal.classList.add('hidden');
    pendingRoomToUnlock = null;
  };

  btnCloseUnlockRoom.addEventListener('click', closeUnlockModal);
  btnCancelUnlockRoom.addEventListener('click', closeUnlockModal);

  unlockRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!pendingRoomToUnlock) return;
    const password = document.getElementById('unlockPassword').value;
    const isUnlocked = await Chat.unlockPrivateRoom(pendingRoomToUnlock.id, password);

    if (isUnlocked) {
      const targetRoom = pendingRoomToUnlock;
      closeUnlockModal();
      renderChannels();
      switchRoom(targetRoom.id);
    } else {
      unlockError.textContent = "Incorrect channel password. Access denied.";
      unlockError.classList.remove('hidden');
    }
  });

  /* ==========================================================================
     DIRECT MESSAGING (1-on-1)
     ========================================================================== */
  function loadActiveDMs() {
    activeDMs = new Set(['bot1', 'bot2']);
    renderDMList();
  }

  function renderDMList() {
    dmList.innerHTML = '';
    const users = Auth.getRegisteredUsers();

    activeDMs.forEach(targetUsername => {
      const targetUser = users[targetUsername] || { displayName: targetUsername, avatar: '👤' };
      const dmRoomId = Chat.getDmRoomId(Auth.currentUser.username, targetUsername);
      const isCurrent = Chat.currentRoom && Chat.currentRoom.id === dmRoomId;

      const item = document.createElement('div');
      item.className = `nav-item ${isCurrent ? 'active' : ''}`;
      item.dataset.roomId = dmRoomId;

      let badgeHtml = '';
      if (targetUser.unread) {
        badgeHtml = `<span class="nav-badge">${targetUser.unread}</span>`;
      }

      item.innerHTML = `
        <div class="nav-item-avatar-wrapper">
          <span>${targetUser.avatar || '👤'}</span>
          <span class="status-dot"></span>
        </div>
        <span class="nav-item-label">${targetUser.displayName}</span>
        ${badgeHtml}
      `;

      item.addEventListener('click', () => {
        openDirectMessageWith(targetUsername);
      });

      dmList.appendChild(item);
    });
  }

  function openDirectMessageWith(targetUsername) {
    if (!Auth.currentUser) return;
    if (targetUsername === Auth.currentUser.username) {
      alert("You cannot start a direct message with yourself.");
      return;
    }

    activeDMs.add(targetUsername);
    renderDMList();

    const users = Auth.getRegisteredUsers();
    const targetUser = users[targetUsername] || { displayName: targetUsername, avatar: '👤' };
    const dmRoomId = Chat.getDmRoomId(Auth.currentUser.username, targetUsername);

    const dmRoomObj = {
      id: dmRoomId,
      name: `@${targetUser.displayName}`,
      desc: `Direct Message conversation with ${targetUser.displayName}`,
      isPrivate: true,
      isDM: true,
      targetUser: targetUser
    };

    Chat.setActiveRoom(dmRoomObj);
    updateChatHeader(dmRoomObj);
    renderRoomMessages(dmRoomId);
    highlightActiveNavItem(dmRoomId);
    closeSidebar();
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS (VOICE & VIDEO CALL)
     ========================================================================== */
  function showToast(message, icon = '⚠️') {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast) {
      alert(`${icon} ${message}`);
      return;
    }
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 350);
    }, 3200);
  }

  // Voice & Video Call Handlers (Show Not Available)
  const btnAudioCall = document.getElementById('btnAudioCall');
  const btnVideoCall = document.getElementById('btnVideoCall');

  if (btnAudioCall) {
    btnAudioCall.addEventListener('click', () => {
      showToast("Voice call is not available right now.", "📞");
    });
  }

  if (btnVideoCall) {
    btnVideoCall.addEventListener('click', () => {
      showToast("Video call is not available right now.", "📹");
    });
  }

  btnOpenNewDM.addEventListener('click', () => {
    renderQuickUsersList();
    newDmModal.classList.remove('hidden');
    document.getElementById('dmTargetUsername').focus();
  });

  const closeNewDmModal = () => {
    newDmModal.classList.add('hidden');
    newDmForm.reset();
  };

  btnCloseNewDm.addEventListener('click', closeNewDmModal);
  btnCancelNewDm.addEventListener('click', closeNewDmModal);

  function renderQuickUsersList() {
    quickUsersList.innerHTML = '';
    const users = Auth.getRegisteredUsers();
    const currentUsername = Auth.currentUser ? Auth.currentUser.username : '';

    let count = 0;
    Object.values(users).forEach(u => {
      if (u.username === currentUsername) return;
      count++;

      const chip = document.createElement('div');
      chip.className = 'quick-user-chip';
      chip.innerHTML = `
        <span class="quick-user-avatar">${u.avatar || '👤'}</span>
        <span class="quick-user-name">${u.displayName}</span>
        <span class="quick-user-handle">@${u.username}</span>
      `;

      chip.addEventListener('click', () => {
        document.getElementById('dmTargetUsername').value = u.username;
      });

      quickUsersList.appendChild(chip);
    });

    if (count === 0) {
      quickUsersList.innerHTML = `<span style="font-size:0.75rem; color:var(--text-dim); padding:6px;">No other registered users yet.</span>`;
    }
  }

  newDmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = document.getElementById('dmTargetUsername').value.trim().toLowerCase();
    closeNewDmModal();
    openDirectMessageWith(target);
  });

  /* ==========================================================================
     ROOM SWITCHING & MESSAGE RENDERING
     ========================================================================== */
  function switchRoom(roomId) {
    const rooms = Chat.getAllRooms();
    const room = rooms[roomId];
    if (!room) return;

    Chat.setActiveRoom(room);
    updateChatHeader(room);
    renderRoomMessages(roomId);
    highlightActiveNavItem(roomId);
    closeSidebar();
  }

  function updateChatHeader(room) {
    if (room.isDM) {
      if (currentRoomAvatar) currentRoomAvatar.textContent = room.targetUser.avatar || '🤖';
      currentRoomTitle.textContent = room.name;
      currentRoomDesc.textContent = room.desc;
      roomPrivacyBadge.textContent = 'Direct Message';
      roomPrivacyBadge.className = 'privacy-badge hidden';
      welcomeBannerTitle.textContent = `Direct Message with ${room.name}`;
      welcomeBannerSub.textContent = `This is the start of your 1-on-1 private chat.`;
    } else {
      if (currentRoomAvatar) currentRoomAvatar.textContent = room.icon || '#';
      currentRoomTitle.textContent = `#${room.name}`;
      currentRoomDesc.textContent = room.desc || `Welcome to #${room.name}`;
      roomPrivacyBadge.textContent = room.isPrivate ? 'Private' : 'Public';
      roomPrivacyBadge.className = `privacy-badge ${room.isPrivate ? 'locked' : ''} hidden`;
      welcomeBannerTitle.textContent = `Welcome to #${room.name}!`;
      welcomeBannerSub.textContent = room.desc || `This is the start of this channel. Say hello or share your ideas!`;
    }
  }

  function highlightActiveNavItem(id) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      el.classList.remove('active-dm');
      if (el.dataset.roomId === id) {
        if (id.startsWith('dm_')) {
          el.classList.add('active-dm');
        } else {
          el.classList.add('active');
        }
      }
    });

    // In the reference screenshot, # general remains glowing blue in CHANNELS
    const generalChannel = document.querySelector(`.nav-item[data-room-id="general"]`);
    if (generalChannel && id.startsWith('dm_')) {
      generalChannel.classList.add('active');
    }
  }

  function renderRoomMessages(roomId) {
    messagesList.innerHTML = '';
    const messages = Chat.getRoomMessages(roomId);

    if (messages.length === 0) {
      channelWelcomeBanner.classList.remove('hidden');
    } else {
      channelWelcomeBanner.classList.add('hidden');
      messages.forEach(msg => appendMessageToDOM(msg));
    }

    scrollToBottom();
  }

  /**
   * Status Indicator Generator (Matches Screenshot: double checkmarks ✓✓)
   */
  function getStatusDotsHtml(status) {
    if (status === 'seen') {
      return `<span class="msg-status-ticks seen" title="Seen">✓✓</span>`;
    } else if (status === 'delivered') {
      return `<span class="msg-status-ticks delivered" title="Delivered">✓✓</span>`;
    } else {
      return `<span class="msg-status-ticks sent" title="Sent">✓</span>`;
    }
  }

  /**
   * Append Message to DOM (Deduplicated & Left/Right Positioned)
   */
  function appendMessageToDOM(msg) {
    if (document.getElementById(`msg-${msg.id}`)) {
      return;
    }

    channelWelcomeBanner.classList.add('hidden');

    const isOutgoing = Auth.currentUser && msg.sender.username === Auth.currentUser.username;
    const row = document.createElement('div');
    row.className = `message-row ${isOutgoing ? 'outgoing' : 'incoming'}`;
    row.id = `msg-${msg.id}`;

    const timeFormatted = formatMessageTime(msg);
    const safeText = escapeHtml(msg.text);

    let attachmentHtml = '';
    if (msg.attachment) {
      attachmentHtml = `
        <div class="message-image-attachment">
          <img src="${msg.attachment}" alt="Attachment">
        </div>
      `;
    }

    let reactionsHtml = `<div class="reactions-bar" id="reactions-${msg.id}">`;
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      Object.entries(msg.reactions).forEach(([emoji, users]) => {
        const isUserReacted = Auth.currentUser && users.includes(Auth.currentUser.username);
        reactionsHtml += `
          <span class="reaction-pill ${isUserReacted ? 'active' : ''}" data-emoji="${emoji}" data-msg-id="${msg.id}">
            ${emoji} ${users.length}
          </span>
        `;
      });
    }
    reactionsHtml += `</div>`;

    const statusDotsHtml = isOutgoing 
      ? `<span id="status-${msg.id}">${getStatusDotsHtml(msg.status || 'seen')}</span>` 
      : '';

    const senderNameHtml = !isOutgoing
      ? `<div class="message-sender-name">${escapeHtml(msg.sender.displayName)}</div>`
      : '';

    row.innerHTML = `
      <div class="message-avatar-wrap">
        <div class="message-avatar">${msg.sender.avatar || (isOutgoing ? '👦' : '🤖')}</div>
        <span class="status-indicator online"></span>
      </div>
      <div class="message-bubble">
        ${senderNameHtml}
        <div class="message-text">${safeText}</div>
        ${attachmentHtml}
        ${reactionsHtml}
        <div class="message-meta-footer">
          <span class="message-time">${timeFormatted}</span>
          ${statusDotsHtml}
        </div>
      </div>
      <div class="message-actions">
        <button class="action-btn" data-action="react" data-emoji="👍" data-msg-id="${msg.id}" title="Thumbs Up">👍</button>
        <button class="action-btn" data-action="react" data-emoji="❤️" data-msg-id="${msg.id}" title="Heart">❤️</button>
        <button class="action-btn" data-action="react" data-emoji="🔥" data-msg-id="${msg.id}" title="Fire">🔥</button>
        <button class="action-btn delete-btn" data-action="delete" data-msg-id="${msg.id}" title="Delete Message">🗑️</button>
      </div>
    `;

    row.querySelectorAll('.reaction-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        Chat.toggleReaction(pill.dataset.msgId, pill.dataset.emoji);
      });
    });

    row.querySelectorAll('.action-btn[data-action="react"]').forEach(btn => {
      btn.addEventListener('click', () => {
        Chat.toggleReaction(btn.dataset.msgId, btn.dataset.emoji);
      });
    });

    const deleteBtn = row.querySelector('.action-btn.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm("Delete this message?")) {
          Chat.deleteMessage(msg.id);
        }
      });
    }

    const imgEl = row.querySelector('.message-image-attachment img');
    if (imgEl) {
      imgEl.addEventListener('click', () => {
        lightboxImage.src = imgEl.src;
        imageLightbox.classList.remove('hidden');
      });
    }

    messagesList.appendChild(row);
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function formatMessageTime(msg) {
    if (typeof msg === 'object' && msg !== null) {
      if (msg.timeDisplay) return msg.timeDisplay;
      if (!msg.timestamp) return '';
      const date = new Date(msg.timestamp);
      if (isNaN(date.getTime())) return msg.timestamp;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const isoString = msg;
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ==========================================================================
     SENDING MESSAGES & ATTACHMENTS
     ========================================================================== */
  async function handleSendMessage() {
    const text = messageInput.value.trim();
    const attachment = pendingAttachmentBase64;

    if (!text && !attachment) return;

    try {
      messageInput.value = '';
      clearAttachmentPreview();
      autoResizeTextarea();
      await Chat.sendMessage(text, attachment);
      scrollToBottom();
    } catch (err) {
      alert(err.message);
    }
  }

  btnSendMessage.addEventListener('click', handleSendMessage);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  messageInput.addEventListener('input', () => {
    autoResizeTextarea();
    if (Chat.broadcastTyping) {
      clearTimeout(typingDebounceTimer);
      Chat.broadcastTyping();
      typingDebounceTimer = setTimeout(() => {}, 2000);
    }
  });

  function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
  }

  btnAttachFile.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Only image attachments (PNG, JPG, GIF, WebP) are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is larger than 2MB. Please select a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      pendingAttachmentBase64 = e.target.result;
      previewImage.src = pendingAttachmentBase64;
      previewFilename.textContent = file.name;
      attachmentPreviewBar.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  btnRemoveAttachment.addEventListener('click', clearAttachmentPreview);

  function clearAttachmentPreview() {
    pendingAttachmentBase64 = null;
    previewImage.src = '';
    attachmentPreviewBar.classList.add('hidden');
  }

  btnEmojiToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPopup.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!emojiPopup.contains(e.target) && e.target !== btnEmojiToggle) {
      emojiPopup.classList.add('hidden');
    }
  });

  document.querySelectorAll('.emoji-item').forEach(item => {
    item.addEventListener('click', () => {
      messageInput.value += item.textContent;
      emojiPopup.classList.add('hidden');
      messageInput.focus();
      autoResizeTextarea();
    });
  });

  /* ==========================================================================
     CLEAR CHAT (DELETE ALL MESSAGES IN CURRENT ROOM)
     ========================================================================== */
  btnClearChat.addEventListener('click', () => {
    const roomName = Chat.currentRoom.name;
    if (confirm(`Are you sure you want to delete all messages in #${roomName}? This cannot be undone.`)) {
      Chat.clearRoomMessages(Chat.currentRoom.id);
    }
  });

  /* ==========================================================================
     REAL-TIME EVENT HOOKS
     ========================================================================== */
  Chat.onMessageReceived = (msg) => {
    if (Chat.currentRoom && Chat.currentRoom.id === msg.roomId) {
      appendMessageToDOM(msg);
      scrollToBottom();
    } else {
      if (msg.roomId && msg.roomId.startsWith('dm_')) {
        loadActiveDMs();
      }
    }
  };

  Chat.onRoomAdded = () => {
    renderChannels();
  };

  Chat.onStatusUpdated = ({ messageId, status, roomId }) => {
    if (Chat.currentRoom && Chat.currentRoom.id === roomId) {
      const statusEl = document.getElementById(`status-${messageId}`);
      if (statusEl) {
        statusEl.innerHTML = getStatusDotsHtml(status);
      }
    }
  };

  Chat.onMessageDeleted = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.remove();
    }
    if (messagesList.children.length === 0) {
      channelWelcomeBanner.classList.remove('hidden');
    }
  };

  Chat.onRoomCleared = (roomId) => {
    if (Chat.currentRoom && Chat.currentRoom.id === roomId) {
      messagesList.innerHTML = '';
      channelWelcomeBanner.classList.remove('hidden');
    }
  };

  Chat.onTypingUpdated = (data) => {
    if (Chat.currentRoom && Chat.currentRoom.id === data.roomId) {
      if (Auth.currentUser && data.username === Auth.currentUser.username) return;
      typingText.textContent = `${data.displayName} is typing...`;
      typingIndicator.classList.remove('hidden');
      clearTimeout(Chat.activeTypingTimeouts[data.username]);
      Chat.activeTypingTimeouts[data.username] = setTimeout(() => {
        typingIndicator.classList.add('hidden');
      }, 2500);
    }
  };

  Chat.onReactionUpdated = ({ messageId, reactions, roomId }) => {
    if (Chat.currentRoom && Chat.currentRoom.id === roomId) {
      const container = document.getElementById(`reactions-${messageId}`);
      if (!container) return;

      container.innerHTML = '';
      if (reactions && Object.keys(reactions).length > 0) {
        Object.entries(reactions).forEach(([emoji, users]) => {
          const isUserReacted = Auth.currentUser && users.includes(Auth.currentUser.username);
          const pill = document.createElement('span');
          pill.className = `reaction-pill ${isUserReacted ? 'active' : ''}`;
          pill.dataset.emoji = emoji;
          pill.dataset.msgId = messageId;
          pill.textContent = `${emoji} ${users.length}`;
          pill.addEventListener('click', () => {
            Chat.toggleReaction(messageId, emoji);
          });
          container.appendChild(pill);
        });
      }
    }
  };

  /* ==========================================================================
     SEARCH MESSAGES IN ROOM
     ========================================================================== */
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.message-row').forEach(row => {
      const textEl = row.querySelector('.message-text');
      const text = textEl ? textEl.textContent.toLowerCase() : '';
      if (!query || text.includes(query)) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
  });

  /* ==========================================================================
     MOBILE SIDEBAR DRAWER & RESPONSIVE CONTROLLER
     ========================================================================== */
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function toggleSidebar() {
    if (sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Auto-close mobile drawer when viewport expands to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  // Esc key closes mobile sidebar or open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
      if (emojiPopup) emojiPopup.classList.add('hidden');
    }
  });

  /* ==========================================================================
     SETTINGS MODAL & ID DELETION
     ========================================================================== */
  btnOpenSettings.addEventListener('click', () => {
    if (Auth.currentUser) {
      editDisplayName.value = Auth.currentUser.displayName || '';
      const editCustomDpInput = document.getElementById('editCustomDpInput');
      const editDpPreview = document.getElementById('editDpPreview');
      if (editCustomDpInput) editCustomDpInput.value = Auth.currentUser.avatar || '👦';
      if (editDpPreview) editDpPreview.textContent = Auth.currentUser.avatar || '👦';

      // Setup emoji picker in settings modal
      const editAllEmojisGrid = document.getElementById('editAllEmojisGrid');
      const editEmojiSearch = document.getElementById('editEmojiSearch');
      const btnClearEditEmojiSearch = document.getElementById('btnClearEditEmojiSearch');
      const editEmojiCategoryPills = document.getElementById('editEmojiCategoryPills');

      setupEmojiPicker(
        editAllEmojisGrid,
        editDpPreview,
        editCustomDpInput,
        editEmojiSearch,
        btnClearEditEmojiSearch,
        editEmojiCategoryPills
      );
    }
    settingsModal.classList.remove('hidden');
  });

  btnCloseSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  editProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = editDisplayName.value.trim();
    const editCustomDpInput = document.getElementById('editCustomDpInput');
    const newAvatar = editCustomDpInput ? (editCustomDpInput.value.trim() || '👦') : '👦';

    if (newName) {
      const updated = Auth.updateProfile(newName, newAvatar);
      onUserLoggedIn(updated);

      // Update outgoing message avatars currently displayed in the chat view
      document.querySelectorAll('.message-row.outgoing .message-avatar').forEach(el => {
        el.textContent = newAvatar;
      });
    }
    settingsModal.classList.add('hidden');
  });

  // ID / ACCOUNT DELETION
  btnDeleteAccount.addEventListener('click', async () => {
    if (!Auth.currentUser) return;
    const username = Auth.currentUser.username;
    const confirmed = confirm(
      `⚠️ PERMANENT ID DELETION\n\nAre you sure you want to delete your ID @${username}?\n\nThis will remove your login from this browser permanently. This action cannot be undone.`
    );
    if (confirmed) {
      await Auth.deleteAccount(username);
      alert(`Your ID @${username} has been permanently deleted.`);
      location.reload();
    }
  });

  // Lightbox close
  btnCloseLightbox.addEventListener('click', () => {
    imageLightbox.classList.add('hidden');
  });
  imageLightbox.addEventListener('click', (e) => {
    if (e.target === imageLightbox) {
      imageLightbox.classList.add('hidden');
    }
  });

});
