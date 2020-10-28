const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const ctContract = require('../contract/tracerCT.json');
const tracerContract = require('../contract/tokenTracer.json');
let ctAddress = "0xE6c68dE96680A0C94cd7F3241aE3c5A32abf0565";
let relayer = "0x1ce067aC2E0D4702cC183e85963f11358Cbb2768";
main();
async function main() {
    setInterval(async function() {
        let ct = new web3.eth.Contract(ctContract.abi);
        ct.options.address = ctAddress;
        let token = await ct.methods.getTokenContract().call({
            from: relayer
        });
        for (var i = 0; i < token.length; i++) {
            let tracer = await ct.methods.tokenTracers(token[i]).call({ from: relayer });
            let tr = new web3.eth.Contract(tracerContract.abi);
            tr.options.address = tracer;
            let oraclizeIsRunning = await tr.methods.oraclizeIsRunning().call({ from: relayer });
            if (!oraclizeIsRunning) {
                tr.methods.traceTx().send({
                    from: relayer,
                    value: web3.utils.toWei("1", "ether")
                }).on('receipt', async function(receipt) {
                    console.log('Trace token transaction history - Tracer: ' + tracer);
                }).on('error', function(error) {
                    console.log(error);
                })
            }
        }
    }, 8000)
}