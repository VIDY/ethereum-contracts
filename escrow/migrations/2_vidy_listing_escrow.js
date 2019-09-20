const { ethereumNetwork, truffleContract } = require('@vidy-dev/ethereum-utils');

const VidyListingEscrow = artifacts.require('./VidyListingEscrow.sol');
const VidyCoin = truffleContract('@vidy-dev/ethereum-vidycoin/build/contracts/VidyCoin.json', web3);
const VidyTeamWallet = truffleContract('@vidy-dev/ethereum-wallets/build/contracts/VidyTeamWallet.json', web3);

const JULY_7_2019 = 1562457600;
const JULY_7_2020 = 1594080000;

const AUGUST_20_2019 = 1566259200;

module.exports = function(deployer, network, accounts) {
  let unlockAt = ethereumNetwork.isMain(network)
    ? JULY_7_2020 : AUGUST_20_2019;

  if (!ethereumNetwork.isGanache(network)) {
    let vidyCoin, vidyWallet;
    VidyCoin.deployed()
      .then((instance) => {
        vidyCoin = instance;
        return VidyTeamWallet.deployed();
      })
      .then((instance) => {
        vidyWallet = instance;
        return deployer.deploy(VidyListingEscrow, vidyCoin.address, vidyWallet.address, unlockAt);
      });
  } else {
    return deployer.deploy(VidyListingEscrow, accounts[0], accounts[1], JULY_7_2020);
  }
}
