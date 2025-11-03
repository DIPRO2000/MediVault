import axios from "axios";
import FormData from "form-data";
import {ethers} from "ethers";
import { provider,CONTRACTS,RPC_URL } from "../config/contracts.js";

export const uploadToIPFS = async (req, res) => {
  try {
    const data = new FormData();
    data.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    res.json({ hash: response.data.IpfsHash });
  } catch (err) {
    console.error("IPFS upload failed:", err.message);
    res.status(500).json({ error: "IPFS upload failed" });
  }
};


export const getPatientFiles = async (req, res) => {

  const contract = new ethers.Contract(CONTRACTS.patient.address, CONTRACTS.patient.abi, provider);

  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const fileHashes = await contract.getPatientFiles(address);

    // Optional: convert bytes32 to string if stored that way
    const formattedHashes = fileHashes.map((hash) => {
      try {
        return ethers.decodeBytes32String(hash).replace(/\0/g, "");
      } catch {
        return hash; // fallback if it’s already a normal string
      }
    });

    return res.status(200).json({
      success: true,
      patient: address,
      files: formattedHashes,
      count: formattedHashes.length,
    });
  } catch (error) {
    console.error("Error in getPatientFiles:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient files",
      error: error.message,
    });
  }
};
