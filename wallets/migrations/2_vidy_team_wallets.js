const VidyTeamWallet = artifacts.require("./VidyTeamWallet.sol");

const { ethereumNetwork } = require('@vidy-dev/ethereum-utils')
const migrationAccounts = require('../libs/migration-accounts');

module.exports = function(deployer, network, accounts) {
  const address = migrationAccounts(deployer, network, accounts);

  const vidyTeam = [address.jake, address.patrick];

  deployer.deploy(VidyTeamWallet, vidyTeam, vidyTeam.length);
}
