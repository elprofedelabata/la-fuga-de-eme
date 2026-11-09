"""Hoja de personaje de Eme (Mundo I: el cuaderno).

Genera eme_hoja_personaje.png en esta misma carpeta.
Se dibuja a escala S (supersampling) y se reduce al final para suavizar bordes.
"""
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFont

S = 3                      # factor de supersampling
W, H = 1800, 1200          # tamano final
PW, PH = 540, 470          # tamano de cada vineta
FONT_DIR = "C:/Windows/Fonts/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "eme_hoja_personaje.png")

# ---------- paleta ----------
PAPER = (251, 248, 239, 255)
CARD = (255, 254, 249, 255)
GRID = (200, 218, 236, 255)
MARGIN = (236, 160, 160, 255)
LEAD = (58, 53, 48, 255)
ORANGE = (242, 163, 58, 255)
ORANGE_D = (217, 130, 43, 255)
ORANGE_L = (252, 200, 120, 255)
TATTOO = (196, 108, 32, 255)
JULITO = (247, 208, 70, 255)
CALOR = (229, 83, 61, 255)
ICE = (212, 235, 247, 255)
SAND = (238, 210, 152, 255)
DIRT = (233, 225, 206, 255)
WHITE = (255, 255, 255, 255)
SWEAT = (150, 205, 240, 255)
SOFT = (110, 104, 98, 255)


def font(name, size):
    return ImageFont.truetype(FONT_DIR + name, int(size * S))


def P(pts):
    """Coordenadas finales -> coordenadas de trabajo."""
    return [(x * S, y * S) for x, y in pts]


# ---------- trazo de lapiz ----------
class Wob:
    def __init__(self, seed, amp):
        r = random.Random(seed)
        self.ph = [r.uniform(0, 6.283) for _ in range(3)]
        self.amp = amp

    def __call__(self, t):
        a = self.amp
        return a * (0.6 * math.sin(t / 23 + self.ph[0])
                    + 0.3 * math.sin(t / 9 + self.ph[1])
                    + 0.15 * math.sin(t / 4 + self.ph[2]))


def resample(pts, step):
    out = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / step))
        for i in range(1, n + 1):
            out.append((x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n))
    return out


def wobble(pts, seed=0, amp=1.2, closed=False):
    if closed:
        pts = list(pts) + [pts[0]]
    p = resample(pts, 4 * S)
    w = Wob(seed, amp)
    out, L = [], 0.0
    for i, (x, y) in enumerate(p):
        if i:
            L += math.hypot(x - p[i - 1][0], y - p[i - 1][1])
        a, b = p[max(i - 1, 0)], p[min(i + 1, len(p) - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        n = math.hypot(dx, dy) or 1
        o = w(L / S) * S
        out.append((x - dy / n * o, y + dx / n * o))
    if closed:
        out[-1] = out[0]
    return out


def pencil(d, pts, width=3, color=LEAD, seed=0, amp=1.2, closed=False, double=True):
    """pts en coordenadas de trabajo."""
    p = wobble(pts, seed, amp, closed)
    d.line(p, fill=color, width=max(1, int(width * S)), joint="curve")
    r = width * S / 2
    for x, y in (p[0], p[-1]):
        d.ellipse([x - r, y - r, x + r, y + r], fill=color)
    if double:
        p2 = wobble(pts, seed + 101, amp * 1.4, closed)
        d.line(p2, fill=color[:3] + (80,), width=max(1, int(width * S * 0.4)), joint="curve")
    return p


def rrect_pts(x0, y0, x1, y1, r):
    pts = []
    for cx, cy, a0, a1 in ((x1 - r, y0 + r, -90, 0), (x1 - r, y1 - r, 0, 90),
                           (x0 + r, y1 - r, 90, 180), (x0 + r, y0 + r, 180, 270)):
        for i in range(13):
            a = math.radians(a0 + (a1 - a0) * i / 12)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def hatch(img, poly, spacing=14, color=(0, 0, 0, 30), width=1.2, slope=1.0):
    """Rayado diagonal recortado a un poligono (coords de trabajo)."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    w, h = img.size
    step = spacing * S
    k = -h
    while k < w + h:
        ld.line([(k, h), (k + h * slope, 0)], fill=color, width=max(1, int(width * S)))
        k += step
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)
    a = ImageChops.multiply(layer.getchannel("A"), mask)
    layer.putalpha(a)
    img.alpha_composite(layer)


def square(d, cx, cy, size, angle, fill, seed=0):
    a = math.radians(angle)
    h = size / 2
    pts = []
    for sx, sy in ((-h, -h), (h, -h), (h, h), (-h, h)):
        pts.append((cx + sx * math.cos(a) - sy * math.sin(a), cy + sx * math.sin(a) + sy * math.cos(a)))
    pts = P(pts)
    d.polygon(pts, fill=fill)
    pencil(d, pts, 1.6, LEAD, seed, 0.3, closed=True, double=False)


def sweat(d, x, y, s):
    """Gota de sudor (coords de trabajo)."""
    R = s * 0.5
    yc = y + s * 0.3
    pts = [(x, y - s * 0.75)]
    for i in range(25):
        a = math.radians(-35 + 250 * i / 24)
        pts.append((x + R * math.cos(a), yc + R * math.sin(a)))
    d.polygon(pts, fill=SWEAT, outline=LEAD)
    d.line(pts + [pts[0]], fill=LEAD, width=int(S * 1.6), joint="curve")
    h = R * 0.28
    d.ellipse([x - R * 0.35 - h, yc - R * 0.2 - h, x - R * 0.35 + h, yc - R * 0.2 + h], fill=WHITE)


def star(d, x, y, r, color=LEAD):
    pts = []
    for i in range(8):
        rr = r if i % 2 == 0 else r * 0.3
        a = math.radians(i * 45 - 90)
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    d.polygon(P(pts), fill=color)


# ---------- Eme ----------
def make_eme(expr, B, sx=1.0, sy=1.0, flag=False, seed=1, **kw):
    B = B * S
    size = int(B * 2.4)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx = cy = size / 2
    bw, bh = B * sx, B * sy
    x0, y0, x1, y1 = cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2
    body = wobble(rrect_pts(x0, y0, x1, y1, 0.2 * min(bw, bh)), seed, 0.9, closed=True)

    # relleno con sombra y brillo, recortado al cuerpo
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(body, fill=255)
    fill = Image.new("RGBA", img.size, ORANGE)
    fd = ImageDraw.Draw(fill, "RGBA")
    fd.ellipse([cx - bw * 0.05, cy + bh * 0.05, cx + bw * 1.3, cy + bh * 1.4], fill=ORANGE_D)
    fd.ellipse([cx + bw * 0.25, cy - bh * 0.9, cx + bw * 1.3, cy + bh * 1.4], fill=ORANGE_D)
    for i in range(7):  # rayado de lapiz en la esquina inferior derecha
        t = bw * (0.12 + 0.07 * i)
        fd.line([(x1 - t, y1), (x1, y1 - t)], fill=(190, 105, 30, 120), width=int(S * 1.3))
    fd.line([(x0 + bw * 0.11, y0 + bh * 0.38), (x0 + bw * 0.11, y0 + bh * 0.16),
             (x0 + bw * 0.16, y0 + bh * 0.11), (x0 + bw * 0.38, y0 + bh * 0.1)],
            fill=ORANGE_L, width=int(B * 0.045), joint="curve")
    img = Image.composite(fill, img, mask)
    d = ImageDraw.Draw(img, "RGBA")
    lw = B * 0.022

    # la "m" que odia
    d.text((cx + bw * 0.27, cy + bh * 0.27), "m", font=font("segoeprb.ttf", B / S * 0.3),
           fill=TATTOO, anchor="mm")

    ex, ey = 0.2 * bw, cy - 0.1 * bh
    rx, ry = 0.12 * bw, 0.15 * bh
    lx, rxx = cx - ex, cx + ex
    mx, my = cx, cy + 0.18 * bh

    def eye(x, k=1.0, px=0.0, py=0.0, pr=0.45, lid=0.0):
        """lid: 0 = abierto, 0.5 = medio cerrado, 1 = cerrado."""
        a, b = rx * k, ry * k
        if lid >= 0.92:  # ojo cerrado: una curva
            d.arc([x - a, ey - b * 0.35, x + a, ey + b * 0.55], 15, 165, fill=LEAD, width=int(lw * 1.4))
            return
        box = [x - a, ey - b, x + a, ey + b]
        d.ellipse(box, fill=WHITE, outline=LEAD, width=int(lw))
        qx, qy, R = x + px * a * 0.45, ey + py * b * 0.45, a * pr
        d.ellipse([qx - R, qy - R, qx + R, qy + R], fill=LEAD)
        h = R * 0.32
        d.ellipse([qx - R * 0.35 - h, qy - R * 0.4 - h, qx - R * 0.35 + h, qy - R * 0.4 + h], fill=WHITE)
        if lid > 0.02:
            s = -1 + 2 * lid
            t0 = math.degrees(math.asin(s))
            d.chord(box, 180 - t0, 360 + t0, fill=ORANGE)
            d.arc(box, 180 - t0, 360 + t0, fill=LEAD, width=int(lw))
            yl, xr = ey + b * s, a * math.cos(math.radians(t0))
            d.line([(x - xr, yl), (x + xr, yl)], fill=LEAD, width=int(lw * 1.2))

    def eye_happy(x):
        d.arc([x - rx, ey - ry * 0.6, x + rx, ey + ry], 200, 340, fill=LEAD, width=int(lw * 1.4))

    def eye_squeeze(x, right):
        s = -1 if right else 1
        pts = [(x - s * rx * 0.7, ey - ry * 0.55), (x + s * rx * 0.6, ey), (x - s * rx * 0.7, ey + ry * 0.55)]
        d.line(pts, fill=LEAD, width=int(lw * 1.4), joint="curve")

    def brow(xa, ya, xb, yb):
        d.line([(xa, ya), (xb, yb)], fill=LEAD, width=int(lw * 1.4))

    def mouth(kind):
        if kind == "wavy":
            pts = [(mx - 0.11 * bw + 0.22 * bw * i / 30,
                    my + 0.018 * bh * math.sin(i / 30 * 4 * math.pi)) for i in range(31)]
            d.line(pts, fill=LEAD, width=int(lw * 1.2), joint="curve")
        elif kind == "O":
            d.ellipse([mx - 0.06 * bw, my - 0.05 * bh, mx + 0.06 * bw, my + 0.09 * bh], fill=LEAD)
            d.ellipse([mx - 0.035 * bw, my + 0.035 * bh, mx + 0.035 * bw, my + 0.08 * bh], fill=CALOR)
        elif kind == "grimace":
            box = [mx - 0.15 * bw, my - 0.04 * bh, mx + 0.15 * bw, my + 0.07 * bh]
            d.rounded_rectangle(box, radius=0.03 * bw, fill=WHITE, outline=LEAD, width=int(lw))
            d.line([(box[0], my + 0.015 * bh), (box[2], my + 0.015 * bh)], fill=LEAD, width=int(lw * 0.7))
            for i in (-1, 0, 1):
                d.line([(mx + i * 0.07 * bw, box[1]), (mx + i * 0.07 * bw, box[3])], fill=LEAD, width=int(lw * 0.7))
        elif kind == "smile":
            d.arc([mx - 0.12 * bw, my - 0.1 * bh, mx + 0.12 * bw, my + 0.05 * bh], 20, 160,
                  fill=LEAD, width=int(lw * 1.3))
        elif kind == "big":
            box = [mx - 0.15 * bw, my - 0.11 * bh, mx + 0.15 * bw, my + 0.12 * bh]
            d.chord(box, 0, 180, fill=LEAD)
            d.chord([mx - 0.075 * bw, my + 0.04 * bh, mx + 0.075 * bw, my + 0.115 * bh], 180, 360, fill=CALOR)
        elif kind == "flat":
            d.line([(mx - 0.09 * bw, my + 0.01 * bh), (mx + 0.08 * bw, my - 0.005 * bh)],
                   fill=LEAD, width=int(lw * 1.2))

    def blush(color=(240, 110, 110, 110)):
        for x in (cx - 0.3 * bw, cx + 0.3 * bw):
            d.ellipse([x - 0.065 * bw, my - 0.07 * bh, x + 0.065 * bw, my - 0.025 * bh], fill=color)

    if expr == "bored":
        eye(lx, px=0.2, py=0.55, lid=0.5)
        eye(rxx, px=0.2, py=0.55, lid=0.5)
        mouth("flat")
    elif expr == "idle":  # parametros continuos para animar
        px, py, lid = kw.get("px", 0.0), kw.get("py", 0.0), kw.get("lid", 0.0)
        eye(lx, px=px, py=py, lid=lid)
        eye(rxx, px=px, py=py, lid=lid)
        mouth(kw.get("mouth", "flat"))
    elif expr == "gulp":
        eye(lx, 1.05, px=0.7, py=0.75)
        eye(rxx, 1.05, px=0.7, py=0.75)
        brow(lx - 0.8 * rx, ey - 1.3 * ry, lx + 0.8 * rx, ey - 1.6 * ry)
        brow(rxx - 0.8 * rx, ey - 1.6 * ry, rxx + 0.8 * rx, ey - 1.3 * ry)
        mouth("wavy")
        sweat(d, x0 - 0.04 * bw, y0 + 0.18 * bh, 0.16 * B)
    elif expr == "fast":
        eye(lx, 1.25, pr=0.24)
        eye(rxx, 1.25, pr=0.24)
        brow(lx - 0.8 * rx, ey - 1.95 * ry, lx + 0.8 * rx, ey - 2.0 * ry)
        brow(rxx - 0.8 * rx, ey - 2.0 * ry, rxx + 0.8 * rx, ey - 1.95 * ry)
        mouth("O")
    elif expr == "effort":
        eye_squeeze(lx, False)
        eye_squeeze(rxx, True)
        brow(lx - 0.9 * rx, ey - 1.35 * ry, lx + 0.9 * rx, ey - 0.85 * ry)
        brow(rxx - 0.9 * rx, ey - 0.85 * ry, rxx + 0.9 * rx, ey - 1.35 * ry)
        mouth("grimace")
        blush((229, 83, 61, 120))
        sweat(d, x0 - 0.05 * bw, y0 + 0.12 * bh, 0.15 * B)
        sweat(d, x1 + 0.08 * bw, y0 + 0.02 * bh, 0.12 * B)
    elif expr == "ice":
        eye_happy(lx)
        eye_happy(rxx)
        mouth("smile")
        blush()
    elif expr == "edge":
        eye(lx, 1.0, px=0.0, py=0.1, pr=0.28)
        eye(rxx, 1.0, px=0.0, py=0.1, pr=0.28)
        brow(lx - 0.8 * rx, ey - 1.45 * ry, lx + 0.8 * rx, ey - 1.75 * ry)
        brow(rxx - 0.8 * rx, ey - 1.35 * ry, rxx + 0.8 * rx, ey - 1.35 * ry)
        mouth("wavy")
        sweat(d, x1 + 0.06 * bw, y0 + 0.1 * bh, 0.15 * B)
    elif expr == "win":
        eye_happy(lx)
        eye_happy(rxx)
        mouth("big")
        blush()

    # contorno de lapiz
    d.line(body, fill=LEAD, width=int(lw * 1.3), joint="curve")
    d.line(wobble(rrect_pts(x0, y0, x1, y1, 0.2 * min(bw, bh)), seed + 7, 1.4, closed=True),
           fill=LEAD[:3] + (70,), width=int(lw * 0.5), joint="curve")

    if flag:  # la bandera de meta como sombrero
        base = (cx + 0.06 * bw, y0 + 0.03 * bh)
        top = (cx + 0.14 * bw, y0 - 0.62 * B)
        d.line([base, top], fill=LEAD, width=int(lw * 1.4))
        tri = [top, (top[0] + 0.36 * B, top[1] + 0.1 * B), (top[0] + 0.02 * B, top[1] + 0.22 * B)]
        d.polygon(tri, fill=CALOR)
        pencil(d, tri, 1.6, LEAD, seed + 3, 0.4, closed=True, double=False)
    return img


def place(panel, eimg, cx, cy, angle=0.0):
    if angle:
        eimg = eimg.rotate(angle, resample=Image.BICUBIC)
    panel.paste(eimg, (int(cx * S - eimg.width / 2), int(cy * S - eimg.height / 2)), eimg)


def ground(panel, top, color, seed, hatched=True):
    d = ImageDraw.Draw(panel, "RGBA")
    poly = P(top + [(top[-1][0], PH + 20), (top[0][0], PH + 20)])
    d.polygon(poly, fill=color)
    if hatched:
        hatch(panel, poly, spacing=13, color=(90, 80, 60, 40))
    pencil(d, P(top), 3, LEAD, seed)
    return d


# ---------- vinetas ----------
B = 150


def v_salida(p, d):
    top = [(-10, 250), (300, 250), (335, 256), (365, 290), (392, 345), (420, 420), (445, 480)]
    d = ground(p, top, DIRT, 11)
    place(p, make_eme("gulp", B, seed=3), 220, 250 - B / 2)
    d.text(P([(345, 95)])[0], "glup", font=font("segoeprb.ttf", 30), fill=SOFT)
    # julitos de partida: Ep
    for i in range(8):
        square(d, 40 + (i % 2) * 22, 228 - (i // 2) * 22, 18, 0, JULITO, seed=i)
    d.text(P([(28, 120)])[0], "8", font=font("segoeprb.ttf", 22), fill=SOFT)


def v_velocidad(p, d):
    a, b = (-10, 110), (550, 410)
    d = ground(p, [a, b], DIRT, 12)
    th = math.atan2(b[1] - a[1], b[0] - a[0])
    ux, uy = math.cos(th), math.sin(th)
    nx, ny = math.sin(th), -math.cos(th)
    x = 300
    y = a[1] + (x - a[0]) * math.tan(th)
    sy = 0.94
    cx, cy = x + nx * B * sy / 2, y + ny * B * sy / 2
    place(p, make_eme("fast", B, sx=1.07, sy=sy, seed=4), cx, cy, -math.degrees(th))
    r = random.Random(5)
    for k in (-48, -18, 12, 42):
        sx0, sy0 = cx - ux * 115 + nx * k, cy - uy * 115 + ny * k
        L = r.uniform(70, 120)
        pencil(d, P([(sx0, sy0), (sx0 - ux * L, sy0 - uy * L)]), 2.4, SOFT, seed=k, double=False)
    d.text(P([(395, 60)])[0], "¡Uaaah!", font=font("segoeprb.ttf", 30), fill=SOFT)


def v_arena(p, d):
    top = [(-10, 290), (550, 290)]
    d = ground(p, top, SAND, 13, hatched=False)
    r = random.Random(6)
    for _ in range(260):
        x, y = r.uniform(0, PW), r.uniform(296, PH)
        rr = r.uniform(1.2, 2.6)
        d.ellipse([(x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S], fill=(196, 160, 96, 200))
    pile = [(338, 291), (352, 280), (370, 271), (392, 268), (410, 276), (424, 291)]
    d.polygon(P(pile), fill=SAND)
    pencil(d, P(pile), 2.6, LEAD, 31)
    place(p, make_eme("effort", B, sx=1.04, sy=0.96, seed=5), 265, 290 - B * 0.96 / 2)
    for (x, y, rr) in ((155, 272, 22), (122, 262, 17), (98, 280, 12), (175, 250, 12)):
        d.ellipse([(x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S], fill=(225, 214, 190, 255))
        pencil(d, P([(x + rr * math.cos(t / 20 * 6.283), y + rr * math.sin(t / 20 * 6.283)) for t in range(20)]),
               1.8, SOFT, seed=int(x), amp=0.6, closed=True, double=False)
    for i, (x, y, ang) in enumerate(((140, 205, 15), (95, 165, -20), (150, 135, 30))):
        square(d, x, y, 20, ang, CALOR, seed=40 + i)
        pencil(d, P([(x + 14, y + 12), (x + 30, y + 24)]), 1.6, CALOR, seed=60 + i, double=False)
    d.text(P([(40, 92)])[0], "+ calor", font=font("segoeprb.ttf", 26), fill=CALOR)


def v_hielo(p, d):
    top = [(-10, 290), (550, 290)]
    d = ground(p, top, ICE, 14, hatched=False)
    for x, y in ((60, 320), (200, 345), (330, 315), (450, 340), (120, 370)):
        d.line(P([(x, y), (x + 30, y - 12)]), fill=WHITE, width=int(4 * S))
        d.line(P([(x + 12, y + 8), (x + 26, y + 2)]), fill=WHITE, width=int(3 * S))
    place(p, make_eme("ice", B, seed=6), 255, 290 - B / 2)
    for y in (190, 222, 254):
        pencil(d, P([(90, y), (160, y)]), 2.2, SOFT, seed=y, double=False)
    star(d, 380, 170, 13)
    star(d, 415, 225, 9)
    star(d, 150, 120, 10)
    d.text(P([(355, 92)])[0], "uiii~", font=font("segoeprb.ttf", 32), fill=SOFT)


def v_borde(p, d):
    top = [(-10, 262), (330, 262), (330, 480)]
    d = ground(p, top, DIRT, 15)
    a = math.radians(11)
    ox, oy = -0.28 * B, -B / 2
    cx = 330 + ox * math.cos(a) - oy * math.sin(a)
    cy = 262 + ox * math.sin(a) + oy * math.cos(a)
    place(p, make_eme("edge", B, seed=7), cx, cy, -11)
    for (x, y, a0, a1) in ((cx - 105, cy - 70, 150, 210), (cx + 95, cy - 85, -30, 30)):
        for k in (0, 14):
            d.arc([(x - 20 - k) * S, (y - 20 - k) * S, (x + 20 + k) * S, (y + 20 + k) * S],
                  a0, a1, fill=SOFT, width=int(2.4 * S))
    for x, y, rr in ((362, 318, 6), (378, 365, 4.5)):
        d.ellipse([(x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S], fill=SOFT)
        pencil(d, P([(x, y - rr - 6), (x, y - rr - 20)]), 1.5, SOFT, seed=int(y), double=False)
    d.text(P([(cx - 10, 52)])[0], "…", font=font("segoeprb.ttf", 36), fill=SOFT)


def v_victoria(p, d):
    top = [(-10, 330), (550, 330)]
    d = ground(p, top, DIRT, 16)
    d.ellipse(P([(212, 322), (328, 340)]), fill=(90, 80, 70, 70))
    sy = 1.08
    place(p, make_eme("win", B, sx=0.93, sy=sy, flag=True, seed=8), 270, 215)
    for x in (238, 270, 302):
        pencil(d, P([(x, 300), (x, 318)]), 2.2, SOFT, seed=x, double=False)
    r = random.Random(9)
    for i, (x, y) in enumerate(((70, 80), (110, 190), (60, 270), (420, 70), (460, 170),
                                (400, 250), (150, 60), (480, 290), (360, 120))):
        square(d, x, y, r.uniform(14, 20), r.uniform(-40, 40), JULITO, seed=80 + i)


PANELS = [
    ("Salida", "«¿Desde el reposo? ¿Otra vez?»", v_salida),
    ("¡Velocidad!", "Ep → Ec. Mucha Ec.", v_velocidad),
    ("Frenando en arena", "Los julitos se van en calor.", v_arena),
    ("Hielo", "«Rozamiento despreciable. Por fin.»", v_hielo),
    ("Al borde, con 0 julitos", "«Esto… no llego.»", v_borde),
    ("¡Victoria!", "Ni más, ni menos.", v_victoria),
]


def make_panel(title, quote, scene, seed):
    p = Image.new("RGBA", (PW * S, PH * S), CARD)
    d = ImageDraw.Draw(p, "RGBA")
    scene(p, d)
    d = ImageDraw.Draw(p, "RGBA")
    strip = P([(14, 382), (526, 382), (526, 458), (14, 458)])
    d.rounded_rectangle([strip[0], strip[2]], radius=8 * S, fill=(255, 255, 255, 238))
    pencil(d, strip, 1.6, LEAD, seed + 50, 0.6, closed=True, double=False)
    d.text(P([(30, 388)])[0], title, font=font("segoeprb.ttf", 25), fill=LEAD)
    d.text(P([(30, 424)])[0], quote, font=font("segoepr.ttf", 18), fill=SOFT)
    return p


def main():
    sheet = Image.new("RGBA", (W * S, H * S), PAPER)
    d = ImageDraw.Draw(sheet, "RGBA")
    for x in range(0, W, 30):
        d.line([(x * S, 0), (x * S, H * S)], fill=GRID, width=S)
    for y in range(0, H, 30):
        d.line([(0, y * S), (W * S, y * S)], fill=GRID, width=S)
    d.line([(38 * S, 0), (38 * S, H * S)], fill=MARGIN, width=2 * S)

    # cabecera
    d.text(P([(70, 22)])[0], "Eme", font=font("segoeprb.ttf", 76), fill=LEAD)
    d.text(P([(76, 128)])[0], "hoja de personaje  ·  Mundo I: el cuaderno",
           font=font("segoepr.ttf", 22), fill=SOFT)
    place(sheet, make_eme("bored", 92, seed=2), 340, 82)
    bub = P([(420, 40), (930, 40), (930, 108), (420, 108)])
    d.rounded_rectangle([bub[0], bub[2]], radius=18 * S, fill=WHITE)
    pencil(d, bub, 2, LEAD, 70, 0.8, closed=True, double=False)
    d.polygon(P([(425, 70), (398, 84), (425, 88)]), fill=WHITE)
    pencil(d, P([(421, 66), (398, 84), (421, 92)]), 2, LEAD, 71, 0.3, double=False)
    d.text(P([(440, 56)])[0], "Otra vez un plano inclinado. Qué original.",
           font=font("segoepr.ttf", 22), fill=LEAD)

    sw = [("cuerpo", ORANGE), ("sombra", ORANGE_D), ("lápiz", LEAD), ("julito", JULITO), ("calor", CALOR)]
    d.text(P([(1150, 34)])[0], "paleta", font=font("segoeprb.ttf", 20), fill=SOFT)
    for i, (name, c) in enumerate(sw):
        x, y = 1180 + i * 120, 92
        d.ellipse(P([(x - 22, y - 22), (x + 22, y + 22)]), fill=c)
        pencil(d, P([(x + 22 * math.cos(t / 24 * 6.283), y + 22 * math.sin(t / 24 * 6.283)) for t in range(24)]),
               1.6, LEAD, 90 + i, 0.4, closed=True, double=False)
        d.text(P([(x, 126)])[0], name, font=font("segoepr.ttf", 16), fill=LEAD, anchor="mt")
        d.text(P([(x, 148)])[0], "#%02X%02X%02X" % c[:3], font=font("segoepr.ttf", 13), fill=SOFT, anchor="mt")

    # vinetas
    for i, (title, quote, scene) in enumerate(PANELS):
        col, row = i % 3, i // 3
        x, y = 60 + col * (PW + 30), 200 + row * (PH + 30)
        shadow = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle(P([(x + 5, y + 6), (x + PW + 5, y + PH + 6)]),
                                                 radius=4 * S, fill=(80, 70, 60, 40))
        sheet.alpha_composite(shadow)
        d = ImageDraw.Draw(sheet, "RGBA")
        panel = make_panel(title, quote, scene, i * 10)
        sheet.paste(panel, (x * S, y * S))
        pencil(d, P([(x, y), (x + PW, y), (x + PW, y + PH), (x, y + PH)]), 2.2, LEAD, 200 + i, 0.8, closed=True)
        for tx, ang in ((x + 30, -18), (x + PW - 30, 16)):
            a = math.radians(ang)
            pts = [(tx + u * math.cos(a) - v * math.sin(a), y + u * math.sin(a) + v * math.cos(a))
                   for u, v in ((-38, -12), (38, -12), (38, 12), (-38, 12))]
            d.polygon(P(pts), fill=(236, 226, 196, 150))

    out = sheet.resize((W, H), Image.LANCZOS).convert("RGB")
    out.save(OUT, optimize=True)
    print("ok", OUT)


if __name__ == "__main__":
    main()
