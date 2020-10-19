const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const ctContract = require('../contract/tracerCT.json');
const tracerContract = require('../contract/tokenTracer.json');
const ctAddress = "0x17b91A1a2B9ebbE2d7892A5dB34545BD56863E5c";
const nowAccount = "0x7196EbC2937234E4D4C0f0e988b31530452C7604";
/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('index')
});
//get accounts
router.get('/ct', function(req, res, next) {
    let address = ctAddress
    res.send(address)
});
//get reg tokens in ct
router.get('/getTokens', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let tokens = await ct.methods.getTokenContract().call({
        from: nowAccount
    });
    res.send(tokens)
});
//get token info
router.post('/getTokenInfo', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let tokenName = await ct.methods.tokenName(req.body.tokenAddress).call({
        from: nowAccount
    });
    let tokenDecimal = await ct.methods.tokenDecimal(req.body.tokenAddress).call({
        from: nowAccount
    });
    res.send({
        tokenName: tokenName,
        tokenDecimal: tokenDecimal
    });
});
//alter token info
router.post('/alterTokenInfo', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let tokenName = await ct.methods.alterTokenInfo(req.body.tokenAddress, req.body.tokenName, req.body.tokenDecimal).send({
        from: nowAccount,
        gas: 20000000
    }).on('receipt', async function(receipt) {
        res.send(receipt);
    }).on('error', function(error) {
        res.send(error.toString());
    })
});
//get tracer
router.post('/getTracer', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let tracer = await ct.methods.tokenTracers(req.body.tokenAddress).call({
        from: nowAccount
    });
    let tokenName = await ct.methods.tokenName(req.body.tokenAddress).call({
        from: nowAccount
    });
    let tokenDecimal = await ct.methods.tokenDecimal(req.body.tokenAddress).call({
        from: nowAccount
    });
    
    let tr = new web3.eth.Contract(tracerContract.abi)
    tr.options.address = tracer
    let syncBlock = await tr.methods.syncBlockHeight().call({
        from: nowAccount
    });
    let syncTxnCount = await tr.methods.transactionCount().call({
        from: nowAccount
    });
    let oraclizeStatus = await tr.methods.oraclizeIsRunning().call({
        from: nowAccount
    });
    res.send({
        tracer: tracer,
        tokenName: tokenName,
        tokenDecimal: tokenDecimal,
        syncBlock: syncBlock,
        syncTxnCount: syncTxnCount,
        oraclizeStatus: oraclizeStatus
    });
});
//registration
router.post('/regTracer', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    ct.methods.regTracer(web3.utils.toChecksumAddress(req.body.tokenAddress), req.body.tokenName, req.body.tokenDecimal).send({
        from: nowAccount,
        gas: 20000000
    }).on('receipt', async function(receipt) {
        let tracer = await ct.methods.tokenTracers(req.body.tokenAddress).call({
            from: nowAccount
        });
        res.send({
            receipt: receipt,
            tracer: tracer
        });
    }).on('error', function(error) {
        res.send(error.toString());
    })
});
router.post('/searchAll', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    let transactionCount = await tr.methods.transactionCount().call({
        from: nowAccount
    });
    let indexTo = 100;
    if ((transactionCount-req.body.indexFrom) < 100) {
        indexTo = transactionCount - req.body.indexFrom;
    }
    var result = await tr.methods.token_query(req.body.indexFrom, indexTo).call({
        from: nowAccount
    });

    res.send({
        txn: result[0],
        from: result[1],
        to: result[2],
        quantity: result[3],
        block: result[4],
        timeStamp: result[5],
        decimal: decimal
    });
});
router.post('/searchDateUser', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.account), req.body.searchType, req.body.checkPoint).call({
        from: nowAccount
    });
    res.send({
        checkPoint: result[0],
        txn: result[1],
        from: result[2],
        to: result[3],
        quantity: result[4],
        block: result[5],
        timeStamp: result[6],
        decimal: decimal
    });
});
router.post('/searchDateBoth', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to)).call({
        from: nowAccount
    });
    res.send({
        txn: result[0],
        from: result[1],
        to: result[2],
        quantity: result[3],
        block: result[4],
        timeStamp: result[5],
        decimal: decimal
    });
});
router.post('/searchDate', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, req.body.checkPoint).call({
        from: nowAccount
    });
    res.send({
        checkPoint: result[0],
        txn: result[1],
        from: result[2],
        to: result[3],
        quantity: result[4],
        block: result[5],
        timeStamp: result[6],
        decimal: decimal
    });
});
router.post('/searchHeightUser', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.account), req.body.searchType, req.body.checkPoint).call({
        from: nowAccount
    });
    res.send({
        checkPoint: result[0],
        txn: result[1],
        from: result[2],
        to: result[3],
        quantity: result[4],
        block: result[5],
        timeStamp: result[6],
        decimal: decimal
    });
});
router.post('/searchHeightBoth', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to)).call({
        from: nowAccount
    });
    res.send({
        txn: result[0],
        from: result[1],
        to: result[2],
        quantity: result[3],
        block: result[4],
        timeStamp: result[5],
        decimal: decimal
    });
});
router.post('/searchHeight', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, req.body.checkPoint).call({
        from: nowAccount
    });
    res.send({
        checkPoint: result[0],
        txn: result[1],
        from: result[2],
        to: result[3],
        quantity: result[4],
        block: result[5],
        timeStamp: result[6],
        decimal: decimal
    });
});
router.post('/searchAccount', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.account), req.body.searchType, req.body.checkPoint).call({
        from: nowAccount
    });
    res.send({
        checkPoint: result[0],
        txn: result[1],
        from: result[2],
        to: result[3],
        quantity: result[4],
        block: result[5],
        timeStamp: result[6],
        decimal: decimal
    });
});
router.post('/searchBoth', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to)).call({
        from: nowAccount
    });
    res.send({
        txn: result[0],
        from: result[1],
        to: result[2],
        quantity: result[3],
        block: result[4],
        timeStamp: result[5],
        decimal: decimal
    });
});
module.exports = router;
