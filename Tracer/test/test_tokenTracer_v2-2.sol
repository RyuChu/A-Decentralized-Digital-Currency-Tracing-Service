pragma solidity >= 0.5.0 < 0.6.0;

contract tokenTracer {
    uint[] blockNumber;
    
    // 取得已儲存之交易筆數
    uint public transactionCount;
    
    uint public _block = 1;
    
    function savingTx() public {
        for (uint i = 0; i < 100; i ++) {
            for (uint j = 0; j < 10; j++) {
                blockNumber.push(_block);
            }
            _block++;
        }
        
        transactionCount = blockNumber.length;
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, uint checkPoint) public view returns(uint _checkPoint, uint[] memory _blockNumber) {
        uint size;
        uint[] memory index = new uint[](blockNumber.length);
        for (uint i = checkPoint; i < blockNumber.length && i < _checkPoint + 100; i++) {
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

        _blockNumber = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _blockNumber[i] = blockNumber[index[i]];
        } 
    }
}