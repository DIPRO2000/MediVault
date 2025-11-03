
import PatientRegistry from "../../../Blockchain/build/contracts/PatientRegistry.json" with { type: "json" };
import DoctorRegistry from "../../../Blockchain/build/contracts/DoctorRegistry.json" with { type: "json" };
import AccessControl from "../../../Blockchain/build/contracts/AccessControl.json" with { type: "json" };
import MedicalRecord from "../../../Blockchain/build/contracts/MedicalRecord.json" with { type: "json" };
//import AdminRegistry from "../../../Blockchain/build/contracts/AdminRegistry.json";


export const CONTRACTS = {
  patient: {
    address: `${import.meta.env.VITE_PATIENT_REGISTRY_ADDRESS}`, // replace after deploy
    abi: PatientRegistry.abi,
  },
//   doctor: {
//     address: "0x0000000000000000000000000000000000000000",
//     abi: require("../abis/DoctorRegistry.json"),
//   },
  accesscontrol: {
    address: `${import.meta.env.VITE_ACCESS_CONTROL_ADDRESS}`,
    abi: AccessControl.abi,
  },
  medicalrecord: {
    address: `${import.meta.env.VITE_MEDICAL_RECORD_ADDRESS}`,
    abi: MedicalRecord.abi,
  },
};
