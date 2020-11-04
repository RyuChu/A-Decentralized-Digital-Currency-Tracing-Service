const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v3.2.json');
let contractAddress = "0x8CC79327fF94821C0eFE5b8621516e97156a5e43";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

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