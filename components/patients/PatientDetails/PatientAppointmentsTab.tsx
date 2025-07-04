"use server"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { IPatientAppointmentsTab } from './types';

export const PatientAppointmentsTab: React.FC<IPatientAppointmentsTab> = ({ appointments }) => (
  <Card>
    <CardHeader>
      <CardTitle>Histórico de Consultas</CardTitle>
    </CardHeader>
    <CardContent>
      {appointments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profissional</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>{format(new Date(apt.appointmentDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{format(new Date(apt.appointmentDate), 'HH:mm', { locale: ptBR })}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {apt.status}
                  </span>
                </TableCell>
                <TableCell>{apt.professional?.name || 'Dr. Silva'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma consulta encontrada para este paciente.</p>
        </div>
      )}
    </CardContent>
  </Card>
);
