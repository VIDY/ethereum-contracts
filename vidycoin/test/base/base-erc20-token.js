const BaseERC20Token = artifacts.require("./BaseERC20Token.sol");

const { assertRevert, validateErc20, assertNumbersEqual, assertNumberIsSum, assertNumberIsDifference, padAddress } = require('@vidy-dev/ethereum-utils')

const supply = 9001;
const balance0 = 8000;
const balance1 = 1001;
let T, owner;

contract('BaseERC20Token', (accounts) => {
  beforeEach(async() => {
    owner = accounts[0];
    T = await BaseERC20Token.new(supply, 18, "Token", "T", { from: owner });
    await T.transfer(accounts[1], 1001, { from: owner });
  });

  it('erc20: should pass erc20 standard validation', async() => {
    const balances = {};
    balances[accounts[0]] = balance0;
    balances[accounts[1]] = balance1;
    await validateErc20({
      token: T,
      supply,
      decimals: 18,
      name: "Token",
      symbol: "T",
      accounts,
      balances,
      allowances: {}
    })
  });

  it('construction: should remember owner', async() => {
      const obj0 = await BaseERC20Token.new(supply, 18, "Token", "T");
      const obj1 = await BaseERC20Token.new(supply, 18, "Token", "T", {from: accounts[1]});
      assert.strictEqual(await obj0.owner.call(), accounts[0]);
      assert.strictEqual(await obj1.owner.call(), accounts[1]);
  });

  it('pause: should set "paused"', async() => {
    assert.strictEqual(await T.paused.call(), false);
    await T.pause({from: owner});
    assert.strictEqual(await T.paused.call(), true);
  });

  it('pause: all transfers and approvals should revert while paused', async() => {
    await T.approve(accounts[1], 1000, {from: accounts[0]});
    await T.pause({from: accounts[0]});

    await assertRevert(T.transfer(accounts[1], 1, {from: accounts[0]}));
    await assertRevert(T.transfer(accounts[0], 1, {from: accounts[1]}));
    await assertRevert(T.transfer(accounts[1], 0, {from: accounts[0]}));
    await assertRevert(T.transfer(accounts[0], 0, {from: accounts[1]}));

    await assertRevert(T.transferFrom(accounts[0], accounts[2], 1, {from: accounts[1]}));

    await assertRevert(T.approve(accounts[0], 1000, {from: accounts[1]}));
  })

  it('unpause: should set "paused"', async() => {
    assert.strictEqual(await T.paused.call(), false);
    await T.pause({from: owner});
    await T.unpause({from: owner})
    assert.strictEqual(await T.paused.call(), false);
  });

  it('unpause: should pass erc20 standard validation after unpausing', async() => {
    const balances = {};
    balances[accounts[0]] = balance0;
    balances[accounts[1]] = balance1;
    await T.pause({from: owner});
    await T.unpause({from: owner})
    await validateErc20({
      token: T,
      supply,
      decimals: 18,
      name: "Token",
      symbol: "T",
      accounts,
      balances,
      allowances: {}
    })
  })

  it('burn: should successfully burn tokens, removing them from total supply', async() => {
    await T.burn(10, { from: accounts[0] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();

    assert.strictEqual(balance.toNumber(), balance0 - 10);
    assert.strictEqual(totalSupply.toNumber(), supply - 10);
  });

  it('burn: revert when paused', async() => {
    await T.pause({from: owner});
    await assertRevert(T.burn(10, { from: accounts[0] }));
    await assertRevert(T.burn(10, { from: accounts[1] }));
  });

  it('burn: should successfully burn tokens after unpausing', async() => {
    await T.pause({from: owner});
    await T.unpause({from: owner});
    await T.burn(10, { from: accounts[0] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();

    assert.strictEqual(balance.toNumber(), balance0 - 10);
    assert.strictEqual(totalSupply.toNumber(), supply - 10);
  });

  it('burn: should successfully burn all tokens in an account', async() => {
    await T.burn(balance0, { from: accounts[0] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();

    assert.strictEqual(balance.toNumber(), 0);
    assert.strictEqual(totalSupply.toNumber(), supply - balance0);
  });

  it('burn: should successfully 0 tokens', async() => {
    await T.burn(0, { from: accounts[0] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();

    assert.strictEqual(balance.toNumber(), balance0);
    assert.strictEqual(totalSupply.toNumber(), supply);
  });

  it('burn: should fail burning more tokens than in an account', async() => {
    await assertRevert(T.burn.call(balance0 + 1, { from: accounts[0] }));
  });

  it('burnFrom: should successfully burn tokens, removing them from total supply', async() => {
    await T.approve(accounts[1], 1000, { from: accounts[0] })
    await T.burnFrom(accounts[0], 10, { from: accounts[1] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();
    const allowance = await T.allowance.call(accounts[0], accounts[1])

    assertNumberIsDifference(balance, balance0, 10);
    assertNumberIsDifference(totalSupply, supply, 10);
    assertNumberIsDifference(allowance, 1000, 10);
  });

  it('burnFrom: revert when paused', async() => {
    await T.approve(accounts[1], 1000, { from: accounts[0] })
    await T.pause({from: owner});
    await assertRevert(T.burnFrom(accounts[0], 10, { from: accounts[1] }));
  });

  it('burnFrom: should successfully burn tokens after unpausing', async() => {
    await T.approve(accounts[1], 1000, { from: accounts[0] })
    await T.pause({from: owner});
    await T.unpause({from: owner});
    await T.burnFrom(accounts[0], 10, { from: accounts[1] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();
    const allowance = await T.allowance.call(accounts[0], accounts[1])

    assertNumberIsDifference(balance, balance0, 10);
    assertNumberIsDifference(totalSupply, supply, 10);
    assertNumberIsDifference(allowance, 1000, 10);
  });

  it('burnFrom: should successfully burn all tokens in an account', async() => {
    await T.approve(accounts[1], balance0, { from: accounts[0] })
    await T.burnFrom(accounts[0], balance0, { from: accounts[1] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();
    const allowance = await T.allowance.call(accounts[0], accounts[1])

    assertNumbersEqual(balance, 0);
    assertNumberIsDifference(totalSupply, supply, balance0);
    assertNumbersEqual(allowance, 0);
  });

  it('burnFrom: should successfully burn 0 tokens', async() => {
    await T.approve(accounts[1], 1000, { from: accounts[0] })
    await T.burnFrom(accounts[0], 0, { from: accounts[1] });
    const balance = await T.balanceOf.call(accounts[0]);
    const totalSupply = await T.totalSupply.call();
    const allowance = await T.allowance.call(accounts[0], accounts[1])

    assertNumbersEqual(balance, balance0);
    assertNumbersEqual(totalSupply, supply);
    assertNumbersEqual(allowance, 1000);
  });

  it('burnFrom: should fail burning more tokens than in an account', async() => {
    await T.approve(accounts[1], balance0 + 1000, { from: accounts[0] })
    await assertRevert(T.burnFrom.call(accounts[0], balance0 + 1, { from: accounts[1] }));
  });

  it('burnFrom: should fail burning more tokens than allowance', async() => {
    await T.approve(accounts[1], 1000, { from: accounts[0] })
    await assertRevert(T.burnFrom.call(accounts[0], 1001, { from: accounts[1] }));
  });

  it('transferOwnership: should reassign owner', async() => {
    const obj = await BaseERC20Token.new(supply, 18, "Token", "T");
    assert.strictEqual(await obj.owner.call(), accounts[0]);
    await obj.transferOwnership(accounts[1]);
    assert.strictEqual(await obj.owner.call(), accounts[1]);
    await obj.transferOwnership(accounts[2], {from: accounts[1]});
    assert.strictEqual(await obj.owner.call(), accounts[2]);
  });

  it('transferOwnership: should revert if called by non-owner', async() => {
    const obj = await BaseERC20Token.new(supply, 18, "Token", "T");
    await assertRevert(obj.transferOwnership.call(accounts[1], {from: accounts[2]}));
    await obj.transferOwnership(accounts[1]);
    await assertRevert(obj.transferOwnership.call(accounts[2], {from: accounts[0]}));
  });

  it('renounceOwnership: should remove owner', async() => {
    var obj = await BaseERC20Token.new(supply, 18, "Token", "T");
    assert.strictEqual(await obj.owner.call(), accounts[0]);
    await obj.renounceOwnership();
    assert.strictEqual(await obj.owner.call(), padAddress(0));

    obj = await BaseERC20Token.new(supply, 18, "Token", "T", {from: accounts[1]});
    assert.strictEqual(await obj.owner.call(), accounts[1]);
    await obj.renounceOwnership({from: accounts[1]});
    assert.strictEqual(await obj.owner.call(), padAddress(0));
  });

  it('renounceOwnership: should revert if called by non-owner', async() => {
    var obj = await BaseERC20Token.new(supply, 18, "Token", "T");
    await assertRevert(obj.renounceOwnership.call({from: accounts[1]}));

    obj = await BaseERC20Token.new(supply, 18, "Token", "T", {from: accounts[1]});
    await assertRevert(obj.renounceOwnership.call({from: accounts[0]}));
  });

  it('events: should fire Burn event normally', async () => {
    const res = await T.burn(10, { from: accounts[0] });
    const transferLog = res.logs.find(element => element.event.match('Burn'));
    assert.strictEqual(transferLog.args.burner, accounts[0]);
    assert.strictEqual(transferLog.args.value.toString(), '10');
  });

  it('events: should fire Burn event normally for a 0-burn', async () => {
    const res = await T.burn(0, { from: accounts[0] });
    const transferLog = res.logs.find(element => element.event.match('Burn'));
    assert.strictEqual(transferLog.args.burner, accounts[0]);
    assert.strictEqual(transferLog.args.value.toString(), '0');
  });

  it('events: should fire Pause when paused', async () => {
    const res = await T.pause({ from: owner });
    const transferLog = res.logs.find(element => element.event.match('Pause'));
    assert.ok(!!transferLog, 'should find the Pause event')
  });

  it('events: should fire Unpause when paused', async () => {
    await T.pause({ from: owner });
    const res = await T.unpause({ from: owner });
    const transferLog = res.logs.find(element => element.event.match('Unpause'));
    assert.ok(!!transferLog, 'should find the Unpause event')
  });
})
