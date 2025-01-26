// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the ERC20Demo
 */
interface IERC20Demo is IERC20 {
    /**
     * @dev Thrown on mintin if the maximum total supply is exceeded.
     */
    error MaxTotalSupplyExceeded(
        uint256 exceededTotalSupply,
        uint256 maxTotalSupply
    );

    /**
     * @dev Thrown on receiving unexpected ETH.
     */
    error ReceivingEthUnsupported(uint256 value);

    /**
     * @dev Creates an `amount` amount of tokens and assigns them to `to`, by transferring it from address(0).
     * This function is restricted to the `owner` managed by OpenZeppelins Ownable2Step. The function increases
     * the `totalSupply` of the token by the given `amount`. The maximum total supply is restricted by
     * `MAX_TOTAL_SUPPLY` and checked before minting to prevent minting more tokens than allowed.
     * @param to The address of the recipient of the minted tokens.
     * @param amount The amount of tokens to mint.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     */
    function mint(address to, uint256 amount) external;
}
