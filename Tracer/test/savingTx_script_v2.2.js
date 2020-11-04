const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v2.2.json');
let contractAddress = "0x38B8515eAd0543b284FC6509385b9cC7732B4Da4";
let account = "0x8070456002771f7977e7869e0Bc5d9a97dB52A73";

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