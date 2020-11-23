const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const ctContract = require('../contract/tracerCT.json');
const tracerContract = require('../contract/tokenTracer.json');
const ctAddress = "0xE268a4edB30ebef756d73092b08d7A1ef4240Dac";
const nowAccount = "0x6744369E8Ea362287807c355Ab3ab7d0440049A5";
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
        tokenAddress: req.body.tokenAddress,
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
    var result = await tr.methods.token_query(req.body.checkPoint).call({
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
router.post('/searchDate', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result;
    if (req.body.searchType == '0') {
        result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    } else if (req.body.searchType == '1') {
        result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint).call({
            from: nowAccount
        });
    } else if (req.body.searchType == '2') {
        result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    } else {
        result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, nowAccount, nowAccount, req.body.checkPoint).call({
            from: nowAccount
        });
    }
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
router.post('/searchHeight', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.tokenAddress)).call({
        from: nowAccount
    });

    let tr = new web3.eth.Contract(tracerContract.abi);
    tr.options.address = web3.utils.toChecksumAddress(req.body.tracerAddress);
    var result;
    if (req.body.searchType == '0') {
        result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    } else if (req.body.searchType == '1') {
        result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint).call({
            from: nowAccount
        });
    } else if (req.body.searchType == '2') {
        result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    } else {
        result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, nowAccount, nowAccount, req.body.checkPoint).call({
            from: nowAccount
        });
    }
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
    var result;
    if (req.body.searchType == '0') {
        result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    } else if (req.body.searchType == '1') {
        result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint).call({
            from: nowAccount
        });
    } else {
        result = await tr.methods.token_queryAccount(nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
            from: nowAccount
        });
    }
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
router.post('/searchAllToken', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    let tokens = await ct.methods.getTokenContract().call({
        from: nowAccount
    });
    var _checkPoint = [];
    var _totalResult = [];
    for (var i = 0; i < tokens.length; i++) {
        let tokenName = await ct.methods.tokenName(web3.utils.toChecksumAddress(tokens[i])).call({
            from: nowAccount
        });
        let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(tokens[i])).call({
            from: nowAccount
        });

        let tracer = await ct.methods.tokenTracers(web3.utils.toChecksumAddress(tokens[i])).call({
            from: nowAccount
        });

        let tr = new web3.eth.Contract(tracerContract.abi);
        tr.options.address = web3.utils.toChecksumAddress(web3.utils.toChecksumAddress(tracer));
        var result = await tr.methods.token_query(req.body.checkPoint[i]).call({
            from: nowAccount
        });
        _checkPoint.push(result[0]);
        for (var j = 0; j < result[1].length; j++) {
            var r = new Array();
            r[0] = result[5][j]; // block
            r[1] = result[1][j]; // Txn
            r[2] = result[2][j]; // from
            r[3] = result[3][j]; // to
            r[4] = result[4][j]; // quantity
            r[5] = result[6][j]; // timestamp
            r[6] = decimal;
            r[7] = tokenName;
            _totalResult.push(r);
        }
    }

    _totalResult = _totalResult.sort(function(x, y) {
        if (x[0] === y[0]) {
            return 0;
        } else {
            return (x[0] < y[0]) ? -1 : 1;
        }
    });

    res.send({
        checkPoint: _checkPoint,
        totalResult: _totalResult
    });
});
router.post('/searchToken', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    var _checkPoint = [];
    var _totalResult = [];
    for (var i = 0; i < req.body.regTokens.length; i++) {
        let tokenName = await ct.methods.tokenName(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });
        let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tracer = await ct.methods.tokenTracers(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tr = new web3.eth.Contract(tracerContract.abi);
        tr.options.address = web3.utils.toChecksumAddress(web3.utils.toChecksumAddress(tracer));
        var result = await tr.methods.token_query(req.body.checkPoint[i]).call({
            from: nowAccount
        });
        _checkPoint.push(result[0]);
        for (var j = 0; j < result[1].length; j++) {
            var r = new Array();
            r[0] = result[5][j]; // block
            r[1] = result[1][j]; // Txn
            r[2] = result[2][j]; // from
            r[3] = result[3][j]; // to
            r[4] = result[4][j]; // quantity
            r[5] = result[6][j]; // timestamp
            r[6] = decimal;
            r[7] = tokenName;
            _totalResult.push(r);
        }
    }

    _totalResult = _totalResult.sort(function(x, y) {
        if (x[0] === y[0]) {
            return 0;
        } else {
            return (x[0] < y[0]) ? -1 : 1;
        }
    });

    res.send({
        checkPoint: _checkPoint,
        totalResult: _totalResult
    });
});
router.post('/searchTokenDate', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    var _checkPoint = [];
    var _totalResult = [];
    for (var i = 0; i < req.body.regTokens.length; i++) {
        let tokenName = await ct.methods.tokenName(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });
        let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tracer = await ct.methods.tokenTracers(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tr = new web3.eth.Contract(tracerContract.abi);
        tr.options.address = web3.utils.toChecksumAddress(web3.utils.toChecksumAddress(tracer));
        var result;
        if (req.body.searchType == '0') {
            result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint[i]).call({
                from: nowAccount
            });
        } else if (req.body.searchType == '1') {
            result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint[i]).call({
                from: nowAccount
            });
        } else if (req.body.searchType == '2') {
            result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint[i]).call({
                from: nowAccount
            });
        } else {
            result = await tr.methods.token_queryTime(req.body.fromDate, req.body.toDate, nowAccount, nowAccount, req.body.checkPoint[i]).call({
                from: nowAccount
            });
        }
        _checkPoint.push(result[0]);
        for (var j = 0; j < result[1].length; j++) {
            var r = new Array();
            r[0] = result[5][j]; // block
            r[1] = result[1][j]; // Txn
            r[2] = result[2][j]; // from
            r[3] = result[3][j]; // to
            r[4] = result[4][j]; // quantity
            r[5] = result[6][j]; // timestamp
            r[6] = decimal;
            r[7] = tokenName;
            _totalResult.push(r);
        }
    }

    _totalResult = _totalResult.sort(function(x, y) {
        if (x[0] === y[0]) {
            return 0;
        } else {
            return (x[0] < y[0]) ? -1 : 1;
        }
    });

    res.send({
        checkPoint: _checkPoint,
        totalResult: _totalResult
    });
});
router.post('/searchTokenHeight', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    var _checkPoint = [];
    var _totalResult = [];
    for (var i = 0; i < req.body.regTokens.length; i++) {
        let tokenName = await ct.methods.tokenName(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });
        let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tracer = await ct.methods.tokenTracers(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tr = new web3.eth.Contract(tracerContract.abi);
        tr.options.address = web3.utils.toChecksumAddress(web3.utils.toChecksumAddress(tracer));
        var result;
        if (req.body.searchType == '0') {
            result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
                from: nowAccount
            });
        } else if (req.body.searchType == '1') {
            result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint).call({
                from: nowAccount
            });
        } else if (req.body.searchType == '2') {
            result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
                from: nowAccount
            });
        } else {
            result = await tr.methods.token_queryBlock(req.body.fromBlock, req.body.toBlock, nowAccount, nowAccount, req.body.checkPoint).call({
                from: nowAccount
            });
        }
        _checkPoint.push(result[0]);
        for (var j = 0; j < result[1].length; j++) {
            var r = new Array();
            r[0] = result[5][j]; // block
            r[1] = result[1][j]; // Txn
            r[2] = result[2][j]; // from
            r[3] = result[3][j]; // to
            r[4] = result[4][j]; // quantity
            r[5] = result[6][j]; // timestamp
            r[6] = decimal;
            r[7] = tokenName;
            _totalResult.push(r);
        }
    }

    _totalResult = _totalResult.sort(function(x, y) {
        if (x[0] === y[0]) {
            return 0;
        } else {
            return (x[0] < y[0]) ? -1 : 1;
        }
    });

    res.send({
        checkPoint: _checkPoint,
        totalResult: _totalResult
    });
});
router.post('/searchTokenAccount', async function(req, res, next) {
    let ct = new web3.eth.Contract(ctContract.abi);
    ct.options.address = ctAddress;
    var _checkPoint = [];
    var _totalResult = [];
    for (var i = 0; i < req.body.regTokens.length; i++) {
        let tokenName = await ct.methods.tokenName(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });
        let decimal = await ct.methods.tokenDecimal(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tracer = await ct.methods.tokenTracers(web3.utils.toChecksumAddress(req.body.regTokens[i])).call({
            from: nowAccount
        });

        let tr = new web3.eth.Contract(tracerContract.abi);
        tr.options.address = web3.utils.toChecksumAddress(web3.utils.toChecksumAddress(tracer));
        var result;
        if (req.body.searchType == '0') {
            result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.from), web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
                from: nowAccount
            });
        } else if (req.body.searchType == '1') {
            result = await tr.methods.token_queryAccount(web3.utils.toChecksumAddress(req.body.from), nowAccount, req.body.checkPoint).call({
                from: nowAccount
            });
        } else {
            result = await tr.methods.token_queryAccount(nowAccount, web3.utils.toChecksumAddress(req.body.to), req.body.checkPoint).call({
                from: nowAccount
            });
        }
        _checkPoint.push(result[0]);
        for (var j = 0; j < result[1].length; j++) {
            var r = new Array();
            r[0] = result[5][j]; // block
            r[1] = result[1][j]; // Txn
            r[2] = result[2][j]; // from
            r[3] = result[3][j]; // to
            r[4] = result[4][j]; // quantity
            r[5] = result[6][j]; // timestamp
            r[6] = decimal;
            r[7] = tokenName;
            _totalResult.push(r);
        }
    }

    _totalResult = _totalResult.sort(function(x, y) {
        if (x[0] === y[0]) {
            return 0;
        } else {
            return (x[0] < y[0]) ? -1 : 1;
        }
    });

    res.send({
        checkPoint: _checkPoint,
        totalResult: _totalResult
    });
});
module.exports = router;