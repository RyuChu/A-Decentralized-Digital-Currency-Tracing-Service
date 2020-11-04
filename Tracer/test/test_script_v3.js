const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v3.json');
let contractAddress = "0x715CdCE9fD261D19454a26F20CFb52A467749bC2";
let account = "0xF7359b1c9a0a94DEb6b3aA28E882D1C411dc9f7d";

var fromBlock = '';
var toBlock = '';

var checkPoint = 0;

// searchBlock();
searchAll();

async function searchBlock() {
    console.time('test');

    let contract = new web3.eth.Contract(tracerContract.abi);
    contract.options.address = web3.utils.toChecksumAddress(contractAddress);
    var result = await contract.methods.token_queryBlock(fromBlock, toBlock, checkPoint).call({
        from: account
    });
    if (result[1].length < 100) {
        // Done for seaching
        fs.appendFileSync("result_searchBlock.txt", "Get result amount: " + result[i].length);
        fs.appendFileSync("Cost time: " + console.timeEnd('test') + "\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}

async function searchAll() {
    let contract = new web3.eth.Contract(tracerContract.abi);
    contract.options.address = web3.utils.toChecksumAddress(contractAddress);
    var result = await contract.methods.token_query(checkPoint).call({
        from: account
    });
    if (result[1].length < 100) {
        // Done for seaching
        fs.appendFileSync("result_searchAll.txt", "Get result amount: " + result[i].length);
        fs.appendFileSync("Cost time: " + console.timeEnd('test') + "\n");
    } else {
        checkPoint = result[0];
        searchAll();
    }
}