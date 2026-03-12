// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DJZSEscrowLock is Ownable {
    using SafeERC20 for IERC20;

    enum EscrowStatus { Pending, Settled, Refunded }

    struct Escrow {
        address creator;
        address recipient;
        uint256 amount;
        bytes32 executionTraceHash;
        bool settled;
        EscrowStatus status;
        string irisTxId;
    }

    IERC20 public immutable paymentToken;
    address public settlementAgent;
    uint256 public nextEscrowId;

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address creator,
        address recipient,
        uint256 amount,
        bytes32 executionTraceHash
    );

    event AuditPending(
        uint256 indexed escrowId,
        address creator,
        address recipient,
        bytes32 executionTraceHash,
        uint256 amount
    );

    event EscrowSettled(
        uint256 indexed escrowId,
        bool passed,
        string irisTxId
    );

    event EscrowRefunded(uint256 indexed escrowId);

    modifier onlySettlementAgent() {
        require(
            msg.sender == settlementAgent || msg.sender == owner(),
            "DJZSEscrowLock: caller is not the settlement agent"
        );
        _;
    }

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        settlementAgent = msg.sender;
    }

    function setSettlementAgent(address _agent) external onlyOwner {
        settlementAgent = _agent;
    }

    function createEscrow(
        address recipient,
        uint256 amount,
        bytes32 executionTraceHash
    ) external returns (uint256 escrowId) {
        require(recipient != address(0), "DJZSEscrowLock: zero recipient");
        require(amount > 0, "DJZSEscrowLock: zero amount");

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            creator: msg.sender,
            recipient: recipient,
            amount: amount,
            executionTraceHash: executionTraceHash,
            settled: false,
            status: EscrowStatus.Pending,
            irisTxId: ""
        });

        emit EscrowCreated(escrowId, msg.sender, recipient, amount, executionTraceHash);
        emit AuditPending(escrowId, msg.sender, recipient, executionTraceHash, amount);
    }

    function settleEscrow(
        uint256 escrowId,
        bool passed,
        string calldata irisTxId
    ) external onlySettlementAgent {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.creator != address(0), "DJZSEscrowLock: escrow does not exist");
        require(!escrow.settled, "DJZSEscrowLock: already settled");

        escrow.settled = true;
        escrow.status = EscrowStatus.Settled;
        escrow.irisTxId = irisTxId;

        if (passed) {
            paymentToken.safeTransfer(escrow.recipient, escrow.amount);
        } else {
            paymentToken.safeTransfer(escrow.creator, escrow.amount);
        }

        emit EscrowSettled(escrowId, passed, irisTxId);
    }

    function refundEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.creator != address(0), "DJZSEscrowLock: escrow does not exist");
        require(!escrow.settled, "DJZSEscrowLock: already settled");

        escrow.settled = true;
        escrow.status = EscrowStatus.Refunded;
        paymentToken.safeTransfer(escrow.creator, escrow.amount);

        emit EscrowRefunded(escrowId);
    }

    function getEscrow(uint256 escrowId) external view returns (
        address creator,
        address recipient,
        uint256 amount,
        bytes32 executionTraceHash,
        bool settled
    ) {
        Escrow storage escrow = escrows[escrowId];
        return (
            escrow.creator,
            escrow.recipient,
            escrow.amount,
            escrow.executionTraceHash,
            escrow.settled
        );
    }
}
