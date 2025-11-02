// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRegistry {
    struct Patient {
        string name;            // Patient’s full name
        string gender;          // "Male", "Female", "Other"
        string dateOfBirth;     // DOB (YYYY-MM-DD or similar)
        string contactInfo;     // Email or phone
        bool isRegistered;      // Tracks if account exists
        bytes32[] fileHashes;   // Uploaded record identifiers (e.g., keccak of IPFS CID)
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patient, string name);
    event FileAdded(address indexed patient, bytes32 fileHash);

    modifier onlyRegistered() {
        require(patients[msg.sender].isRegistered, "Not registered");
        _;
    }

    function registerPatient(
        string memory _name,
        string memory _gender,
        string memory _dateOfBirth,
        string memory _contactInfo
    ) external {
        require(!patients[msg.sender].isRegistered, "Already registered");

        // Use a storage reference. Solidity initializes the dynamic array to empty.
        Patient storage p = patients[msg.sender];
        p.name = _name;
        p.gender = _gender;
        p.dateOfBirth = _dateOfBirth;
        p.contactInfo = _contactInfo;
        p.isRegistered = true;

        emit PatientRegistered(msg.sender, _name);
    }

    function addFileToPatient(bytes32 _fileHash) external onlyRegistered {
        patients[msg.sender].fileHashes.push(_fileHash);
        emit FileAdded(msg.sender, _fileHash);
    }

    function getPatientFiles(address _patient) external view returns (bytes32[] memory) {
        return patients[_patient].fileHashes;
    }

    function getPatientDetails(address _patient)
        external
        view
        returns (string memory, string memory, string memory, string memory)
    {
        Patient storage p = patients[_patient];
        return (p.name, p.gender, p.dateOfBirth, p.contactInfo);
    }
}
