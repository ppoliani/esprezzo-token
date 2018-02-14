var EsprezzoCrowdsale = artifacts.require("./EsprezzoCrowdsale.sol");

module.exports = function(deployer) {
  const startTime = Math.round((new Date(Date.now() - 86400000).getTime())/1000); // Yesterday
  const endTime = Math.round((new Date().getTime() + (86400000 * 20))/1000); // Today + 20 days
  deployer.deploy(EsprezzoCrowdsale,
    startTime,
    endTime,
    5,
    "0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc", // Replace this wallet address with the last one (10th account) from Ganache UI. This will be treated as the beneficiary address.
    2000000000000000000, // 2 ETH
    500000000000000000000 // 500 ETH
  );
};
