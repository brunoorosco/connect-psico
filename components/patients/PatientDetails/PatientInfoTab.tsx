"use server"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IPatient } from './types';

export const PatientInfoTab: React.FC<IPatient> = ({ patient }) => (
  <Card>
    <CardHeader>
      <CardTitle>Informações Pessoais</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Email" value={patient.email} />
        <InfoField label="Telefone" value={patient.phone} />
        <InfoField label="Data de Nascimento" value={(patient as any).birthDate} />
        <InfoField label="Contato de Emergência" value={(patient as any).emergencyContact} />
        <InfoField label="Endereço" value={(patient as any).address} fullWidth />
        <InfoField label="Observações" value={(patient as any).notes} fullWidth />
      </div>
    </CardContent>
  </Card>
);

const InfoField = ({ label, value, fullWidth = false }: { label: string; value?: string; fullWidth?: boolean }) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <p>{value || '-'}</p>
  </div>
);
