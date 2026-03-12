// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DJZSStaking is Ownable {
    using SafeERC20 for IERC20;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lockUntil;
        bool active;
    }

    IERC20 public immutable stakingToken;
    uint256 public minimumStake;
    uint256 public lockDuration;
    uint256 public totalStaked;

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public isStaker;

    event Staked(address indexed staker, uint256 amount, uint256 lockUntil);
    event Unstaked(address indexed staker, uint256 amount);
    event Slashed(address indexed staker, uint256 amount, string reason);
    event MinimumStakeUpdated(uint256 newMinimum);
    event LockDurationUpdated(uint256 newDuration);

    constructor(
        address _stakingToken,
        uint256 _minimumStake,
        uint256 _lockDuration
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        minimumStake = _minimumStake;
        lockDuration = _lockDuration;
    }

    function stake(uint256 amount) external {
        require(amount >= minimumStake, "DJZSStaking: below minimum stake");
        require(!stakes[msg.sender].active, "DJZSStaking: already staked");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 lockUntil = block.timestamp + lockDuration;
        stakes[msg.sender] = StakeInfo({
            amount: amount,
            stakedAt: block.timestamp,
            lockUntil: lockUntil,
            active: true
        });
        isStaker[msg.sender] = true;
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockUntil);
    }

    function unstake() external {
        StakeInfo storage info = stakes[msg.sender];
        require(info.active, "DJZSStaking: no active stake");
        require(block.timestamp >= info.lockUntil, "DJZSStaking: still locked");

        uint256 amount = info.amount;
        info.active = false;
        isStaker[msg.sender] = false;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function slash(address staker, uint256 amount, string calldata reason) external onlyOwner {
        StakeInfo storage info = stakes[staker];
        require(info.active, "DJZSStaking: no active stake");
        require(amount <= info.amount, "DJZSStaking: slash exceeds stake");

        info.amount -= amount;
        totalStaked -= amount;

        if (info.amount == 0) {
            info.active = false;
            isStaker[staker] = false;
        }

        stakingToken.safeTransfer(owner(), amount);

        emit Slashed(staker, amount, reason);
    }

    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
        emit MinimumStakeUpdated(_minimumStake);
    }

    function setLockDuration(uint256 _lockDuration) external onlyOwner {
        lockDuration = _lockDuration;
        emit LockDurationUpdated(_lockDuration);
    }

    function getStake(address staker) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint256 lockUntil,
        bool active
    ) {
        StakeInfo storage info = stakes[staker];
        return (info.amount, info.stakedAt, info.lockUntil, info.active);
    }
}
