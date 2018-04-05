pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract EsprezzoToken is MintableToken, DetailedERC20 {
  string public name = "Esprezzo Token";
  string public symbol = "EZP"; 
  uint8 public decimals = 18;

  function EsprezzoToken() public DetailedERC20(name, symbol, decimals) {
  }
}
