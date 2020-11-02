const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const tracerContract = require('../contract/tokenTracer.json');
let contractAddress = "0xa91fD7F63BdC89A10af6bCb7b90696592935663a";
let account = "0xa643EB1E9080DEe4cCD10988E90960D4C58c2dCA";

var _txn = ['0x69a0ecd9bf4a5ac4c37cb4628da7e69e352b39a7a98869e522f488c282e4d35e',
            '0xa290eeb10d63dc8ce310d8a172716de87022d66c05a88e0cf00b92aaf88cc2f8',
            '0xe4575278a35214887f157c02d26402e62cdafafdee2ce59d9dabcdc46977c747'];
var _from = ['0x8d738b3ddf8425e155f52caaaedc65ab28234f31',
            '0x46f3e6976007731788572ce90f8589e9e46bdff8',
            '0x9bea6ce8145ac1a16b21b3bbdf5cb97f02b1c5ee'];
var _to = ['0x3d5d22f567c31bcd76c603d075c85be7240e46c3',
            '0x2130e69be82c9df7073b7e28ae128420d8af490e',
            '0x0785aea8aec642e9712273d1420000c4173cd516'];
var block = 4000000;
var time = 1499644800;

main();

async function main() {
    setInterval(async function() {
        var _txns = new Array(50);
        var _froms = new Array(50);
        var _tos = new Array(50);
        var _blocks = new Array(50);
        var _times = new Array(50);
        for (var i = 0; i < 50; i++) {
            _txns.push(_txn[i / 3]);
            _froms.push(_from[i / 3]);
            _tos.push(_to[i / 3]);
            _blocks.push(block + 5);
            _times.push(time + 100);

            block += 5;
            time += 100;
        }

        let contract = new web3.eth.Contract(tracerContract.abi);
        contract.options.address = tracer;
        tr.methods.savingTx(_txns, _froms, _tos, 20, _blocks, _times).send({
            from: account
        }).on('receipt', async function(receipt) {
            console.log(receipt);
        }).on('error', function(error) {
            console.log(error);
        })
    }, 8000)
}