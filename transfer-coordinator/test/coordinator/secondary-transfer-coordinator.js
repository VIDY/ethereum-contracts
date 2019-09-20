const { BN, time, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const InterfaceTester = require('./interface-tester');

const { expect } = require('chai');

const SecondaryTransferCoordinator = artifacts.require("./SecondaryTransferCoordinator.sol");
const BaseERC20Token = artifacts.require("./BaseERC20Token.sol");

const constructor = async (tokenAddress) => {
  return SecondaryTransferCoordinator.new(tokenAddress)
};

contract('SecondaryTransferCoordinator', function (accounts) {
  context('interface', InterfaceTester(constructor, accounts));

  context('secondary', function () {
    it('TODO: implement primary/secondary testing', async function () {
      expect("implemented").to.equal(true);
    });
  });
});
