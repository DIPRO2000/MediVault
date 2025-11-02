// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControl {
    // fileHash => list of addresses that have access
    mapping(bytes32 => mapping(address => bool)) public fileAccess;

    event AccessGranted(bytes32 indexed fileHash, address indexed doctor);
    event AccessRevoked(bytes32 indexed fileHash, address indexed doctor);

    function grantAccess(bytes32 _fileHash, address _doctor) external {
        fileAccess[_fileHash][_doctor] = true;
        emit AccessGranted(_fileHash, _doctor);
    }

    function revokeAccess(bytes32 _fileHash, address _doctor) external {
        fileAccess[_fileHash][_doctor] = false;
        emit AccessRevoked(_fileHash, _doctor);
    }

    function hasAccess(bytes32 _fileHash, address _user) external view returns (bool) {
        return fileAccess[_fileHash][_user];
    }
}
