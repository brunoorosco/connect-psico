import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Patient, Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockAppointments } from '@/presentation/pages/patients/mockdata';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onBack,
  onEdit,
}) => {
  // Filtrar consultas do paciente
  const patientAppointments = mockAppointments.filter(
    (apt) => apt.patientId === patient.id
  );

  const handleSendMessage = () => {
    console.log('Enviando mensagem para:', patient.name);
  };

  const handleScheduleAppointment = () => {
    console.log('Agendando consulta para:', patient.name);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <p className="text-gray-600">
                  {patient.medicalRecordId && `Prontuário: ${patient.medicalRecordId}`}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSendMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagem
              </Button>
              <Button variant="outline" onClick={handleScheduleAppointment}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="records">Prontuário</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{patient.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p>{patient.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <p>{(patient as any).birthDate || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contato de Emergência</label>
                  <p>{(patient as any).emergencyContact || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Endereço</label>
                  <p>{(patient as any).address || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p>{(patient as any).notes || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              {patientAppointments.length > 0 ? (
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
                    {patientAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.appointmentDate), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {appointment.professional?.name || 'Dr. Silva'}
                        </TableCell>
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
        </TabsContent>

        <TabsContent value="records">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;
