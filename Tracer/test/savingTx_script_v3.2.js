const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v3.2.json');
let contractAddress = "0xFF6173dBF6A28e9e69698e53bBa134382474548C";
let account = "0x6DCD2Fa2271168ED534f4f008D6cc521dbea75C6";

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