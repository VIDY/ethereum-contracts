# ethereum-vidycoin
The ERC20 VidyCoin token contract.

### Install

    $ yarn add @vidy-dev/ethereum-vidycoin
  or

    $ npm install @vidy-dev/ethereum-vidycoin

## VidyCoin Tokens

**VidyCoin (VIDY)** is an ERC20 token created with a total supply of 10 billion coins.  Of these 10 billion, 5.2 billion will be distributed to investors via our ICO; distribution of the remaining 4.8 billion is specified in our whitepaper.

### VidyCoin Contract Code

The VidyCoin implementation is based on the OpenZeppelin-Solidity library tokens: `StandardBurnableToken`, `PausableToken`, and `DetailedERC20`.  The result meets the ERC20 token standard and is compatible with any wallet, contract, or client that is built for that standard.  Math operations (such as adjusting balances when transfers are made) are executed through a `SafeMath` library, which by preventing integer underflows also enforces token transfer requirements (i.e. no one can `transfer` more VidyCoins than they own).  In addition to the ERC20 functions, VidyCoin supports `burn`ing as a way to permanently destroy tokens, removing them from circulation.  As there is no way to create new VidyCoins after contract deployment, the total supply will monotonically decrease as coins are burned.

As an ERC20 token, VidyCoin is compatible with any wallet, contract, or client UI that is built for that standard.  Users can exchange tokens directly using `transfer`; the convention for smart contracts receiving VidyCoins as payment for an operation is for the caller to `approve` withdrawal of those coins by the contract, then execute a contract function which calls `transferFrom` to retrieve them.  This convention allows contracts to retrieve the precise amount of VidyCoins necessary to pay for an operation and makes successful receipt of those coins a transaction requirement for successful completion of the requested operation.

To prepare for a transition from Ethereum to our own blockchain, the VidyCoin contract is `Pausable`: we can temporarily halt all transfers and approvals to keep account balances frozen until unpaused.  This helps ensure a consistent and predictable result when issuing tokens on the new blockchain according to account balances on Ethereum and a clear moment when the Ethereum implementation is obsoleted.

#### Public Interface

VidyCoin is an ERC20 token with 18 decimals and a total supply of 10 billion coins.  It matches the public interface of the ERC20 token standard.

In all cases, a quantity of VidyCoins is internally represented as an unsigned integer number of "subunits", with 1000000000000000000 (`1e18`) such subunits equaling 1 VidyCoin.  In other words, the initial total supply of 10 billion (`1e10`) VidyCoins is represented as 10000000000000000000000000000 (`1e28`), a balance of `1.73 VIDY` represented as 1730000000000000000 (`1.73e18`), etc.  Client UIs designed to interact with ERC20 tokens should present VidyCoins using a similar format to ether, for which e.g. the internal representation of 1200000000000000000 (`1.2e18`) "wei" is presented as `1.2 ETH`.

##### Construction

The initial total supply of 10 billion VidyCoins, along with its token name and symbol, are hardcoded in the VidyCoin contract code and passed to a supercontract constructor as arguments.  The supercontract, `BaseERC20Token`, implements the ERC20 token standard and adds `burn` and `burnFrom` functions, and the `Burn` event.

##### Events

`event Transfer(address indexed from, address indexed to, uint256 value)`: Emitted when VidyCoins are transferred from one address to another.

`event Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when VidyCoins are approved for transfer from an address by another address.

`event Burn(address indexed burner, uint256 value)`: Emitted when any amount of VidyCoins are burned (destroyed) by their owner.

`event Pause()`: Emitted when the VidyCoin is "paused" (preventing any changes in account balances or allowances).

`event Unpause()`: Emitted when the VidyCoin is "unpaused" (once again allowing changes in account balances or allowances).

In all cases, the amount of VidyCoins in question, `value` is represented as an integer number of VidyCoin subunits; `1e18` such subunits equal one VidyCoin.

##### Fields and Constant Functions

`uint8 public decimals`: `18`.  The allowed precision of a quantity of VidyCoins, as digits after the decimal point.  `1e18` subunits = `1` full VidyCoin.  Used by ERC20-compatible token wallets to appropriately format token balances for the user.

`string public name`: `VidyCoin`.  The name of this ERC20 token.

`string public symbol`: `VIDY`. A short token identifier.

`bool public paused`: Whether the token is currently paused (reverting changes to account balances or allowances).

`function totalSupply() public view returns (uint256)`: The total number of VidyCoin subunits that exist.  Begins at 10 billion full VidyCoins (`1e28` subunits).  Will never increase, but will decrease as VidyCoins are `burn`ed.

`function balanceOf(address _owner) public view returns (uint256)`: The number of VidyCoin subunits owned by the specified address.

`function allowance(address _owner, address _spender) public view returns (uint256)`: The number of VidyCoin subunits which `_spender` is authorized to `transferFrom` `_owner`'s balance.

##### Non-constant Functions

`function transfer(address _to, uint256 _value) public returns (bool success)`: Transfers `_value` VidyCoin subunits from the caller's account into the account of `_to`, reducing the caller's token balance and increasing the balance of the recipient.  Requirements: the caller has sufficient VidyCoins to fund this transfer, VidyCoin is not paused.

`function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)`: Transfers `_value` VidyCoin subunits from the account of `_from` into the account of `_to`, as if `transfer(_to, _value)` was called by `_from`.  A transfer by the caller of at least this amount must have been previously approved by `_from`; the resulting transfer allowance is decreased by the amount transferred by this function.  Requirements: `_from` has sufficient VidyCoins to fund this transfer, the caller has been granted a sufficient transfer balance by `_from`, VidyCoin is not paused.

`function approve(address _spender, uint256 _value) public returns (bool success)`: Approve the transfer of up to `_value` VidyCoin subunits by `_spender` from the caller's account.  Any such withdrawal, using `transferFrom`, will reduce the remaining allowance by the amount withdrawn.  Requirements: VidyCoin is not paused.

`function burn(uint256 _value) public returns (bool success)`: Permanently destroys `_value` VidyCoin subunits, removing them from the caller's account and from circulation as reflected by `totalSupply()`.  Requirements: the caller has a balance of at least `_value`, VidyCoin is not paused.

`function burnFrom(address _from, uint256 _value) public returns (bool success)`: Permanently destroys `_value` VidyCoin subunits, removing them from the `_from`'s account and from circulation as reflected by `totalSupply()`.  Requirements: the caller has a balance of at least `_value`.  The resulting transfer allowance is decreased by the amount burned by this function.  Requirements: `_from` has sufficient VidyCoins to burn, and the caller has been granted a sufficient transfer balance by `_from`, VidyCoin is not paused.

`function transferOwnership(address newOwner) public`: Set `owner = newOwner`.  Requirements: `msg.sender == owner`.

`function renounceOwnership() public`: Set `owner = address(0)`.  Requirements: `msg.sender == owner`.

`function pause() public`: Pause VidyCoin transfers and burns, freezing allow account balances and allowances.  Transactions altering account balances or allowances will be reverted until unpaused.  Requirements: `msg.sender == owner`.

`function pause() unpublic`: Resume VidyCoin transfers and burns, unfreezing account balances and allowances.  Transactions altering account balances or allowances will be allowed.  Requirements: `msg.sender == owner`.

#### Implementation Notes

The SafeMath library used for all VidyCoin token arithmetic protects against integer overflow / underflow and in so doing prevents token transfer overdrafts.

As specified in the whitepaper, VidyCoin has a contractual limit of 10 billion total coins with no ability to mint more.  The `burn` function allows VidyCoins to be permanently destroyed in a way that is reflected in the events log and by the token's `totalSupply`, allowing our progress towards the promise of 2% of all VidyCoins burned over time to be verified by anyone.

One VidyCoin can be subdivided to up to 18 decimal places; internally, an amount of VidyCoins is represented as a number up to `1e28`, with the least significant 18 digits representing portions of one coin and the remaining 10 most significant digits being a whole number of coins.  This is the same representation as used for ether: `1.7 ETH` is represented as `1700000000000000000 wei`; `1.7 VIDY` is `1700000000000000000` of the smallest possible VidyCoin subunit (which is not named).
