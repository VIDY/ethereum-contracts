const { ethereumNetwork } = require('@vidy-dev/ethereum-utils')
const real_accounts = require('../fixture/real-accounts')
const test_accounts = require('../fixture/test-accounts')

module.exports = (deployer, network, accounts) => {
  const live = ethereumNetwork.isLive(network);
  const ganache = ethereumNetwork.isGanache(network);

  var address;
  if (ganache) {
    // replace with arbitrary addresses
    address = {}
    const keys = Object.keys(real_accounts);
    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      address[key] = accounts[i];
    }
  } else {
    address = Object.assign({}, real_accounts, live ? {} : test_accounts);
  }

  return address;
}
