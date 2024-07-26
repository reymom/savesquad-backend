// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStakingContract {
    // Public state variables
    function stakingToken() external view returns (address);
    function owner() external view returns (address);
    function rewardRate() external view returns (uint256);
    function lastUpdateTime() external view returns (uint256);
    function rewardPerTokenStored() external view returns (uint256);
    function userRewardPerTokenPaid(
        address account
    ) external view returns (uint256);
    function rewards(address account) external view returns (uint256);

    // Functions
    function rewardPerToken() external view returns (uint256);
    function earned(address account) external view returns (uint256);
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getReward() external;
    function exit() external;
    function setRewardRate(uint256 _rewardRate) external;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
}
