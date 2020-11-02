const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v2.json');
let contractAddress = "0x89f1Ffc054c6e4F00B8c23dc2E05eef951fbbC9d";
let account = "0x8070456002771f7977e7869e0Bc5d9a97dB52A73";

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