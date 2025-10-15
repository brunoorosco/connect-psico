export interface IPrescription {
  value: string;
  onChange: (val: string) => void;
}

export interface IPatientHeader {
  name: string;
  age?: number;
  gender?: string;
  diagnosis?: string;
  date: Date;
  time: string;
  isEditing: boolean;
  onEditToggle: () => void;
}

export interface IConsultationDateTimeEditor {
  date: Date;
  time: string;
  onChangeDate: (date: Date) => void;
  onChangeTime: (time: string) => void;
  onConfirm: () => void;
}

export interface IClinicalEvolution {
  value: string;
  onChange: (val: string) => void;
}