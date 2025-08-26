import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import HeaderConfig from "./HeaderConfig"
import BodyConfig from "./BodyConfig"
import BackgroundConfig from "./BackgroundConfig"
import { CertificateConfig } from "./types"

type TabKey = "header" | "body" | "background"

interface Props {
  config: CertificateConfig
  onChange: (key: keyof CertificateConfig, value: any) => void
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void

  /** Controlado (opcional) */
  value?: TabKey
  /** Notifica mudança de aba (opcional) */
  onTabChange?: (tab: TabKey) => void
}

/**
 * Se `value` vier, o componente funciona controlado.
 * Caso contrário, usa `defaultValue="header"`.
 */
export default function CertificateTabs({ config, onChange, onFile, value, onTabChange }: Props) {
  const isControlled = value !== undefined

  return (
    <Tabs
      className="space-y-4"
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : "body"}
      onValueChange={(v) => onTabChange?.(v as TabKey)}
    >
      <TabsList>
        <TabsTrigger value="body">Corpo</TabsTrigger>
        <TabsTrigger value="header">Cabeçalho/Rodapé</TabsTrigger>
        <TabsTrigger value="background">Fundo</TabsTrigger>
      </TabsList>

      <TabsContent value="header">
        <HeaderConfig config={config} onChange={onChange} onFile={onFile} />
      </TabsContent>

      <TabsContent value="body">
        <BodyConfig config={config} onChange={onChange} />
      </TabsContent>

      <TabsContent value="background">
        <BackgroundConfig config={config} onChange={onChange} onFile={onFile} />
      </TabsContent>
    </Tabs>
  )
}
