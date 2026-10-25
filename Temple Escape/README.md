# TEMPLE ESCAPE: LOST IDOL — 3D ENDLESS RUNNER

A complete, high-performance 3D endless runner game recreated from the ground up, inspired by the classic mechanics and atmosphere of *Temple Run*.

Built using **Three.js (WebGL)**, **JavaScript (ES6+)**, **HTML5 Canvas**, and the **Web Audio API**.

---

## 🎮 How to Run and Play

### Option 1: One-Click Local Server (Recommended)
Open your terminal in this directory and run:
```bash
python server.py
```
This automatically starts a local server on port 8000 and opens the game directly in your default browser at `http://localhost:8000`.

### Option 2: Direct Browser Launch
Simply double-click [`index.html`](file:///c:/Users/viswajeet/Desktop/temple%20run%20game/index.html) to run it in any modern desktop or mobile browser. All dependencies (`libs/three.min.js`) are bundled locally offline!

---

## 🕹️ Controls

| Action | Desktop Controls | Mobile / Touch Controls |
| :--- | :--- | :--- |
| **Jump** | `Up Arrow` / `W` / `Space` | Swipe Up or Tap `↑` |
| **Slide** | `Down Arrow` / `S` | Swipe Down or Tap `↓` |
| **Turn Left** | `Left Arrow` / `A` (at corners) | Swipe Left or Tap `←` |
| **Turn Right** | `Right Arrow` / `D` (at corners) | Swipe Right or Tap `→` |
| **Lane Shift** | `Left` / `Right` Arrow keys | Swipe Left / Right on straight path |
| **Pause / Resume** | `Escape` / `P` | Tap Pause button (top right) |

---

## ✨ Key Features & Mechanics

1. **Continuous Third-Person 3D Action**
   - Dynamic chase camera positioned behind the explorer with smooth positional damping, corner banking, jump bob, and impact shake.
   - Progressive difficulty curve: forward speed increases smoothly from 19 m/s up to 34 m/s over distance.

2. **Articulated 3D Explorer & Temple Guardian**
   - **Explorer Character**: Fully rigged 3D adventurer with fedora, khaki outfit, cargo pants, boots, and the Golden Temple Idol at his hip. Procedural animation keyframe cycles for running, tuck jumping, low sliding, corner leaning, stumbling, and falling.
   - **Temple Guardian (Demon Ape Beast)**: Fearsome dark stone creature with glowing crimson eyes, horned head, and massive claws. Pursues closely behind the runner; surges forward on stumbles and lunges for the catch on fatal mistakes!

3. **Endless Modular Path Generation**
   - Seamlessly generates ancient stone pathways, 90-degree left and right turn intersections, wooden suspension bridges over canyons, broken floor chasms, and low stone arches.
   - Intelligent recycling system prevents memory leaks and ensures stable 60 FPS performance.

4. **Power-Ups & Collectibles**
   - **3D Spinning Golden Coins**: High-specular metallic coins arranged in lines and parabolic jump arcs.
   - **Coin Magnet**: Attracts all coins across all lanes within a 12m radius toward the runner.
   - **Temple Shield**: Grants 1-hit protection against fatal obstacles with an energy bubble and burst particles.
   - **Speed Boost**: Turbo dash forward at hyper speed with total invulnerability and dynamic field-of-view expansion.
   - **2X Multiplier**: Doubles score and coin value during active duration.

5. **Procedural Web Audio API Sound System**
   - 100% self-contained synthesized sound effects: footsteps, golden coin pickup chimes, jump whoosh, slide friction scrape, monster roars, crash rumble, and UI clicks.
   - Dynamic tribal jungle chase drums beat in rhythm with the escape run.

6. **Progression & Upgrades Shop**
   - Persistent `localStorage` tracking for High Score, Best Distance, and Total Lifetime Coins.
   - Upgrades menu to increase Magnet duration, Shield capacity, Boost distance, and Score Multipliers up to Level 5.

---

## 📁 Project Architecture

```
temple run game/
├── assets/
│   ├── icons/                  # 21 transparent game SVG icons
│   │   ├── icon-play.svg
│   │   ├── icon-pause.svg
│   │   ├── icon-resume.svg
│   │   ├── icon-restart.svg
│   │   ├── icon-home.svg
│   │   ├── icon-settings.svg
│   │   ├── icon-sound.svg
│   │   ├── icon-music.svg
│   │   ├── icon-shop.svg
│   │   ├── icon-coin.svg
│   │   ├── icon-distance.svg
│   │   ├── icon-score.svg
│   │   ├── icon-magnet.svg
│   │   ├── icon-shield.svg
│   │   ├── icon-boost.svg
│   │   ├── icon-multiplier.svg
│   │   ├── icon-revive.svg
│   │   ├── icon-close.svg
│   │   ├── icon-back.svg
│   │   ├── icon-achievement.svg
│   │   └── icon-golden-idol.svg
│   ├── textures/               # Seamless procedural PBR textures
│   └── manifest.json           # Complete asset registry and metadata
├── libs/
│   └── three.min.js            # Bundled local Three.js r128 engine
├── src/
│   ├── Audio.js                # Web Audio API sound & tribal drums synthesizer
│   ├── StateManager.js         # Finite State Machine for Game & Player states
│   ├── InputManager.js         # Keyboard & Mobile touch swipe gesture handler
│   ├── Character.js            # 3D Explorer model & procedural animation rig
│   ├── Pursuer.js              # 3D Demon Ape Temple Guardian pursuer
│   ├── Obstacles.js            # Jump, slide, and dodge hazard factory
│   ├── Collectibles.js         # 3D coins, power-ups, and magnet logic
│   ├── Particles.js            # Sparkles, footsteps dust, ambient falling leaves
│   ├── CameraController.js     # Third-person smooth follow, shake & FOV
│   ├── Environment.js          # Modular endless path generator & turns
│   ├── UI.js                   # HUD, menus, upgrades shop, audio sliders
│   └── Game.js                 # Main game loop, physics & collision engine
├── css/
│   └── style.css               # Ancient stone tablet UI styling & layout
├── index.html                  # Main game entry point
├── server.py                   # Local development server launcher
└── README.md                   # Project documentation
```

---

## 🧪 Testing Checklist

- [x] Keyboard controls (Arrows, WASD, Space, Escape)
- [x] Touch swipe gestures (Up, Down, Left, Right)
- [x] Jump clearing logs and floor spikes
- [x] Slide ducking under low carved stone arches
- [x] 90-degree corner turns with input buffering
- [x] Coin collection and score counter incrementing
- [x] Power-up activation (Magnet, Shield, Boost, 2X) with HUD timer bar
- [x] Beast pursuer threat distance increase on stumble and pounce on collision
- [x] Pause, resume, restart, and return to main menu
- [x] Upgrades shop with coin deductions and persistent level saving
- [x] Window resize and mobile responsive layout
