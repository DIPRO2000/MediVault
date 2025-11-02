// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./PatientRegistry.sol";

contract MedicalRecord {
    AccessControl public accessControl;
    PatientRegistry public patientRegistry;

    struct Record {
        bytes32 fileHash;        // IPFS or encrypted file reference
        string fileType;         // e.g. "X-ray", "Prescription"
        address owner;           // Patient’s address
        uint256 uploadTime;
    }

    mapping(bytes32 => Record) public records;

    event RecordUploaded(address indexed patient, bytes32 fileHash);
    event RecordViewed(address indexed doctor, bytes32 fileHash, uint256 time);

    constructor(address _accessControl, address _patientRegistry) {
        accessControl = AccessControl(_accessControl);
        patientRegistry = PatientRegistry(_patientRegistry);
    }

    function uploadRecord(bytes32 _fileHash, string memory _fileType) external {
        records[_fileHash] = Record(_fileHash, _fileType, msg.sender, block.timestamp);
        patientRegistry.addFileToPatient(_fileHash);
        emit RecordUploaded(msg.sender, _fileHash);
    }

    function viewRecord(bytes32 _fileHash) external {
        require(
            accessControl.hasAccess(_fileHash, msg.sender) ||
            records[_fileHash].owner == msg.sender,
            "Access denied"
        );
        emit RecordViewed(msg.sender, _fileHash, block.timestamp);
    }
}
