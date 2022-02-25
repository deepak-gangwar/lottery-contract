const HDWalletProvider = require('@truffle/hdwallet-provider');

// Web3 is our portal to the Rinkeby network
// We imported whole library as a class
const Web3 = require('web3');

const { abi, evm } = require('./compile');

// wallet provider needs two arguments, 
// your account mnemonic to charge ether for sending transaciton
// and address of a node on that network to deploy the contract
// we are doing this using infura's hosted nodes
// This is secret stuff, don't make this visible in actual projects
provider = new HDWalletProvider(
    'account-mnemonic',
    'Infura url'
);

// But web3 needs a provider. 
// We are using truffle
const web3 = new Web3(provider);

// Above is created an instance of web3 library
// We can have multiple instances in same project
// that can connect to different networks

// To use the async/await syntax, we are creating a function
// and then calling it just after declaration
const deploy = async () => {
    // Getting the list of accounts
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy a contract from account", accounts[0]);

    // Storing the contract in result variable
    const result = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
        })
        .send({ from: accounts[0], gas: 1000000 });

    console.log('Contract deployed to ', result.options.address);

    // We call provider.engine.stop() to prevent deployment 
    // from hanging in the terminal
    provider.engine.stop();
};

deploy();
