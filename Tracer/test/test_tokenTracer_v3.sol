pragma solidity >= 0.5.0 < 0.6.0;
import "./Arrays.sol";

contract tokenTracer {
    bytes32[] transactionHash;
    address[] sender;
    address[] receiver;
    uint[] value;
    uint[] blockNumber;
    uint[] timeStamp;
    
    // 取得已儲存之交易筆數
    uint public transactionCount;
    
    function savingTx(bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) public {
        for (uint i = 0; i < 50; i++) {
            transactionHash.push(_transactionHash[i]);
            sender.push(_sender[i]);
            receiver.push(_receiver[i]);
            value.push(_value[i]);
            blockNumber.push(_blockNumber[i]);
            timeStamp.push(_timestamp[i]);
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(timeStamp, startTime);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(timeStamp, startTime);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(timeStamp, startTime);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(blockNumber, startBlock);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(blockNumber, startBlock);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
        
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(blockNumber, startBlock);
        }
        
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
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
            _checkPoint = i + 1;
        }
        if (_checkPoint == transactionHash.length)
            return (true, _checkPoint, _txn, _from, _to, _amount, _block, _time);
        else
            return (false, _checkPoint, _txn, _from, _to, _amount, _block, _time);
    }
}