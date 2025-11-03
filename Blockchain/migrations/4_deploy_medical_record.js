const MedicalRecord = artifacts.require("./MedicalRecord.sol");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer) {
    console.log("--- Step 4: Deploying MedicalRecord ---");
    
    // Read the addresses of dependencies from the config file
    const configPath = path.join(__dirname, "..", "deployedAddresses.json");
    let deployedAddresses = {}; 
    
    if (fs.existsSync(configPath)) {
        deployedAddresses = JSON.parse(fs.readFileSync(configPath));
    } else {
        throw new Error("deployedAddresses.json not found! Cannot deploy MedicalRecord without AccessControl and PatientRegistry addresses.");
    }
    
    const accessControlAddress = deployedAddresses.AccessControl;
    const patientRegistryAddress = deployedAddresses.PatientRegistry;

    // Deploy MedicalRecord with constructor params
    await deployer.deploy(MedicalRecord, accessControlAddress, patientRegistryAddress);
    const medicalRecord = await MedicalRecord.deployed();
    console.log("MedicalRecord deployed at address:", medicalRecord.address);

    // Save the deployed address back to the config file
    deployedAddresses.MedicalRecord = medicalRecord.address;
    fs.writeFileSync(configPath, JSON.stringify(deployedAddresses, null, 2));
    console.log("Deployed addresses updated in deployedAddresses.json");    
};