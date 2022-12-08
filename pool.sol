// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract BUSD_POOL {
    struct USER {
        uint256 amount;
        uint256 reward;
        uint256 timestamp;
        uint256 claimDate;
    }

    IERC20 public immutable BUSD;

    address public ADMIN;
    mapping(address => USER) private user_info;

    address[] public allUsers;

    bool public isLaunched = false;

    constructor(IERC20 _BUSD, address _admin) {
        BUSD = _BUSD;
        ADMIN = _admin;
    }

    modifier whenLaunched() {
        require(isLaunched, "NOT_START_YET");
        _;
    }

    function deposit(uint256 amount) external whenLaunched {
        require(amount > 0, "ZERO BUSD AMOUNT");
        require(
            BUSD.transferFrom(msg.sender, address(this), amount),
            "TRANSFERFROM_FAIL"
        );
        allUsers.push(msg.sender);
        uint256 real_amount = amount - (amount * 3) / 100;
        user_info[msg.sender].amount = real_amount;
        user_info[msg.sender].reward = (real_amount * 3) / 1000;
        user_info[msg.sender].timestamp = block.timestamp;
        user_info[msg.sender].claimDate = block.timestamp;
    }

    function withdrawMoney() external whenLaunched {
        uint256 passTime = block.timestamp - user_info[msg.sender].claimDate;
        uint256 profit = (((passTime / 1 days) * 3) / 1000) *
            user_info[msg.sender].amount;
        uint256 withdrawalAmount = user_info[msg.sender].amount + profit;
        require(BUSD.transfer(msg.sender, withdrawalAmount), "WITHDRAW FAIL");

        user_info[msg.sender].amount = 0;
        user_info[msg.sender].reward = 0;
        user_info[msg.sender].timestamp = block.timestamp;
        user_info[msg.sender].claimDate = block.timestamp;
    }

    function claim() external whenLaunched {
        uint256 passTime = block.timestamp - user_info[msg.sender].claimDate;
        uint256 profit = (((passTime / 1 days) * 3) / 1000) *
            user_info[msg.sender].amount;
        user_info[msg.sender].claimDate = block.timestamp;
        require(BUSD.transfer(msg.sender, profit), "CLAIM FAIL");
    }

    function getProfit() external view returns (uint256) {
        uint256 passTime = block.timestamp - user_info[msg.sender].claimDate;
        uint256 profit = (((passTime / 1 days) * 3) / 1000) *
            user_info[msg.sender].amount;
        return profit;
    }

    function getTotal() external view returns (uint256) {
        return BUSD.balanceOf(address(this));
    }

    function test() external view returns (uint256) {
        return block.timestamp - user_info[msg.sender].timestamp - 1 days;
    }
}
