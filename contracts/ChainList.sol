pragma solidity ^0.4.11;

contract ChainList {
  // Create new article struct to store custom types
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // Initialize variables
  mapping(uint => Article) public articles;
  uint articleCounter;

  // Declare events
  event sellArticleEvent(uint indexed _id, address indexed _seller, string _name, uint256 _price);
  event buyArticleEvent(uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);

  // Sell an article
  function sellArticle(string _name, string _description, uint256 _price)
  public {
    articleCounter++;

    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
      );

    sellArticleEvent(articleCounter, msg.sender, _name, _price);
  }

  // Fetches the number of articles in the contract
  function getNumberOfArticles() public constant returns (uint) {
    return articleCounter;
  }

  // Fetches and returns all article ids that are on sale
  function getArticlesForSale() public constant returns (uint[]) {
    // Check if there is at least one article
    if (articleCounter == 0) {
      return new uint[](0);
    }

    // Prepare output arrays
    // NOTE: uint[] is stored in memory which is less expensive than storing it into storage
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;

    // Loop through articles
    for (uint i = 1; i <= articleCounter; i++) {
      // Keep only the ID for the article not already sold
      if (articles[i].buyer == 0x0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // Copy articleIds array into smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }

    return (forSale);
  }

  // Buy an article
  function buyArticle(uint _id) payable public {
    // Check if there's at least one article
    require(articleCounter > 0);

    // Check if article exists
    require(_id > 0 && _id <= articleCounter);

    // retreive the article
    Article storage article = articles[_id];

    // Check if article has not already been sold
    require(article.buyer == 0x0);

    // Don't allow seller to buy own article
    require(article.seller != msg.sender);

    // Check if value sent corresponds to the article price
    require(article.price == msg.value);

    // Keep buyer's information
    article.buyer = msg.sender;

    // Buyer can buy the article
    article.seller.transfer(msg.value);

    // Trigger event
    buyArticleEvent(_id, article.seller, article.buyer, article.name, article.price);
  }
}
