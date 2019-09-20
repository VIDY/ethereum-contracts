pragma solidity ^0.5.0;

/**
 * A contract that coordinators withdrawal from, and transfer to, multiple
 * accounts as a single operation.  Acts as a token bank to fund transfers to
 * multiple recipients, drawing from multiple other accounts.
 */
contract ITokenTransferCoordinator {
  /**
   * Returns the token whose transfers are coordinated by this contract.
   */
  function token() external view returns (address);

  /**
   * Returns whether the specified nonce value has been used for a coordinated
   * transfer.  Nonces may be used only once, except for nonce 0, which is ignored.
   * Returns 'true' for any nonzero value which has previously been provided to
   * a successful transfer or drain function call.
   */
  function nonceUsed(uint256 nonce) external view returns (bool);

  /**
   * Fully drain all specified accounts using `transferFrom`, moving their
   * balances into this contract account.
   */
  function drain(uint256 nonce, address[] calldata funders) external returns (bool success);

  /**
   * Perform a batch of transfer operations by
   * 1. Use `transferFrom` to retrieve the indicated amount from each funder
   * 2. Use `transfer` to send the indicated amount to each recipient.
   *
   * To succeed, the total retrieved from funders added to the amount owned by
   * this contract must meet or exceed the total sent to recipients.
   */
  function transfer(
    uint256 nonce,
    address[] calldata funders,
    uint256[] calldata funderAmounts,
    address[] calldata recipients,
    uint256[] calldata recipientAmounts
  ) external returns (bool success);

  /**
   * Perform a batch of transfer operations by
   * 1. Use `transferFrom` to forward the indicated amount from each funder to the
   *  intermediate account.
   * 2. Use `transferFrom` to send the indicated amount to each recipient, from that
   *  intermediate account.
   *
   * To succeed, the total retrieved from funders added to the amount owned by the
   * intermediate account must meet or exceed the total sent to recipients.
   */
  function transferThrough(
    uint256 nonce,
    address[] calldata funders,
    uint256[] calldata funderAmounts,
    address intermediate,
    address[] calldata recipients,
    uint256[] calldata recipientAmounts
  ) external returns (bool success);

  /**
   * Perform a batch of transfer operations by directly `transferFrom`ing the
   * amount specified from each funder to the corresponding recipient.
   */
  function transferFrom(
    uint256 nonce,
    address[] calldata funders,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external returns (bool success);
}
