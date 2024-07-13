// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.x;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedTRBTC is ERC20 {
    constructor() ERC20("Wrapped tRBTC", "WtRBTC") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}