const AccessControl = artifacts.require("./AccessControl.sol");
const PatientRegistry = artifacts.require("./PatientRegistry.sol");
const DoctorRegistry = artifacts.require("./DoctorRegistry.sol");
const MedicalRecord = artifacts.require("./MedicalRecord.sol");

module.exports = async function (deployer) {
  // Step 1: Deploy AccessControl
  await deployer.deploy(AccessControl);
  const accessControl = await AccessControl.deployed();
  console.log("AccessControl deployed at:", accessControl.address);

  // Step 2: Deploy PatientRegistry
  await deployer.deploy(PatientRegistry);
  const patientRegistry = await PatientRegistry.deployed();
  console.log("PatientRegistry deployed at:", patientRegistry.address);

  // Step 3: Deploy DoctorRegistry
  await deployer.deploy(DoctorRegistry);
  const doctorRegistry = await DoctorRegistry.deployed();
  console.log("DoctorRegistry deployed at:", doctorRegistry.address);

  // Step 4: Deploy MedicalRecord with constructor params
  await deployer.deploy(MedicalRecord, accessControl.address, patientRegistry.address);
  const medicalRecord = await MedicalRecord.deployed();
  console.log("MedicalRecord deployed at:", medicalRecord.address);

  console.log("\n✅ Deployment Summary:");
  console.log("AccessControl:", accessControl.address);
  console.log("PatientRegistry:", patientRegistry.address);
  console.log("DoctorRegistry:", doctorRegistry.address);
  console.log("MedicalRecord:", medicalRecord.address);
};
