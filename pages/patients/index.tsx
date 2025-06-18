import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import PatientList from '@/components/Patients/PatientList';
import PatientForm from '@/components/Patients/PatientForm';
import PatientDetails from '@/components/Patients/PatientDetails';
import { Patient } from '@/types/appointment';
import { mockPatients } from '@/data/mockData';

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleAddPatient = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPatients([...patients, newPatient]);
    setShowForm(false);
  };

  const handleEditPatient = (patientData: Omit<Patient, 'id'>) => {
    if (editingPatient) {
      const updatedPatients = patients.map(p => 
        p.id === editingPatient.id ? { ...patientData, id: editingPatient.id } : p
      );
      setPatients(updatedPatients);
      setEditingPatient(null);
      setShowForm(false);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-medical">Gerenciamento de Pacientes</h1>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </CardTitle>
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
