// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControl {
    // fileHash (string) => (doctor address => access granted)
    mapping(string => mapping(address => bool)) private fileAccess;

    event AccessGranted(string indexed fileHash, address indexed doctor);
    event AccessRevoked(string indexed fileHash, address indexed doctor);

    /**
     * @notice Grant access to a doctor for a specific file
     * @param _fileHash - IPFS hash of the file (string)
     * @param _doctor - Address of doctor to be granted access
     */
    function grantAccess(string memory _fileHash, address _doctor) external {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_doctor != address(0), "Invalid doctor address");

        fileAccess[_fileHash][_doctor] = true;
        emit AccessGranted(_fileHash, _doctor);
    }

    /**
     * @notice Revoke access for a doctor to a specific file
     * @param _fileHash - IPFS hash (string)
     * @param _doctor - Address of doctor whose access will be revoked
     */
    function revokeAccess(string memory _fileHash, address _doctor) external {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_doctor != address(0), "Invalid doctor address");

        fileAccess[_fileHash][_doctor] = false;
        emit AccessRevoked(_fileHash, _doctor);
    }

    /**
     * @notice Check if a user has access to a specific file
     * @param _fileHash - IPFS hash (string)
     * @param _user - Address to check
     * @return bool - True if user has access
     */
    function hasAccess(string memory _fileHash, address _user) external view returns (bool) {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        return fileAccess[_fileHash][_user];
    }
}
