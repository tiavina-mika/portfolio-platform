/*
 * The two palettes of the e-mail frame. `light` is written inline in every template because it is
 * what all mail clients render; `dark` is only reachable through the `prefers-color-scheme` rules of
 * the frame, which is why the shared blocks reference these values by class and not by color.
 */
export const EMAIL_COLORS = {
  light: {
    bg: '#fbf7f0',
    card: '#fffdf9',
    cardBorder: '#e3daca',
    text: '#12211a',
    muted: '#566259',
    link: '#046c2b',
    button: '#05a63c',
    codeBg: '#e2f3e5',
    quoteBg: '#f1ebdf',
    warnBg: '#f8e4db',
    alertBadge: '#b94a2c',
    dot: '#05a63c',
    dots: '#cfc3ad',
  },
  dark: {
    bg: '#0e1712',
    card: '#16221b',
    cardBorder: '#27382d',
    text: '#f1ede3',
    muted: '#a5b2a9',
    link: '#5be39a',
    button: '#34d67f',
    codeBg: '#173424',
    quoteBg: '#1d2b22',
    warnBg: '#3a211a',
    dot: '#34d67f',
    dots: '#3a4f40',
  },
} as const;
