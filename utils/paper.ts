export function hexToRgba(hex: string) {
    const m8 = /^#([0-9A-F]{8})$/i.exec(hex)
    const m6 = /^#([0-9A-F]{6})$/i.exec(hex)
    if (m8) {
      const r = parseInt(m8[1].slice(0, 2), 16)
      const g = parseInt(m8[1].slice(2, 4), 16)
      const b = parseInt(m8[1].slice(4, 6), 16)
      const a = parseInt(m8[1].slice(6, 8), 16) / 255
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    if (m6) return hex // #RRGGBB normal
    return hex
  }

export function cmToPx(cm: number) {
    return Math.round((cm * 96) / 2.54) // 96 dpi
  }