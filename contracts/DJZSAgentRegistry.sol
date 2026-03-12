// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DJZSAgentRegistry is Ownable {
    struct AgentInfo {
        string name;
        string metadataUri;
        address owner;
        bool active;
        uint256 registeredAt;
    }

    mapping(address => AgentInfo) public agents;
    mapping(address => bool) public isRegistered;
    address[] public agentList;

    event AgentRegistered(address indexed agent, string name, address indexed agentOwner);
    event AgentDeactivated(address indexed agent);
    event AgentReactivated(address indexed agent);
    event AgentMetadataUpdated(address indexed agent, string metadataUri);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        address agent,
        string calldata name,
        string calldata metadataUri
    ) external {
        require(agent != address(0), "DJZSAgentRegistry: zero address");
        require(!isRegistered[agent], "DJZSAgentRegistry: already registered");
        require(
            msg.sender == agent || msg.sender == owner(),
            "DJZSAgentRegistry: unauthorized"
        );

        agents[agent] = AgentInfo({
            name: name,
            metadataUri: metadataUri,
            owner: msg.sender,
            active: true,
            registeredAt: block.timestamp
        });
        isRegistered[agent] = true;
        agentList.push(agent);

        emit AgentRegistered(agent, name, msg.sender);
    }

    function deactivateAgent(address agent) external {
        require(isRegistered[agent], "DJZSAgentRegistry: not registered");
        require(
            msg.sender == agents[agent].owner || msg.sender == owner(),
            "DJZSAgentRegistry: unauthorized"
        );

        agents[agent].active = false;
        emit AgentDeactivated(agent);
    }

    function reactivateAgent(address agent) external {
        require(isRegistered[agent], "DJZSAgentRegistry: not registered");
        require(
            msg.sender == agents[agent].owner || msg.sender == owner(),
            "DJZSAgentRegistry: unauthorized"
        );

        agents[agent].active = true;
        emit AgentReactivated(agent);
    }

    function updateMetadata(address agent, string calldata metadataUri) external {
        require(isRegistered[agent], "DJZSAgentRegistry: not registered");
        require(
            msg.sender == agents[agent].owner || msg.sender == owner(),
            "DJZSAgentRegistry: unauthorized"
        );

        agents[agent].metadataUri = metadataUri;
        emit AgentMetadataUpdated(agent, metadataUri);
    }

    function getAgent(address agent) external view returns (
        string memory name,
        string memory metadataUri,
        address agentOwner,
        bool active,
        uint256 registeredAt
    ) {
        AgentInfo storage info = agents[agent];
        return (info.name, info.metadataUri, info.owner, info.active, info.registeredAt);
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAgentAtIndex(uint256 index) external view returns (address) {
        require(index < agentList.length, "DJZSAgentRegistry: index out of bounds");
        return agentList[index];
    }
}
