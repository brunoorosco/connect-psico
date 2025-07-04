"use server"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const PatientRecordsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Prontuário Médico</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Funcionalidade de prontuário em desenvolvimento.</p>
        <p className="text-sm mt-2">
          Aqui será possível visualizar e gerenciar o prontuário médico do paciente.
        </p>
      </div>
    </CardContent>
  </Card>
);
