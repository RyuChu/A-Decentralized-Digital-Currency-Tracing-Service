const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./test_tokenTracer.json');
let contractAddress = "0xd8F384692E24b823023124632dcadcf626Cb7aF8";
let account = "0x088C4fcc372111E0513046ee9645c2Bfe99F8160";

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