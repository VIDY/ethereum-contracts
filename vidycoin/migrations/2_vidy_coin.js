const { ethereumNetwork, truffleContract } = require('@vidy-dev/ethereum-utils')

const VidyCoin = artifacts.require("./VidyCoin.sol");
const VidyTeamWallet = truffleContract('@vidy-dev/ethereum-wallets/build/contracts/VidyTeamWallet.json', web3)

module.exports = function(deployer, network, accounts) {
  const deployPromise = deployer.deploy(VidyCoin);

  // If we're deploying in any context other than unit testing, it's
  // important to transfer the VidyCoin balance to the VidyTeam wallet.
  // I don't know how to check for unit testing specifically, so use
  // "network is Ganache" is a shorthand.
  if (!ethereumNetwork.isGanache(network)) {
    var vc, wallet, balance;
    deployPromise.then(() => {
      // get the deployed vidyCoin
      return VidyCoin.deployed();
    }).then((vidyCoinInstance) => {
      vc = vidyCoinInstance;
      // get account balance (should be 10 billion)
      return vc.balanceOf(accounts[0]);
    }).then((b) => {
      balance = b;
      return VidyTeamWallet.deployed();
    }).then((vidyTeamWallet) => {
      wallet = vidyTeamWallet;
      // transfer all vidy coins into the team wallet, from which they will
      // be distributed according to whitepaper spec.
      return vc.transfer(wallet.address, balance);
    });
  }
};
