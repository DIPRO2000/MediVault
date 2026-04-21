
import PatientRegistry from "../blockchain/build/contracts/PatientRegistry.json" with { type: "json" };
import DoctorRegistry from "../blockchain/build/contracts/DoctorRegistry.json" with { type: "json" };
import AccessControl from "../blockchain/build/contracts/AccessControl.json" with { type: "json" };
import MedicalRecord from "../blockchain/build/contracts/MedicalRecord.json" with { type: "json" };


export const CONTRACTS = {
  patient: {
    address: `${import.meta.env.VITE_PATIENT_REGISTRY_ADDRESS}`, // replace after deploy
    abi: PatientRegistry.abi,
  },
  doctor: {
    address: `${import.meta.env.VITE_DOCTOR_REGISTRY_ADDRESS}`,
    abi: DoctorRegistry.abi,
  },
  accesscontrol: {
    address: `${import.meta.env.VITE_ACCESS_CONTROL_ADDRESS}`,
    abi: AccessControl.abi,
  },
  medicalrecord: {
    address: `${import.meta.env.VITE_MEDICAL_RECORD_ADDRESS}`,
    abi: MedicalRecord.abi,
  },
};
