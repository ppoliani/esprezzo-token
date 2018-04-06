const EsprezzoCrowdsale = artifacts.require('EsprezzoCrowdsale');
const EsprezzoToken = artifacts.require('EsprezzoToken');
const {increaseTimeTo} = require('./helpers/timeUtils');

contract('EsprezzoCrowdsale', async (accounts) => {
  let instance;

  before(async () => {
    instance = await EsprezzoCrowdsale.deployed();
    const openingTime = await instance.openingTime();
    await increaseTimeTo(openingTime.toNumber() + 1000);
  });

  it('should deploy the token and store the address', async () => {
    const token = await instance.token.call();
    assert(token, 'Token address couldn\'t be stored');
  });

  it('should set stage to PreICO', async () => {
    await instance.setCrowdsaleStage(0);
    const stage = await instance.stage.call();
    assert.equal(stage.toNumber(), 0, 'The stage couldn\'t be set to PreICO');
  });

  it('one ETH should buy 5 Esprezzo Tokens in PreICO', async () => {
    const data = await instance.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });
    const tokenAddress = await instance.token();
    const esprezzoToken = EsprezzoToken.at(tokenAddress);
    const tokenAmount = await esprezzoToken.balanceOf(accounts[7]);
    assert.equal(tokenAmount.toNumber(), 5000000000000000000, 'The sender didn\'t receive the tokens as per PreICO rate');
  });

  it('should transfer the ETH to wallet immediately in Pre ICO', async () => {
    let balanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
    balanceOfBeneficiary = Number(balanceOfBeneficiary.toString(10));

    await instance.sendTransaction({ from: accounts[1], value: web3.toWei(2, 'ether') });

    let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
    newBalanceOfBeneficiary = Number(newBalanceOfBeneficiary.toString(10));

    assert.equal(newBalanceOfBeneficiary, balanceOfBeneficiary + 2000000000000000000, 'ETH couldn\'t be transferred to the beneficiary');
  });

  it('should set variable `totalWeiRaisedDuringPreICO` correctly', async () => {
    const amount = await instance.totalWeiRaisedDuringPreICO.call();
    assert.equal(amount.toNumber(), web3.toWei(3, 'ether'), 'Total ETH raised in PreICO was not calculated correctly');
  });

  it('should set stage to ICO', async () => {
    await instance.setCrowdsaleStage(1);
    const stage = await instance.stage.call();
    assert.equal(stage.toNumber(), 1, 'The stage couldn\'t be set to ICO');
  });

  it('one ETH should buy 2 Esprezzo Tokens in ICO', async () => {
    const data = await instance.sendTransaction({ from: accounts[2], value: web3.toWei(1.5, 'ether') });
    const tokenAddress = await instance.token.call();
    const esprezzoToken = EsprezzoToken.at(tokenAddress);
    const tokenAmount = await esprezzoToken.balanceOf(accounts[2]);
    assert.equal(tokenAmount.toNumber(), 3000000000000000000, 'The sender didn\'t receive the tokens as per ICO rate');
  });

  it('should transfer the raised ETH to RefundVault during ICO', async () => {
    const vaultAddress = await instance.vault.call();
    const balance = await web3.eth.getBalance(vaultAddress);
    assert.equal(balance.toNumber(), 1500000000000000000, 'ETH couldn\'t be transferred to the vault');
  });

  it('Vault balance should be added to our wallet once ICO is over', async () => {
    let balanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
    balanceOfBeneficiary = balanceOfBeneficiary.toNumber();

    const vaultAddress = await instance.vault.call();
    const vaultBalance = await web3.eth.getBalance(vaultAddress);

    const closingTime = await instance.closingTime();
    await increaseTimeTo(closingTime.toNumber() + 10);

    await instance.finish(accounts[0], accounts[1], accounts[2]);

    let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
    newBalanceOfBeneficiary = newBalanceOfBeneficiary.toNumber();

    assert.equal(newBalanceOfBeneficiary, balanceOfBeneficiary + vaultBalance.toNumber(), 'Vault balance couldn\'t be sent to the wallet');
  });
});
