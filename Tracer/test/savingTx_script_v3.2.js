const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v3.2.json');
let contractAddress = "0x715CdCE9fD261D19454a26F20CFb52A467749bC2";
let account = "0xF7359b1c9a0a94DEb6b3aA28E882D1C411dc9f7d";

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