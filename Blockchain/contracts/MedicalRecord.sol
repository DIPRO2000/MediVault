// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./PatientRegistry.sol";

contract MedicalRecord {
    AccessControl public accessControl;
    PatientRegistry public patientRegistry;

    struct Record {
        string fileHash;      // IPFS or encrypted file reference (now string)
        string fileType;      // e.g. "X-ray", "Prescription"
        address owner;        // Patient’s address
        uint256 uploadTime;   // Timestamp of upload
    }

    // Mapping from fileHash (string) => Record details
    mapping(string => Record) private records;

    // Mapping from patient address => list of their file hashes
    mapping(address => string[]) private patientFiles;

    // Events
    event RecordUploaded(address indexed patient, string fileHash, string fileType);
    event RecordViewed(address indexed viewer, string fileHash, uint256 time);

    constructor(address _accessControl, address _patientRegistry) {
        accessControl = AccessControl(_accessControl);
        patientRegistry = PatientRegistry(_patientRegistry);
    }

    /**
     * @notice Upload a new medical record (IPFS hash in string form)
     * @param _fileHash - IPFS hash (e.g., "Qm...")
     * @param _fileType - Type of file (e.g., "X-ray", "Prescription")
     */
    function uploadRecord(string memory _fileHash, string memory _fileType) external {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(bytes(_fileType).length > 0, "Invalid file type");
        require(records[_fileHash].owner == address(0), "Record already exists");

        records[_fileHash] = Record({
            fileHash: _fileHash,
            fileType: _fileType,
            owner: msg.sender,
            uploadTime: block.timestamp
        });

        patientFiles[msg.sender].push(_fileHash);
        patientRegistry.addFileToPatient(msg.sender,_fileHash);

        emit RecordUploaded(msg.sender, _fileHash, _fileType);
    }

    /**
     * @notice View record details if access is granted or caller is owner
     * @param _fileHash - IPFS file hash (string)
     */
    function viewRecord(string memory _fileHash,address _user) external view returns (Record memory) {
        Record memory record = records[_fileHash];
        require(record.owner != address(0), "Record does not exist");

        bool isOwner = record.owner == _user;
        bool hasPermission = accessControl.hasAccess(_fileHash, _user);

        require(isOwner || hasPermission, "Access denied");

        return record;
    }

    /**
     * @notice Get all file hashes for a given patient
     * @param patient - Patient wallet address
     */
    function getPatientFiles(address patient) external view returns (string[] memory) {
        return patientFiles[patient];
    }

    /**
     * @notice Get record details by file hash
     */
    function getRecordDetails(string memory _fileHash) external view returns (Record memory) {
        require(records[_fileHash].owner != address(0), "Record not found");
        return records[_fileHash];
    }
}
