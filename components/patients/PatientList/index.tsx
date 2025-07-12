'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Edit, Trash2, MessageSquare, SquarePlay } from 'lucide-react';
import { usePatientList } from '@/hooks/usePatientList';
import { IPatientList } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePatientStore } from '@/infra/stores/usePatientStore';
import { Patient } from '@/types/appointment';

export default function PatientList({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: IPatientList) {
  const {
    handleView,
    handleEdit,
    handleDelete,
    handleSendMessage,
  } = usePatientList({
    onViewPatient,
    onEditPatient,
    onDeletePatient,
  });

  const handleStartConsultation = (item: Patient) => {
    usePatientStore.getState().setPatient(item);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pacientes ({patients.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabela para desktop */}
        <div className="hidden md:block">
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
              {patients.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleView(item)}
                >
                  <TableCell className="font-medium uppercase py-2">{item.name}</TableCell>
                  <TableCell className="py-2">{item.email || '-'}</TableCell>
                  <TableCell className="py-2">{item.phone || '-'}</TableCell>
                  <TableCell className="py-2">{item.medicalRecordId || '-'}</TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <PatientActions
                        item={item}
                        onStart={handleStartConsultation}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSendMessage={handleSendMessage}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Lista para mobile */}
        <div className="md:hidden space-y-2">
          {patients.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
              onClick={() => handleView(item)}
            >
              <div className="text-lg font-semibold uppercase">{item.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Email: {item.email || '-'}
              </div>
              <div className="text-sm text-gray-600">Telefone: {item.phone || '-'}</div>
              <div className="text-sm text-gray-600">
                Prontuário: {item.medicalRecordId || '-'}
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <PatientActions
                  item={item}
                  onStart={handleStartConsultation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Nenhum paciente */}
        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum paciente cadastrado ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PatientActions({
  item,
  onStart,
  onEdit,
  onDelete,
  onSendMessage,
}: {
  item: Patient;
  onStart: (item: Patient) => void;
  onEdit: (item: Patient) => void;
  onDelete: (id: number) => void;
  onSendMessage: (item: Patient) => void;
}) {
  const router = useRouter();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStart(item);
              router.push(`./pacientes/${item.userId}/consulta`);
            }}
          >
            <SquarePlay className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Iniciar Consulta</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar Paciente</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSendMessage(item);
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enviar Mensagem</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id); // item.id agora é number
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Excluir Paciente</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
