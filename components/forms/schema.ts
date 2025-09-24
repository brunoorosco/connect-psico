// schemas/forms.ts
import { z } from "zod"

// ---------- FICHA DE IDENTIFICAÇÃO ----------
export const IdentificationSchema = z.object({
  date: z.string().optional(),
  attendedBy: z.string().optional(),
  name: z.string().min(3, "Informe o nome completo"),
  birthDate: z.string().optional(),
  age: z.string().optional(),
  placeOfBirth: z.string().optional(),
  sex: z.enum(["F", "M"]).optional(),
  maritalStatus: z.string().optional(),
  profession: z.string().optional(),
  schooling: z.string().optional(),
  isStudying: z.boolean().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  spouseName: z.string().optional(),
  spouseAge: z.string().optional(),
  children: z.array(z.object({ name: z.string(), age: z.string() })).optional(),
  siblings: z.array(z.object({ name: z.string(), age: z.string() })).optional(),
  householdCount: z.string().optional(),
  illness: z.string().optional(),
  surgery: z.string().optional(),
  medication: z.string().optional(),
  psychHistory: z.string().optional(),
  addictions: z.string().optional(),
  complaint: z.string().max(4000).optional(),
})
export type IdentificationData = z.infer<typeof IdentificationSchema>

// ---------- ANAMNESE ADULTO ----------
const yesNo = z.enum(["SIM", "NAO"])
const severity = ["LEVE", "MODERADO", "SEVERO"]

export const AdultAnamnesisSchema = z.object({
  // cabeçalho
  date: z.string().optional(),
  name: z.string().min(3),
  informant: z.string().optional(),
  address: z.string().optional(),
  phones: z.string().optional(),
  birthDate: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  birthPlace: z.string().optional(),
  language: z.string().optional(),
  fluency: z.string().optional(),
  writingHand: z.string().optional(),
  referral: z.string().optional(),
  medicalDx: z.string().optional(),
  demand: z.string().optional(),

  // SINTOMAS (checkboxes/grupos)
  symptomsPhysical: z.object({
    headache: z.boolean().optional(),
    dizziness: z.boolean().optional(),
    nauseaVomiting: z.boolean().optional(),
    fatigue: z.boolean().optional(),
    urinaryIncontinence: z.boolean().optional(),
    giProblems: z.boolean().optional(),
    hemibodyWeakness: z.boolean().optional(),
    fineMotorControl: z.boolean().optional(),
    tremorsNumbness: z.boolean().optional(),
    tics: z.boolean().optional(),
    balance: z.boolean().optional(),
    fainting: z.boolean().optional(),
    bumping: z.boolean().optional(),
    lossSensation: z.string().optional(), // “indicar local”
    skinParesthesia: z.string().optional(), // “indicar local”
    tempDiff: z.boolean().optional(),
    visualImpairment: z.boolean().optional(),
    correctiveLens: z.boolean().optional(),
    hemianopsia: z.boolean().optional(),
    lightSensitivity: z.boolean().optional(),
    blurredVision: z.boolean().optional(),
    hallucinations: z.boolean().optional(),
    transientBlindness: z.boolean().optional(),
    needsFocus: z.boolean().optional(),
    hearingLoss: z.boolean().optional(),
    hearingAid: z.boolean().optional(),
    tinnitus: z.boolean().optional(),
    oddNoises: z.boolean().optional(),
    neglect: z.boolean().optional(),
    tasteProblems: z
      .object({
        more: z.boolean().optional(),
        less: z.boolean().optional(),
      })
      .optional(),
    smellProblems: z
      .object({
        more: z.boolean().optional(),
        less: z.boolean().optional(),
      })
      .optional(),
    pain: z.boolean().optional(),
    other: z.string().optional(),
  }),

  symptomsCognitive: z.object({
    problemSolving: z
      .object({
        newThings: z.boolean().optional(),
        everyday: z.boolean().optional(),
        planning: z.boolean().optional(),
        shiftPlans: z.boolean().optional(),
        speed: z.boolean().optional(),
        completeOnTime: z.boolean().optional(),
        sequence: z.boolean().optional(),
      })
      .optional(),
    languageMath: z
      .object({
        wordFinding: z.boolean().optional(),
        incoherentSpeech: z.boolean().optional(),
        unusualSounds: z.boolean().optional(),
        expressThoughts: z.boolean().optional(),
        understandOthers: z.boolean().optional(),
        reading: z.boolean().optional(),
        writing: z.boolean().optional(),
        mathOps: z.boolean().optional(),
        other: z.string().optional(),
      })
      .optional(),
    nonverbalSkills: z
      .object({
        leftRight: z.boolean().optional(),
        drawCopy: z.boolean().optional(),
        dress: z.boolean().optional(),
        automaticActs: z.boolean().optional(),
        wayfinding: z.boolean().optional(),
        recognize: z.boolean().optional(),
        bodyPartAlien: z.boolean().optional(),
        musicalDecline: z.boolean().optional(),
        timeLoss: z.boolean().optional(),
        slowReaction: z.boolean().optional(),
        other: z.string().optional(),
      })
      .optional(),
    awarenessAttention: z
      .object({
        distractible: z.boolean().optional(),
        loseTrain: z.boolean().optional(),
        blankMind: z.boolean().optional(),
        multitask: z.boolean().optional(),
        confused: z.boolean().optional(),
        oddSensations: z.boolean().optional(),
        notAlert: z.boolean().optional(),
        effortful: z.boolean().optional(),
        other: z.string().optional(),
      })
      .optional(),
    memory: z
      .object({
        misplace: z.boolean().optional(),
        names: z.boolean().optional(),
        loseTrackActivity: z.boolean().optional(),
        whereAmI: z.boolean().optional(),
        recentEvents: z.boolean().optional(),
        appointments: z.boolean().optional(),
        remoteEvents: z.boolean().optional(),
        relyOthers: z.boolean().optional(),
        relyNotes: z.boolean().optional(),
        orderEvents: z.boolean().optional(),
        recallFactsProcedures: z.boolean().optional(),
        prosopagnosia: z.boolean().optional(),
        other: z.string().optional(),
      })
      .optional(),
  }),

  moodBehavior: z
    .object({
      sadness: z.enum(["LEVE", "MODERADO", "SEVERO"]).optional(),
      anxiety: z.enum(["LEVE", "MODERADO", "SEVERO"]).optional(),
      stress: z.enum(["LEVE", "MODERADO", "SEVERO"]).optional(),
      sleepProblems: z.boolean().optional(),
      nightmares: z.boolean().optional(),
      irritable: z.boolean().optional(),
      euphoria: z.boolean().optional(),
      emotional: z.boolean().optional(),
      apathy: z.boolean().optional(),
      frustration: z.boolean().optional(),
      automaticActs: z.boolean().optional(),
      disinhibited: z.boolean().optional(),
      spontaneity: z.boolean().optional(),
      energyChange: z.enum(["PERDA", "AUMENTO"]).optional(),
      appetiteChange: z.enum(["PERDA", "AUMENTO"]).optional(),
      sexualChange: z.enum(["PERDA", "AUMENTO"]).optional(),
      anhedonia: z.boolean().optional(),
      irritabilityUp: z.boolean().optional(),
      aggressionUp: z.boolean().optional(),
      relationships: z.string().optional(),
      othersComment: z.string().optional(),
    })
    .optional(),

  lifeAreas: z
    .object({
      maritalFamily: z.boolean().optional(),
      financialLegal: z.boolean().optional(),
      dailyLife: z.boolean().optional(),
      moneyMgmt: z.boolean().optional(),
      mobility: z.boolean().optional(),
    })
    .optional(),

  onsetSpeed: z.enum(["DEVAGAR", "RAPIDO"]).optional(),
  last6Months: z.enum(["MELHOROU", "ESTACIONOU", "PIOROU"]).optional(),
  helpsReduce: z.string().optional(),
  worsen: z.string().optional(),
  selfSummary: z.enum(["DEFINITIVAMENTE", "POSSIVELMENTE", "NADA"]).optional(),
  goals: z.string().optional(),

  // histórico anterior / médico / familiar / pessoal etc.
  previousHistory: z.record(z.any()).optional(),
  medicalHistory: z.record(z.any()).optional(),
  substanceUse: z.record(z.any()).optional(),
  familyHistory: z.record(z.any()).optional(),
  personalHistory: z.record(z.any()).optional(),
  recentExams: z.record(z.any()).optional(),
  additionalInfo: z.string().optional(),
})
export type AdultAnamnesisData = z.infer<typeof AdultAnamnesisSchema>

// ---------- ANAMNESE INFANTIL ----------
export const ChildAnamnesisSchema = z.object({
  // antecedentes pessoais (cabeçalho)
  name: z.string().min(3),
  birthDate: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  shift: z.string().optional(),
  father: z
    .object({
      name: z.string().optional(),
      birthCity: z.string().optional(),
      birthState: z.string().optional(),
      nationality: z.string().optional(),
      schooling: z.string().optional(),
      profession: z.string().optional(),
      workplace: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  mother: z
    .object({
      name: z.string().optional(),
      birthCity: z.string().optional(),
      birthState: z.string().optional(),
      nationality: z.string().optional(),
      schooling: z.string().optional(),
      profession: z.string().optional(),
      workplace: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  complaint: z.string().max(6000).optional(),

  conception: z.record(z.any()).optional(),
  pregnancy: z.record(z.any()).optional(),
  birth: z.record(z.any()).optional(),

  development: z
    .object({
      sleep: z.record(z.any()).optional(),
      feeding: z.record(z.any()).optional(),
      psychomotor: z.record(z.any()).optional(),
      habits: z.record(z.any()).optional(), // chupeta/dedo/tiques
      tics: z.record(z.any()).optional(),
      schooling: z.record(z.any()).optional(),
      sociability: z.record(z.any()).optional(),
      emotional: z.record(z.any()).optional(),
      sexuality: z.record(z.any()).optional(),
    })
    .optional(),

  diseases: z
    .array(
      z.object({
        name: z.string(),
        age: z.string().optional(),
        severity: z.string().optional(),
      })
    )
    .optional(),
  accidents: z.string().optional(),
  headEarTrauma: z.string().optional(),
  visionProblems: z.string().optional(),
  allergies: z.string().optional(),
  currentHealth: z.enum(["BOA", "REGULAR", "DEFICIENTE"]).optional(),

  hearingInfo: z.record(z.any()).optional(),
  speechLanguage: z.record(z.any()).optional(),
  behavior: z.record(z.any()).optional(),
  familyBackground: z.record(z.any()).optional(),
  familyEnvironment: z.record(z.any()).optional(),
  relationships: z.record(z.any()).optional(),

  childDay: z
    .object({
      typicalDay: z.string().optional(),
      leisureDay: z.string().optional(),
    })
    .optional(),

  notes: z.string().optional(),
})
export type ChildAnamnesisData = z.infer<typeof ChildAnamnesisSchema>
