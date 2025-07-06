"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Eye } from "lucide-react";
import { IPatientAppointmentsTab } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Button } from "@components/ui";

export const PatientAppointmentsTab: React.FC<IPatientAppointmentsTab> = (props) => {
  const { appointments } = props || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead hidden>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    {format(new Date(apt.appointmentDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apt.appointmentDate), "HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        apt.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : apt.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {apt.status === "CONFIRMED"
                        ? "CONFIRMADA"
                        : apt.status === "PENDING"
                        ? "PENDENTE DE CONFIRMAÇÃO"
                        : apt.status === "CANCELLED"
                        ? "CANCELADA"
                        : "CONCLUÍDA"}
                    </span>
                  </TableCell>
                  <TableCell>{apt.professional?.name || "-"}</TableCell>
                  {apt.status === "CONCLUDED" ? (
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log("detalhes da consulta")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Detalhes da Consulta</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  ) : (
                    ""
                  )}
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
};
