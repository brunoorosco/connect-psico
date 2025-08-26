import { memo, CSSProperties } from "react";
import { Rnd } from "react-rnd";

export type BaseLayer = {
  id: string;
  type: "text" | "image" | "qr";
  x: number;
  y: number;
  w?: number;
  h?: number;
  rotate?: number;
  z?: number;
  lock?: boolean;
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  opacity?: number;
  background?: string;
  padding?: number;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  publicId?: string;
  objectFit?: "contain" | "cover";
  opacity?: number;
};

export type QrLayer = BaseLayer & {
  type: "qr";
  value: string;
  fg?: string;
  bg?: string;
};

export type AnyLayer = TextLayer | ImageLayer | QrLayer;

type Props = {
  layer: AnyLayer;
  boundsSelector?: string;
  editable?: boolean;
  onChange?: (patch: Partial<AnyLayer>) => void;
  renderQr?: (layer: QrLayer) => React.ReactNode;
};

const DraggableLayer = memo(({ layer, boundsSelector = "#certificate", editable = false, onChange, renderQr }: Props) => {
  const style: CSSProperties = {
    position: "absolute",
    zIndex: layer.z ?? 40,
    pointerEvents: "auto",
  };

  if (!editable) {
    // Render estático
    return (
      <div
        style={{
          ...style,
          left: layer.x,
          top: layer.y,
          width: layer.w,
          height: layer.h,
        }}
      >
        <div style={{ width: "100%", height: "100%", transform: (layer.rotate && layer.rotate % 360 !== 0) ? `rotate(${layer.rotate}deg)` : undefined }}>
          {layer.type === "image" ? (
            <img
              src={(layer as ImageLayer).src}
              alt=""
              className="w-full h-full"
              style={{
                objectFit: (layer as ImageLayer).objectFit ?? "contain",
                opacity: (layer as ImageLayer).opacity ?? 1,
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          ) : layer.type == "qr" ? (
            renderQr ? renderQr(layer as QrLayer) : <div />
          ) : (
            <div
              className="w-full h-full"
              style={{
                color: (layer as TextLayer).color ?? "#111",
                fontSize: (layer as TextLayer).fontSize ?? 16,
                textAlign: (layer as TextLayer).align ?? "left",
                fontFamily: (layer as TextLayer).fontFamily ?? "inherit",
                fontWeight: (layer as TextLayer).bold ? 700 : 400,
                fontStyle: (layer as TextLayer).italic ? "italic" : "normal",
                opacity: (layer as TextLayer).opacity ?? 1,
                background: (layer as TextLayer).background ?? "transparent",
                padding: (layer as TextLayer).padding ?? 0,
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  (layer as TextLayer).align === "center"
                    ? "center"
                    : (layer as TextLayer).align === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {(layer as TextLayer).text}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editável com react-rnd
  return (
    <Rnd
      default={{
        x: layer.x ?? 0,
        y: layer.y ?? 0,
        width: layer.w ?? "auto",
        height: layer.h ?? "auto",
      }}
      position={{ x: layer.x ?? 0, y: layer.y ?? 0 }}
      size={{ width: layer.w ?? "auto", height: layer.h ?? "auto" }}
      bounds={boundsSelector}
      enableResizing={!layer.lock}
      disableDragging={!!layer.lock}
      onDragStop={(_e, d) => onChange?.({ x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        onChange?.({ w: ref.offsetWidth, h: ref.offsetHeight, x: pos.x, y: pos.y })
      }
      style={style}
      className="group"
    >
      <div style={{ width: "100%", height: "100%", transform: (layer.rotate && layer.rotate % 360 !== 0) ? `rotate(${layer.rotate}deg)` : undefined }}>
        {layer.type === "image" ? (
          <img
            src={(layer as ImageLayer).src}
            alt=""
            className="w-full h-full"
            style={{
              objectFit: (layer as ImageLayer).objectFit ?? "contain",
              opacity: (layer as ImageLayer).opacity ?? 1,
              userSelect: "none",
            }}
            draggable={false}
          />
        ) : layer.type === "qr" ? (
          renderQr ? renderQr(layer as QrLayer) : <div />
        ) : (
          <div
            className="w-full h-full"
            style={{
              color: (layer as TextLayer).color ?? "#111",
              fontSize: (layer as TextLayer).fontSize ?? 16,
              textAlign: (layer as TextLayer).align ?? "left",
              fontFamily: (layer as TextLayer).fontFamily ?? "inherit",
              fontWeight: (layer as TextLayer).bold ? 700 : 400,
              fontStyle: (layer as TextLayer).italic ? "italic" : "normal",
              opacity: (layer as TextLayer).opacity ?? 1,
              background: (layer as TextLayer).background ?? "transparent",
              padding: (layer as TextLayer).padding ?? 0,
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent:
                (layer as TextLayer).align === "center"
                  ? "center"
                  : (layer as TextLayer).align === "right"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            {(layer as TextLayer).text}
          </div>
        )}
      </div>
      {/* guia visual ao passar o mouse */}
      <div className="absolute inset-0 border border-dashed border-slate-400/50 opacity-0 group-hover:opacity-100 pointer-events-none" />
    </Rnd>
  );
});

export default DraggableLayer;
