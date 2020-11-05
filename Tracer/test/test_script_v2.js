const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v2-2.json');
let contractAddress = "0x39654ac6B137F3Bb794469dac108F60d1953B17A";
let account = "0x088C4fcc372111E0513046ee9645c2Bfe99F8160";

var block = 100;

var checkPoint = 0;

searchBlock();

async function searchBlock() {
    console.time('test');

    let contract = new web3.eth.Contract(tracerContract.abi, contractAddress);
    var result = await contract.methods.token_queryBlock(block, block, checkPoint).call();
    if (result[1].length < 100) {
        // Done for searching
        fs.appendFileSync("result_searchBlock.txt", "Get result amount: " + result[1].length);
        fs.appendFileSync("Cost time: " + console.timeEnd('test') + "\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}