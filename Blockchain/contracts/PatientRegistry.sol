// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRegistry {
    struct Patient {
        string name;            // Patient’s full name
        string gender;          // "Male", "Female", "Other"
        string dateOfBirth;     // DOB (YYYY-MM-DD)
        string bloodGroup;      // e.g. "A+", "B-", etc.
        string contactInfo;     // Email or phone
        string homeAddress;     // Full residential address
        bool isRegistered;      // Tracks if account exists
        string[] fileHashes;   // Uploaded record identifiers (keccak of IPFS CID)
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patient, string name);
    event FileAdded(address indexed patient, string fileHash);

    // modifier onlyRegistered() {
    //     require(patients[msg.sender].isRegistered, "Not registered");
    //     _;
    // }

    function registerPatient(
        string memory _name,
        string memory _gender,
        string memory _dateOfBirth,
        string memory _bloodGroup,
        string memory _contactInfo,
        string memory _homeAddress
    ) external {
        require(!patients[msg.sender].isRegistered, "Already registered");

        Patient storage p = patients[msg.sender];
        p.name = _name;
        p.gender = _gender;
        p.dateOfBirth = _dateOfBirth;
        p.bloodGroup = _bloodGroup;
        p.contactInfo = _contactInfo;
        p.homeAddress = _homeAddress;
        p.isRegistered = true;

        emit PatientRegistered(msg.sender, _name);
    }

    function addFileToPatient(address _patient,string memory _fileHash) public  {
        require(patients[_patient].isRegistered, "Not registered");
        patients[_patient].fileHashes.push(_fileHash);
        emit FileAdded(_patient, _fileHash);
    }

    function getPatientFiles(address _patient) external view returns (string[] memory) {
        return patients[_patient].fileHashes;
    }

    function getPatientDetails(address _patient)
        external
        view
        returns (
            string memory name,
            string memory gender,
            string memory dateOfBirth,
            string memory bloodGroup,
            string memory contactInfo,
            string memory homeAddress
        )
    {
        Patient storage p = patients[_patient];
        return (p.name, p.gender, p.dateOfBirth, p.bloodGroup, p.contactInfo, p.homeAddress);
    }

    // function test() public view returns(bool)
    // {
    //     return patients[msg.sender].isRegistered;
    // }
}
