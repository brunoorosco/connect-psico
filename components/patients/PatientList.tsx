import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Patient } from '@/types/appointment';

interface PatientListProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}) => {
  const handleSendMessage = (patient: Patient) => {
    // Implementar envio de mensagem
    console.log('Enviando mensagem para:', patient.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pacientes ({patients.length}) - MODELO TESTE</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Prontuário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.email || '-'}</TableCell>
                <TableCell>{patient.phoneNumber || '-'}</TableCell>
                <TableCell>{patient.medicalRecordId || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPatient(patient)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPatient(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(patient)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeletePatient(patient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum paciente cadastrado ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientList;