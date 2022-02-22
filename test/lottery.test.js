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
    
    // Try and catch assertions

    // When we are using the asynchronous code, like async/await
    // we can use try/catch to look for errors
    it('requires a min amount of ether to enter', async () => {
        // How try catch work is that JavaScript will run the 
        // code inside try block, if everything is fine, code will
        // execute and finish. If something goes wrong, the interpreter
        // will run the code inside the catch block
        try {
            // Here we deliberately want that this call should 
            // end in an error so that we reach catch block
            await lottery.methods.enter().send({
                from : accounts[0],
                value: 10
            });

            // If upto here it does not throw an error
            // the following statement is going to throw error
            assert(false);
            // the whole point of this line is that if we get upto
            // this point in code, we automatically fail the test
        } catch (err) {
            assert(err);
        }
    });
    
    // Testing function modifiers
    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
    
    // End to end test
    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        // Using getBalance function of web3 to know the 
        // balance of contract or any individual account
        
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        
        //Technically the difference between initial and final balance
        // should be 2 ether, however we also spend some ether on gas
        // so in actual it should be less than that

        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});

