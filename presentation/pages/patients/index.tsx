"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PatientList from "@/components/patients/PatientList";
import PatientForm from "@/components/patients/PatientForm";
import PatientDetails from "@/components/patients/PatientDetails";
import { Patient } from "@/types/appointment";
import { getPatients } from "@/actions/patients"; // ✅

const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      const result = await getPatients();
      if (!("error" in result)) {
        setPatients(result);
      }
    };
    loadPatients();
  }, []);

  const handleAddPatient = (patientData: Omit<Patient, "id">) => {
    // Aqui você pode também integrar com uma action de criação
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPatients([...patients, newPatient]);
    setShowForm(false);
  };

  const handleEditPatient = (patientData: Omit<Patient, "id">) => {
    if (editingPatient) {
      const updatedPatients = patients.map((p) =>
        p.id === editingPatient.id
          ? {
              // ...patientData,
              // id: editingPatient.id,
              // medicalRecordId: editingPatient.medicalRecordId,
              ...editingPatient,
            }
          : p
      );
      console.log("wqwqwq", updatedPatients);
      setPatients(updatedPatients);
      setEditingPatient(null);
      setShowForm(false);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter((p) => p.id !== patientId));
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleEditClick = (patient: Patient) => {
    console.log("pattiti", editingPatient);
    setEditingPatient(patient);
    setShowForm(true);
  };

  return (
    <div className="container-full bg-gray-50">
      <div className="mx-auto py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-medical">Gerenciamento de Pacientes</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      <main className="mx-auto py-6">
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingPatient ? "Editar Paciente" : "Novo Paciente"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientForm
                patient={editingPatient}
                onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                }}
              />
            </CardContent>
          </Card>
        ) : selectedPatient ? (
          <PatientDetails
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
            onEdit={() => handleEditClick(selectedPatient)}
          />
        ) : (
          <PatientList
            patients={patients}
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditClick}
            onDeletePatient={handleDeletePatient}
          />
        )}
      </main>
    </div>
  );
};

export default Patients;
