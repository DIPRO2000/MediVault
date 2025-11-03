const AccessControl = artifacts.require("./AccessControl.sol");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer) {
    console.log("--- Step 1: Deploying AccessControl ---");
    await deployer.deploy(AccessControl);
    const accessControl = await AccessControl.deployed();
    console.log("AccessControl deployed at address:", accessControl.address);

    // Save the deployed address to a config file (deployedAddresses.json one level up)
    const configPath = path.join(__dirname, "..", "deployedAddresses.json");
    let deployedAddresses = {}; 
    
    // Read existing addresses if the file exists
    if (fs.existsSync(configPath)) {
        deployedAddresses = JSON.parse(fs.readFileSync(configPath));
    }  
    
    deployedAddresses.AccessControl = accessControl.address;
    fs.writeFileSync(configPath, JSON.stringify(deployedAddresses, null, 2));
    console.log("Deployed addresses updated in deployedAddresses.json");    
};