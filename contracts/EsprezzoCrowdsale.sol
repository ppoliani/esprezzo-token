pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import './EsprezzoToken.sol';

contract EsprezzoCrowdsale is RefundableCrowdsale, MintedCrowdsale, CappedCrowdsale {
  using SafeMath for uint256;

  // ICO Stage
  // ============
  enum CrowdsaleStage { PreICO, ICO }
  CrowdsaleStage public stage = CrowdsaleStage.PreICO; // By default it's Pre Sale
  // =============

  // Token Distribution
  // =============================
  uint256 public maxTokens = 100000000000000000000; 
  uint256 public tokensForEcosystem = 20000000000000000000;
  uint256 public tokensForTeam = 10000000000000000000;
  uint256 public tokensForBounty = 10000000000000000000;
  uint256 public totalTokensForSale = 60000000000000000000; 
  uint256 public totalTokensForSaleDuringPreICO = 20000000000000000000;
  // ==============================

  // Amount raised in PreICO
  // ==================
  uint256 public totalWeiRaisedDuringPreICO;
  // ===================

  // Events
  event EthTransferred(string text);
  event EthRefunded(string text);


  // Constructor
  // ============
  function EsprezzoCrowdsale(
    uint256 _startTime, 
    uint256 _endTime, 
    uint256 _rate, 
    address _wallet, 
    uint256 _goal, 
    uint256 _cap
  ) public
    CappedCrowdsale(_cap) 
    TimedCrowdsale(_startTime, _endTime) 
    RefundableCrowdsale(_goal) 
    Crowdsale(_rate, _wallet, createTokenContract()) {
      require(_goal <= _cap);
  }
  // =============

  // Token Deployment
  // =================
  function createTokenContract() internal returns (MintableToken) {
    return new EsprezzoToken(); // Deploys the ERC20 token. Automatically called when crowdsale contract is deployed
  }
  // ==================

  // Crowdsale Stage Management
  // =========================================================

  // Change Crowdsale Stage. Available Options: PreICO, ICO
  function setCrowdsaleStage(uint256 value) public onlyOwner {
      CrowdsaleStage _stage;

      if (uint256(CrowdsaleStage.PreICO) == value) {
        _stage = CrowdsaleStage.PreICO;
      } else if (uint256(CrowdsaleStage.ICO) == value) {
        _stage = CrowdsaleStage.ICO;
      }

      stage = _stage;

      if (stage == CrowdsaleStage.PreICO) {
        setCurrentRate(5);
      } else if (stage == CrowdsaleStage.ICO) {
        setCurrentRate(2);
      }
  }

  // Change the current rate
  function setCurrentRate(uint256 _rate) private {
      rate = _rate;
  }

  // ================ Stage Management Over =====================

  function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
    if ((stage == CrowdsaleStage.PreICO) && (token.totalSupply().add(_tokenAmount) > totalTokensForSaleDuringPreICO)) {
      msg.sender.transfer(msg.value); // Refund them
      EthRefunded("PreICO Limit Hit");
      return;
    }

    super._processPurchase(_beneficiary, _tokenAmount);
  }

  function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {
      if (stage == CrowdsaleStage.PreICO) {
        totalWeiRaisedDuringPreICO = totalWeiRaisedDuringPreICO.add(_weiAmount);
      }
  }

  function _forwardFunds() internal {
      if (stage == CrowdsaleStage.PreICO) {
          wallet.transfer(msg.value);
          EthTransferred("forwarding funds to wallet");
      } else if (stage == CrowdsaleStage.ICO) {
          EthTransferred("forwarding funds to refundable vault");
          super._forwardFunds();
      }
  }
  
  // ===========================

  // Finish: Mint Extra Tokens as needed before finalizing the Crowdsale.
  // ====================================================================

  function finish(address _teamFund, address _ecosystemFund, address _bountyFund) public onlyOwner {
      require(!isFinalized);
      uint256 alreadyMinted = token.totalSupply();
      require(alreadyMinted < maxTokens);

      uint256 unsoldTokens = totalTokensForSale - alreadyMinted;
      if (unsoldTokens > 0) {
        tokensForEcosystem = tokensForEcosystem + unsoldTokens;
      }

      MintableToken mintableToken = MintableToken(token);
      mintableToken.mint(_teamFund,tokensForTeam);
      mintableToken.mint(_ecosystemFund,tokensForEcosystem);
      mintableToken.mint(_bountyFund,tokensForBounty);
      finalize();
  }
  
  // ===============================

  // REMOVE THIS FUNCTION ONCE YOU ARE READY FOR PRODUCTION
  // USEFUL FOR TESTING `finish()` FUNCTION
  function hasEnded() public view returns (bool) {
    return true;
  }
}
