"""
Asset generator for Temple Escape: Lost Idol
Generates all required 2D UI icons in SVG format and produces the asset manifest.
"""
import os
import json

ICONS = {
    "icon-play": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="50%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#B76E00"/>
    </linearGradient>
    <linearGradient id="inner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D2005"/>
      <stop offset="100%" stop-color="#1A0D02"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#inner-grad)" stroke="url(#gold-grad)" stroke-width="5" filter="url(#glow)"/>
  <polygon points="40,30 70,50 40,70" fill="url(#gold-grad)"/>
</svg>''',

    "icon-pause": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-grad-p" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="50%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#B76E00"/>
    </linearGradient>
    <linearGradient id="inner-grad-p" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D2005"/>
      <stop offset="100%" stop-color="#1A0D02"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#inner-grad-p)" stroke="url(#gold-grad-p)" stroke-width="5"/>
  <rect x="34" y="30" width="10" height="40" rx="3" fill="url(#gold-grad-p)"/>
  <rect x="56" y="30" width="10" height="40" rx="3" fill="url(#gold-grad-p)"/>
</svg>''',

    "icon-resume": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-r" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-r)" stroke-width="5"/>
  <polygon points="36,32 60,50 36,68" fill="url(#gold-r)"/>
  <polygon points="56,32 80,50 56,68" fill="url(#gold-r)"/>
</svg>''',

    "icon-restart": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-res" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-res)" stroke-width="5"/>
  <path d="M50 25 A 25 25 0 1 1 25 50" fill="none" stroke="url(#gold-res)" stroke-width="8" stroke-linecap="round"/>
  <polygon points="18,32 32,25 32,39" fill="url(#gold-res)"/>
</svg>''',

    "icon-home": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-h" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-h)" stroke-width="5"/>
  <!-- Temple Facade -->
  <polygon points="50,26 28,42 72,42" fill="url(#gold-h)"/>
  <rect x="32" y="44" width="36" height="26" fill="url(#gold-h)"/>
  <path d="M43 70 L43 54 A7 7 0 0 1 57 54 L57 70 Z" fill="#2B1807"/>
</svg>''',

    "icon-settings": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-set" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-set)" stroke-width="5"/>
  <path d="M50,33 L54,33 L55,37 L59,39 L62,36 L66,39 L64,43 L66,47 L70,48 L70,52 L66,53 L64,57 L66,61 L62,64 L59,61 L55,63 L54,67 L50,67 L46,67 L45,63 L41,61 L38,64 L34,61 L36,57 L34,53 L30,52 L30,48 L34,47 L36,43 L34,39 L38,36 L41,39 L45,37 L46,33 Z" fill="url(#gold-set)"/>
  <circle cx="50" cy="50" r="7" fill="#2B1807"/>
</svg>''',

    "icon-sound": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-snd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-snd)" stroke-width="5"/>
  <polygon points="30,42 40,42 52,30 52,70 40,58 30,58" fill="url(#gold-snd)"/>
  <path d="M60 40 A 15 15 0 0 1 60 60" fill="none" stroke="url(#gold-snd)" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 32 A 25 25 0 0 1 66 68" fill="none" stroke="url(#gold-snd)" stroke-width="4" stroke-linecap="round"/>
</svg>''',

    "icon-music": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-msc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-msc)" stroke-width="5"/>
  <ellipse cx="40" cy="62" rx="7" ry="5" fill="url(#gold-msc)"/>
  <ellipse cx="62" cy="54" rx="7" ry="5" fill="url(#gold-msc)"/>
  <rect x="45" y="32" width="4" height="30" fill="url(#gold-msc)"/>
  <rect x="67" y="24" width="4" height="30" fill="url(#gold-msc)"/>
  <polygon points="45,34 71,26 71,32 45,40" fill="url(#gold-msc)"/>
</svg>''',

    "icon-shop": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-shp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-shp)" stroke-width="5"/>
  <!-- Ancient treasure chest -->
  <path d="M28 44 Q 50 30 72 44 L72 68 Q 50 72 28 68 Z" fill="url(#gold-shp)"/>
  <line x1="28" y1="52" x2="72" y2="52" stroke="#2B1807" stroke-width="3"/>
  <circle cx="50" cy="54" r="4" fill="#2B1807"/>
</svg>''',

    "icon-coin": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-cn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF275"/>
      <stop offset="45%" stop-color="#F5B300"/>
      <stop offset="100%" stop-color="#A86200"/>
    </linearGradient>
    <radialGradient id="gold-shine" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#FFDD33" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#B87300" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="42" fill="url(#gold-cn)" stroke="#FFE875" stroke-width="3"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="#683B00" stroke-width="2" stroke-dasharray="4,3"/>
  <!-- Ancient Mayan/Incan rune diamond -->
  <polygon points="50,28 66,50 50,72 34,50" fill="#683B00"/>
  <polygon points="50,33 61,50 50,67 39,50" fill="url(#gold-cn)"/>
  <circle cx="50" cy="50" r="4" fill="#683B00"/>
  <circle cx="50" cy="50" r="42" fill="url(#gold-shine)"/>
</svg>''',

    "icon-distance": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-dst" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-dst)" stroke-width="5"/>
  <!-- Runner figure & trail -->
  <circle cx="55" cy="30" r="6" fill="url(#gold-dst)"/>
  <path d="M48 38 L58 46 L50 56 L62 70" fill="none" stroke="url(#gold-dst)" stroke-width="4" stroke-linecap="round"/>
  <path d="M56 44 L44 50 L38 44" fill="none" stroke="url(#gold-dst)" stroke-width="4" stroke-linecap="round"/>
  <line x1="24" y1="72" x2="76" y2="72" stroke="url(#gold-dst)" stroke-width="3" stroke-dasharray="5,3"/>
</svg>''',

    "icon-score": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-sc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-sc)" stroke-width="5"/>
  <!-- Trophy cup -->
  <path d="M35 30 L65 30 L60 52 Q 50 62 40 52 Z" fill="url(#gold-sc)"/>
  <path d="M47 60 L53 60 L55 70 L45 70 Z" fill="url(#gold-sc)"/>
  <rect x="40" y="70" width="20" height="6" rx="2" fill="url(#gold-sc)"/>
  <path d="M35 34 Q 24 38 28 48 Q 32 52 38 48" fill="none" stroke="url(#gold-sc)" stroke-width="3"/>
  <path d="M65 34 Q 76 38 72 48 Q 68 52 62 48" fill="none" stroke="url(#gold-sc)" stroke-width="3"/>
</svg>''',

    "icon-magnet": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="red-mag" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5252"/><stop offset="100%" stop-color="#C62828"/>
    </linearGradient>
    <linearGradient id="blue-mag" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#448AFF"/><stop offset="100%" stop-color="#1565C0"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#1C1824" stroke="#8E44AD" stroke-width="5"/>
  <!-- Horseshoe Magnet -->
  <path d="M30 46 C 30 26, 70 26, 70 46 L70 56 L58 56 L58 46 C 58 36, 42 36, 42 46 L42 56 L30 56 Z" fill="url(#red-mag)"/>
  <rect x="30" y="56" width="12" height="14" fill="#ECEFF1"/>
  <rect x="58" y="56" width="12" height="14" fill="url(#blue-mag)"/>
  <!-- Sparks -->
  <circle cx="36" cy="74" r="2" fill="#FFE066"/>
  <circle cx="64" cy="74" r="2" fill="#FFE066"/>
  <circle cx="50" cy="76" r="3" fill="#FFE066"/>
</svg>''',

    "icon-shield": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="green-shld" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#69F0AE"/><stop offset="100%" stop-color="#00C853"/>
    </linearGradient>
    <linearGradient id="gold-shld-bdr" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#0A2218" stroke="url(#green-shld)" stroke-width="5"/>
  <!-- Shield shape -->
  <path d="M50 24 L68 32 C 68 54, 58 68, 50 76 C 42 68, 32 54, 32 32 Z" fill="url(#green-shld)" stroke="url(#gold-shld-bdr)" stroke-width="3"/>
  <path d="M50 32 L60 37 C 60 50, 54 58, 50 64 C 46 58, 40 50, 40 37 Z" fill="#E8F5E9" opacity="0.6"/>
</svg>''',

    "icon-boost": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="blue-bst" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#40C4FF"/><stop offset="100%" stop-color="#0091EA"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#072233" stroke="url(#blue-bst)" stroke-width="5"/>
  <!-- Boost Wings/Chevrons -->
  <polygon points="50,22 68,46 50,42 32,46" fill="url(#blue-bst)"/>
  <polygon points="50,42 68,66 50,62 32,66" fill="url(#blue-bst)"/>
  <polygon points="50,62 68,84 50,80 32,84" fill="url(#blue-bst)"/>
</svg>''',

    "icon-multiplier": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="mult-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#FF9100"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#361700" stroke="url(#mult-gold)" stroke-width="5"/>
  <text x="50" y="62" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="bold" fill="url(#mult-gold)" text-anchor="middle">2X</text>
  <circle cx="50" cy="50" r="34" fill="none" stroke="url(#mult-gold)" stroke-width="2" stroke-dasharray="6,4"/>
</svg>''',

    "icon-revive": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="hrt-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5252"/><stop offset="100%" stop-color="#D50000"/>
    </linearGradient>
    <linearGradient id="ankh-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#F57C00"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2E0808" stroke="url(#hrt-red)" stroke-width="5"/>
  <!-- Winged Life Heart -->
  <path d="M50 38 C 50 28, 30 24, 30 40 C 30 52, 50 68, 50 68 C 50 68, 70 52, 70 40 C 70 24, 50 28, 50 38 Z" fill="url(#hrt-red)"/>
  <!-- Golden wings -->
  <path d="M30 42 C 20 40, 16 32, 22 28 C 26 32, 28 36, 30 42 Z" fill="url(#ankh-gold)"/>
  <path d="M70 42 C 80 40, 84 32, 78 28 C 74 32, 72 36, 70 42 Z" fill="url(#ankh-gold)"/>
</svg>''',

    "icon-close": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="red-cls" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B"/><stop offset="100%" stop-color="#C0392B"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2A1010" stroke="url(#red-cls)" stroke-width="5"/>
  <line x1="34" y1="34" x2="66" y2="66" stroke="url(#red-cls)" stroke-width="8" stroke-linecap="round"/>
  <line x1="66" y1="34" x2="34" y2="66" stroke="url(#red-cls)" stroke-width="8" stroke-linecap="round"/>
</svg>''',

    "icon-back": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-bk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-bk)" stroke-width="5"/>
  <polygon points="34,50 56,32 56,44 68,44 68,56 56,56 56,68" fill="url(#gold-bk)"/>
</svg>''',

    "icon-achievement": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold-ach" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="rib-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E53935"/><stop offset="100%" stop-color="#B71C1C"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#gold-ach)" stroke-width="5"/>
  <!-- Ribbons -->
  <polygon points="42,54 36,78 46,72 50,60" fill="url(#rib-red)"/>
  <polygon points="58,54 64,78 54,72 50,60" fill="url(#rib-red)"/>
  <!-- Medal -->
  <circle cx="50" cy="44" r="18" fill="url(#gold-ach)"/>
  <polygon points="50,33 53,41 62,41 55,46 58,54 50,49 42,54 45,46 38,41 47,41" fill="#422006"/>
</svg>''',

    "icon-golden-idol": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="idol-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF59D"/>
      <stop offset="35%" stop-color="#FBC02D"/>
      <stop offset="80%" stop-color="#F57F17"/>
      <stop offset="100%" stop-color="#824300"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="#2B1807" stroke="url(#idol-gold)" stroke-width="5"/>
  <!-- Golden Idol Mask -->
  <rect x="28" y="24" width="44" height="12" rx="4" fill="url(#idol-gold)"/>
  <path d="M30 36 L70 36 L66 70 Q 50 78 34 70 Z" fill="url(#idol-gold)"/>
  <!-- Ruby glowing eyes -->
  <rect x="36" y="44" width="10" height="8" rx="2" fill="#D50000"/>
  <circle cx="41" cy="48" r="2" fill="#FF8A80"/>
  <rect x="54" y="44" width="10" height="8" rx="2" fill="#D50000"/>
  <circle cx="59" cy="48" r="2" fill="#FF8A80"/>
  <!-- Grimace / Mouth -->
  <rect x="42" y="58" width="16" height="8" rx="2" fill="#3E2723"/>
  <line x1="46" y1="58" x2="46" y2="66" stroke="url(#idol-gold)" stroke-width="2"/>
  <line x1="50" y1="58" x2="50" y2="66" stroke="url(#idol-gold)" stroke-width="2"/>
  <line x1="54" y1="58" x2="54" y2="66" stroke="url(#idol-gold)" stroke-width="2"/>
</svg>'''
}

def generate_icons():
    icons_dir = "assets/icons"
    os.makedirs(icons_dir, exist_ok=True)
    manifest_icons = []
    
    for name, svg_content in ICONS.items():
        file_path = os.path.join(icons_dir, f"{name}.svg")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(svg_content.strip())
        print(f"Created: {file_path}")
        manifest_icons.append({
            "name": name,
            "filename": f"assets/icons/{name}.svg",
            "format": "svg",
            "dimensions": "100x100",
            "transparent": True,
            "category": "ui-icon",
            "intended_use": f"UI control or indicator for {name.replace('icon-', '')}"
        })
        
    # Generate manifest.json
    manifest = {
        "game_title": "TEMPLE ESCAPE: LOST IDOL",
        "version": "1.0.0",
        "created_at": "2026-10-24",
        "description": "Complete original 3D endless runner asset manifest",
        "assets_count": len(manifest_icons),
        "icons": manifest_icons,
        "models_3d": [
            {"name": "explorer", "type": "procedural_hierarchical_mesh", "description": "Adventurer runner character with animated joints"},
            {"name": "pursuer_guardian", "type": "procedural_hierarchical_mesh", "description": "Demon ape temple guardian beast"},
            {"name": "coin", "type": "procedural_mesh", "description": "Spinning metallic 3D golden coin"},
            {"name": "path_straight", "type": "modular_segment", "description": "Ancient carved stone path with moss and borders"},
            {"name": "path_turn_left", "type": "modular_segment", "description": "90 degree left turn junction"},
            {"name": "path_turn_right", "type": "modular_segment", "description": "90 degree right turn junction"},
            {"name": "narrow_bridge", "type": "modular_segment", "description": "Wood plank bridge over jungle canyon"},
            {"name": "broken_bridge", "type": "modular_segment", "description": "Jump gap chasm over mist"},
            {"name": "stone_arch", "type": "obstacle_mesh", "description": "Low stone arch requiring slide action"},
            {"name": "fallen_log", "type": "obstacle_mesh", "description": "Fallen mossy tree trunk requiring jump"},
            {"name": "side_rock", "type": "obstacle_mesh", "description": "Stone boulder blocking specific lane"},
            {"name": "spikes", "type": "obstacle_mesh", "description": "Ancient floor spikes trap"},
            {"name": "temple_pillar", "type": "prop_mesh", "description": "Ancient carved stone ruin pillar"},
            {"name": "jungle_tree", "type": "prop_mesh", "description": "Lush tropical tree with canopy and vines"}
        ],
        "audio": [
            {"name": "footstep", "type": "web_audio_synth", "description": "Stone impact step"},
            {"name": "coin_pickup", "type": "web_audio_synth", "description": "Golden chime pentatonic tone"},
            {"name": "jump", "type": "web_audio_synth", "description": "Wind leap whoosh"},
            {"name": "slide", "type": "web_audio_synth", "description": "Stone friction slide"},
            {"name": "powerup", "type": "web_audio_synth", "description": "Harmonic ascending fanfare"},
            {"name": "roar", "type": "web_audio_synth", "description": "Deep resonant monster guardian roar"},
            {"name": "crash", "type": "web_audio_synth", "description": "Impact thud with rumble"},
            {"name": "jungle_drums", "type": "web_audio_synth", "description": "Dynamic procedural tribal chase rhythm"}
        ]
    }
    
    with open("assets/manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("Created: assets/manifest.json")

if __name__ == "__main__":
    generate_icons()
