"""Generate custom app icon PNG with gradient WashingMachine + GlownDry text."""

from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "icon.png")
FONT_BLACK = os.path.join(
    os.path.dirname(__file__),
    "..",
    "node_modules",
    "@expo-google-fonts",
    "inter",
    "900Black",
    "Inter_900Black.ttf",
)
FONT_BOLD = FONT_BLACK.replace("900Black", "700Bold")

TEAL_START = (0, 198, 181)
TEAL_END = (0, 109, 150)
BLACK = (26, 42, 58)
BG = (247, 250, 250)


def make_gradient(w, h, c1, c2):
    grad = Image.new("RGBA", (w, h))
    px = grad.load()
    for x in range(w):
        t = x / w
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        for y in range(h):
            px[x, y] = (r, g, b, 255)
    return grad


def main():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded rect
    margin = 48
    radius = 120
    draw.rounded_rectangle(
        [margin, margin, SIZE - margin, SIZE - margin],
        radius=radius,
        fill=BG,
    )

    # Icon and text layout
    icon_cx = SIZE // 2
    icon_cy = int(SIZE * 0.32)
    text_y = int(SIZE * 0.60)

    # The WashingMachine viewBox is 0-24. We'll draw at a comfortable size.
    # Icon bounding box roughly x:[3,21], y:[2,22] so about 18x20 centered on 12,12
    icon_draw_size = int(SIZE * 0.30)
    scale = icon_draw_size / 24

    def s(v):
        """Scale a viewBox coordinate to pixels, centered on icon_cx, icon_cy."""
        return int((v - 12) * scale)

    sw = max(2, int(2 * scale))  # stroke width ~2 in viewBox coords

    # Create mask for the icon shapes
    pad = sw * 4
    mask_size = icon_draw_size + pad * 2
    mask_img = Image.new("L", (mask_size, mask_size), 0)
    mdraw = ImageDraw.Draw(mask_img)

    def mx(vx, vy):
        """Map viewBox to mask coords, centered."""
        return int(mask_size // 2 + (vx - 12) * scale)

    def my(vy):
        return int(mask_size // 2 + (vy - 12) * scale)

    # 1. Machine body: rounded rect (5,2) -> (19,22) with r=2
    body = [mx(5, 0), my(2), mx(19, 0), my(22)]
    br = max(1, int(2 * scale))
    mdraw.rounded_rectangle(body, radius=br, outline=255, width=sw)

    # 2. Top left button: line (3,6) -> (6,6)
    mdraw.line([mx(3, 0), my(6), mx(6, 0), my(6)], fill=255, width=sw)

    # 3. Top right dot: at (17,6)
    dr = max(1, sw // 2)
    mdraw.ellipse([mx(17, 0) - dr, my(6) - dr, mx(17, 0) + dr, my(6) + dr], fill=255)

    # 4. Door circle: center (12,13), r=5
    door_cx = mx(12, 0)
    door_cy = my(13)
    door_r = int(5 * scale)
    mdraw.ellipse(
        [door_cx - door_r, door_cy - door_r, door_cx + door_r, door_cy + door_r],
        outline=255,
        width=sw,
    )

    # 5. Drum circle: center (12,15.5), r=2.5
    drum_cx = mx(12, 0)
    drum_cy = my(15)
    drum_r = int(2.5 * scale)
    mdraw.ellipse(
        [drum_cx - drum_r, drum_cy - drum_r, drum_cx + drum_r, drum_cy + drum_r],
        outline=255,
        width=sw,
    )
    # Cross inside drum
    gs = int(drum_r * 0.55)
    mdraw.line([drum_cx - gs, drum_cy, drum_cx + gs, drum_cy], fill=255, width=sw)
    mdraw.line([drum_cx, drum_cy - gs, drum_cx, drum_cy + gs], fill=255, width=sw)

    # Apply gradient through mask
    grad = make_gradient(mask_size, mask_size, TEAL_START, TEAL_END)
    icon_layer = Image.composite(
        grad, Image.new("RGBA", (mask_size, mask_size), (0, 0, 0, 0)), mask_img
    )

    # Paste onto main image
    paste_x = (SIZE - mask_size) // 2
    paste_y = icon_cy - mask_size // 2
    img.paste(icon_layer, (paste_x, paste_y), icon_layer)

    # --- Text: GlownDry with Inter Black 900 ---
    font_size = int(SIZE * 0.06)
    font = ImageFont.truetype(FONT_BLACK, font_size)

    # Measure each part
    bb_g = font.getbbox("Glown")
    bb_d = font.getbbox("Dry")
    w_g = bb_g[2] - bb_g[0]
    w_d = bb_d[2] - bb_d[0]
    # Adjust bbox for descenders (y offset from baseline)
    # The font's ascent is negative in getbbox y-min, descent is y-max
    h_g = bb_g[3] - bb_g[1]
    h_d = bb_d[3] - bb_d[1]

    total_w = w_g + w_d
    x_g = (SIZE - total_w) // 2
    x_d = x_g + w_g

    # Draw text - adjust y so baseline aligns. y parameter is the top-left corner.
    draw.text((x_g, text_y), "Glown", fill=BLACK, font=font)
    draw.text((x_d, text_y), "Dry", fill=TEAL_START, font=font)

    # --- Optional "CUSTOMER" label ---
    try:
        lf = ImageFont.truetype(FONT_BOLD, int(SIZE * 0.023))
        lb = lf.getbbox("CUSTOMER")
        lw = lb[2] - lb[0]
        lx = (SIZE - lw) // 2
        ly = text_y + font_size + int(SIZE * 0.012)
        draw.text((lx, ly), "CUSTOMER", fill=TEAL_START, font=lf)
    except Exception:
        pass

    # --- Save ---
    img.save(OUTPUT, "PNG")
    print(f"Icon saved: {OUTPUT}  ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
