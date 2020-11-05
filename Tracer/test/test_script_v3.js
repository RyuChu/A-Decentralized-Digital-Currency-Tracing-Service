const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v3-2.json');
let contractAddress = "0xb7dC3C8cB813e5D52692aAf5a2e6DD9c94fd7A64";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

var block = 100;

var checkPoint = 0;

searchBlock();

async function searchBlock() {
    console.time('test');

    let contract = new web3.eth.Contract(tracerContract.abi);
    contract.options.address = web3.utils.toChecksumAddress(contractAddress);
    var result = await contract.methods.token_queryBlock(block, block, checkPoint).call({
        from: account,
        gas: 10000000
    });
    if (result[1].length < 100) {
        // Done for searching
        fs.appendFileSync("result_searchBlock.txt", "Get result amount: " + result[1].length);
        fs.appendFileSync("Cost time: " + console.timeEnd('test') + "\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}