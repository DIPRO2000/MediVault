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
  const patientContract = new ethers.Contract(CONTRACTS.patient.address, CONTRACTS.patient.abi, provider);
  const medicalrecordContract = new ethers.Contract(CONTRACTS.medicalrecord.address, CONTRACTS.medicalrecord.abi, provider);

  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const fileHashes = await patientContract.getPatientFiles(address);

    // Optional: convert bytes32 to string if stored that way
    const formattedHashes = fileHashes.map((hash) => {
      try {
        return ethers.decodeBytes32String(hash).replace(/\0/g, "");
      } catch {
        return hash; // fallback if it's already a normal string
      }
    });

    let fileRecords = [];
    for (const hash of formattedHashes) {
      const record = await medicalrecordContract.getRecordDetails(hash);
      
      // Convert BigInt values to strings for JSON serialization
      const serializableRecord = {
        fileHash: record.fileHash,
        fileType: record.fileType,
        owner: record.owner,
        uploadTime: record.uploadTime.toString(), // Convert BigInt to string
      };
      
      fileRecords.push(serializableRecord);
    }

    return res.status(200).json({
      success: true,
      patient: address,
      fileHashes: formattedHashes,
      fileRecords: fileRecords,
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


//Get Patients Stats like total files uploaded or total patients registered
export const getPatientRegistryStats = async (req, res) => {
    try {
        // 1. Initialize the Contract instance
        const patientContract = new ethers.Contract(
            CONTRACTS.patient.address,
            CONTRACTS.patient.abi,
            provider
        );

        // 2. Prepare concurrent promises for fetching all three data points
        // Using Promise.all is highly efficient for multiple view calls
        const [
            totalPatientsCount,
            totalRecordsCount,
            allPatientAddresses
        ] = await Promise.all([
            // Call the function to get the total patient count
            patientContract.getTotalPatientsCount(), 
            
            // Call the function to get the total record count
            patientContract.getTotalRecordsCount(), 
            
            // Call the function to get the array of all patient addresses
            patientContract.getAllRegisteredPatients() 
        ]);

        // 3. Process and format the results
        // Convert BigNumber (or equivalent) results to standard JavaScript numbers/strings
        const stats = {
            // Use .toString() or .toNumber() depending on the ethers version/need
            totalPatients: totalPatientsCount.toString(), 
            totalRecords: totalRecordsCount.toString(),
            registeredAddresses: allPatientAddresses 
        };

        // 4. Respond with the compiled statistics
        res.json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error("Failed to fetch patient registry statistics:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch patient registry statistics",
            details: err.message
        });
    }
}


//Get Doctors with particular File Hash
export const getDoctorsWithFileAccess = async (req, res) => {
    try {
        // Retrieve the file hash from the URL parameters
        const { fileHash } = req.params;

        if (!fileHash) {
            return res.status(400).json({ error: "File hash is required in the request parameters" });
        }

        // 1. Initialize the Contract instance for the AccessControl contract
        const accessControlContract = new ethers.Contract(
            CONTRACTS.accesscontrol.address, // Replace with your AccessControl contract address
            CONTRACTS.accesscontrol.abi,     // Replace with your AccessControl contract ABI
            provider                  // Your initialized Ethers provider
        );

        console.log(`Querying contract for doctors with access to file: ${fileHash}`);

        // 2. Call the smart contract function
        // The contract logic (from the previously modified Solidity) ensures only 
        // actively granted addresses are returned.
        const activeDoctors = await accessControlContract.getDoctorsForFile(fileHash);

        // 3. Respond with the list of addresses
        res.json({
            success: true,
            fileHash: fileHash,
            activeDoctorAddresses: activeDoctors,
            totalAccessCount: activeDoctors.length
        });

    } catch (err) {
        console.error(`Failed to retrieve doctors for file ${req.params.fileHash}:`, err.message);
        res.status(500).json({
            success: false,
            error: "Failed to query access control contract for file access.",
            details: err.message
        });
    }
}