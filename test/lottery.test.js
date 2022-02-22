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


// some common process that needs to be carried out during each 'it' function
beforeEach(async () => {
    // Since web3 is used for all kinds of things and 
    // not just ethereum, so eth is a module in it
    
    // Things with web3 are quick but asynchronous
    // That is why we are using async/await
    
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    //Creating the contract instance
    lottery = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
        })
        .send({ from: accounts[0], gas: '1000000' });
    
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
    
    // Asserting single players entry
    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });
    
    / Asserting multiple players
    // If one test goes wrong doesn't mean the other cannot be right
    it('allows more than one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(2, players.length);
    });
});

