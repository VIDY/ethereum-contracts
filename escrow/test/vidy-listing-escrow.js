const { BN, time, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');

const { expect } = require('chai');

const VidyListingEscrow = artifacts.require("./VidyListingEscrow.sol");
const BaseERC20Token = artifacts.require("./BaseERC20Token.sol");

contract('VidyListingEscrow', function (accounts) {
  const amount = new BN('1e28');
  const minter = accounts[0];
  const beneficiary = accounts[1];
  const otherAccounts = accounts.slice(2);

  context('with token', function () {
    beforeEach(async function () {
      this.token = await BaseERC20Token.new();
    });

    it('rejects a release time in the past', async function () {
      const pastReleaseTime = (await time.latest()).sub(time.duration.years(1));
      await expectRevert(
        VidyListingEscrow.new(this.token.address, beneficiary, pastReleaseTime),
        'TokenTimelock: release time is before current time'
      );
    });

    context('absolute date', function () {
      const JULY_7_2019 = 1562457600;
      const JULY_7_2020 = 1594080000;

      it('cannot deploy to July 7 2019', async function() {
        await expectRevert(
          VidyListingEscrow.new(this.token.address, beneficiary, JULY_7_2019),
          'TokenTimelock: release time is before current time'
        );
      });

      it('can deploy to July 7 2020', async function() {
        const timelock = await VidyListingEscrow.new(this.token.address, beneficiary, JULY_7_2020);
        expect(await timelock.token()).to.equal(this.token.address);
        expect(await timelock.beneficiary()).to.equal(beneficiary);
        expect(await timelock.releaseTime()).to.be.bignumber.equal(new BN(JULY_7_2020));
      });
    });

    context('once deployed', function () {
      beforeEach(async function () {
        this.releaseTime = (await time.latest()).add(time.duration.years(1));
        this.timelock = await VidyListingEscrow.new(this.token.address, beneficiary, this.releaseTime);
        await this.token.mint(this.timelock.address, amount, { from: minter });
      });

      it('can get state', async function () {
        expect(await this.timelock.token()).to.equal(this.token.address);
        expect(await this.timelock.beneficiary()).to.equal(beneficiary);
        expect(await this.timelock.releaseTime()).to.be.bignumber.equal(this.releaseTime);
      });

      it('cannot be released before time limit', async function () {
        await expectRevert(this.timelock.release(), 'TokenTimelock: current time is before release time');
      });

      it('cannot be released just before time limit', async function () {
        await time.increaseTo(this.releaseTime.sub(time.duration.seconds(3)));
        await expectRevert(this.timelock.release(), 'TokenTimelock: current time is before release time');
      });

      it('can be released just after limit', async function () {
        await time.increaseTo(this.releaseTime.add(time.duration.seconds(1)));
        await this.timelock.release();
        expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(amount);
      });

      it('can be released after time limit', async function () {
        await time.increaseTo(this.releaseTime.add(time.duration.years(1)));
        await this.timelock.release();
        expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(amount);
      });

      it('cannot be released twice', async function () {
        await time.increaseTo(this.releaseTime.add(time.duration.years(1)));
        await this.timelock.release();
        await expectRevert(this.timelock.release(), 'TokenTimelock: no tokens to release');
        expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(amount);
      });
    });
  });
});
