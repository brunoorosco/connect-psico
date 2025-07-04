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
import { Eye, Edit, Trash2, MessageSquare } from "lucide-react";
import { usePatientList } from "@/hooks/usePatientList";
import { IPatientList } from "./types";

const PatientList = ({ patients, onViewPatient, onEditPatient, onDeletePatient }: IPatientList) => {
  const { handleView, handleEdit, handleDelete, handleSendMessage } = usePatientList({
    onViewPatient,
    onEditPatient,
    onDeletePatient,
  });

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
                    <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSendMessage(item)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
