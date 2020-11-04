const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v2.2.json');
let contractAddress = "0xfeE4Df73E4abE04b18aaB581FF2Fe6634191da65";
let account = "0x2A9E697b4cf365C1Be4C00804Ad653bb4FA88C4E";

main();

var count = 0;

async function main() {
    setInterval(async function() {
        if (count < 500) {
            let contract = new web3.eth.Contract(tracerContract.abi);
            contract.options.address = contractAddress;
            contract.methods.savingTx().send({
                from: account,
                gas: 1000000000
            }).on('receipt', async function(receipt) {
                console.log(receipt);
            }).on('error', function(error) {
                console.log(error);
            })
            count++;
        }
    }, 3000)
}