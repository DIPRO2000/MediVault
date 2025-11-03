
import PatientRegistry from "../../../Blockchain/build/contracts/PatientRegistry.json" with { type: "json" };
import DoctorRegistry from "../../../Blockchain/build/contracts/DoctorRegistry.json" with { type: "json" };
import AccessControl from "../../../Blockchain/build/contracts/AccessControl.json" with { type: "json" };
import MedicalRecord from "../../../Blockchain/build/contracts/MedicalRecord.json" with { type: "json" };
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();


export const RPC_URL = process.env.RPC_URL; // e.g. Alchemy, Infura, or local 
console.log(RPC_URL);
export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const CONTRACTS = {
  patient: {
    address: `${process.env.PATIENT_REGISTRY_ADDRESS}`, // replace after deploy
    abi: PatientRegistry.abi,
  },
//   doctor: {
//     address: "0x0000000000000000000000000000000000000000",
//     abi: require("../abis/DoctorRegistry.json"),
//   },
//   accesscontrol: {
//     address: "0x0000000000000000000000000000000000000000",
//     abi: require("../abis/AdminRegistry.json"),
//   },
  medicalrecord: {
    address: `${process.env.MEDICAL_RECORD_ADDRESS}`,
    abi: MedicalRecord.abi,
  },
};
