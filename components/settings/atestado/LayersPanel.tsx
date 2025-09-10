import { useMemo, useRef } from "react"
import { Button } from "@components/ui"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import ColorField from "./ColorField"
import type { AnyLayer, TextLayer, ImageLayer, QrLayer, SignatureLayer } from "./DraggableLayer"
import ModelFont from "./ModelFont"
import { uploadImageToCloudinary } from "@/services/cloudinaryService/uploadImage"
import { useCurrentUser } from "@hooks/use-current-user"

type Props = {
  layers?: AnyLayer[]
  selectedId?: string | null
  onChange: (layers: AnyLayer[]) => void
  onSelect: (id: string | null) => void
  cloudContextId?: string | number
  cloudFolder?: string
}

const newId = () => Math.random().toString(36).slice(2, 9)

export default function LayersPanel({
  layers = [],
  selectedId,
  onChange,
  onSelect,
  cloudContextId,
  cloudFolder = "layers",
}: Props) {
  const selected = useMemo(() => layers.find((l) => l.id === selectedId) || null, [layers, selectedId])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const user = useCurrentUser()

  async function onImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const contextOrFolder = (cloudContextId ?? cloudFolder) as any
      const res: any = await uploadImageToCloudinary(file, contextOrFolder, cloudFolder)
      const url: string = typeof res === "string" ? res : res?.secure_url || res?.url || ""
      if (!url) throw new Error("Upload falhou (sem URL)")
      const publicId: string | undefined = typeof res === "string" ? undefined : res?.public_id

      let nextW = selected?.w ?? 200
      let nextH = selected?.h ?? 150
      if (typeof res !== "string" && res?.width && res?.height) {
        nextW = Math.min(320, res.width)
        nextH = Math.round(nextW * (res.height / res.width))
      }
      patchSelected({ src: url, publicId, w: nextW, h: nextH })
    } catch (err) {
      console.error("Falha no upload:", err)
    } finally {
      // if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function addText() {
    const l: TextLayer = {
      id: newId(),
      type: "text",
      x: 40,
      y: 40,
      w: 220,
      h: 48,
      text: "Novo texto",
      fontSize: 18,
      color: "#111111",
      align: "left",
      z: 50,
    }
    onChange([...(layers || []), l])
    onSelect(l.id)
  }

  function addImage() {
    const l: ImageLayer = {
      id: newId(),
      type: "image",
      x: 60,
      y: 60,
      w: 160,
      h: 120,
      src: "https://placehold.co/320x240/png",
      objectFit: "contain",
      z: 50,
    }
    onChange([...(layers || []), l])
    onSelect(l.id)
  }

  function addQr() {
    const l: QrLayer = {
      id: newId(),
      type: "qr",
      x: 80,
      y: 80,
      w: 100,
      h: 100,
      value: "https://example.com",
      z: 50,
    }
    onChange([...(layers || []), l])
    onSelect(l.id)
  }

  // ✅ Nova layer de assinatura com defaults sensatos
  function addSignature() {
    const l: SignatureLayer = {
      id: newId(),
      type: "signature",
      x: 340,
      y: 520,
      w: 220,
      h: 70,
      align: "right",
      fontFamily: "verdana",
      fontSize: 14,
      color: "#000000",
      showLine: true,
      lineWidthPct: 300,
      lineThickness: 1,
      gapLineToName: 8,
      gapNameToCrp: 4,
      name: user?.name || "Profissional",
      crp: user?.crm || user?.crm || "CRP 00/00000",
      z: 50,
    }
    onChange([...(layers || []), l])
    onSelect(l.id)
  }

  function patchSelected(patch: Partial<AnyLayer>) {
    if (!selected) return
    onChange(layers.map((l) => (l.id === selected.id ? ({ ...l, ...patch } as AnyLayer) : l)))
  }

  function removeSelected() {
    if (!selected) return
    onChange(layers.filter((l) => l.id !== selected.id))
    onSelect(null)
  }

  function bringToFront() {
    if (!selected) return
    const maxZ = layers.reduce((m, l) => Math.max(m, l.z || 0), 0) + 1
    patchSelected({ z: maxZ })
  }

  function sendToBack() {
    if (!selected) return
    const minZ = layers.reduce((m, l) => Math.min(m, l.z || 0), 0) - 1
    patchSelected({ z: minZ })
  }

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={addText}>+ Texto</Button>
        <Button size="sm" onClick={addImage}>+ Imagem</Button>
        <Button size="sm" onClick={addQr}>+ QR</Button>
        <Button size="sm" onClick={addSignature}>Assinatura</Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={bringToFront} disabled={!selected}>Frente</Button>
          <Button size="sm" variant="secondary" onClick={sendToBack} disabled={!selected}>Fundo</Button>
          <Button size="sm" variant="destructive" onClick={removeSelected} disabled={!selected}>Remover</Button>
        </div>
      </div>

      {/* Lista */}
      <div className="border rounded-md divide-y">
        {(layers || []).map((l) => (
          <button
            key={l.id}
            onClick={() => onSelect(l.id)}
            className={`w-full text-left p-2 hover:bg-slate-50 ${selectedId === l.id ? "bg-slate-100" : ""}`}
          >
            <div className="text-xs text-slate-500">#{l.id.slice(0, 5)}</div>
            <div className="font-medium">{l.type.toUpperCase()}</div>
            <div className="text-xs">x:{l.x} y:{l.y} w:{l.w ?? "-"} h:{l.h ?? "-"}</div>
          </button>
        ))}
        {layers?.length === 0 && <div className="p-3 text-sm text-slate-500">Nenhuma camada criada.</div>}
      </div>

      {/* Editor do selecionado */}
      {selected && (
        <div className="space-y-3">
          {/* Básico */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label>X</Label>
              <Input type="number" value={selected.x} onChange={(e) => patchSelected({ x: e.currentTarget.valueAsNumber })} />
            </div>
            <div>
              <Label>Y</Label>
              <Input type="number" value={selected.y} onChange={(e) => patchSelected({ y: e.currentTarget.valueAsNumber })} />
            </div>
            <div>
              <Label>W</Label>
              <Input type="number" value={selected.w ?? 0} onChange={(e) => patchSelected({ w: e.currentTarget.valueAsNumber })} />
            </div>
            <div>
              <Label>H</Label>
              <Input type="number" value={selected.h ?? 0} onChange={(e) => patchSelected({ h: e.currentTarget.valueAsNumber })} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label>Rotação</Label>
              <Input type="number" value={selected.rotate ?? 0} onChange={(e) => patchSelected({ rotate: e.currentTarget.valueAsNumber })} />
            </div>
            <div>
              <Label>Z-Index</Label>
              <Input type="number" value={selected.z ?? 0} onChange={(e) => patchSelected({ z: e.currentTarget.valueAsNumber })} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch checked={!!selected.lock} onCheckedChange={(v) => patchSelected({ lock: v })} />
              <Label>Travar</Label>
            </div>
          </div>

          {/* TEXT */}
          {selected.type === "text" && (
            <div className="space-y-3">
              <div>
                <Label>Texto</Label>
                <Input value={(selected as TextLayer).text} onChange={(e) => patchSelected({ text: e.currentTarget.value })} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label>Tamanho</Label>
                  <Input type="number" value={(selected as TextLayer).fontSize ?? 16} onChange={(e) => patchSelected({ fontSize: e.currentTarget.valueAsNumber })} />
                </div>
                <div className="col-span-1">
                  <ModelFont value={(selected as TextLayer).fontFamily ?? ""} onChange={(v) => patchSelected({ fontFamily: v })} />
                </div>
                <div>
                  <Label>Alinhamento</Label>
                  <Select value={(selected as TextLayer).align ?? "left"} onValueChange={(v) => patchSelected({ align: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Opacidade</Label>
                  <Input type="number" min={0} max={1} step={0.05} value={(selected as TextLayer).opacity ?? 1} onChange={(e) => patchSelected({ opacity: e.currentTarget.valueAsNumber })} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <ColorField label="Cor" value={(selected as TextLayer).color ?? "#111111"} onChange={(v) => patchSelected({ color: v })} />
                </div>
              </div>
            </div>
          )}

          {/* IMAGE */}
          {selected.type === "image" && (
            <div className="space-y-3">
              <div>
                <Label>Importar do computador</Label>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={onImageFileChange} className="cursor-pointer" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Object Fit</Label>
                  <Select value={(selected as ImageLayer).objectFit ?? "contain"} onValueChange={(v) => patchSelected({ objectFit: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Opacidade</Label>
                  <Input type="number" min={0} max={1} step={0.05} value={(selected as ImageLayer).opacity ?? 1} onChange={(e) => patchSelected({ opacity: e.currentTarget.valueAsNumber })} />
                </div>
              </div>
            </div>
          )}

          {/* QR */}
          {selected.type === "qr" && (
            <div className="space-y-3">
              <div>
                <Label>Valor</Label>
                <Input value={(selected as QrLayer).value} onChange={(e) => patchSelected({ value: e.currentTarget.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Cor" value={(selected as QrLayer).fg ?? "#000000"} onChange={(v) => patchSelected({ fg: v })} />
                <ColorField label="Fundo" value={(selected as QrLayer).bg ?? "#FFFFFF"} onChange={(v) => patchSelected({ bg: v })} />
              </div>
            </div>
          )}

          {/* ✅ SIGNATURE */}
          {selected.type === "signature" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={(selected as SignatureLayer).name ?? ""} onChange={(e) => patchSelected({ name: e.currentTarget.value })} />
                </div>
                <div>
                  <Label>CRP</Label>
                  <Input value={(selected as SignatureLayer).crp ?? ""} onChange={(e) => patchSelected({ crp: e.currentTarget.value })} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label>Tamanho</Label>
                  <Input type="number" value={(selected as SignatureLayer).fontSize ?? 14} onChange={(e) => patchSelected({ fontSize: e.currentTarget.valueAsNumber })} />
                </div>
                <div className="col-span-1">
                  <ModelFont value={(selected as SignatureLayer).fontFamily ?? ""} onChange={(v) => patchSelected({ fontFamily: v })} />
                </div>
                <div>
                  <Label>Alinhamento</Label>
                  <Select value={(selected as SignatureLayer).align ?? "right"} onValueChange={(v) => patchSelected({ align: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <ColorField label="Cor" value={(selected as SignatureLayer).color ?? "#000000"} onChange={(v) => patchSelected({ color: v })} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="flex items-center gap-2 mt-6">
                  <Switch checked={(selected as SignatureLayer).showLine ?? true} onCheckedChange={(v) => patchSelected({ showLine: v })} />
                  <Label>Exibir linha</Label>
                </div>
                <div>
                  <Label>Espessura (px)</Label>
                  <Input type="number" min={0.5} step={0.5} value={(selected as SignatureLayer).lineThickness ?? 1} onChange={(e) => patchSelected({ lineThickness: e.currentTarget.valueAsNumber })} />
                </div>
                <div>
                  <Label>Largura da linha (%)</Label>
                  <Input type="number" min={1} max={100} value={(selected as SignatureLayer).lineWidthPct ?? 100} onChange={(e) => patchSelected({ lineWidthPct: e.currentTarget.valueAsNumber })} />
                </div>
                <div />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label>Espaço linha → nome (px)</Label>
                  <Input type="number" min={0} value={(selected as SignatureLayer).gapLineToName ?? 8} onChange={(e) => patchSelected({ gapLineToName: e.currentTarget.valueAsNumber })} />
                </div>
                <div>
                  <Label>Espaço nome → CRP (px)</Label>
                  <Input type="number" min={0} value={(selected as SignatureLayer).gapNameToCrp ?? 4} onChange={(e) => patchSelected({ gapNameToCrp: e.currentTarget.valueAsNumber })} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
