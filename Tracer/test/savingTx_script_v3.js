const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('./v3.json');
let contractAddress = "0xfE1A24b1B19C728F919D05074bcD2DD3be002f3d";
let account = "0x7254F5a608aB44EE587Cd095223602cA35Bf2A2d";

var _txn = '0x69a0ecd9bf4a5ac4c37cb4628da7e69e352b39a7a98869e522f488c282e4d35e';
var _from = '0x8d738b3ddf8425e155f52caaaedc65ab28234f31';
var _to = '0x3d5d22f567c31bcd76c603d075c85be7240e46c3';
var _block = 4000000;
var _time = 1499644800;

main();

async function main() {
    setInterval(async function() {
        let contract = new web3.eth.Contract(tracerContract.abi);
        contract.options.address = contractAddress;
        contract.methods.savingTx(_txn, _from, _to, 20, _block, _time).send({
            from: account
        }).on('receipt', async function(receipt) {
            console.log(receipt);
        }).on('error', function(error) {
            console.log(error);
        })
        _block += 5;
        _time += 100;
    }, 1500)
}