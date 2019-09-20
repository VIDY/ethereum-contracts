# ethereum-wallets
The Vidy company wallets

### Install

$ npm install --save-dev @vidy-dev/ethereum-wallets

## Wallets

Two wallet contracts are used for the ICO: **InvestorWallet** and **VidyTeamWallet**.  The two contracts have identical code (both being empty subcontracts of `MultiSigWallet`).  They are multisignature wallets, initialized with 2 owners (signatories) each, for controlling ether and VidyCoin distribution.

**InvestorWallet** has two owners: an Ethereum mainnet address owned by an early investor and an address owned by Patrick Colangelo (Vidy founder and CEO); approval from both is required to issue a transaction.  This wallet is the ultimate destination of the ether raised from a successful ICO, which will be distributed as indicated in the whitepaper via transfer transactions issued with the consensus of the Vidy development team (represented by Colangelo) and the investors/advisors.

**VidyTeamWallet** has two owners: Patrick Colangelo and a Vidy software developer (likely Jake Rosin, the author of this text); approval from both is required to issue a transaction.  This wallet is the initial owner of all 10 billion VidyCoins and the source from which those tokens are distributed as described in the whitepaper.  Ultimately, full distribution reduces the VidyTeamWallet's VidyCoin balance to 0, with the 10 billion VidyCoins being held by users, lock-up vestment contracts, etc.

### Wallet Contract Code

`InvestorWallet` and `VidyTeamWallet` are based on a multisignature wallet implementation provided by Gnosis and available at https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol.

This wallet can store ether, ERC20 tokens, or any other token type that does not impose specific requirements on wallet contracts.  The wallet can, upon request and confirmation by its owners, issue an arbitrary transaction to an arbitrary Ethereum address, which may or may not be accompanied by an ether transfer.  This method is also used to make changes to the wallet owner list; i.e. those changes are represented as transactions to be issued to the wallet address itself, and require the same consensus of signatories before being performed.

#### Public Interface

##### Construction

The two wallet contracts are each constructed with an initial list of owners and the number of those owners whose confirmation is required to execute a Transaction.  As described above, each wallet will be initialized with two owners, and 2-of-2 confirmation required.

##### Events

`event Confirmation(address indexed sender, uint indexed transactionId)`: Emitted when an owner (`sender`) provides their confirmation for the Transaction `transactionId`.

`event Revocation(address indexed sender, uint indexed transactionId)`: Emitted when an owner (`sender`) revokes their previously provided confirmation for the Transaction `transactionId`.

`event Submission(uint indexed transactionId)`: Emitted when a Transaction has been submitted to the wallet and assigned `transactionId` as its id.

`event Execution(uint indexed transactionId)`: Emitted when Transaction `transactionId` is successfully executed by the wallet (necessarily implying that it had the required number of confirmations).  Occurs at most once per transaction.

`event ExecutionFailure(uint indexed transactionId)`: Emitted when Transaction `transactionId` was unsuccessfully executed by the wallet (necessarily implying that it had the required number of confirmations).  Can occur multiple times per transaction, up until a successful execution.

`event Deposit(address indexed sender, uint value)`: Emitted when the wallet receives ether.

`event OwnerAddition(address indexed owner)`: Emitted when an owner is added to the wallet.

`event OwnerRemoval(address indexed owner)`: Emitted when an owner is removed from the wallet.

`event RequirementChange(uint required)`: Emitted when `required`, the number of owners whose confirmation is required to issue a transaction, changes.

##### Fields and Constant Functions

`uint constant MAX_OWNER_COUNT`: The maximum number of owners the wallet supports as potential transaction signatories.

`mapping (uint => Transaction) public transaction`: Retrieve a Transaction by its permanent and unique ID.  The Transaction retrieved contains the intended destination address, the ether value (>= 0), data bytes encoding a function call to execute on the destination, and whether the transaction has already been executed.

`mapping (uint => mapping (address => bool)) public confirmations`: For the Transaction with the given ID, a mapping from owner address to boolean indicating whether that owner has confirmed the associated Transaction.

`mapping (address => bool)`: Whether the indicated address is a wallet owner.

`address[] public owners`: The list of current wallet owners.

`uint public required`: The minimum number of wallet owners who must confirm a transaction before it is issued.

`uint public transactionCount`: The number of Transactions which have been submitted to this wallet.  Valid Transaction IDs are {0, 1, ..., transactionCount - 1}.

`function isConfirmed(uint transactionId) public constant returns (bool)`: Returns whether the indicated Transaction exists and has been confirmed by at least `required` owners.

`function getConfirmationCount(uint transactionId) public constant returns (uint)`: Returns the number of owner confirmations collected for the indicated Transaction.

`function getTransactionCount(bool pending, bool executed) public constant returns (uint)`: Returns the number of Transactions that match the indicated filters.  `pending`: include Transactions that have not yet been executed.  `executed`: include transactions that have already been executed.

`function getOwners() public constant returns (address[])`: Returns the list of owners.

`function getConfirmations(uint transactionId) public constant returns (address[])`: Returns the owners who have confirmed the indicated transaction, as an array of addresses.

`function getTransactionIds(uint from, uint to, bool pending, bool executed) public constant returns (uint[])`: Returns an array of length `(from - to)`, where the first `max(0, getTransactionCount(pending, executed) - from)` elements are IDs of transactions that match the filters.  The parameters `pending` and `executed` are interpretted as in `getTransactionCount`, determining whether unexecuted and/or executed transactions are considered.  `from` and `to` indicate start and stop indices into the list of *filtered* transactions (not the full list of all transactions) which has length `getTransactionCount(pending, executed)`.

##### Non-constant Functions

Many of the public functions will `revert` any attempted execution that does not originate from the wallet itself.  They are public, not internal, so that they appear in the contracts ABI.  This enforces a usage pattern: to call such a function (e.g. `addOwner(..)`), an existing owner encodes the function call and argument(s) as bytes and submits a Transaction with the wallet itself as the `destination`, and the encoded function call as the `data`.  This Transaction will then only be executed once enough of the wallet owners confirm it.

`function addOwner(address owner)`: Adds the specified address to the list of owners capable of confirming transactions.  Requirements: called by the wallet contract itself, the address is not already an owner and is not 0, adding an owner will not grow the owner list beyond `MAX_OWNER_COUNT`.

`function removeOwner(address owner)`: Remove the specified address from the list of owners capable of confirming transactions.  If the resulting number of owners is below the current `required` value, calls `changeRequirement(..)` to set `required` to the resulting number of owners.  Requirements: called by the wallet contract itself, the address is an owner.

`function replaceOwner(address owner, address newOwner)`: Removes the indicated owner from the wallet, and adds `newOwner` in their place.  Does not change `required`  under any circumstances, so is not equivalent to sequential calls of `removeOwner(..)` and `addOwner(..)`.  Requirements: called by the wallet contract itself, `owner` is an existing owner of the wallet, `newOwner` is not already an owner.

`function changeRequirement(uint _required)`: Change `required`, the number of owners whose confirmation is required before a pending Transaction can be executed.  Requirements: called by the wallet contract itself, the resulting number of required owners is not zero and is less than or equal to the number of owners.

`function submitTransaction(address destination, uint value, bytes data) public returns (uint transactionId)`: Adds a Transaction to the wallet.  `destination`: the target address on which the Transaction will be executed.  `value`: the amount of ether (in wei) that will be sent with the transaction.  `data` encoded function to be executed with the transaction.  Causes execution of `confirmTransaction(..)` as if called by the same owner submitting it.  When executed, the transaction will run as a `call` on the `destination` address which transfers `value` ether from the wallet, executing the function (with parameters) encoded in `data`.  Requirements: called by an owner, the destination address is not 0.

`function confirmTransaction(uint transactionId)`: Records that the caller has confirmed the indicated transaction.  Called automatically during the execution of `submitTransaction`.  Causes execution of `executeTransaction(..)` as if called by the same owner confirming it.  Requirements: called by an owner, the transactionId represents an existing transaction that has not been confirmed by the caller.

`function revokeConfirmation(uint transactionId)`: Removes the existing confirmation from the caller on the indicated transaction.  Requirements: called by an owner who has confirmed the transaction, the transaction has not been executed.

`function executeTransaction(uint transactionId)`: Causes the execution of the indicated transaction, if it has received confirmation from the required number of owners.  Called automatically during the execution of `submitTransaction`; in most circumstances users should not need to call this function directly.  Allows the execution of confirmed transactions if e.g. the `required` number of signatories has changed, or an execution attempt failed due to circumstances that have now changed (such as insufficient funds in the wallet).  Successful execution is recorded; each transaction will be executed no more than once.  Requirements: called by an owner who has confirmed the transaction, which has not been successfully executed.

#### Implementation Notes

The Gnosis-provided multisignature wallet implementation, `MultiSigWallet.sol`, was altered in two ways: setting the `pragma`-specified Solidity version to `0.4.23` rather than `^0.4.15`, and using `constructor` rather than `function MultiSigWallet` as that form was deprecated by `0.4.23`.

`InvestorWallet` and `VidyTeamWallet` are both empty subcontracts of `MultiSigWallet`.  They pass their construction arguments, unchanged and unexamined, to the subcontract constructor.
