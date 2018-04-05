module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: "5777"
    },
		ropsten: {
			network_id: 3,
			host: "localhost",
			port: 8545,
			gas: 2900000
		}
  },
  rpc: {
    host: "localhost",
    post:8080
  },
  solc: { 
    optimizer: { 
      enabled: true, 
      runs: 200 
    } 
  }
};
