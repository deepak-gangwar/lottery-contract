// SPDX-License-Identifier: MIT

// Updates from the original contract, lot of type casting had to be done
// 1. Had to update addresses to address payble type
// 2. this.balance was updadted to address(this).balance
// 3. Updated the arguments of keccak256 function to pass abi.encodePacked(arg)
// 4. now was deprecated so used block.timestamp instead

pragma solidity ^0.8.0;

contract Lottery {
    address payable public manager;
    address payable[] public players;

    constructor() {
        manager = payable(msg.sender);
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);

        players.push(payable(msg.sender));
    }

    function random() private view returns(uint) {
        // now was deprecated so used block.timestamp instead
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;

        // You used to be able to do this.balance because solidity would allow 
        // implicit access to the address functions through the contract instance object.

        // However, as of Solidity 0.4.22, the recommended practice is to use address(this).balance 
        // which explicitly converts this (the current contract instance) to an address object.
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }
}
