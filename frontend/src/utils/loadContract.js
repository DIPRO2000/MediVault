import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts.js";

export const loadContract = async (type, signer) => {
  const contractInfo = CONTRACTS[type];
  if (!contractInfo || !contractInfo.address) throw new Error("Contract not found for type: " + type);
  return new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
};
