pragma solidity >= 0.5.0 < 0.6.0;
import "./provableAPI_0.5.sol";
import "./JsmnSolLib.sol";
import "./Parser.sol";

contract tracerCT {
    address admin;

    constructor() public {
        admin = msg.sender;
    }

    address[] tokenContracts;
    mapping(address => tokenTracer) public tokenTracers;
    mapping(address => string) public tokenName;
    mapping(address => uint) public tokenDecimal;
    
    // 註冊欲追蹤之token合約
    function regTracer(address tokenContract, string memory _tokenName, uint _tokenDecimal) public {
        // 避免重複註冊相同的token合約
        require(tokenTracers[tokenContract] == tokenTracer(0), "Duplicate Registration");
        
        // 建立儲存之資料庫
        tokenTracer newTracer = new tokenTracer(tokenContract, address(this));
        tokenTracers[tokenContract] = newTracer;
        tokenName[tokenContract] = _tokenName;
        tokenDecimal[tokenContract] = _tokenDecimal;
        
        // 儲存欲追蹤的token合約地址
        tokenContracts.push(tokenContract);
    }
    
    function getTokenContract() public view returns (address[] memory) {
        return tokenContracts;
    }
    
    function getTokenInfo(address _tokenContract) public view returns (string memory, uint) {
        return (tokenName[_tokenContract], tokenDecimal[_tokenContract]);
    }
    
    function alterTokenInfo(address _tokenContract, string memory _tokenName, uint _tokenDecimal) public {
        tokenName[_tokenContract] = _tokenName;
        tokenDecimal[_tokenContract] = _tokenDecimal;
    }
}

contract tokenTracer is usingProvable {
    address public tokenContract;
    address public CT;
    uint public syncBlockHeight;
    uint private syncIndex;
    bool public oraclizeIsRunning;
    
    constructor(address _tokenContract, address _CT) public {
        tokenContract = _tokenContract;
        CT = _CT;
    }
    
    event LogNewOraclizeQuery(string description);
    
    // oraclize results
    function __callback(bytes32 myid, string memory _result) public {
        if (msg.sender != provable_cbAddress()) revert();
        
        oraclizeIsRunning = false;
        // 檢查是否有回傳值
        if (bytes(_result).length != 0) {
            savingTx(_result);
        }
    }
    
    // call oraclize
    function traceTx() payable public {
        uint gasLimit = 50000000;
        oraclizeIsRunning = true;
            
        // 設定為每次Oraclize取得的交易筆數[:Count]
        string memory apiStr1 = "json(https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=";
        string memory apiStr2 = "&toBlock=latest";
        string memory apiStr3 = "&address=0x";
        string memory apiStr4 = "&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        string memory apiStr5 = "&apikey=HTI3IX924Z1IBXIIN4992VRAPKHJI149AX).result[";
        string memory apiStr6 = "][transactionHash, blockNumber, timeStamp, topics, data]";
        string memory apiUrl = string(abi.encodePacked(apiStr1, uint2str(syncBlockHeight), apiStr2, apiStr3, Parser.parseAddrressToString(tokenContract), apiStr4, apiStr5, uint2str(syncIndex), ":", uint2str(syncIndex + 50), apiStr6));
        provable_query("URL", apiUrl, gasLimit);
    }
    
    bytes32[] transactionHash;
    address[] sender;
    address[] receiver;
    uint[] value;
    uint[] blockNumber;
    uint[] timeStamp;
    
    // 取得已儲存之交易筆數
    uint public transactionCount;
    
    mapping(bytes32 => bool) private isExist;
    
    function savingTx(string memory json) internal {
        uint returnValue;
        JsmnSolLib.Token[] memory tokens;
        uint actualNum;

        // (returnValue, tokens, actualNum) = JsmnSolLib.parse(json, 9);
        (returnValue, tokens, actualNum) = JsmnSolLib.parse(json, 450);
        
        // 迴圈設定每次Oraclize取得之交易筆數
        for (uint i = 0; i < 50; i++) {
            JsmnSolLib.Token memory a = tokens[1 + 8*i];
            bytes32 _transactionHash = Parser.parseStringTo32Bytes(JsmnSolLib.getBytes(json, a.start, a.end));
            // 避免重複紀錄同一筆交易
            if (!isExist[_transactionHash] && _transactionHash != "") {
                isExist[_transactionHash] = true;
                transactionHash.push(_transactionHash);
                JsmnSolLib.Token memory b = tokens[2 + 8*i];
                uint _blockNumber = Parser.parseHexToUint256(JsmnSolLib.getBytes(json, b.start, b.end));
                blockNumber.push(_blockNumber);
                JsmnSolLib.Token memory c = tokens[3 + 8*i];
                timeStamp.push(Parser.parseHexToUint256(JsmnSolLib.getBytes(json, c.start, c.end)));
                JsmnSolLib.Token memory d = tokens[6 + 8*i];
                sender.push(parseAddr(Parser.subString(JsmnSolLib.getBytes(json, d.start, d.end), 26, 66)));
                JsmnSolLib.Token memory e = tokens[7 + 8*i];
                receiver.push(parseAddr(Parser.subString(JsmnSolLib.getBytes(json, e.start, e.end), 26, 66)));
                JsmnSolLib.Token memory f = tokens[8 + 8*i];
                value.push(Parser.parseHexToUint256(JsmnSolLib.getBytes(json, f.start, f.end)));
                
                // 更新下回開始搜尋之blockNumber, 需避免同一block有多筆交易
                syncBlockHeight = _blockNumber;
                syncIndex = 0;
            } else if (_transactionHash == "") {
                syncIndex = 0;
                break;
            }
        }
        if (transactionCount == transactionHash.length) {
            syncIndex += 50;
        }
        transactionCount = transactionHash.length;
    }
    
    // 取得查詢交儲存之交易結果 (100 txns)
    function token_query(uint checkPoint) public view returns(bool _done, uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint count = 100;
        if (checkPoint-1 + 100 > transactionCount) {
            count = transactionCount - (checkPoint - 1);
        }

        _transactionHash = new bytes32[](count);
        _sender = new address[](count);
        _receiver = new address[](count);
        _value = new uint[](count);
        _blockNumber = new uint[](count);
        _timestamp = new uint[](count);
        for (uint i = checkPoint; i < count; i++) {
            _transactionHash[i] = transactionHash[checkPoint - 1 + i];
            _sender[i] = sender[checkPoint - 1 + i];
            _receiver[i] = receiver[checkPoint - 1 + i];
            _value[i] = value[checkPoint - 1 + i];
            _blockNumber[i] = blockNumber[checkPoint - 1 + i];
            _timestamp[i] = timeStamp[checkPoint - 1 + i];
            
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            _done = true;
        else
            _done = false;
    }
    
    bytes32[] _txn;
    address[] _from;
    address[] _to;
    uint[] _amount;
    uint[] _block;
    uint[] _time;
    
    function token_queryAccount(address _address, uint searchType, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < checkPoint + 100; i++) {
            if (searchType == 0) {
                if (sender[i] == _address) {
                    _txn.push(transactionHash[i]);
                    _from.push(sender[i]);
                    _to.push(receiver[i]);
                    _amount.push(value[i]);
                    _block.push(blockNumber[i]);
                    _time.push(timeStamp[i]);
                }
            } else {
                if (receiver[i] == _address) {
                    _txn.push(transactionHash[i]);
                    _from.push(sender[i]);
                    _to.push(receiver[i]);
                    _amount.push(value[i]);
                    _block.push(blockNumber[i]);
                    _time.push(timeStamp[i]);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryAccount(address _sender, address _receiver) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = _checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (sender[i] == _sender && receiver[i] == _receiver) {
                _txn.push(transactionHash[i]);
                _from.push(sender[i]);
                _to.push(receiver[i]);
                _amount.push(value[i]);
                _block.push(blockNumber[i]);
                _time.push(timeStamp[i]);
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryTime(uint startTime, uint endTime, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    _txn.push(transactionHash[i]);
                    _from.push(sender[i]);
                    _to.push(receiver[i]);
                    _amount.push(value[i]);
                    _block.push(blockNumber[i]);
                    _time.push(timeStamp[i]);
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryTime(uint startTime, uint endTime, address account, uint searchType, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    if (searchType == 0 && account == sender[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    } else if (searchType == 1 && account == receiver[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    }
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryTime(uint startTime, uint endTime, address s, address r, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    if (s == sender[i] && r == receiver[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    }
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    _txn.push(transactionHash[i]);
                    _from.push(sender[i]);
                    _to.push(receiver[i]);
                    _amount.push(value[i]);
                    _block.push(blockNumber[i]);
                    _time.push(timeStamp[i]);
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, address account, uint searchType, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    if (searchType == 0 && account == sender[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    } else if (searchType == 1 && account == receiver[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    }
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, address s, address r, uint checkPoint) public returns(bool, uint _checkPoint, bytes32[] memory, address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory) {
        delete _txn;
        delete _from;
        delete _to;
        delete _amount;
        delete _block;
        delete _time;
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    if (s == sender[i] && r == receiver[i]) {
                        _txn.push(transactionHash[i]);
                        _from.push(sender[i]);
                        _to.push(receiver[i]);
                        _amount.push(value[i]);
                        _block.push(blockNumber[i]);
                        _time.push(timeStamp[i]);
                    }
                } else {
                    return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
                }
            }
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
}