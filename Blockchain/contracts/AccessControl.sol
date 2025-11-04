// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControl {
    // Primary storage: fileHash (string) => (doctor address => access granted)
    mapping(string => mapping(address => bool)) private fileAccess;

    // Doctor address => list of file hashes they have ever been granted access to
    mapping(address => string[]) private doctorToFileHashes;

    // File hash => list of doctor addresses who have ever been granted access
    mapping(string => address[]) private fileToDoctors;

    // Index maps for efficient deletion (to fix unbounded array growth)
    mapping(address => mapping(string => uint256)) private doctorFileIndex;
    mapping(string => mapping(address => uint256)) private fileDoctorIndex;

    event AccessGranted(string indexed fileHash, address indexed doctor);
    event AccessRevoked(string indexed fileHash, address indexed doctor);

    // Grant access to a particular doctor
    function grantAccess(string memory _fileHash, address _doctor) external {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_doctor != address(0), "Invalid doctor address");

        bool alreadyHasAccess = fileAccess[_fileHash][_doctor];

        // ✅ Only grant if not already active
        if (!alreadyHasAccess) {
            fileAccess[_fileHash][_doctor] = true;

            // Add to doctor’s list
            doctorToFileHashes[_doctor].push(_fileHash);
            doctorFileIndex[_doctor][_fileHash] = doctorToFileHashes[_doctor].length - 1;

            // Add to file’s doctor list
            fileToDoctors[_fileHash].push(_doctor);
            fileDoctorIndex[_fileHash][_doctor] = fileToDoctors[_fileHash].length - 1;

            emit AccessGranted(_fileHash, _doctor);
        }
    }

    /**
     * @notice Revoke access for a doctor to a specific file
     */
    function revokeAccess(string memory _fileHash, address _doctor) external {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_doctor != address(0), "Invalid doctor address");

        // ✅ Only emit and revoke if the doctor currently has access
        if (fileAccess[_fileHash][_doctor]) {
            fileAccess[_fileHash][_doctor] = false;

            // ✅ Remove from doctor’s active list efficiently
            uint256 indexDoctor = doctorFileIndex[_doctor][_fileHash];
            string[] storage fileList = doctorToFileHashes[_doctor];
            if (indexDoctor < fileList.length) {
                fileList[indexDoctor] = fileList[fileList.length - 1];
                fileList.pop();
            }

            // ✅ Remove from file’s active doctor list efficiently
            uint256 indexFile = fileDoctorIndex[_fileHash][_doctor];
            address[] storage doctorList = fileToDoctors[_fileHash];
            if (indexFile < doctorList.length) {
                doctorList[indexFile] = doctorList[doctorList.length - 1];
                doctorList.pop();
            }

            emit AccessRevoked(_fileHash, _doctor);
        }
    }

    /**
     * @notice Check if a user has access to a specific file
     */
    function hasAccess(string memory _fileHash, address _user) public view returns (bool) {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        return fileAccess[_fileHash][_user];
    }

    // Get all active IPFS file hashes accessible by a doctor
    function getFilesForDoctor(address _doctor) external view returns (string[] memory activeFileHashes) {
        return doctorToFileHashes[_doctor];
    }

    // Get all doctors who have active access to a specific IPFS file
    function getDoctorsForFile(string memory _fileHash) external view returns (address[] memory activeDoctors) {
        return fileToDoctors[_fileHash];
    }
}
