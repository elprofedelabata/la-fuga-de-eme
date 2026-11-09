"""Boceto de interfaz movil (vertical): montaje, lanzamiento y resultado del nivel 1.

Genera boceto_interfaz_movil.png en esta carpeta.
"""
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw

import eme_hoja_personaje as E

S = E.S
P = E.P
F = E.font
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "boceto_interfaz_movil.png")

SW, SH = 390, 844                  # pantalla del movil (px CSS)
BX0, BY0, BS = 12, 170, 366        # tablero
CELL = BS / 3
CU = BS / 9                        # un cuadrito = 1 julito de altura

EP_BLUE = (92, 142, 230, 255)
WOOD = (205, 150, 92, 255)
ASPHALT = (150, 150, 156, 255)
FELPUDO = (178, 74, 60, 255)
GRAYF = (120, 120, 120, 45)
SUBGRID = (226, 235, 245, 255)     # cuadritos del tablero, mas suaves que el papel
CELL_LINE = (160, 163, 170, 255)     # divisiones de la rejilla 3x3


# ---------- utilidades ----------
def bp(x, h):
    """(x, altura) en cuadritos -> px de pantalla."""
    return (BX0 + x * CU, BY0 + BS - h * CU)


def cell_rect(n):
    c, r = (n - 1) % 3, (n - 1) // 3
    return (BX0 + c * CELL, BY0 + r * CELL, BX0 + (c + 1) * CELL, BY0 + (r + 1) * CELL)


def cell_of(x, h):
    c = min(max(int(x // 3), 0), 2)
    r = min(max(int(h // 3), 0), 2)
    return (2 - r) * 3 + c + 1


def rect(d, box, fill=None, outline=None, width=0, radius=0):
    d.rounded_rectangle(P([box[:2], box[2:]]), radius=radius * S, fill=fill,
                        outline=outline, width=int(width * S))


def prect(d, box, radius=10, width=1.8, color=E.LEAD, seed=0, amp=0.5):
    x0, y0, x1, y1 = box
    E.pencil(d, P(E.rrect_pts(x0, y0, x1, y1, radius)), width, color, seed, amp, closed=True, double=False)


def text(d, xy, s, size, color=E.LEAD, bold=False, anchor="la", face=None):
    f = F(face or ("segoeprb.ttf" if bold else "segoepr.ttf"), size)
    d.text(P([xy])[0], s, font=f, fill=color, anchor=anchor)


def dashed(d, pts, dash=7, gap=5, width=2, color=E.LEAD):
    p = E.resample(pts, 1)
    run, acc, on = [], 0.0, True
    for i in range(1, len(p)):
        seg = math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])
        acc += seg
        if on:
            run.append(p[i])
        if acc >= (dash if on else gap):
            if on and len(run) > 1:
                d.line(P(run), fill=color, width=int(width * S))
            on, acc, run = not on, 0.0, [p[i]]
    if on and len(run) > 1:
        d.line(P(run), fill=color, width=int(width * S))


def star5(d, cx, cy, r, fill, outline=E.LEAD):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.45
        a = math.radians(-90 + i * 36)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    if fill:
        d.polygon(P(pts), fill=fill)
    E.pencil(d, P(pts), 1.5, outline, int(cx), 0.2, closed=True, double=False)


def tri(d, cx, cy, s, fill):
    d.polygon(P([(cx - s * 0.45, cy - s * 0.6), (cx + s * 0.65, cy), (cx - s * 0.45, cy + s * 0.6)]), fill=fill)


def replay(d, cx, cy, r, color=E.LEAD):
    d.arc(P([(cx - r, cy - r), (cx + r, cy + r)]), -60, 230, fill=color, width=int(2.4 * S))
    a = math.radians(-60)
    x, y = cx + r * math.cos(a), cy + r * math.sin(a)
    d.polygon(P([(x - 6, y - 4), (x + 4, y - 7), (x + 2, y + 5)]), fill=color)


# ---------- pista y terreno ----------
def track(bshape):
    pts = [(0, 8), (1.2, 8)]
    for i in range(1, 41):
        th = i / 40 * math.pi / 2
        pts.append((1.2 + 1.8 * (1 - math.cos(th)), 1 + 7 * (1 - math.sin(th))))
    if bshape == "dip":
        for i in range(1, 31):
            x = 3 + 3 * i / 30
            pts.append((x, 1 - 0.75 * math.sin(math.pi * (x - 3) / 3)))
    else:
        pts.append((6, 1))
    for i in range(1, 31):
        u = i / 30
        pts.append((6 + 1.4 * u, 1 + 3 * u * u * (3 - 2 * u)))
    pts.append((9, 4))
    return pts


def mat_layer(size, box, mat, seed):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    x0, y0, x1, y1 = box
    col = {"fixed": E.DIRT, "ice": E.ICE, "sand": E.SAND, "wood": WOOD, "asphalt": ASPHALT}[mat]
    d.rectangle(P([(x0, y0), (x1, y1)]), fill=col)
    r = random.Random(seed)
    w, h = x1 - x0, y1 - y0
    if mat == "fixed":
        k = -h
        while k < w:
            d.line(P([(x0 + k, y1), (x0 + k + h, y0)]), fill=(90, 80, 60, 45), width=S)
            k += 9
    elif mat == "sand":
        for _ in range(int(w * h / 18)):
            x, y, rr = r.uniform(x0, x1), r.uniform(y0, y1), r.uniform(0.6, 1.4)
            d.ellipse(P([(x - rr, y - rr), (x + rr, y + rr)]), fill=(190, 152, 90, 220))
    elif mat == "asphalt":
        for _ in range(int(w * h / 14)):
            x, y, rr = r.uniform(x0, x1), r.uniform(y0, y1), r.uniform(0.5, 1.1)
            c = (95, 95, 100, 220) if r.random() < 0.6 else (205, 205, 210, 220)
            d.ellipse(P([(x - rr, y - rr), (x + rr, y + rr)]), fill=c)
    elif mat == "wood":
        y = y0 + 4
        while y < y1:
            d.line(P([(x0, y), (x1, y)]), fill=(150, 98, 50, 200), width=S)
            jx = x0 + r.uniform(0, w)
            d.line(P([(jx, y), (jx, y + 8)]), fill=(150, 98, 50, 200), width=S)
            y += 8
    elif mat == "ice":
        for _ in range(int(w * h / 500) + 1):
            x, y = r.uniform(x0, x1 - 12), r.uniform(y0, y1)
            d.line(P([(x, y), (x + 12, y - 5)]), fill=(255, 255, 255, 230), width=int(2 * S))
    return layer


def paint_terrain(img, poly, box, mat, seed):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(P(poly), fill=255)
    clip = Image.new("L", img.size, 0)
    ImageDraw.Draw(clip).rectangle(P([box[:2], box[2:]]), fill=255)
    mask = ImageChops.multiply(mask, clip)
    layer = mat_layer(img.size, box, mat, seed)
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), mask))
    img.alpha_composite(layer)


def pencil_runs(d, pts, keep, width=2.6, seed=0):
    run = []
    for p in pts:
        if keep(p):
            run.append(p)
        else:
            if len(run) > 1:
                E.pencil(d, P(run), width, E.LEAD, seed + len(run), 0.8)
            run = []
    if len(run) > 1:
        E.pencil(d, P(run), width, E.LEAD, seed + 3, 0.8)


def cell_thumb(img, box, cell, mat, bshape, seed):
    """Miniatura de una pieza: la celda real del nivel con ese material."""
    d = ImageDraw.Draw(img, "RGBA")
    x0, y0, x1, y1 = box
    rect(d, box, fill=E.CARD, radius=4)
    for i in range(1, 3):
        d.line(P([(x0 + (x1 - x0) * i / 3, y0), (x0 + (x1 - x0) * i / 3, y1)]), fill=E.GRID, width=S)
        d.line(P([(x0, y0 + (y1 - y0) * i / 3), (x1, y0 + (y1 - y0) * i / 3)]), fill=E.GRID, width=S)
    c, r = (cell - 1) % 3, (cell - 1) // 3
    cx0, ch0 = c * 3, (2 - r) * 3

    def tf(p):
        return (x0 + (p[0] - cx0) / 3 * (x1 - x0), y1 - (p[1] - ch0) / 3 * (y1 - y0))

    tr = track(bshape)
    poly = [tf(p) for p in tr + [(9, -1), (0, -1)]]
    paint_terrain(img, poly, box, mat, seed)
    d = ImageDraw.Draw(img, "RGBA")
    pts = [tf(p) for p in tr if cx0 - 0.2 <= p[0] <= cx0 + 3.2 and ch0 - 0.2 <= p[1] <= ch0 + 3.2]
    if len(pts) > 1:
        E.pencil(d, P(pts), 2, E.LEAD, seed, 0.4, double=False)
    prect(d, box, 4, 1.2, E.SOFT, seed + 1, 0.2)


def draw_board(img, a_mat, b_mat, b_shape, seed=0, holes=None):
    """a_mat/b_mat: material del hueco A (celda 4) y B (celda 8), o None si esta vacio."""
    d = ImageDraw.Draw(img, "RGBA")
    rect(d, (BX0, BY0, BX0 + BS, BY0 + BS), fill=E.CARD, radius=6)
    for i in range(1, 9):
        if i % 3:
            d.line(P([(BX0 + i * CU, BY0), (BX0 + i * CU, BY0 + BS)]), fill=SUBGRID, width=S)
            d.line(P([(BX0, BY0 + i * CU), (BX0 + BS, BY0 + i * CU)]), fill=SUBGRID, width=S)
    tr = track(b_shape or "flat")
    poly = [bp(*p) for p in tr + [(9, 0), (0, 0)]]
    mats = {4: a_mat, 8: b_mat}
    for n in range(1, 10):
        m = mats.get(n, "fixed")
        if m:
            paint_terrain(img, poly, cell_rect(n), m, seed + n)
    d = ImageDraw.Draw(img, "RGBA")
    empty = {n for n, m in mats.items() if m is None}
    pencil_runs(d, [bp(*p) for p in tr], lambda q: True, seed=seed)
    # los huecos vacios se limpian encima del trazo
    for n in empty:
        x0, y0, x1, y1 = cell_rect(n)
        d.rectangle(P([(x0 + 1, y0 + 1), (x1 - 1, y1 - 1)]), fill=E.CARD)
        for i in range(1, 3):
            d.line(P([(x0 + i * CU, y0), (x0 + i * CU, y1)]), fill=SUBGRID, width=S)
            d.line(P([(x0, y0 + i * CU), (x1, y0 + i * CU)]), fill=SUBGRID, width=S)

    # felpudo y meta
    fx0, fy = bp(7.6, 4)
    fx1, _ = bp(8.55, 4)
    d.rectangle(P([(fx0, fy - 6), (fx1, fy)]), fill=FELPUDO)
    for k in range(int(fx0) + 4, int(fx1), 6):
        d.line(P([(k, fy - 6), (k, fy)]), fill=(220, 120, 100, 255), width=S)
    E.pencil(d, P([(fx0, fy - 6), (fx1, fy - 6)]), 1.2, E.LEAD, 5, 0.2, double=False)
    # rejilla 3x3 bien marcada, por encima del terreno
    for i in (1, 2):
        E.pencil(d, P([(BX0 + i * CELL, BY0), (BX0 + i * CELL, BY0 + BS)]), 2.4, CELL_LINE, 400 + i, 0.6)
        E.pencil(d, P([(BX0, BY0 + i * CELL), (BX0 + BS, BY0 + i * CELL)]), 2.4, CELL_LINE, 410 + i, 0.6)
    # regla de alturas (en julitos)
    for h in range(0, 10):
        text(d, (BX0 + 4, BY0 + BS - h * CU), str(h), 9, (110, 140, 180, 255), anchor="lb")
    return empty


def draw_flag(d, x=8.8):
    base = bp(x, 4)
    top = bp(x, 5.6)
    d.line(P([base, top]), fill=E.LEAD, width=int(2.2 * S))
    tri_pts = [top, (top[0] + 22, top[1] + 7), (top[0], top[1] + 15)]
    d.polygon(P(tri_pts), fill=E.CALOR)
    E.pencil(d, P(tri_pts), 1.3, E.LEAD, 9, 0.2, closed=True, double=False)


def hole(d, n, kind, state):
    """state: 'idle', 'active' (late, aqui encaja) o 'dim' (no encaja)."""
    x0, y0, x1, y1 = cell_rect(n)
    box = (x0 + 7, y0 + 7, x1 - 7, y1 - 7)
    if state == "active":
        rect(d, (x0 + 3, y0 + 3, x1 - 3, y1 - 3), outline=E.ORANGE[:3] + (110,), width=6, radius=12)
        rect(d, box, fill=E.ORANGE[:3] + (45,), radius=9)
        col = E.ORANGE_D
    elif state == "dim":
        rect(d, box, fill=GRAYF, radius=9)
        col = (150, 150, 150, 255)
    else:
        col = E.SOFT
    dashed(d, E.rrect_pts(*box, 9) + [E.rrect_pts(*box, 9)[0]], 7, 5, 2.2 if state == "active" else 1.6, col)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if kind == "ramp":
        pts = [(cx - 14 + 28 * (1 - math.cos(t / 10 * math.pi / 2)), cy - 18 + 30 * (1 - math.sin(t / 10 * math.pi / 2)))
               for t in range(11)]
        pts = [(cx - 10, cy - 20)] + [(cx - 10 + 22 * (t / 10) ** 2, cy - 20 + 34 * (t / 10)) for t in range(1, 11)]
        d.line(P(pts), fill=col, width=int(2.6 * S), joint="curve")
        label = "rampa"
        conns = [bp(1.28, 6), bp(1.74, 3)]
    else:
        d.line(P([(cx - 20, cy + 4), (cx + 20, cy + 4)]), fill=col, width=int(2.6 * S))
        label = "suelo"
        conns = [bp(3, 1), bp(6, 1)]
    text(d, (cx, cy + 22), label, 11, col, anchor="mm")
    if state == "active":
        text(d, (cx, cy + 40), "¡toca aquí!", 11, E.ORANGE_D, bold=True, anchor="mm")
    for (x, y) in conns:
        d.ellipse(P([(x - 4.5, y - 4.5), (x + 4.5, y + 4.5)]), fill=col if state != "dim" else (150, 150, 150, 255))


# ---------- piezas de la interfaz ----------
def status_bar(d):
    text(d, (30, 16), "9:41", 15, E.LEAD, face="segoeuib.ttf")
    for i in range(4):
        d.rectangle(P([(300 + i * 6, 28 - i * 3), (304 + i * 6, 31)]), fill=E.LEAD)
    rect(d, (332, 19, 358, 31), outline=E.LEAD, width=1.4, radius=3)
    rect(d, (334, 21, 352, 29), fill=E.LEAD, radius=2)
    d.rectangle(P([(359, 23), (361, 27)]), fill=E.LEAD)


def top_bar(d, stars=0):
    for y in (62, 70, 78):
        E.pencil(d, P([(18, y), (40, y)]), 2.4, E.LEAD, y, 0.3, double=False)
    text(d, (180, 70), "Nivel 1 · Ni más, ni menos", 15, E.LEAD, bold=True, anchor="mm")
    for i in range(3):
        star5(d, 318 + i * 23, 70, 10, E.JULITO if i < stars else None, E.LEAD if i < stars else (170, 165, 160, 255))


def julitos_bar(d, ep, ec, cal):
    rect(d, (12, 100, 378, 158), fill=(255, 255, 255, 235), radius=10)
    prect(d, (12, 100, 378, 158), 10, 1.6, E.LEAD, 31)
    cols = [EP_BLUE] * ep + [E.JULITO] * ec + [E.CALOR] * cal
    for i, c in enumerate(cols):
        E.square(d, 34 + i * 26, 129, 21, 0, c, seed=i)
    for j, (name, c, v) in enumerate((("Ep", EP_BLUE, ep), ("Ec", E.JULITO, ec), ("calor", E.CALOR, cal))):
        y = 113 + j * 16
        d.rectangle(P([(254, y - 5), (264, y + 5)]), fill=c)
        text(d, (271, y), name, 11, E.LEAD, anchor="lm")
        text(d, (362, y), str(v), 12, E.LEAD, bold=True, anchor="rm")


def piece_card(img, x, y, name1, name2, loss, cell, mat, bshape, selected=False, seed=0):
    d = ImageDraw.Draw(img, "RGBA")
    w, h = 100, 124
    if selected:
        y -= 12
        rect(d, (x + 3, y + 8, x + w + 3, y + h + 8), fill=(80, 70, 60, 50), radius=12)
    rect(d, (x, y, x + w, y + h), fill=(255, 255, 255, 255), radius=12)
    if selected:
        rect(d, (x - 3, y - 3, x + w + 3, y + h + 3), outline=E.ORANGE[:3] + (120,), width=5, radius=14)
        prect(d, (x, y, x + w, y + h), 12, 2.6, E.ORANGE_D, seed)
    else:
        prect(d, (x, y, x + w, y + h), 12, 1.6, E.LEAD, seed)
    cell_thumb(img, (x + 20, y + 10, x + 80, y + 70), cell, mat, bshape, seed)
    d = ImageDraw.Draw(img, "RGBA")
    text(d, (x + w / 2, y + 86), name1, 12, E.LEAD, bold=True, anchor="mm")
    text(d, (x + w / 2, y + 104), name2, 12, E.SOFT, anchor="mm")
    sc = E.CALOR if loss else (150, 150, 150, 255)
    rect(d, (x + 66, y - 8, x + 104, y + 14), fill=sc, radius=8)
    text(d, (x + 85, y + 3), f"−{loss}", 12, (255, 255, 255, 255), face="segoeuib.ttf", anchor="mm")


def pill(d, box, label, primary=False, glyph=None, seed=0, size=18):
    fill = E.ORANGE if primary else (255, 255, 255, 255)
    rect(d, box, fill=fill, radius=(box[3] - box[1]) / 2)
    prect(d, box, (box[3] - box[1]) / 2, 2.2 if primary else 1.6, E.LEAD, seed)
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    if glyph and label:
        tw = d.textlength(label, font=F("segoeprb.ttf", size)) / S
        gx = cx - (tw + 26) / 2 + 8
        glyph(gx, cy)
        text(d, (gx + 18, cy), label, size, E.LEAD, bold=True, anchor="lm")
    elif glyph:
        glyph(cx, cy)
    else:
        text(d, (cx, cy), label, size, E.LEAD, bold=True, anchor="mm")


def home_indicator(d):
    rect(d, (128, 828, 262, 833), fill=E.LEAD, radius=3)


def new_screen():
    img = Image.new("RGBA", (SW * S, SH * S), E.PAPER)
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(0, SW, 20):
        d.line(P([(x, 0), (x, SH)]), fill=(214, 228, 242, 255), width=S)
    for y in range(0, SH, 20):
        d.line(P([(0, y), (SW, y)]), fill=(214, 228, 242, 255), width=S)
    return img


def eme_at(img, expr, x, h, B=38, **kw):
    E.place(img, E.make_eme(expr, B, **kw), *(lambda p: (p[0], p[1] - B * kw.get("sy", 1) / 2))(bp(x, h)))


# ---------- pantallas ----------
def screen_montaje():
    img = new_screen()
    d = ImageDraw.Draw(img, "RGBA")
    status_bar(d)
    top_bar(d)
    julitos_bar(d, 8, 0, 0)
    draw_board(img, None, None, None, seed=10)
    d = ImageDraw.Draw(img, "RGBA")
    hole(d, 4, "ramp", "active")
    hole(d, 8, "floor", "dim")
    draw_flag(d)
    prect(d, (BX0, BY0, BX0 + BS, BY0 + BS), 6, 2.2, E.LEAD, 77)
    eme_at(img, "gulp", 0.55, 8, seed=3)

    # bocadillo de Eme
    d = ImageDraw.Draw(img, "RGBA")
    bub = (146, 184, 370, 244)
    rect(d, bub, fill=(255, 255, 255, 255), radius=14)
    prect(d, bub, 14, 1.8, E.LEAD, 41)
    d.polygon(P([(150, 206), (64, 196), (150, 224)]), fill=(255, 255, 255, 255))
    E.pencil(d, P([(147, 204), (64, 196), (147, 226)]), 1.8, E.LEAD, 42, 0.3, double=False)
    text(d, (160, 200), "«Desprecie el rozamiento»,", 13, E.LEAD, anchor="lm")
    text(d, (160, 224), "dicen. Ojalá.", 13, E.LEAD, anchor="lm")

    # bandeja
    text(d, (16, 546), "Piezas", 12, E.LEAD, bold=True, anchor="lm")
    text(d, (68, 546), "· toca una · desliza para ver más ›", 11, E.SOFT, anchor="lm")
    piece_card(img, 16, 580, "Rampa", "de hielo", 0, 4, "ice", "flat", seed=50)
    piece_card(img, 126, 580, "Rampa", "de arena", 3, 4, "sand", "flat", selected=True, seed=51)
    piece_card(img, 236, 580, "Suelo", "de madera", 1, 8, "wood", "flat", seed=52)
    piece_card(img, 346, 580, "Suelo", "de asfalto", 2, 8, "asphalt", "flat", seed=53)

    d = ImageDraw.Draw(img, "RGBA")
    pill(d, (18, 718, 82, 782), "", glyph=lambda x, y: replay(d, x, y, 13), seed=60)
    pill(d, (96, 718, 372, 782), "LANZAR", primary=True, glyph=lambda x, y: tri(d, x, y, 16, E.LEAD), seed=61, size=22)
    home_indicator(d)
    return img


def screen_lanzamiento():
    img = new_screen()
    d = ImageDraw.Draw(img, "RGBA")
    status_bar(d)
    top_bar(d)
    julitos_bar(d, 0, 5, 3)
    draw_board(img, "sand", "ice", "dip", seed=20)
    d = ImageDraw.Draw(img, "RGBA")
    draw_flag(d)
    prect(d, (BX0, BY0, BX0 + BS, BY0 + BS), 6, 2.2, E.LEAD, 78)
    # calor que se escapa de la rampa de arena
    for i, (x, h, a) in enumerate(((2.3, 4.6, 15), (2.7, 5.4, -20), (2.2, 6.1, 30))):
        E.square(d, *bp(x, h), 10, a, E.CALOR, seed=90 + i)
    # lineas de velocidad
    for k, y in enumerate((0.55, 0.95, 1.35)):
        a, b = bp(3.15, y + 0.15), bp(3.9, y)
        E.pencil(d, P([a, b]), 1.8, E.SOFT, 100 + k, 0.3, double=False)
    eme_at(img, "fast", 4.5, 0.25, sx=1.06, sy=0.95, seed=4)

    # panel de energia en directo (sustituye a la bandeja)
    d = ImageDraw.Draw(img, "RGBA")
    rect(d, (12, 552, 378, 690), fill=(255, 255, 255, 240), radius=12)
    prect(d, (12, 552, 378, 690), 12, 1.6, E.LEAD, 70)
    text(d, (28, 572), "Energía en directo", 14, E.LEAD, bold=True, anchor="lm")
    text(d, (362, 572), "piezas bloqueadas", 11, E.SOFT, anchor="rm")
    x0, x1, y0, y1 = 28, 362, 592, 634
    xm = x0 + (x1 - x0) * 5 / 8
    d.rectangle(P([(x0, y0), (xm, y1)]), fill=E.JULITO)
    d.rectangle(P([(xm, y0), (x1, y1)]), fill=E.CALOR)
    for i in range(1, 8):
        xx = x0 + (x1 - x0) * i / 8
        d.line(P([(xx, y0), (xx, y1)]), fill=(255, 255, 255, 150), width=S)
    prect(d, (x0, y0, x1, y1), 4, 1.8, E.LEAD, 71, 0.3)
    text(d, ((x0 + xm) / 2, (y0 + y1) / 2), "Ec · 5", 15, E.LEAD, bold=True, anchor="mm")
    text(d, ((xm + x1) / 2, (y0 + y1) / 2), "calor · 3", 15, (255, 255, 255, 255), bold=True, anchor="mm")
    text(d, (28, 652), "Ep · 0  (Eme está en lo más hondo)", 12, E.SOFT, anchor="lm")
    text(d, (28, 672), "Total: 8 julitos. Siempre.", 12, E.LEAD, bold=True, anchor="lm")

    # controles de reproduccion
    def pause(x, y):
        d.rectangle(P([(x - 7, y - 9), (x - 2, y + 9)]), fill=E.LEAD)
        d.rectangle(P([(x + 2, y - 9), (x + 7, y + 9)]), fill=E.LEAD)

    def stop(x, y):
        d.rectangle(P([(x - 8, y - 8), (x + 8, y + 8)]), fill=E.LEAD)

    specs = [((20, 712, 100, 768), "", pause, False, "pausa"),
             ((110, 712, 190, 768), "×0,5", None, True, "cámara lenta"),
             ((200, 712, 280, 768), "×1", None, False, "normal"),
             ((290, 712, 370, 768), "", stop, False, "parar")]
    for i, (box, lab, g, prim, cap) in enumerate(specs):
        pill(d, box, lab, primary=prim, glyph=g, seed=80 + i, size=18)
        text(d, ((box[0] + box[2]) / 2, 784), cap, 11, E.SOFT, anchor="mm")
    home_indicator(d)
    return img


def screen_resultado():
    img = new_screen()
    d = ImageDraw.Draw(img, "RGBA")
    status_bar(d)
    top_bar(d, stars=3)
    julitos_bar(d, 4, 0, 4)
    draw_board(img, "sand", "ice", "dip", seed=30)
    d = ImageDraw.Draw(img, "RGBA")
    prect(d, (BX0, BY0, BX0 + BS, BY0 + BS), 6, 2.2, E.LEAD, 79)
    eme_at(img, "win", 8.1, 4, flag=True, sx=0.95, sy=1.05, seed=8)
    d = ImageDraw.Draw(img, "RGBA")
    r = random.Random(3)
    for i in range(16):
        x, y = r.uniform(30, 370), r.uniform(180, 420)
        if 300 < x and y > 300:
            continue
        E.square(d, x, y, r.uniform(7, 11), r.uniform(-40, 40), E.JULITO, seed=200 + i)

    # panel inferior
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(P([(0, 536), (SW, SH + 30)]), radius=26 * S, fill=(60, 50, 40, 45))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img, "RGBA")
    rect(d, (0, 544, SW, SH + 30), fill=(255, 255, 255, 255), radius=24)
    rp = E.rrect_pts(0, 544, SW, SH + 30, 24)
    E.pencil(d, P(rp[39:] + rp[:13]), 1.8, E.LEAD, 300, 0.4, double=False)
    rect(d, (176, 553, 214, 558), fill=(190, 185, 180, 255), radius=3)
    text(d, (24, 586), "¡Conseguido!", 26, E.LEAD, bold=True, anchor="lm")
    for i in range(3):
        star5(d, 300 + i * 30, 582, 13, E.JULITO)
    text(d, (330, 606), "¡a la primera!", 11, E.SOFT, anchor="mm")
    text(d, (24, 624), "Balance de energía", 13, E.SOFT, anchor="lm")
    groups = [(4, EP_BLUE, "altura meta"), (3, E.CALOR, "arena"), (1, E.CALOR, "felpudo")]
    x = 34
    for n, c, lab in groups:
        gx0 = x
        for _ in range(n):
            E.square(d, x, 652, 22, 0, c, seed=int(x))
            x += 27
        gx1 = x - 27
        E.pencil(d, P([(gx0 - 9, 671), (gx0 - 9, 676), (gx1 + 9, 676), (gx1 + 9, 671)]), 1.3, E.SOFT,
                 int(x), 0.2, double=False)
        text(d, ((gx0 + gx1) / 2, 690), f"{lab} · {n}", 11, E.LEAD, anchor="mm")
        x += 16
    text(d, (24, 722), "8 = 4 + 3 + 1", 19, E.LEAD, bold=True, anchor="lm")
    text(d, (366, 722), "«Ni más, ni menos.»", 13, E.SOFT, anchor="rm")
    pill(d, (20, 752, 178, 806), "Reintentar", glyph=lambda x, y: replay(d, x, y, 9), seed=310, size=16)
    pill(d, (192, 752, 370, 806), "Siguiente", primary=True, glyph=lambda x, y: tri(d, x, y, 13, E.LEAD),
         seed=311, size=17)
    home_indicator(d)
    return img


# ---------- composicion ----------
def phone(screen):
    bz = 12
    W_, H_ = SW + 2 * bz, SH + 2 * bz
    ph = Image.new("RGBA", (W_ * S, H_ * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(ph, "RGBA")
    d.rounded_rectangle(P([(0, 0), (W_, H_)]), radius=58 * S, fill=(44, 42, 46, 255))
    mask = Image.new("L", screen.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([(0, 0), screen.size], radius=46 * S, fill=255)
    ph.paste(screen, (bz * S, bz * S), mask)
    d.rounded_rectangle(P([(W_ / 2 - 58, bz + 10), (W_ / 2 + 58, bz + 40)]), radius=15 * S, fill=(20, 20, 22, 255))
    return ph


def main():
    W, H = 1800, 1260
    sheet = Image.new("RGBA", (W * S, H * S), E.PAPER)
    d = ImageDraw.Draw(sheet, "RGBA")
    for x in range(0, W, 30):
        d.line([(x * S, 0), (x * S, H * S)], fill=E.GRID, width=S)
    for y in range(0, H, 30):
        d.line([(0, y * S), (W * S, y * S)], fill=E.GRID, width=S)
    d.line([(38 * S, 0), (38 * S, H * S)], fill=E.MARGIN, width=2 * S)

    text(d, (70, 20), "Boceto de interfaz", 58, E.LEAD, bold=True)
    text(d, (76, 112), "Móvil en vertical  ·  Nivel 1 «Ni más, ni menos»  ·  pantalla 390 × 844",
         22, E.SOFT)
    bub = (1150, 48, 1600, 112)
    rect(d, bub, fill=(255, 255, 255, 255), radius=18)
    prect(d, bub, 18, 2, E.LEAD, 500)
    d.polygon(P([(1596, 72), (1628, 86), (1596, 92)]), fill=(255, 255, 255, 255))
    E.pencil(d, P([(1599, 68), (1628, 86), (1599, 96)]), 2, E.LEAD, 501, 0.3, double=False)
    text(d, (1375, 80), "¿Tres veces en la misma imagen? Vale.", 19, E.LEAD, anchor="mm")
    E.place(sheet, E.make_eme("bored", 84, seed=2), 1690, 84)

    screens = [
        (screen_montaje(), "1 · Montaje",
         ["Tocas una pieza: se levanta y los huecos", "donde encaja laten; los demás se apagan.",
          "Tocas el hueco y la pieza se coloca."]),
        (screen_lanzamiento(), "2 · Lanzamiento",
         ["La bandeja se repliega y aparece la energía", "en directo. Cámara lenta para verlo en clase.",
          "Las piezas quedan bloqueadas."]),
        (screen_resultado(), "3 · Resultado",
         ["Sube un panel con las estrellas y el balance", "de energía del intento: siempre suma 8.",
          "Reintentar o pasar al siguiente nivel."]),
    ]
    gap = 150
    pw = SW + 24
    x0 = (W - (3 * pw + 2 * gap)) // 2
    for i, (scr, title, lines) in enumerate(screens):
        x, y = x0 + i * (pw + gap), 168
        sh = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle(P([(x + 8, y + 12), (x + pw + 8, y + SH + 24 + 12)]),
                                             radius=58 * S, fill=(60, 50, 40, 50))
        sheet.alpha_composite(sh)
        ph = phone(scr)
        sheet.paste(ph, (x * S, y * S), ph)
        d = ImageDraw.Draw(sheet, "RGBA")
        cx = x + pw / 2
        text(d, (cx, y + SH + 24 + 38), title, 28, E.LEAD, bold=True, anchor="mm")
        for j, ln in enumerate(lines):
            text(d, (cx, y + SH + 24 + 76 + j * 26), ln, 17, E.SOFT, anchor="mm")

    out = sheet.resize((W, H), Image.LANCZOS).convert("RGB")
    out.save(OUT, optimize=True)
    print("ok", OUT)


if __name__ == "__main__":
    main()
