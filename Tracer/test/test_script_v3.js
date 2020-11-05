const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v3-2.json');
let contractAddress = "0xb7dC3C8cB813e5D52692aAf5a2e6DD9c94fd7A64";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

var block = 10;

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

        fs.appendFileSync("result_searchBlock.txt", "Search block: " + block + "\n");
        fs.appendFileSync("result_searchBlock.txt", "checkPoint: " + result[0] + "\n");
        fs.appendFileSync("result_searchBlock.txt", "Get result amount: " + result[1].length + "\n");
        fs.appendFileSync("result_searchBlock.txt", "Cost time: " + hrend[1] / 1000000 + "ms" + "\n\n");
    } else {
        checkPoint = result[0];
        searchBlock();
    }
}