// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DJZSLogicTrustScore is Ownable {
    struct TrustRecord {
        uint256 riskScore;
        string verdict;
        string[] flags;
        uint256 timestamp;
        string irysTxId;
    }

    mapping(address => TrustRecord[]) public agentHistory;
    mapping(address => uint256) public latestRiskScore;
    mapping(address => string) public latestVerdict;
    mapping(address => uint256) public auditCount;

    mapping(address => bool) public authorizedWriters;

    event ScoreUpdated(
        address indexed agent,
        uint256 riskScore,
        string verdict,
        string[] flags,
        string irysTxId,
        uint256 timestamp
    );

    event WriterAuthorized(address indexed writer);
    event WriterRevoked(address indexed writer);

    modifier onlyWriter() {
        require(
            authorizedWriters[msg.sender] || msg.sender == owner(),
            "DJZSLogicTrustScore: caller is not an authorized writer"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        authorizedWriters[msg.sender] = true;
    }

    function authorizeWriter(address writer) external onlyOwner {
        authorizedWriters[writer] = true;
        emit WriterAuthorized(writer);
    }

    function revokeWriter(address writer) external onlyOwner {
        authorizedWriters[writer] = false;
        emit WriterRevoked(writer);
    }

    function updateScore(
        address agent,
        uint256 riskScore,
        string calldata verdict,
        string[] calldata flags,
        string calldata irysTxId
    ) external onlyWriter {
        require(riskScore <= 100, "DJZSLogicTrustScore: risk score must be 0-100");
        require(agent != address(0), "DJZSLogicTrustScore: zero address");

        TrustRecord memory record = TrustRecord({
            riskScore: riskScore,
            verdict: verdict,
            flags: flags,
            timestamp: block.timestamp,
            irysTxId: irysTxId
        });

        agentHistory[agent].push(record);
        latestRiskScore[agent] = riskScore;
        latestVerdict[agent] = verdict;
        auditCount[agent] += 1;

        emit ScoreUpdated(agent, riskScore, verdict, flags, irysTxId, block.timestamp);
    }

    function getLatestScore(address agent) external view returns (
        uint256 riskScore,
        string memory verdict,
        uint256 timestamp,
        uint256 totalAudits
    ) {
        uint256 count = auditCount[agent];
        if (count == 0) {
            return (0, "", 0, 0);
        }
        TrustRecord storage record = agentHistory[agent][count - 1];
        return (record.riskScore, record.verdict, record.timestamp, count);
    }

    function getAuditRecord(address agent, uint256 index) external view returns (
        uint256 riskScore,
        string memory verdict,
        string[] memory flags,
        uint256 timestamp,
        string memory irysTxId
    ) {
        require(index < auditCount[agent], "DJZSLogicTrustScore: index out of bounds");
        TrustRecord storage record = agentHistory[agent][index];
        return (record.riskScore, record.verdict, record.flags, record.timestamp, record.irysTxId);
    }

    function getAuditHistory(address agent) external view returns (uint256 count) {
        return auditCount[agent];
    }
}
