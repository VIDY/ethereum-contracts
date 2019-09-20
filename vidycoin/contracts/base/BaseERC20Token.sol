pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

/**
 * A base token for the VidyCoin (or any other coin with similar behavior).
 * Compatible with contracts and UIs expecting a ERC20 token.
 * Provides also a convenience method to burn tokens, permanently removing them from the pool;
 * the intent of this convenience method is for users who wish to burn tokens
 * (as they always can via a transfer to an unowned address or self-destructing
 * contract) to do so in a way that is then reflected in the token's total supply.
 */
contract BaseERC20Token is StandardBurnableToken, PausableToken, DetailedERC20 {

  constructor(
    uint256 _initialAmount,
    uint8 _decimalUnits,
    string _tokenName,
    string _tokenSymbol
  ) DetailedERC20(_tokenName, _tokenSymbol, _decimalUnits) public {
    totalSupply_ = _initialAmount;
    balances[msg.sender] = totalSupply_;
  }

  // override the burnable token's "Burn" function: don't allow tokens to
  // be burned when paused
  function _burn(address _from, uint256 _value) internal whenNotPaused {
    super._burn(_from, _value);
  }

}
