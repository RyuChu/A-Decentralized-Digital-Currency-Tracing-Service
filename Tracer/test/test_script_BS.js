const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./test_tokenTracer.json');
let contractAddress = "0xb4CBd6D121684b50F6882abC8d572fb628190e4B";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

// var block = 10;
var block = Number(process.argv[2]);

var checkPoint = 0;

var hrstart = process.hrtime();
searchBlock();

async function searchBlock() {
    let contract = new web3.eth.Contract(tracerContract.abi, contractAddress);
    var result = await contract.methods.token_queryBlock_BS(block, block, checkPoint).call();
    if (result[1][0] == block) {
        // Done for searching
        var hrend = process.hrtime(hrstart);

        console.log("search block: " + block);
        console.log("checkPoint: " + result[0]);
        console.log("Cost Time: " + hrend[1] / 1000000 + "ms");

        fs.appendFileSync("result_searchBlock_BS.txt", "Search block: " + block + "\n");
        fs.appendFileSync("result_searchBlock_BS.txt", "checkPoint: " + result[0] + "\n");
        fs.appendFileSync("result_searchBlock_BS.txt", "Get result amount: " + result[1].length + "\n");
        fs.appendFileSync("result_searchBlock_BS.txt", "Cost time: " + (hrend[0] * 1e9 + hrend[1]) / 1000000 + "ms" + "\n\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}