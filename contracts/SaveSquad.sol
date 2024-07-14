// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "./IERC20.sol";
import {IStakingContract} from "./IStaking.sol";

contract SaveSquad {
    struct Pool {
        string name;
        string imageCID;
        uint256 amount;
        uint256 balance;
        uint256 frequency;
        uint256 dueDate;
        IERC20 currency;
        address[] members;
        bool isActive;
        uint stakeRewards;
    }

    struct Deposit {
        uint256 ammount;
        uint256 lastTimeDeposited;
    }

    event Deposited(uint256 poolId, address depositor, uint256 amount);
    event Withdrawn(uint256 poolId, address withdrawer, uint256 amount);

    event PoolCreated(
        uint256 poolId,
        string name,
        string imageCID,
        uint256 amount,
        uint256 frequency,
        uint256 dueDate,
        address creator,
        address currency
    );

    modifier onlyMember(uint256 poolId) {
        require(isMember(poolId, msg.sender), "Not a member of this pool");
        _;
    }

    uint256 public poolCount;
    IStakingContract public stakingContract;

    mapping(uint256 => Pool) public pools;

    // number of pool -> mapping person to Deposit struct
    mapping(uint256 => mapping(address => Deposit)) public deposits;

    constructor(address _stakingContract) {
        stakingContract = IStakingContract(_stakingContract);
    }

    function createPool(
        string memory name,
        string memory imageCID,
        uint256 amount,
        uint256 frequency,
        uint256 dueDate,
        address[] memory members,
        address currency
    ) external returns (uint256 poolId) {
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(members.length > 0, "Pool must have at least one member");

        pools[poolCount] = Pool({
            name: name,
            imageCID: imageCID,
            amount: amount,
            balance: 0,
            frequency: frequency,
            dueDate: dueDate,
            members: members,
            isActive: true,
            currency: IERC20(currency),
            stakeRewards: 0
        });

        emit PoolCreated(
            poolCount,
            name,
            imageCID,
            amount,
            frequency,
            dueDate,
            msg.sender,
            currency
        );
        poolCount++;

        return poolCount--;
    }

    function deposit(
        uint256 poolId,
        uint256 ammount
    ) external onlyMember(poolId) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool is not active");
        require(
            block.timestamp < pool.dueDate,
            "Pool has reached its due date"
        );
        require(ammount > 0, "You need to deposit an ammount bigger than 0");

        IERC20 tokenContract = pool.currency;
        tokenContract.approve(address(this), ammount);
        tokenContract.transferFrom(msg.sender, address(this), ammount);

        deposits[poolId][msg.sender].ammount += ammount;
        deposits[poolId][msg.sender].lastTimeDeposited = block.timestamp;

        pool.balance += ammount;

        pool.currency.approve(address(stakingContract), ammount);
        stakingContract.stake(ammount);

        emit Deposited(poolId, msg.sender, ammount);
    }

    function stakeFunds(uint256 poolId) public onlyMember(poolId) {
        /// stake in lending rootstock
    }

    function unStakeFunds(uint256 poolId) public onlyMember(poolId) {
        /// repartir equitativamente las recompensas

        // unstake
        // get only rewards

        Pool memory pool = pools[poolId];

        // go through every member of the pool and get percentage
        for (uint256 i = 0; i < pool.members.length; i++) {
            address member = pool.members[i];

            if (deposits[poolId][pool.members[i]].ammount <= 0) {} else {
                uint percentaje = pool.balance /
                    deposits[poolId][member].ammount;
                deposits[poolId][member].ammount +=
                    percentaje *
                    pool.stakeRewards;
            }
        }
    }

    function withdraw(uint256 poolId) external onlyMember(poolId) {
        Pool storage pool = pools[poolId];
        require(
            block.timestamp >= pool.dueDate,
            "Cannot withdraw before due date"
        );
        require(pool.isActive, "Pool is not active");

        uint256 rewards = stakingContract.earned(address(this));
        if (rewards > 0) {
            pool.stakeRewards = rewards;
            stakingContract.getReward();

            for (uint256 i = 0; i < pool.members.length; i++) {
                deposits[poolId][pool.members[i]].ammount +=
                    rewards /
                    pool.members.length;
            }
        }

        uint256 memberBalance = deposits[poolId][msg.sender].ammount;
        require(memberBalance > 0, "No balance to withdraw");

        deposits[poolId][msg.sender].ammount = 0;
        pool.balance -= memberBalance;

        if (pool.balance == 0) {
            pool.isActive = false;
        }

        pool.currency.transfer(msg.sender, memberBalance);
        emit Withdrawn(poolId, msg.sender, memberBalance);
    }

    function isMember(uint256 poolId, address user) public view returns (bool) {
        Pool storage pool = pools[poolId];
        for (uint256 i = 0; i < pool.members.length; i++) {
            if (pool.members[i] == user) {
                return true;
            }
        }
        return false;
    }

    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            string memory name,
            string memory imageCID,
            uint256 amount,
            uint256 balancr,
            uint256 frequency,
            uint256 dueDate,
            address[] memory members,
            bool isActive,
            address currency
        )
    {
        Pool storage pool = pools[poolId];
        return (
            pool.name,
            pool.imageCID,
            pool.amount,
            pool.balance,
            pool.frequency,
            pool.dueDate,
            pool.members,
            pool.isActive,
            address(pool.currency)
        );
    }

    function getDepositsFromMember(
        uint poolId,
        address member
    ) external view returns (uint ammount) {
        return deposits[poolId][member].ammount;
    }
}
