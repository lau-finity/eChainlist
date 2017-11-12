// Contract to be tested

var ChainList = artifacts.require("./ChainList.sol");

// Test suite
contract('ChainList', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;

  // Test case 1: no article is for sale
  it(
    "should thrown exception if you try to buy an article and it's not up for sale",
    function() {
      return ChainList.deployed().then(function(instance) {
        chainListInstance = instance;
        return chainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice, "ether")
        });
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('invalid opcode') >= 0,
          "error should be invalid opcode");
      }).then(function() {
        return chainListInstance.getArticle.call();
      }).then(function(data) {
        // make sure the contract state was not altered
        assert.equal(data[0], 0x0, "seller must be empty");
        assert.equal(data[1], 0x0, "buyer must be empty");
        assert.equal(data[2], '', "article name must be empty");
        assert.equal(data[3], '', "article description must be empty");
        assert.equal(data[4].toNumber(), 0, "article price must be 0");
      });
    });

  // Test case 2: cannot buy the same article you're selling
  it("should throw exception if you try to buy your own article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName,
        articleDescription,
        web3.toWei(articlePrice, "ether"), {
          from: seller
        });
    }).then(function(receipt) {
      return chainListInstance.buyArticle({
        from: seller,
        bslur: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('invalid opcode') >= 0,
        "error should be invalid opcode");
    }).then(function() {
      return chainListInstance.getArticle.call();
    }).then(function(data) {
      // make sure the contract state still holds
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], articleName, "article name must be " +
        articleName);
      assert.equal(data[3], articleDescription,
        "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice,
        "ether"), "article price must be " + web3.toWei(
        articlePrice, "ether"));
    });
  });

  // Test case 3: buying article for different value from its price
  // TODO: fix this, allow buyer to buy article from seller if they have more than seller's price
  // Current: only accepts transaction if buy ether == sell ether
  it(
    "should throw exception if you try to buy an article for value different from its price",
    function() {
      return ChainList.deployed().then(function(instance) {
        chainListInstance = instance;
        return chainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice + 1, "ether")
        });
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('invalid opcode') >= 0,
          "error should be invalid opcode");
      }).then(function() {
        return chainListInstance.getArticle.call();
      }).then(function(data) {
        // make sure the contract state still holds
        assert.equal(data[0], seller, "seller must be " + seller);
        assert.equal(data[1], 0x0, "buyer must be empty");
        assert.equal(data[2], articleName, "article name must be " +
          articleName);
        assert.equal(data[3], articleDescription,
          "article description must be " + articleDescription);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice,
          "ether"), "article price must be " + web3.toWei(
          articlePrice, "ether"));
      });
    });

  // Test case 4: cannot buy article that has been already sold
  it(
    "should throw exception if you try to buy article that has already been sold",
    function() {
      return ChainList.deployed().then(function(instance) {
        chainListInstance = instance;
        return chainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice, "ether")
        });
      }).then(function() {
        return chainListInstance.buyArticle({
          from: web3.eth.accounts[0],
          value: web3.toWei(articlePrice, "ether")
        });
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('invalid opcode') >= 0,
          "error should be invalid opcode");
      }).then(function() {
        return chainListInstance.getArticle.call();
      }).then(function(data) {
        // make sure the contract state still holds
        assert.equal(data[0], seller, "seller must be " + seller);
        assert.equal(data[1], buyer, "buyer must be empty");
        assert.equal(data[2], articleName, "article name must be " +
          articleName);
        assert.equal(data[3], articleDescription,
          "article description must be " + articleDescription);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice,
          "ether"), "article price must be " + web3.toWei(
          articlePrice, "ether"));
      });
    });
});
