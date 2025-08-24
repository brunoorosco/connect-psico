import { CertificateConfig } from "./types"

// mapeia seu Align para justify-content
export const justifyByAlign: Record<CertificateConfig["headerAlign"], React.CSSProperties["justifyContent"]> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
}

export const alignItemsByPosition: Record<"left" | "center" | "right", React.CSSProperties["alignItems"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
}

export const selfByPosition: Record<"left" | "center" | "right", React.CSSProperties["alignSelf"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
}

// mapeia o "modelo" para a font-family real
export const headerFontStacks: Record<string, string> = {
  inter:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  times: '"Times New Roman", Times, serif',
  georgia: "Georgia, serif",
  arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  courier: '"Courier New", Courier, monospace',

  // fontes serifadas elegantes
  garamond: '"Garamond", "Baskerville", "Times New Roman", serif',
  baskerville: '"Baskerville", "Times New Roman", serif',
  cambria: '"Cambria", Georgia, serif',

  // fontes sem serifa mais modernas
  trebuchet: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", Tahoma, sans-serif',
  verdana: '"Verdana", Geneva, sans-serif',
  tahoma: '"Tahoma", Geneva, sans-serif',

  // fontes de display / impacto
  impact: '"Impact", "Haettenschweiler", "Arial Narrow Bold", sans-serif',
  copperplate: '"Copperplate", "Copperplate Gothic Light", fantasy',

  // fontes cursivas / script
  brush: '"Brush Script MT", cursive',
  lucida: '"Lucida Handwriting", cursive',

  // monospace extra
  consolas: '"Consolas", "Courier New", monospace',
  monospace: "monospace",
}