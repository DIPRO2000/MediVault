const AccessControl = artifacts.require("./AccessControl.sol");
const PatientRegistry = artifacts.require("./PatientRegistry.sol");
const DoctorRegistry = artifacts.require("./DoctorRegistry.sol");
const MedicalRecord = artifacts.require("./MedicalRecord.sol");

// Utility function to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function (deployer) {
    const DELAY_MS = 3000; // 3 seconds

    // Step 1: Deploy AccessControl
    console.log("Starting deployment of AccessControl...");
    await deployer.deploy(AccessControl);
    const accessControl = await AccessControl.deployed();
    console.log("AccessControl deployed at:", accessControl.address);
    await delay(DELAY_MS);
    console.log(`Paused for ${DELAY_MS / 1000} seconds.`);

    // Step 2: Deploy PatientRegistry
    console.log("Starting deployment of PatientRegistry...");
    await deployer.deploy(PatientRegistry);
    const patientRegistry = await PatientRegistry.deployed();
    console.log("PatientRegistry deployed at:", patientRegistry.address);
    await delay(DELAY_MS);
    console.log(`Paused for ${DELAY_MS / 1000} seconds.`);

    // Step 3: Deploy DoctorRegistry
    console.log("Starting deployment of DoctorRegistry...");
    await deployer.deploy(DoctorRegistry);
    const doctorRegistry = await DoctorRegistry.deployed();
    console.log("DoctorRegistry deployed at:", doctorRegistry.address);
    await delay(DELAY_MS);
    console.log(`Paused for ${DELAY_MS / 1000} seconds.`);

    // Step 4: Deploy MedicalRecord with constructor params
    console.log("Starting deployment of MedicalRecord...");
    await deployer.deploy(MedicalRecord, accessControl.address, patientRegistry.address);
    const medicalRecord = await MedicalRecord.deployed();
    console.log("MedicalRecord deployed at:", medicalRecord.address);
    // No pause needed after the last deployment

    console.log("\n✅ Deployment Summary:");
    console.log("AccessControl:", accessControl.address);
    console.log("PatientRegistry:", patientRegistry.address);
    console.log("DoctorRegistry:", doctorRegistry.address);
    console.log("MedicalRecord:", medicalRecord.address);
};