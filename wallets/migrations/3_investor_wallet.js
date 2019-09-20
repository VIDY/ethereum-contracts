const InvestorWallet = artifacts.require("./InvestorWallet.sol");

const { ethereumNetwork } = require('@vidy-dev/ethereum-utils')
const migrationAccounts = require('../libs/migration-accounts');

module.exports = function(deployer, network, accounts) {
  const address = migrationAccounts(deployer, network, accounts);

  const live = ethereumNetwork.isLive(network);
  const investors = [address.patrick, address.investor];

  deployer.deploy(InvestorWallet, investors, investors.length);
}
