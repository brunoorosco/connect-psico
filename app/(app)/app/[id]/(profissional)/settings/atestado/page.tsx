'use client'
import { useState, useEffect } from "react";
import CertificatePreview from "./CertificatePreview";
import CertificateTabs from "./CertificateTabs";
import { CertificateConfig, DEFAULT_CONFIG } from "./types";

export default function MedicalCertificate() {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG);

  const onChange = (key: keyof CertificateConfig, value: any) => setConfig((p) => ({ ...p, [key]: value }));
  const onFile = (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(key, reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <CertificateTabs config={config} onChange={onChange} onFile={onFile} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <CertificatePreview config={config} user={{ name: "Dr. Fulano", crm: "12345" }} />
      </div>
    </div>
  );
}
