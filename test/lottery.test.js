// We need assert for making assertions during testing
const assert = require('assert');

// Ganache is the local test network that also provides unlocked accounts 
// Ganache is instantaneous, unlike real ethereum networks
const ganache = require('ganache');

// Web3 is our portal to networks, here ganache
// We imported whole library as a class
const Web3 = require('web3');

// But web3 needs a provider. 
// During testing we are using ganache as the provider it gives 
// is automatically linked to the accounts as well as the network
const web3 = new Web3(ganache.provider());

// Above is created an instance of web3 library
// We can have multiple instances in same project
// that can connect to different networks

const { abi, evm } = require('../compile');

// We need to access accounts and the contract outside 'beforeEach' as well
let accounts;
let lottery;

