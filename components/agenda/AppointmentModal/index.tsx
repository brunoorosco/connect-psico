"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IAppointmentModalProps } from "./types";
import AppointmentForm from "./AppointmentForm";

export const AppointmentModal: React.FC<IAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editingAppointment,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingAppointment ? "Editar Consulta" : "Nova Consulta"}</DialogTitle>
          <DialogDescription>
            {editingAppointment
              ? "Faça alterações nas informações da consulta abaixo"
              : "Preencha as informações para agendar uma nova consulta"}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          onSubmit={onSave}
          onCancel={onClose}
          selectedDate={selectedDate}
          editingAppointment={editingAppointment}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
