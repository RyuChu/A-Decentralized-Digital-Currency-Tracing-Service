const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v3-2.json');
let contractAddress = "0x1d578EC1dFB38A01707bB04579281aAA6B5fCe8e";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

// var block = 10;
var block = Number(process.argv[2]);

var checkPoint = 0;

searchBlock();

async function searchBlock() {
    var hrstart = process.hrtime();

    let contract = new web3.eth.Contract(tracerContract.abi, contractAddress);
    var result = await contract.methods.token_queryBlock(block, block, checkPoint).call();
    if (result[1][0] == block) {
        // Done for searching
        var hrend = process.hrtime(hrstart);

        console.log("search block: " + block);
        console.log("checkPoint: " + result[0]);
        console.log("Cost Time: " + hrend[1] / 1000000 + "ms");

        fs.appendFileSync("result_searchBlock_v3.txt", "Search block: " + block + "\n");
        fs.appendFileSync("result_searchBlock_v3.txt", "checkPoint: " + result[0] + "\n");
        fs.appendFileSync("result_searchBlock_v3.txt", "Get result amount: " + result[1].length + "\n");
        fs.appendFileSync("result_searchBlock_v3.txt", "Cost time: " + hrend[1] / 1000000 + "ms" + "\n\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}