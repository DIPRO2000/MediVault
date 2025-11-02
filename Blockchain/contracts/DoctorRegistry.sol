// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DoctorRegistry {
    address public admin;

    struct Doctor {
        string ipfsHash;   // IPFS CID containing doctor's details (name, degree, license, etc.)
        bool verified;     // Indicates if admin has verified the doctor
        bool registered;   // Indicates if doctor has registered
    }

    mapping(address => Doctor) public doctors;

    event DoctorRegistered(address indexed doctor, string ipfsHash);
    event DoctorVerified(address indexed doctor);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Doctors register by uploading their info to IPFS and submitting the CID
    function registerDoctor(string memory _ipfsHash) external {
        require(!doctors[msg.sender].registered, "Already registered");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        doctors[msg.sender] = Doctor({
            ipfsHash: _ipfsHash,
            verified: false,
            registered: true
        });

        emit DoctorRegistered(msg.sender, _ipfsHash);
    }

    // Admin verifies a doctor's credentials after off-chain review
    function verifyDoctor(address _doctor) external onlyAdmin {
        require(doctors[_doctor].registered, "Doctor not registered");
        require(!doctors[_doctor].verified, "Already verified");

        doctors[_doctor].verified = true;
        emit DoctorVerified(_doctor);
    }

    // Public function to check if a doctor is verified
    function isVerified(address _doctor) external view returns (bool) {
        return doctors[_doctor].verified;
    }

    // Returns the IPFS hash for a given doctor
    function getDoctorDetails(address _doctor) external view returns (string memory) {
        require(doctors[_doctor].registered, "Doctor not registered");
        return doctors[_doctor].ipfsHash;
    }
}
