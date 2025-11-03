import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";

export async function registerPatient(formData) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACTS.patient.address, CONTRACTS.patient.abi, signer);

  const tx = await contract.registerPatient(
    formData.name,
    formData.gender,
    formData.dob,
    formData.bloodGroup,
    formData.contact,
    formData.address
  );

  return tx.wait();
}
