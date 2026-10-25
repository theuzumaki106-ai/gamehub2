"""
Pure Python PNG Texture Generator for Temple Escape
Uses Python standard library (zlib, struct) to generate seamless game textures.
"""
import os
import zlib
import struct
import math
import random

def write_png(filename, width, height, pixels):
    """
    Writes RGBA pixels to a PNG file.
    pixels: bytearray of size width * height * 4
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter byte 0 (None)
        stride = y * width * 4
        raw_data.extend(pixels[stride : stride + width * 4])
        
    compressed = zlib.compress(bytes(raw_data), 6)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n') # Signature
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', 13))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Created texture: {filename} ({width}x{height})")

def generate_stone_path(w=256, h=256):
    buf = bytearray(w * h * 4)
    rng = random.Random(42)
    # 4 rows of 2 stones
    for y in range(h):
        for x in range(w):
            # stone tile coordinates
            tile_y = y // 64
            tile_x = (x + (32 if tile_y % 2 == 1 else 0)) // 64
            mortar_x = (x + (32 if tile_y % 2 == 1 else 0)) % 64
            mortar_y = y % 64
            
            # base stone color: #8A857A to #635F56 with moss greens
            base_r = 130 + int(20 * math.sin(x * 0.05) + 15 * math.cos(y * 0.05))
            base_g = 125 + int(25 * math.sin(x * 0.04 + 1.0) + 10 * math.cos(y * 0.06))
            base_b = 105 + int(15 * math.sin(x * 0.06) + 10 * math.sin(y * 0.04))
            
            # noise
            n = rng.randint(-12, 12)
            base_r = max(0, min(255, base_r + n))
            base_g = max(0, min(255, base_g + n))
            base_b = max(0, min(255, base_b + n))
            
            # mortar grooves
            if mortar_x < 4 or mortar_y < 4 or mortar_x > 60 or mortar_y > 60:
                base_r = int(base_r * 0.45)
                base_g = int(base_g * 0.45)
                base_b = int(base_b * 0.40)
            else:
                # ancient moss flecks
                moss_val = math.sin(x * 0.12) * math.cos(y * 0.15)
                if moss_val > 0.4:
                    base_g = min(255, int(base_g * 1.35))
                    base_r = int(base_r * 0.75)
                    base_b = int(base_b * 0.6)
                    
            idx = (y * w + x) * 4
            buf[idx] = base_r
            buf[idx + 1] = base_g
            buf[idx + 2] = base_b
            buf[idx + 3] = 255
    write_png("assets/textures/stone_path.png", w, h, buf)

def generate_stone_wall(w=256, h=256):
    buf = bytearray(w * h * 4)
    rng = random.Random(101)
    for y in range(h):
        for x in range(w):
            base_r = 110 + int(15 * math.sin(x * 0.08) + 10 * math.cos(y * 0.05))
            base_g = 105 + int(12 * math.cos(x * 0.06) + 15 * math.sin(y * 0.07))
            base_b = 95 + int(10 * math.sin(x * 0.05))
            
            n = rng.randint(-10, 10)
            base_r = max(0, min(255, base_r + n))
            base_g = max(0, min(255, base_g + n))
            base_b = max(0, min(255, base_b + n))
            
            # horizontal brick lines every 32 px
            if y % 32 < 3:
                base_r = int(base_r * 0.5)
                base_g = int(base_g * 0.5)
                base_b = int(base_b * 0.45)
            # staggered vertical grooves
            offset = 32 if (y // 32) % 2 == 1 else 0
            if (x + offset) % 64 < 3:
                base_r = int(base_r * 0.5)
                base_g = int(base_g * 0.5)
                base_b = int(base_b * 0.45)
                
            idx = (y * w + x) * 4
            buf[idx] = base_r
            buf[idx + 1] = base_g
            buf[idx + 2] = base_b
            buf[idx + 3] = 255
    write_png("assets/textures/stone_wall.png", w, h, buf)

def generate_wood_planks(w=256, h=256):
    buf = bytearray(w * h * 4)
    rng = random.Random(77)
    for y in range(h):
        plank_y = y % 32
        for x in range(w):
            grain = math.sin(x * 0.25 + math.sin(y * 0.05) * 5.0) * 15.0
            base_r = 140 + int(grain)
            base_g = 95 + int(grain * 0.7)
            base_b = 55 + int(grain * 0.4)
            
            n = rng.randint(-8, 8)
            base_r = max(0, min(255, base_r + n))
            base_g = max(0, min(255, base_g + n))
            base_b = max(0, min(255, base_b + n))
            
            # Plank gaps
            if plank_y < 3:
                base_r = int(base_r * 0.3)
                base_g = int(base_g * 0.3)
                base_b = int(base_b * 0.2)
                
            # Rivets / nails at edges
            if (x in (20, 21, w - 21, w - 20)) and (plank_y in (15, 16)):
                base_r = 50
                base_g = 50
                base_b = 55
                
            idx = (y * w + x) * 4
            buf[idx] = base_r
            buf[idx + 1] = base_g
            buf[idx + 2] = base_b
            buf[idx + 3] = 255
    write_png("assets/textures/wood_planks.png", w, h, buf)

def generate_foliage(w=128, h=128):
    buf = bytearray(w * h * 4)
    for y in range(h):
        for x in range(w):
            val = math.sin(x * 0.15) * math.cos(y * 0.15) + math.sin(x * 0.05 + y * 0.08)
            r = int(25 + 30 * val)
            g = int(120 + 70 * val)
            b = int(20 + 25 * val)
            idx = (y * w + x) * 4
            buf[idx] = max(0, min(255, r))
            buf[idx + 1] = max(0, min(255, g))
            buf[idx + 2] = max(0, min(255, b))
            buf[idx + 3] = 255
    write_png("assets/textures/foliage.png", w, h, buf)

def generate_particle_sparkle(w=64, h=64):
    buf = bytearray(w * h * 4)
    cx, cy = w / 2.0, h / 2.0
    max_r = w / 2.0
    for y in range(h):
        for x in range(w):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            # 4-point star spike formula
            angle = math.atan2(dy, dx)
            spike = (math.cos(angle * 4) ** 2) * 0.6 + 0.4
            intensity = max(0.0, 1.0 - (dist / (max_r * spike)))
            alpha = int(255 * (intensity ** 1.8))
            
            idx = (y * w + x) * 4
            buf[idx] = 255     # R
            buf[idx + 1] = 230 # G
            buf[idx + 2] = 120 # B
            buf[idx + 3] = max(0, min(255, alpha))
    write_png("assets/textures/particle_sparkle.png", w, h, buf)

def generate_dust_smoke(w=64, h=64):
    buf = bytearray(w * h * 4)
    cx, cy = w / 2.0, h / 2.0
    max_r = w / 2.0
    for y in range(h):
        for x in range(w):
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            intensity = max(0.0, 1.0 - dist / max_r)
            alpha = int(200 * (intensity ** 2.0))
            idx = (y * w + x) * 4
            buf[idx] = 220
            buf[idx + 1] = 210
            buf[idx + 2] = 180
            buf[idx + 3] = max(0, min(255, alpha))
    write_png("assets/textures/dust_smoke.png", w, h, buf)

if __name__ == "__main__":
    generate_stone_path()
    generate_stone_wall()
    generate_wood_planks()
    generate_foliage()
    generate_particle_sparkle()
    generate_dust_smoke()
    print("All textures generated successfully!")
