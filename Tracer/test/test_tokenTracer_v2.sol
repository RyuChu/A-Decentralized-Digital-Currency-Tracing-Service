pragma solidity >= 0.5.0 < 0.6.0;

contract tokenTracer {
    bytes32[] transactionHash;
    address[] sender;
    address[] receiver;
    uint[] value;
    uint[] blockNumber;
    uint[] timeStamp;
    
    // 取得已儲存之交易筆數
    uint public transactionCount;
    
    mapping(bytes32 => bool) private isExist;
    
    function savingTx(bytes32 _transactionHash, address _sender, address _receiver, uint _value, uint _blockNumber, uint _timestamp) public {
        transactionHash.push(_transactionHash);
        sender.push(_sender);
        receiver.push(_receiver);
        value.push(_value);
        blockNumber.push(_blockNumber);
        timeStamp.push(_timestamp);
        
        transactionCount = transactionHash.length;
    }
    
    // 取得查詢交儲存之交易結果 (100 txns)
    function token_query(uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint count = 100;
        if (checkPoint + 100 > transactionCount) {
            count = transactionCount - checkPoint;
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
    }
    
    function token_queryAccount(address _address, uint searchType, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < checkPoint + 100; i++) {
            if (searchType == 0) {
                if (sender[i] == _address) {
                    index[size] = i;
                    size++;
                }
            } else {
                if (receiver[i] == _address) {
                    index[size] = i;
                    size++;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }
    }
    
    function token_queryAccount(address _from, address _to) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = _checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (sender[i] == _from && receiver[i] == _to) {
                index[size] = i;
                size++;
            }
            _checkPoint = i + 1;
        }
            
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }    
    }
    
    function token_queryTime(uint startTime, uint endTime, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    index[size] = i;
                    size++;
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }  
    }
    
    function token_queryTime(uint startTime, uint endTime, address account, uint searchType, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    if (searchType == 0 && account == sender[i]) {
                        index[size] = i;
                        size++;
                    } else if (searchType == 1 && account == receiver[i]) {
                        index[size] = i;
                        size++;
                    }
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }     
    }
    
    function token_queryTime(uint startTime, uint endTime, address s, address r, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startTime <= timeStamp[i]) {
                if (endTime >= timeStamp[i]) {
                    if (s == sender[i] && r == receiver[i]) {
                        index[size] = i;
                        size++;
                    }
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
            
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }     
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    index[size] = i;
                    size++;
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        } 
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, address account, uint searchType, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    if (searchType == 0 && account == sender[i]) {
                        index[size] = i;
                        size++;
                    } else if (searchType == 1 && account == receiver[i]) {
                        index[size] = i;
                        size++;
                    }
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }     
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, address s, address r, uint checkPoint) public view returns(uint _checkPoint, bytes32[] memory _transactionHash, address[] memory _sender, address[] memory _receiver, uint[] memory _value, uint[] memory _blockNumber, uint[] memory _timestamp) {
        uint size;
        uint[] memory index = new uint[](transactionHash.length);
        for (uint i = checkPoint; i < transactionHash.length && i < _checkPoint + 100; i++) {
            if (startBlock <= blockNumber[i]) {
                if (endBlock >= blockNumber[i]) {
                    if (s == sender[i] && r == receiver[i]) {
                        index[size] = i;
                        size++;
                    }
                } else {
                    break;
                }
            }
            _checkPoint = i + 1;
        }
        
        _transactionHash = new bytes32[](size);
        _sender = new address[](size);
        _receiver = new address[](size);
        _value = new uint[](size);
        _blockNumber = new uint[](size);
        _timestamp = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _transactionHash[i] = transactionHash[index[i]];
            _sender[i] = sender[index[i]];
            _receiver[i] = receiver[index[i]];
            _value[i] = value[index[i]];
            _blockNumber[i] = blockNumber[index[i]];
            _timestamp[i] = timeStamp[index[i]];
        }     
    }
}