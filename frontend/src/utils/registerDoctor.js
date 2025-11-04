import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";

export async function registerDoctor(formData) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    // Step 1: Upload doctor metadata to IPFS
    console.log("Uploading doctor metadata to IPFS...");
    const ipfsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/doctormetadataupload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        specialization: formData.specialization,
        degree: formData.degree,
        licenseNumber: formData.licenseNumber || "",
        experience: formData.experience || "",
        contactInfo: formData.contactInfo || "",
      }),
    });

    if (!ipfsResponse.ok) {
      const errorText = await ipfsResponse.text();
      throw new Error(`IPFS upload failed: ${errorText}`);
    }

    const ipfsData = await ipfsResponse.json();
    
    if (!ipfsData.success || !ipfsData.hash) {
      throw new Error("Failed to get IPFS hash from server");
    }

    const ipfsHash = ipfsData.hash;
    console.log("Doctor metadata uploaded to IPFS:", ipfsHash);

    // Step 2: Push to blockchain
    console.log("Registering doctor on blockchain...");
    const contract = new ethers.Contract(CONTRACTS.doctor.address, CONTRACTS.doctor.abi, signer);

    const tx = await contract.registerDoctor(
      ipfsHash, // Store IPFS hash on blockchain,
      {
        gasLimit: 300000 // Adjust gas limit as needed
      }
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return {
      success: true,
      txHash: tx.hash,
      ipfsHash: ipfsHash,
      metadata: ipfsData.metadata
    };

  } catch (error) {
    console.error("Doctor registration failed:", error);
    throw new Error(`Doctor registration failed: ${error.message}`);
  }
}
