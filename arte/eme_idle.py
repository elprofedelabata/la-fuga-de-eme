"""Animacion idle de Eme en bucle -> eme_idle.gif (y tira de fotogramas para revisar)."""
import math
import os

from PIL import Image, ImageDraw

import eme_hoja_personaje as E

S = E.S
FW, FH = 400, 400          # tamano final de cada fotograma
FPS = 25
T = 4.0                    # duracion del bucle (s)
GROUND = 300
B = 150
HERE = os.path.dirname(os.path.abspath(__file__))


def smooth(a, b, t):
    """0 antes de a, 1 despues de b, suavizado entre medias."""
    if t <= a:
        return 0.0
    if t >= b:
        return 1.0
    x = (t - a) / (b - a)
    return x * x * (3 - 2 * x)


def bump(a, b, c, d, t):
    """Sube en [a,b], se mantiene, baja en [c,d]."""
    return smooth(a, b, t) - smooth(c, d, t)


def blink(t0, t):
    """Parpadeo: cierra en 0.06 s, se mantiene 0.06 s y abre en 0.08 s."""
    if t0 - 0.06 <= t <= t0:
        return (t - (t0 - 0.06)) / 0.06
    if t0 < t <= t0 + 0.06:
        return 1.0
    if t0 + 0.06 < t <= t0 + 0.14:
        return 1 - (t - t0 - 0.06) / 0.08
    return 0.0


def pose(t):
    # respiracion: dos ciclos por bucle, conservando volumen
    br = math.sin(2 * math.pi * t / 2.0)
    sigh = bump(2.85, 3.05, 3.3, 3.7, t)
    sy = 1 + 0.025 * br - 0.05 * sigh
    sx = 1 - 0.02 * br + 0.04 * sigh
    # mirada: izquierda, derecha, centro
    px = (-0.85 * bump(1.35, 1.55, 1.85, 2.05, t)) + 0.85 * bump(1.85, 2.05, 2.25, 2.45, t)
    # aburrimiento: parpados a media asta y mirada abajo
    bored = bump(2.6, 2.85, 3.5, 3.75, t)
    py = 0.5 * bored
    lid = 0.12 + 0.4 * bored
    lid = max(lid, blink(0.9, t), blink(3.85, t))
    lid = max(lid, blink(1.25, t))   # doble parpadeo tras el primero
    return sx, sy, px, py, lid, sigh


def frame(i, n):
    t = T * i / n
    boil = (i // 3) % 3                      # el lapiz "hierve" a ~8 fps
    sx, sy, px, py, lid, sigh = pose(t)

    img = Image.new("RGBA", (FW * S, FH * S), E.PAPER)
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(0, FW, 30):
        d.line([(x * S, 0), (x * S, FH * S)], fill=E.GRID, width=S)
    for y in range(0, FH, 30):
        d.line([(0, y * S), (FW * S, y * S)], fill=E.GRID, width=S)

    poly = E.P([(-10, GROUND), (FW + 10, GROUND), (FW + 10, FH + 10), (-10, FH + 10)])
    d.polygon(poly, fill=E.DIRT)
    E.hatch(img, poly, spacing=13, color=(90, 80, 60, 40))
    d = ImageDraw.Draw(img, "RGBA")
    E.pencil(d, E.P([(-10, GROUND), (FW + 10, GROUND)]), 3, E.LEAD, seed=20 + boil)

    # sombra
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hw = 62 * sx
    ImageDraw.Draw(shadow).ellipse(E.P([(200 - hw, GROUND - 6), (200 + hw, GROUND + 9)]), fill=(90, 80, 70, 60))
    img.alpha_composite(shadow)

    eme = E.make_eme("idle", B, sx=sx, sy=sy, seed=3 + boil, px=px, py=py, lid=lid)
    E.place(img, eme, 200, GROUND - B * sy / 2)

    if sigh > 0.05:  # "uff" que aparece y se desvanece
        txt = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(txt).text(E.P([(292, 150 - 12 * sigh)])[0], "uff…",
                                 font=E.font("segoeprb.ttf", 26), fill=E.SOFT[:3] + (int(255 * sigh),))
        img.alpha_composite(txt)

    return img.resize((FW, FH), Image.LANCZOS).convert("RGB")


def main():
    n = int(T * FPS)
    frames = [frame(i, n) for i in range(n)]

    pal = frames[0].quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    gif = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    out = os.path.join(HERE, "eme_idle.gif")
    gif[0].save(out, save_all=True, append_images=gif[1:], duration=int(1000 / FPS), loop=0, optimize=False)
    print("ok", out, n, "fotogramas")

    # tira de revision: fotogramas clave
    keys = [0, 23, 32, 38, 47, 57, 75, 81, 97]
    strip = Image.new("RGB", (FW * len(keys) // 2, FH // 2), "white")
    for j, k in enumerate(keys):
        strip.paste(frames[k].resize((FW // 2, FH // 2)), (j * FW // 2, 0))
    strip.save(os.environ.get("STRIP", os.path.join(HERE, "eme_idle_tira.png")))


if __name__ == "__main__":
    main()
