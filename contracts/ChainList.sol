pragma solidity ^0.4.11;

contract ChainList {
  // State variables
  address seller;
  address buyer;
  string name;
  string description;
  uint256 price;

  // Declare events
  event sellArticleEvent(address indexed _seller, string _name, uint256 _price);
  event buyArticleEvent(address indexed _seller, address indexed _buyer, string _name, uint256 _price);

  // Sell an article
  function sellArticle(string _name, string _description, uint256 _price)
  public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;
    sellArticleEvent(seller, name, price);
  }

  // Get the article
  function getArticle() public constant returns (
    address _seller,
    address _buyer,
    string _name,
    string _description,
    uint256 _price) {
      return(seller, buyer, name, description, price);
  }

  // Buy an article
  function buyArticle() payable public {
    // Check if article is up for sellArticle
    require(seller != 0x0);

    // Check if article wasn't already solid
    require(buyer == 0x0);

    // Do not allow seller to buy its own article
    require(msg.sender != seller);

    // Check if value sent corresponds to article price
    require(msg.value == price);

    // Keep buyer's information
    buyer = msg.sender;

    // Buyer can now buy article
    seller.transfer(msg.value);

    // Trigger buyArticleEvent
    buyArticleEvent(seller, buyer, name, price);
  }
}
