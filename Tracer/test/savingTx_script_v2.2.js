const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v2.2.json');
let contractAddress = "0x8741ccbdF1F302F8164Dc8C2B8DADe8a95405888";
let account = "0x3b4f086603b5a2e033784AE23f6d92e65F631bEC";

main();

async function main() {
    setInterval(async function() {
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
    }, 3000)
}