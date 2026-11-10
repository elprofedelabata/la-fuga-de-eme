"""Genera el logo de La fuga de Eme (img/logo.svg).

Las letras son trazos propios (monolínea, puntas redondas), no texto con fuente: así el
logo se ve igual en cualquier sitio y antes de que cargue la tipografía.

Glifos en unidades: línea base y = 0, altura x = -10, ascendentes -16, descendentes +6.
"""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "img", "logo.svg")

LAPIZ = "#3A3530"
NARANJA = "#F2A33A"
NARANJA_O = "#D9822B"
NARANJA_C = "#FCC878"
TATUAJE = "#C46C20"
CUADRI = "#D9E6F3"

# Cuenco común de a, d, g
CUENCO = "M8 -5 A3.5 5 0 1 0 1 -5 A3.5 5 0 1 0 8 -5"
GLIFOS = {
    "L": ("M0.5 -16 V0 H8", 11),
    "a": (CUENCO + " M8 -10 V0", 11),
    "f": ("M6.5 -16 C3.5 -16.3 2.2 -14.8 2.2 -12 V0 M-0.2 -9.5 H5.5", 8),
    "u": ("M1 -10 V-4.5 C1 1.2 8 1.2 8 -4.5 M8 -10 V0", 11),
    "g": (CUENCO + " M8 -10 V2.5 C8 7.5 1.8 7.5 1 4", 11),
    "d": (CUENCO + " M8 -16 V0", 11),
    "e": ("M1.2 -5 H8 C8 -8.8 6.4 -10 4.5 -10 C2.2 -10 1 -7.8 1 -5 C1 -1.8 2.8 0 5 0 C6.4 0 7.4 -0.6 8.1 -1.6", 10.5),
    "E": ("M8.5 -16 H1 V0 H8.5 M1 -8.2 H7", 11.5),
    "m": ("M1 -10 V0 M1 -6 C1 -9 2.5 -10 4 -10 C5.6 -10 6.6 -9 6.6 -6 V0 "
          "M6.6 -6 C6.6 -9 8.1 -10 9.6 -10 C11.2 -10 12.2 -9 12.2 -6 V0", 15),
    " ": ("", 5),
}


def palabra(texto, x, y, escala, trazos):
    """Devuelve el SVG de una palabra escrita con los glifos.

    trazos: lista de (color, grosor en unidades) que se pintan uno encima de otro.
    """
    capas = []
    for color, grosor in trazos:
        partes, cx = [], 0.0
        for letra in texto:
            d, avance = GLIFOS[letra]
            if d:
                partes.append(f'<path transform="translate({cx:.2f} 0)" d="{d}"/>')
            cx += avance
        capas.append(
            f'<g fill="none" stroke="{color}" stroke-width="{grosor}" stroke-linecap="round" '
            f'stroke-linejoin="round">{"".join(partes)}</g>')
    return f'<g transform="translate({x} {y}) scale({escala})">{"".join(capas)}</g>'


def ancho(texto, escala):
    return sum(GLIFOS[c][1] for c in texto) * escala


def trozo_de_papel():
    """Esquina de hoja de cuaderno rasgada."""
    borde = [(14, 46), (100, 34), (104, 52), (95, 66), (106, 82), (97, 98), (107, 114),
             (98, 128), (104, 146), (20, 154)]
    pts = " ".join(f"{x},{y}" for x, y in borde)
    rejilla = "".join(f'<path d="M{x} 20 V170"/>' for x in range(20, 120, 10))
    rejilla += "".join(f'<path d="M0 {y} H120"/>' for y in range(40, 160, 10))
    return f'''
  <defs><clipPath id="papel"><polygon points="{pts}"/></clipPath></defs>
  <polygon points="{pts}" fill="#5a4a3a" opacity="0.12" transform="translate(4 5)"/>
  <polygon points="{pts}" fill="#FFFEF9"/>
  <g clip-path="url(#papel)" stroke="{CUADRI}" stroke-width="1.2">{rejilla}</g>
  <path d="M23 44 V152" stroke="#EC9F9F" stroke-width="1.6" clip-path="url(#papel)"/>
  <polygon points="{pts}" fill="none" stroke="{LAPIZ}" stroke-width="2.4" stroke-linejoin="round"/>'''


def eme():
    """Eme saliendo del papel, inclinado, con cara de «¡me largo!»."""
    lineas = "".join(
        f'<path d="M{-58 - k * 3} {8 + k * 13} H{-40 - k * 3}"/>' for k in range(3))
    m = palabra("m", 4, 22, 0.95, [(TATUAJE, 2.2)])
    return f'''
  <g transform="translate(120 70) rotate(-14)">
    <g stroke="{LAPIZ}" stroke-width="2.6" stroke-linecap="round" opacity="0.75">{lineas}</g>
    <defs><clipPath id="cuerpo"><rect x="-35" y="-35" width="70" height="70" rx="15"/></clipPath></defs>
    <g clip-path="url(#cuerpo)">
      <rect x="-36" y="-36" width="72" height="72" fill="{NARANJA}"/>
      <ellipse cx="34" cy="38" rx="48" ry="46" fill="{NARANJA_O}"/>
      <g stroke="#BE6A1E" stroke-opacity="0.45" stroke-width="1.4">
        <path d="M20 35 L35 20 M14 35 L35 14 M8 35 L35 8"/>
      </g>
      <path d="M-27 -2 V-18 Q-27 -27 -14 -27" fill="none" stroke="{NARANJA_C}" stroke-width="4.5" stroke-linecap="round"/>
    </g>
    {m}
    <g stroke="{LAPIZ}" stroke-width="2.2" stroke-linecap="round">
      <ellipse cx="-12" cy="-7" rx="8.5" ry="10.5" fill="#fff"/>
      <ellipse cx="12" cy="-7" rx="8.5" ry="10.5" fill="#fff"/>
      <path d="M-20 -21 L-5 -18 M5 -18 L20 -21" fill="none"/>
      <path d="M-10 11 Q0 21 11 10" fill="none" stroke-width="2.8"/>
    </g>
    <circle cx="-8.5" cy="-5.5" r="4.6" fill="{LAPIZ}"/>
    <circle cx="15.5" cy="-5.5" r="4.6" fill="{LAPIZ}"/>
    <circle cx="-10" cy="-7.4" r="1.5" fill="#fff"/>
    <circle cx="14" cy="-7.4" r="1.5" fill="#fff"/>
    <rect x="-35" y="-35" width="70" height="70" rx="15" fill="none" stroke="{LAPIZ}" stroke-width="3.2"/>
  </g>'''


def main():
    x0 = 172
    arriba = palabra("La fuga de", x0, 50, 1.75, [(LAPIZ, 1.7)])
    # «Eme»: contorno oscuro grueso, relleno naranja encima y sombra desplazada
    eme_txt = [
        palabra("Eme", x0 + 3, 144, 5.0, [("#5a4a3a", 2.3)]).replace("<g transform", '<g opacity="0.15" transform', 1),
        palabra("Eme", x0, 140, 5.0, [(LAPIZ, 2.3), (NARANJA, 1.25)]),
    ]
    w = max(x0 + ancho("Eme", 5.0), x0 + ancho("La fuga de", 1.75)) + 16
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} 168" role="img" aria-label="La fuga de Eme">
  <title>La fuga de Eme</title>
  <!-- Generado por arte/logo.py -->{trozo_de_papel()}{eme()}
  {arriba}
  {"".join(eme_txt)}
</svg>
'''
    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write(svg)
    print("ok", os.path.normpath(SALIDA), f"{w:.0f}x168")


if __name__ == "__main__":
    main()
