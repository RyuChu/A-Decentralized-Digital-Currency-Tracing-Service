const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v3-2.json');
let contractAddress = "0xb7dC3C8cB813e5D52692aAf5a2e6DD9c94fd7A64";
let account = "0x369a5Cfbc1DfDE0FC7c82E4C6d24E459844494C9";

main();

var count = 0;

async function main() {
    setInterval(async function() {
        if (count < 100) {
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