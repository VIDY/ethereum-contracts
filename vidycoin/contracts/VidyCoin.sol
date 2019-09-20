pragma solidity ^0.4.23;

import "contracts/base/BaseERC20Token.sol";

contract VidyCoin is BaseERC20Token {
  constructor() BaseERC20Token(10000000000000000000000000000, 18, "VidyCoin", "VIDY") public {
    // nothing else needed
  }
}
