pragma solidity >= 0.5.0 < 0.6.0;
import "./Arrays.sol";

contract tokenTracer {
    uint[] blockNumber;
    
    // 取得已儲存之交易筆數
    uint public blockCount;

    uint public _block = 1;
    
    function savingTx() public {
        for (uint i = 0; i < 100; i ++) {
            for (uint j = 0; j < 10; j++) {
                blockNumber.push(_block);
            }
            _block++;
        }
        
        blockCount = blockNumber.length;
    }
    
    function token_queryBlock(uint startBlock, uint endBlock, uint checkPoint) public view returns(uint _checkPoint, uint[] memory _blockNumber) {
        uint size;
        uint[] memory matchIndex = new uint[](blockCount);
        if (checkPoint == 0) {
            checkPoint = Arrays.findUpperBound(blockNumber, startBlock);
        }
        
        for (uint i = checkPoint; i < blockCount && i < checkPoint + 100; i++) {
            _checkPoint = i;
            
            if (endBlock >= blockNumber[i]) {
                matchIndex[size] = i;
                size++;
            } else {
                break;
            }
        }

        _blockNumber = new uint[](size);
        for (uint i = 0; i < size; i++) {
            _blockNumber[i] = blockNumber[matchIndex[i]];
        } 
    }
}