import axios from "axios";
import {ethers} from "ethers";
import { provider,CONTRACTS,RPC_URL } from "../config/contracts.js";

export const uploadDoctorMetadataToIPFS = async (req, res) => {
  try {
    const { name, specialization, degree, licenseNumber, experience, contactInfo } = req.body;

    if (!name || !specialization || !degree) {
      return res.status(400).json({ error: "Name, specialization, and degree are required fields" });
    }

    const doctorMetadata = {
      name,
      specialization,
      degree,
      licenseNumber: licenseNumber || "",
      experience: experience || "",
      contactInfo: contactInfo || "",
      timestamp: new Date().toISOString(),
      type: "doctor_metadata"
    };

    // Use Pinata's JSON endpoint
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: doctorMetadata,
        pinataMetadata: {
          name: `doctor_${name.replace(/\s+/g, '_')}_metadata`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    res.json({ 
      success: true,
      hash: response.data.IpfsHash,
      metadata: doctorMetadata
    });

  } catch (err) {
    console.error("Doctor metadata IPFS upload failed:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Doctor metadata IPFS upload failed",
      details: err.message 
    });
  }
};


export const getDoctorMetadataFromIPFS = async (req, res) => {
  try {
    const { docAddress } = req.params;
    //console.log("Fetching metadata for doctor address:", docAddress);
    if (!docAddress) {
      return res.status(400).json({ error: "Doctor address is required" });
    }

    const doctorContract = new ethers.Contract(
      CONTRACTS.doctor.address,
      CONTRACTS.doctor.abi,
      provider
    );

    //console.log("Querying blockchain for IPFS hash...");

    const ipfsHash = await doctorContract.getDoctorDetails(docAddress);
    if (!ipfsHash || ipfsHash === "") {
      return res.status(404).json({ error: "No metadata found for this doctor" });
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(ipfsUrl);
    res.json({ 
      success: true,
      metadata: response.data 
    });
  } catch (err) {
    console.error("Failed to fetch doctor metadata from IPFS:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch doctor metadata from IPFS",
      details: err.message 
    });
  } 
}

//Get All registered Doctors
export const getAllDoctorsMetadataFromIPFS = async (req, res) => {
    try {
        // 1. Initialize the Contract instance
        const doctorContract = new ethers.Contract(
            CONTRACTS.doctor.address,
            CONTRACTS.doctor.abi,
            provider
        );

        // 2. Fetch all registered doctor addresses from the blockchain
        console.log("Querying blockchain for all registered doctor addresses...");
        const allDoctorAddresses = await doctorContract.getAllRegisteredDoctors();

        if (!allDoctorAddresses || allDoctorAddresses.length === 0) {
            return res.status(200).json({
                success: true,
                doctors: [],
                totalDoctors: 0,
                message: "No doctors are currently registered."
            });
        }

        console.log(`Found ${allDoctorAddresses.length} registered doctors on blockchain`);

        // 3. Prepare concurrent promises for fetching data for ALL doctors
        const fetchPromises = allDoctorAddresses.map(async (docAddress) => {
            let ipfsHash;
            let metadata = null;
            let success = false;
            let errorDetails = null;
            let verified = false;
            let registered = false;

            try {
                // a. Get doctor details from the contract
                const doctorDetails = await doctorContract.doctors(docAddress);
                
                // Extract data from the struct
                ipfsHash = doctorDetails.ipfsHash;
                verified = doctorDetails.verified;
                registered = doctorDetails.registered;

                console.log(`Doctor ${docAddress}: IPFS Hash = ${ipfsHash}, Verified = ${verified}, Registered = ${registered}`);

                if (registered && ipfsHash && ipfsHash.length > 0) {
                    // b. Fetch metadata from the IPFS gateway
                    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                    console.log(`Fetching metadata from IPFS: ${ipfsUrl}`);
                    
                    const response = await axios.get(ipfsUrl, {
                        timeout: 10000 // 10 second timeout
                    });
                    
                    metadata = response.data;
                    success = true;
                    
                    console.log(`Successfully fetched metadata for doctor ${docAddress}`);
                } else {
                    if (!registered) {
                        errorDetails = "Doctor not properly registered";
                    } else {
                        errorDetails = "IPFS hash not found or empty";
                    }
                    console.warn(`Failed to fetch data for doctor ${docAddress}: ${errorDetails}`);
                }
            } catch (err) {
                // Handle failures for individual doctor fetching
                errorDetails = `Failed to fetch IPFS data: ${err.message}`;
                console.error(`Error fetching data for doctor ${docAddress}:`, err.message);
            }

            // Return a structured object for each doctor
            return {
                address: docAddress,
                ipfsHash: ipfsHash,
                verified: verified,
                registered: registered,
                success: success,
                metadata: metadata,
                error: errorDetails
            };
        });

        // 4. Wait for all promises to resolve concurrently
        const results = await Promise.all(fetchPromises);

        // 5. Filter out only successfully registered doctors with metadata
        const successfulDoctors = results.filter(doctor => doctor.success && doctor.registered);
        const failedDoctors = results.filter(doctor => !doctor.success);
        const unregisteredDoctors = results.filter(doctor => !doctor.registered);

        console.log(`Results: ${successfulDoctors.length} successful, ${failedDoctors.length} failed, ${unregisteredDoctors.length} unregistered`);

        // 6. Respond with the compiled list of all doctor details
        res.json({
            success: true,
            totalDoctors: results.length,
            registeredDoctors: successfulDoctors.length,
            failedDoctors: failedDoctors.length,
            unregisteredDoctors: unregisteredDoctors.length,
            doctors: successfulDoctors, // Only return successfully fetched and registered doctors
            message: `Retrieved ${successfulDoctors.length} out of ${results.length} doctors successfully`
        });

    } catch (err) {
        console.error("Failed to fetch all doctor metadata:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch all doctor metadata",
            details: err.message
        });
    }
}


// Get all medical files accessible by a specific doctor
export const getDoctorAccessibleFiles = async (req, res) => {
    try {
        const { doctorAddress } = req.params;

        // Validate doctor address
        if (!doctorAddress || !ethers.isAddress(doctorAddress)) {
            return res.status(400).json({
                success: false,
                error: "Valid doctor address is required"
            });
        }

        
        // 1. Get AccessControl contract instance
        const accessControlContract = new ethers.Contract(
            CONTRACTS.accesscontrol.address,
            CONTRACTS.accesscontrol.abi,
            provider
        );

        // 2. Get MedicalRecord contract instance
        const medicalRecordContract = new ethers.Contract(
            CONTRACTS.medicalrecord.address,
            CONTRACTS.medicalrecord.abi,
            provider
        );

        console.log(`Fetching accessible files for doctor: ${doctorAddress}`);

        // 3. Get all file hashes accessible by the doctor
        const accessibleFileHashes = await accessControlContract.getFilesForDoctor(doctorAddress);
        
        console.log(`Found ${accessibleFileHashes.length} accessible files for doctor ${doctorAddress}`);

        if (accessibleFileHashes.length === 0) {
            return res.json({
                success: true,
                doctorAddress: doctorAddress,
                accessibleFiles: [],
                totalFiles: 0,
                message: "No files accessible for this doctor"
            });
        }

        // 4. Fetch detailed record information for each accessible file
        const fileDetailsPromises = accessibleFileHashes.map(async (fileHash) => {
            try {
                // Get record details from MedicalRecord contract
                const record = await medicalRecordContract.viewRecord(fileHash, doctorAddress);
                
                console.log(`Fetched record for hash ${fileHash}:`, record);

                return {
                    fileHash: fileHash,
                    recordType: record.recordType,
                    owner: record.owner,
                    timestamp: record.timestamp.toString(),
                    isOwner: record.owner === doctorAddress,
                    accessGrantedBy: record.owner // The patient who granted access
                };
            } catch (error) {
                console.error(`Error fetching details for file ${fileHash}:`, error.message);
                return {
                    fileHash: fileHash,
                    error: `Failed to fetch record details: ${error.message}`,
                    accessible: false
                };
            }
        });

        // 5. Wait for all record details to be fetched
        const fileDetails = await Promise.all(fileDetailsPromises);

        // 6. Filter out failed fetches and count successful ones
        const successfulFiles = fileDetails.filter(file => !file.error);
        const failedFiles = fileDetails.filter(file => file.error);

        console.log(`Successfully fetched ${successfulFiles.length} files, ${failedFiles.length} failed`);

        // 7. Respond with the compiled data
        res.json({
            success: true,
            doctorAddress: doctorAddress,
            accessibleFiles: successfulFiles,
            failedFiles: failedFiles,
            totalFiles: accessibleFileHashes.length,
            successfulFiles: successfulFiles.length,
            failedFiles: failedFiles.length,
            message: `Retrieved ${successfulFiles.length} out of ${accessibleFileHashes.length} accessible files`
        });

    } catch (error) {
        console.error("Error fetching doctor accessible files:", error.message);
        
        // Handle specific error cases
        if (error.message.includes("Access denied")) {
            return res.status(403).json({
                success: false,
                error: "Access denied to medical records",
                details: error.message
            });
        } else if (error.message.includes("Record does not exist")) {
            return res.status(404).json({
                success: false,
                error: "One or more records not found",
                details: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to fetch doctor accessible files",
            details: error.message
        });
    }
};

// Optional: Get accessible files with patient information
export const getDoctorAccessibleFilesWithPatientInfo = async (req, res) => {
    try {
        const { doctorAddress } = req.params;

        // Validate doctor address
        if (!doctorAddress || !ethers.isAddress(doctorAddress)) {
            return res.status(400).json({
                success: false,
                error: "Valid doctor address is required"
            });
        }
        
        // Get contracts
        const accessControlContract = new ethers.Contract(
            CONTRACTS.accesscontrol.address,
            CONTRACTS.accesscontrol.abi,
            provider
        );

        const medicalRecordContract = new ethers.Contract(
            CONTRACTS.medicalrecord.address,
            CONTRACTS.medicalrecord.abi,
            provider
        );

        const patientContract = new ethers.Contract(
            CONTRACTS.patient.address,
            CONTRACTS.patient.abi,
            provider
        );

        console.log(`Fetching accessible files with patient info for doctor: ${doctorAddress}`);

        // Get accessible file hashes
        const accessibleFileHashes = await accessControlContract.getFilesForDoctor(doctorAddress);
        
        if (accessibleFileHashes.length === 0) {
            return res.json({
                success: true,
                doctorAddress: doctorAddress,
                accessibleFiles: [],
                totalFiles: 0,
                message: "No files accessible for this doctor"
            });
        }

        // Fetch detailed information including patient data
        const fileDetailsPromises = accessibleFileHashes.map(async (fileHash) => {
            try {
                // Get record details
                const record = await medicalRecordContract.viewRecord(fileHash, doctorAddress);
                
                // Get patient information
                let patientInfo = null;
                try {
                    const patientData = await patientContract.patients(record.owner);
                    patientInfo = {
                        name: patientData.name,
                        walletAddress: record.owner,
                        contactInfo: patientData.contactInfo,
                        bloodGroup: patientData.bloodGroup
                    };
                } catch (patientError) {
                    console.warn(`Could not fetch patient info for ${record.owner}:`, patientError.message);
                    patientInfo = {
                        walletAddress: record.owner,
                        name: "Unknown Patient"
                    };
                }

                return {
                    fileHash: fileHash,
                    recordType: record.recordType,
                    timestamp: record.timestamp.toString(),
                    uploadDate: new Date(Number(record.timestamp) * 1000).toISOString(),
                    patient: patientInfo,
                    accessGrantedBy: record.owner,
                    isOwner: record.owner === doctorAddress
                };
            } catch (error) {
                console.error(`Error fetching details for file ${fileHash}:`, error.message);
                return {
                    fileHash: fileHash,
                    error: `Failed to fetch record details: ${error.message}`,
                    accessible: false
                };
            }
        });

        const fileDetails = await Promise.all(fileDetailsPromises);
        const successfulFiles = fileDetails.filter(file => !file.error);

        res.json({
            success: true,
            doctorAddress: doctorAddress,
            accessibleFiles: successfulFiles,
            totalFiles: accessibleFileHashes.length,
            successfulFiles: successfulFiles.length,
            message: `Retrieved ${successfulFiles.length} accessible files with patient information`
        });

    } catch (error) {
        console.error("Error fetching doctor accessible files with patient info:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch doctor accessible files",
            details: error.message
        });
    }
};