/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

 module.exports = {
   // See <http://truffleframework.com/docs/advanced/configuration>
   // to customize your Truffle configuration!
   networks: {
     live: {
       network_id: 1,
       host: "127.0.0.1",
       port: 8545,
       gas: 4600000
     },
     ropsten: {
       network_id: 3,
       host: "127.0.0.1",
       port: 8545,
       gas: 4600000
     },
     rinkeby: {
       network_id: 4,
       host: "127.0.0.1",
       port: 8545,
       gas: 4600000
     },
     ganache: {
       host: "127.0.0.1",
       port: 7545,
       network_id: "*", // Match any network id
       gas: 4600000
     },
     backend_ganache: {  // a pointless network that exists for configuration testing
       host: "127.0.0.1",
       port: 7545,
       network_id: "*", // Match any network id
       gas: 4600000
     },
     backend_live: {
       network_id: 1,
       host: "127.0.0.1",
       port: 8545,
       gas: 4600000
     },
     backend_rinkeby: {
       network_id: 4,
       host: "127.0.0.1",
       port: 8545,
       gas: 4600000
     }
   },
   ganache: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*", // Match any network id
     gas: 4600000
   }
 };
