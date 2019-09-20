pragma solidity ^0.4.23;

import "contracts/base/MultiSigWallet.sol";

contract InvestorWallet is MultiSigWallet {
  constructor(address[] _owners, uint _required) MultiSigWallet(_owners, _required) public {
    // nothing else needed
  }
}
