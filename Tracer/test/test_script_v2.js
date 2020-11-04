const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v2.json');
let contractAddress = "0x8741ccbdF1F302F8164Dc8C2B8DADe8a95405888";
let account = "0x3b4f086603b5a2e033784AE23f6d92e65F631bEC";

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