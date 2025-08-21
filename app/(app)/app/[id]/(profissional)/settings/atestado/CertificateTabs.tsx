import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeaderConfig from "./HeaderConfig";
import BodyConfig from "./BodyConfig";
import FooterConfig from "./FooterConfig";
import { CertificateConfig } from "./types";

interface Props {
  config: CertificateConfig;
  onChange: any;
  onFile: any;
}

export default function CertificateTabs({ config, onChange, onFile }: Props) {
  return (
    <Tabs defaultValue="header" className="space-y-4">
      <TabsList>
        <TabsTrigger value="header">Cabeçalho</TabsTrigger>
        <TabsTrigger value="body">Corpo</TabsTrigger>
        <TabsTrigger value="footer">Rodapé</TabsTrigger>
      </TabsList>

      <TabsContent value="header">
        <HeaderConfig config={config} onChange={onChange} onFile={onFile} />
      </TabsContent>
      <TabsContent value="body">
        <BodyConfig config={config} onChange={onChange} />
      </TabsContent>
      <TabsContent value="footer">
        <FooterConfig config={config} onChange={onChange} onFile={onFile} />
      </TabsContent>
    </Tabs>
  );
}
