pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Secondary.sol";

/**
 * A contract that coordinators withdrawal from, and transfer to, multiple
 * accounts as a single operation.  Acts as a token bank to fund transfers to
 * multiple recipients, drawing from multiple other accounts.
 */
contract SecondaryTransferCoordinator is Secondary {
  using SafeERC20 for IERC20;

  // ERC20 basic token contract being held
  IERC20 private _token;
  // Nonce mapping: has a nonce been used before?
  mapping(uint256 => bool) public _nonceUsed;

  constructor(IERC20 token) public {
    _token = token;
  }

  function _useNonce(uint256 nonce) internal {
    if (nonce == 0) {
      return;
    }

    require(!_nonceUsed[nonce], 'TokenTransferCoordinator: nonce has already been used');
    _nonceUsed[nonce] = true;
  }

  function token() external view returns (IERC20) {
    return _token;
  }

  function nonceUsed(uint256 nonce) external view returns (bool) {
    return _nonceUsed[nonce];
  }

  function drain(uint256 nonce, address[] calldata funders) external onlyPrimary returns (bool success) {
    _useNonce(nonce);

    address me = address(this);
    for (uint i = 0; i < funders.length; i++) {
      address funder = funders[i];

      uint256 balance = _token.balanceOf(funder);
      uint256 allowance = _token.allowance(funder, me);
      uint256 amount;
      if (balance < allowance) {
        amount = balance;
      } else {
        amount = allowance;
      }

      _token.safeTransferFrom(funder, me, amount);
    }
    return true;
  }

  function transfer(
    uint256 nonce,
    address[] calldata funders,
    uint256[] calldata funderAmounts,
    address[] calldata recipients,
    uint256[] calldata recipientAmounts
  ) external onlyPrimary returns (bool success) {
    _useNonce(nonce);

    require(funders.length == funderAmounts.length,
      "TokenTransferCoordinator: funders and funderAmounts must have same length");
    require(recipients.length == recipientAmounts.length,
      "TokenTransferCoordinator: recipients and recipientAmounts must have same length");

    address me = address(this);
    for (uint i = 0; i < funders.length; i++) {
      _token.safeTransferFrom(funders[i], me, funderAmounts[i]);
    }

    for (uint i = 0; i < recipients.length; i++) {
      _token.safeTransfer(recipients[i], recipientAmounts[i]);
    }

    return true;
  }

  function transferThrough(
    uint256 nonce,
    address[] calldata funders,
    uint256[] calldata funderAmounts,
    address intermediate,
    address[] calldata recipients,
    uint256[] calldata recipientAmounts
  ) external onlyPrimary returns (bool success) {
    _useNonce(nonce);

    require(funders.length == funderAmounts.length,
      "TokenTransferCoordinator: funders and funderAmounts must have same length");
    require(recipients.length == recipientAmounts.length,
      "TokenTransferCoordinator: recipients and recipientAmounts must have same length");

    for (uint i = 0; i < funders.length; i++) {
      _token.safeTransferFrom(funders[i], intermediate, funderAmounts[i]);
    }

    for (uint i = 0; i < recipients.length; i++) {
      _token.safeTransferFrom(intermediate, recipients[i], recipientAmounts[i]);
    }

    return true;
  }

  function transferFrom(
    uint256 nonce,
    address[] calldata funders,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external onlyPrimary returns (bool success) {
    _useNonce(nonce);
    
    uint256 count = amounts.length;
    require(funders.length == count,
      "TokenTransferCoordinator: funders and amounts must have same length");
    require(recipients.length == count,
      "TokenTransferCoordinator: recipients and amounts must have same length");

    for (uint i = 0; i < count; i++) {
      _token.safeTransferFrom(funders[i], recipients[i], amounts[i]);
    }

    return true;
  }

}
