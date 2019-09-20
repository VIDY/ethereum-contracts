const { BN, time, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');

const { expect } = require('chai');

const BaseERC20Token = artifacts.require("./BaseERC20Token.sol");

module.exports = exports = (constructor, accounts) => {
  const callback = (accounts) => () => {
    async function expectAmounts(token, coordinator, amounts) {
      for (const account of accounts) {
        expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amounts[account]);
      }
      for (const account of Object.keys(amounts)) {
        if (!accounts.includes(amounts)) {
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amounts[account]);
        }
      }
    }

    async function expectNonceUsed(coordinator, nonce) {
      expect(await coordinator.nonceUsed.call(0)).to.equal(false);
      expect(await coordinator.nonceUsed.call(1)).to.equal(nonce === 1);
      expect(await coordinator.nonceUsed.call(2)).to.equal(nonce === 2);
      if (nonce > 2) expect(await coordinator.nonceUsed.call(nonce)).to.equal(true);
    }

    const coordinatorAmount = new BN('1000000000000000000000000000000');
    const halfCoordinatorAmount = new BN('500000000000000000000000000000');
    const minter = accounts[0];
    const intermediate = accounts[accounts.length - 1];
    const accountAmounts = {};
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      let extraZeroes;
      if (i % 3 === 0) extraZeroes = '';
      if (i % 3 === 1) extraZeroes = '0';
      if (i % 3 === 2) extraZeroes = '00';

      accountAmounts[account] = new BN(`${1 + (i % 5)}${extraZeroes}000000000000000000000000000`);
    }

    let token, cooordinator, amounts;

    beforeEach(async function () {
      token = await BaseERC20Token.new();
      coordinator = await constructor(token.address);
      amounts = Object.assign({}, accountAmounts, { [coordinator.address]:coordinatorAmount });
    });

    it('remembers token', async function() {
      expect(await coordinator.token.call()).to.equal(token.address);
    });

    it('nonces unused', async function() {
      expect(await coordinator.nonceUsed.call(0)).to.equal(false);
      expect(await coordinator.nonceUsed.call(1)).to.equal(false);
      expect(await coordinator.nonceUsed.call(2)).to.equal(false);
    });

    context('with balances', function () {
      beforeEach(async function () {
        for (const account of accounts) {
          const amount = amounts[account];
          await token.mint(account, amount, { from:minter });
        }
        await token.mint(coordinator.address, coordinatorAmount, { from:minter });
      });

      it('drain should succeed with no effect', async function() {
        const result = await coordinator.drain(0, accounts);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      });

      it('drain should succeed with no effect, except marking nonce 1 used', async function() {
        const result = await coordinator.drain(1, accounts);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      });

      it('drain should succeed with no effect, except marking nonce 2 used', async function() {
        const result = await coordinator.drain(2, accounts);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      });

      it('transfer for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(0, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transfer for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(1, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transfer for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(2, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transferThrough for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(0, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transferThrough for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(1, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transferThrough for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(2, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transferFrom for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(0, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transferFrom for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(1, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transferFrom for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(2, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transfer with nonzero funding reverts', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        await expectRevert.unspecified(coordinator.transfer(0, funders, [0, 1], recipients, zeroes))
      })

      it('transfer with nonzero recipient amount succeeds when coordinator funding available', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        await coordinator.transfer(1, funders, zeroes, recipients, [1, 1]);
        for (const account of accounts) {
          const amount = amounts[account].add(recipients.includes(account) ? new BN(1) : new BN(0));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount.sub(new BN(2)));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with large recipient amount succeeds when coordinator funding available', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const sendAmounts = [halfCoordinatorAmount, halfCoordinatorAmount];
        await coordinator.transfer(1, funders, zeroes, recipients, sendAmounts);
        for (const account of accounts) {
          const amount = amounts[account].add(recipients.includes(account) ? halfCoordinatorAmount : new BN(0));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(0));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with recipient amount exceeding coordinator funding reverts', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const sendAmounts = [halfCoordinatorAmount, halfCoordinatorAmount.add(new BN(1))];
        await expectRevert.unspecified(coordinator.transfer(0, funders, zeroes, recipients, sendAmounts))
      });
    });

    context('with balances and approval', function () {
      beforeEach(async function () {
        const two = new BN(2);
        const two55 = new BN(255);
        const max = two.pow(two55);

        for (const account of accounts) {
          const amount = amounts[account];
          await token.mint(account, amount, { from:minter });

          const approval = account === intermediate ? max : amount.div(two);
          await token.approve(coordinator.address, approval, { from:account });
        }
        await token.mint(coordinator.address, coordinatorAmount, { from:minter });
      });

      it('drain should remove all approved funds', async function() {
        const funders = accounts.slice(1, 5);
        const funds = Object.assign({}, amounts);
        let transferTotal = new BN(0);
        for (const account of funders) {
          funds[account] = amounts[account].div(new BN(2));
          transferTotal = transferTotal.add(funds[account]);
        }
        funds[coordinator.address] = amounts[coordinator.address].add(transferTotal);

        const result = await coordinator.drain(1, funders);
        await expectAmounts(token, coordinator, funds);
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(0, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transfer for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(1, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transfer for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transfer(2, funders, zeroes, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transferThrough for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(0, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transferThrough for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(1, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transferThrough for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const intermediate = accounts[5];
        const zeroes = [0, 0];
        const result = await coordinator.transferThrough(2, funders, zeroes, intermediate, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transferFrom for zero amounts should succeed with no effect', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(0, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 0);
      })

      it('transferFrom for zero amounts should succeed with no effect except marking nonce 1 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(1, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 1);
      })

      it('transferFrom for zero amounts should succeed with no effect except marking nonce 2 used', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const result = await coordinator.transferFrom(2, funders, recipients, zeroes);
        await expectAmounts(token, coordinator, amounts);
        await expectNonceUsed(coordinator, 2);
      })

      it('transfer with nonzero funding succeeds', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        await coordinator.transfer(1, funders, [1, 1], recipients, zeroes);
        for (const account of accounts) {
          const amount = amounts[account].sub(funders.includes(account) ? new BN(1) : new BN(0));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount.add(new BN(2)));
        await expectNonceUsed(coordinator, 1);
      })

      it('transfer with nonzero recipient amount succeeds when coordinator funding available', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        await coordinator.transfer(1, funders, zeroes, recipients, [1, 1]);
        for (const account of accounts) {
          const amount = amounts[account].add(recipients.includes(account) ? new BN(1) : new BN(0));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount.sub(new BN(2)));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with large funder amount succeeds', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const funds = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2))
        ];
        await coordinator.transfer(1, funders, funds, recipients, zeroes);
        for (const account of accounts) {
          const amount = amounts[account].div(funders.includes(account) ? new BN(2) : new BN(1));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        const ca = coordinatorAmount.add(funds[0]).add(funds[1]);
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(ca);
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with large recipient amount succeeds when coordinator funding available', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const sendAmounts = [halfCoordinatorAmount, halfCoordinatorAmount];
        await coordinator.transfer(1, funders, zeroes, recipients, sendAmounts);
        for (const account of accounts) {
          const amount = amounts[account].add(recipients.includes(account) ? halfCoordinatorAmount : new BN(0));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(0));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with recipient amount exceeding coordinator funding reverts', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const zeroes = [0, 0];
        const sendAmounts = [halfCoordinatorAmount, halfCoordinatorAmount.add(new BN(1))];
        await expectRevert.unspecified(coordinator.transfer(0, funders, zeroes, recipients, sendAmounts))
      });

      it('transfer with nonzero throughput succeeds', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const ones = [1, 1];
        await coordinator.transfer(1, funders, ones, recipients, ones);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(new BN(1));
          if (recipients.includes(account)) amount = amount.add(new BN(1));
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with large throughput succeeds', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const fundsOut = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2))
        ];
        const fundsIn = [fundsOut[1], fundsOut[0]];
        await coordinator.transfer(1, funders, fundsOut, recipients, fundsIn);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsOut[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsIn[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer with overlapping throughput succeeds', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsOut = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2)),
          amounts[funders[2]].div(new BN(2))
        ];
        const fundsIn = [fundsOut[2], fundsOut[1], fundsOut[0]];
        await coordinator.transfer(1, funders, fundsOut, recipients, fundsIn);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsOut[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsIn[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer should revert for funding amount exceeding allowance', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const fundsOut = [
          1,
          amounts[funders[1]]
        ];
        const fundsIn = [0, 0];
        await expectRevert.unspecified(coordinator.transfer(1, funders, fundsOut, recipients, fundsIn));
      });

      it('transfer fills coordinator funds when input exceeds output', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2)),
          amounts[funders[2]].div(new BN(2))
        ];
        const fundsOut = [1, 1, 1].map(a => new BN(a));
        await coordinator.transfer(1, funders, fundsIn, recipients, fundsOut);

        let amountIn = new BN(0);
        let amountOut = new BN(3);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) {
            amount = amount.sub(fundsIn[funders.indexOf(account)]);
            amountIn = amountIn.add(fundsIn[funders.indexOf(account)]);
          }
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount.add(amountIn).sub(amountOut));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer draws from coordinator funds when output exceeds input', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [1, 1, 1].map(a => new BN(a));
        const fundsOut = [200000, 300000, 400000].map(a => new BN(a));
        await coordinator.transfer(1, funders, fundsIn, recipients, fundsOut);

        let amountIn = new BN(3);
        let amountOut = new BN(900000);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount.add(amountIn).sub(amountOut));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should succeed when allowance permits', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1, 2].map(a => new BN(a));
        const fundsOut = [2, 1].map(a => new BN(a));
        await token.approve(coordinator.address, 3, { from:intermediate });
        await coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should revert when intermediate allowance does not permit', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1, 2].map(a => new BN(a));
        const fundsOut = [2, 1].map(a => new BN(a));
        await token.approve(coordinator.address, 2, { from:intermediate });
        await expectRevert.unspecified(coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut));
      });

      it('transferThrough should succeed for large amounts', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2))
        ];
        const fundsOut = [fundsIn[1], fundsIn[0]];
        await coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should succeed for overlapping accounts', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2)),
          amounts[funders[2]].div(new BN(2))
        ];
        const fundsOut = [fundsIn[2], fundsIn[1], fundsIn[0]];
        await coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should fill intermediate if inflow exceeds outflow', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [
          amounts[funders[0]].div(new BN(2)),
          amounts[funders[1]].div(new BN(2)),
          amounts[funders[2]].div(new BN(2))
        ];
        const fundsOut = [1, 1, 1].map(a => new BN(a));
        await coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          if (account === intermediate) {
            amount = amount.add(fundsIn[0]).add(fundsIn[1]).add(fundsIn[2]).sub(new BN(3));
          }
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should draw from intermediate if outflow exceeds inflow', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [1, 1, 1].map(a => new BN(a));
        const fundsOut = [200000, 300000, 400000].map(a => new BN(a));
        await coordinator.transferThrough(1, funders, fundsIn, intermediate, recipients, fundsOut);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(fundsIn[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(fundsOut[recipients.indexOf(account)]);
          if (account === intermediate) {
            amount = amount.add(new BN(3)).sub(new BN(900000));
          }
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should directly transfer tokens between accounts', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const funds = [200000, 300000].map(a => new BN(a));
        await coordinator.transferFrom(1, funders, recipients, funds);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(funds[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(funds[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should directly transfer tokens between accounts when overlap exists', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const funds = [200000, 300000, 400000].map(a => new BN(a));
        await coordinator.transferFrom(1, funders, recipients, funds);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(funds[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(funds[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should succeed when self-transfers occur', async function() {
        const funders = accounts.slice(1, 4);
        const recipients = [funders[2], funders[1], funders[0]];
        const funds = [200000, 300000, 400000].map(a => new BN(a));
        await coordinator.transferFrom(1, funders, recipients, funds);
        for (const account of accounts) {
          let amount = amounts[account];
          if (funders.includes(account)) amount = amount.sub(funds[funders.indexOf(account)]);
          if (recipients.includes(account)) amount = amount.add(funds[recipients.indexOf(account)]);
          expect(await token.balanceOf.call(account)).to.be.bignumber.equal(amount);
        }
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(coordinatorAmount);
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should revert when transfer amount exceeds allowance', async function() {
        const funders = accounts.slice(1, 3);
        const recipients = accounts.slice(3, 5);
        const funds = [amounts[funders[0]], new BN(1)];
        await expectRevert.unspecified(coordinator.transferFrom(1, funders, recipients, funds));
      });
    });

    context('with low balances and high allowances', function () {
      beforeEach(async function () {
        const max = (new BN(2)).pow(new BN(255));
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          const amount = new BN(`${i}000`);
          await token.mint(account, amount, { from:minter });
          await token.approve(coordinator.address, max, { from:account });
          amounts[account] = amount;
        }

        amounts[coordinator.address] = new BN('1000');
        await token.mint(coordinator.address, 1000, { from:minter });
      });

      it('drain should exhaust balances', async function () {
        const funders = accounts.slice(1, 4);
        await coordinator.drain(1, funders);
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(7000));
        await expectNonceUsed(coordinator, 1);
      })

      it('transfer should succeed for moderate amounts', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [400, 500, 600].map(a => new BN(a));
        const fundsOut = [700, 805].map(a => new BN(a));

        await coordinator.transfer(1, funders, fundsIn, recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(600));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(3100));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(4805));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(995));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer should succeed for full balances', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [1500, 1505].map(a => new BN(a));

        await coordinator.transfer(1, funders, fundsIn, recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(5505));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(3995));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer should succeed even if coordinator balance necessary', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [1500, 1500, 4000].map(a => new BN(a));

        await coordinator.transfer(1, funders, fundsIn, recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(5500));
        expect(await token.balanceOf.call(accounts[5])).to.be.bignumber.equal(new BN(9000));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(0));
        await expectNonceUsed(coordinator, 1);
      });

      it('transfer should revert for exceeded balance', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [1500, 1500, 4001].map(a => new BN(a));

        await expectRevert.unspecified(coordinator.transfer(1, funders, fundsIn, recipients, fundsOut));
      });

      it('transferThrough should succeed for moderate amounts', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [400, 500, 600].map(a => new BN(a));
        const fundsOut = [700, 795].map(a => new BN(a));

        await coordinator.transferThrough(1, funders, fundsIn, accounts[0], recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[0])).to.be.bignumber.equal(new BN(5));
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(600));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(3100));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(4795));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(1000));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should succeed for full balances', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [1500, 1505].map(a => new BN(a));

        await coordinator.transferThrough(1, funders, fundsIn, accounts[0], recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[0])).to.be.bignumber.equal(new BN(2995));
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(5505));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(1000));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should succeed when intermediate balance required to cover', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [6000, 5000].map(a => new BN(a));

        await coordinator.transferThrough(1, funders, fundsIn, accounts[5], recipients, fundsOut);
        expect(await token.balanceOf.call(accounts[0])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(6000));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(9000));
        expect(await token.balanceOf.call(accounts[5])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(1000));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferThrough should succeed when intermediate balance is insufficient to cover', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 5);
        const fundsIn = [1000, 2000, 3000].map(a => new BN(a));
        const fundsOut = [6000, 5001].map(a => new BN(a));

        await expectRevert.unspecified(coordinator.transferThrough(1, funders, fundsIn, accounts[5], recipients, fundsOut));
      });

      it('transferFrom should succeed for moderate amounts', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const funds = [400, 500, 600].map(a => new BN(a));

        await coordinator.transferFrom(1, funders, recipients, funds);
        expect(await token.balanceOf.call(accounts[0])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(600));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(1500));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(2800));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(4500));
        expect(await token.balanceOf.call(accounts[5])).to.be.bignumber.equal(new BN(5600));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(1000));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should succeed for full amounts', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(3, 6);
        const funds = [1000, 2000, 3000].map(a => new BN(a));

        await coordinator.transferFrom(1, funders, recipients, funds);
        expect(await token.balanceOf.call(accounts[0])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[1])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[2])).to.be.bignumber.equal(new BN(0));
        expect(await token.balanceOf.call(accounts[3])).to.be.bignumber.equal(new BN(1000));
        expect(await token.balanceOf.call(accounts[4])).to.be.bignumber.equal(new BN(6000));
        expect(await token.balanceOf.call(accounts[5])).to.be.bignumber.equal(new BN(8000));
        expect(await token.balanceOf.call(coordinator.address)).to.be.bignumber.equal(new BN(1000));
        await expectNonceUsed(coordinator, 1);
      });

      it('transferFrom should revert for amounts larger than balance', async function () {
        const funders = accounts.slice(1, 4);
        const recipients = accounts.slice(4, 7);
        const funds = [1000, 2000, 3001].map(a => new BN(a));

        await expectRevert.unspecified(coordinator.transferFrom(1, funders, recipients, funds));
      });
    });
  };

  return accounts ? callback(accounts) : callback;
}
