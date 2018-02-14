pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract EsprezzoToken is MintableToken {
  string public name = "Esprezzo Token";
  string public symbol = "EZP";
  uint8 public decimals = 18;
}
