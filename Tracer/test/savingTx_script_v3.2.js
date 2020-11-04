const Web3 = require('web3');
const web3 = new Web3('http://54.188.34.51:8545');
const tracerContract = require('./v3.2.json');
let contractAddress = "0xbD502f5b1A31b1338BdfD858A7dd86E4950874b2";
let account = "0x7254F5a608aB44EE587Cd095223602cA35Bf2A2d";

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