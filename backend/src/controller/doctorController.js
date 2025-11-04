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