const PatientRegistry = artifacts.require("./PatientRegistry.sol");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer) {
    console.log("--- Step 2: Deploying PatientRegistry ---");
    await deployer.deploy(PatientRegistry);
    const patientRegistry = await PatientRegistry.deployed();
    console.log("PatientRegistry deployed at address:", patientRegistry.address);

    // Save the deployed address to a config file
    const configPath = path.join(__dirname, "..", "deployedAddresses.json");
    let deployedAddresses = {}; 
    
    if (fs.existsSync(configPath)) {
        deployedAddresses = JSON.parse(fs.readFileSync(configPath));
    }  
    
    deployedAddresses.PatientRegistry = patientRegistry.address;
    fs.writeFileSync(configPath, JSON.stringify(deployedAddresses, null, 2));
    console.log("Deployed addresses updated in deployedAddresses.json");    
};