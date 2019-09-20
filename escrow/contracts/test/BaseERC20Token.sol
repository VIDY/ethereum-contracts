pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

/**
 * A base token for the VidyCoin (or any other coin with similar behavior).
 * Compatible with contracts and UIs expecting a ERC20 token.
 * Provides also a convenience method to burn tokens, permanently removing them from the pool;
 * the intent of this convenience method is for users who wish to burn tokens
 * (as they always can via a transfer to an unowned address or self-destructing
 * contract) to do so in a way that is then reflected in the token's total supply.
 */
contract BaseERC20Token is ERC20Mintable {

    constructor() public {

    }

}
