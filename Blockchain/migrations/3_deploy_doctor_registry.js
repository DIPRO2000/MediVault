const DoctorRegistry = artifacts.require("./DoctorRegistry.sol");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer) {
    console.log("--- Step 3: Deploying DoctorRegistry ---");
    await deployer.deploy(DoctorRegistry);
    const doctorRegistry = await DoctorRegistry.deployed();
    console.log("DoctorRegistry deployed at address:", doctorRegistry.address);

    // Save the deployed address to a config file
    const configPath = path.join(__dirname, "..", "deployedAddresses.json");
    let deployedAddresses = {}; 
    
    if (fs.existsSync(configPath)) {
        deployedAddresses = JSON.parse(fs.readFileSync(configPath));
    }  
    
    deployedAddresses.DoctorRegistry = doctorRegistry.address;
    fs.writeFileSync(configPath, JSON.stringify(deployedAddresses, null, 2));
    console.log("Deployed addresses updated in deployedAddresses.json");    
};