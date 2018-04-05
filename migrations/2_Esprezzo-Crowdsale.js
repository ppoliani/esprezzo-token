var EsprezzoCrowdsale = artifacts.require("EsprezzoCrowdsale");

module.exports = function(deployer, _, accounts) {
  const startTime = Math.round((new Date(Date.now() + 86400000).getTime())/1000); // Tomorrow
  const endTime = Math.round((new Date().getTime() + (86400000 * 20))/1000); // Today + 20 days

  deployer.deploy(EsprezzoCrowdsale,
    startTime,
    endTime,
    5,
    accounts[9], // Replace this wallet address with the last one (10th account) from Ganache UI. This will be treated as the beneficiary address.
    web3.toWei(2, 'ether'),
    web3.toWei(500, 'ether') // 500 ETH
  );
};
