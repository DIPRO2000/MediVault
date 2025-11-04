// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRegistry {
    //State variables to track counts
    uint256 public totalPatients;
    uint256 public totalFileRecords;

    struct Patient {
        string name;
        string gender;
        string dateOfBirth;
        string bloodGroup;
        string contactInfo;
        string homeAddress;
        bool isRegistered;
        string[] fileHashes;
    }

    mapping(address => Patient) public patients;
    
    // Array to store all registered patient addresses for iteration
    address[] public registeredPatientAddresses;

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
        
        //Update total counts and array on registration
        totalPatients++; // Increment total patient count
        registeredPatientAddresses.push(msg.sender); // Add address to iterable list

        emit PatientRegistered(msg.sender, _name);
    }

    function addFileToPatient(address _patient, string memory _fileHash) public {
        require(patients[_patient].isRegistered, "Not registered");
        patients[_patient].fileHashes.push(_fileHash);
        
        // Update total records count on file addition
        totalFileRecords++; 

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

    // Getter functions for total counts
    
    function getTotalPatientsCount() public view returns (uint256) {
        return totalPatients;
    }

    function getTotalRecordsCount() public view returns (uint256) {
        return totalFileRecords;
    }
    
    function getAllRegisteredPatients() public view returns (address[] memory) {
        return registeredPatientAddresses;
    }
}