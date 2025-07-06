"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, MessageSquare, SquarePlay } from "lucide-react";
import { usePatientList } from "@/hooks/usePatientList";
import { IPatientList } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import Link from "next/link";
import { usePatientStore } from "@/stores/usePatientStore";
import { Patient } from "@/types/appointment";

const PatientList = ({ patients, onViewPatient, onEditPatient, onDeletePatient }: IPatientList) => {
  const { handleView, handleEdit, handleDelete, handleSendMessage } = usePatientList({
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
              <TableRow key={item.id}>
                <TableCell className="font-medium uppercase">{item.name}</TableCell>
                <TableCell>{item.email || "-"}</TableCell>
                <TableCell>{item.phone || "-"}</TableCell>
                <TableCell>{item.medicalRecordId || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Detalhes do Paciente</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`./pacientes/${item.userId}/consulta`}
                          onClick={() => handleStartConsultation(item)}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-10"
                        >
                          <SquarePlay className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Iniciar Consulta</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar Paciente</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleSendMessage(item)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enviar Mensagem</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir Paciente</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhum paciente cadastrado ainda.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientList;
