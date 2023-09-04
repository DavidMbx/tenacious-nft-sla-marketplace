// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    //Su Solidity non possiamo avere lunghezza dinamica degli array quindi dobbiamo sapere la lunghezza
    //Array di item comprati, item creati e item vendu
    //Not sold= itemIds-itemSold 


    uint256 listingPrice = 0 ether;
    address payable owner;

    constructor()  {
      owner = payable(msg.sender);
    }
    //Owner e' colui che ha deployato il contratto, sarebbe il marketplace


//Struct per ogni oggetto del market
    struct MarketItem {
      uint256 itemId;
      address nftContract;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }


    mapping(uint256 => MarketItem) private idToMarketItem;
    //Dato l'id di un item riesco a farmi ritornare tutto l'oggetto



// Creo un oggetto evento per debugging
    event MarketItemCreated (
      uint256 indexed itemId,
      address indexed nftContract,
      uint256 indexed tokenId,
      address payable seller,
      address payable owner,
      uint256 price,
      bool sold
    );


    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    function getMarketItemById(uint256 _itemId) public view returns (MarketItem memory) {
    return idToMarketItem[_itemId];
}

    
    //Funzione per creare un oggetto da zero e metterlo sul mercato
    function createMarketItem(
      address nftContract,
      uint256 tokenId,
      uint256 price
    ) public payable nonReentrant {
      require(price > 0, "Price must be at least 1 wei");
      require(msg.value == listingPrice, "Price must be equal to listing price");

      _itemIds.increment();
      uint256 itemId=_itemIds.current();

      idToMarketItem[tokenId] =  MarketItem(
        itemId,
        nftContract,
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);


      emit MarketItemCreated(
        itemId,
        nftContract,
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );
    }

//Funzione di vendita di nft da un venditore ad un compratore
    function createMarketSale(
      address nftContract,
      uint256 itemId
    ) public payable nonReentrant{

      uint price=idToMarketItem[itemId].price;
      uint tokenId=idToMarketItem[itemId].tokenId;

      require(msg.value==price, "Invia il prezzo richiesto per completare l'acquisto");

      idToMarketItem[itemId].seller.transfer(msg.value);
      IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
      idToMarketItem[itemId].owner=payable(msg.sender);
      idToMarketItem[itemId].sold=true;
      _itemsSold.increment();
      payable(owner).transfer(listingPrice);
    }


    // Funzione per rimuovere un NFT dal mercato
    function removeMarketItem(uint256 itemId) public nonReentrant {
      // Ottieni l'oggetto dal mapping
      MarketItem storage item = idToMarketItem[itemId];

      // Verifica che l'item esista e che l'utente attuale sia il venditore
      require(item.itemId > 0, "Item does not exist");
      require(item.seller == msg.sender, "You are not the seller");

      // Verifica che l'item non sia già stato venduto
      require(!item.sold, "Item is already sold");

      // Trasferisci il NFT indietro al venditore
      IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId);

      // Rimborsa eventuali costi di inserimento al venditore
      payable(msg.sender).transfer(listingPrice);
    }

//Funzione che ritorna gli nft di tutto il marketplace

function fetchMarketItems() public view returns (MarketItem[] memory){
  uint itemCount=_itemIds.current();
  uint unsoldItemCount= _itemIds.current() -_itemsSold.current();
  uint currentIndex=0;

//Ho già a disposizione il numero di item presenti il tutto il marketplace
  MarketItem[] memory items = new MarketItem[](unsoldItemCount);
  for(uint i=0; i< itemCount;i++){
    if(idToMarketItem[i+1].owner==address(this)){
      uint currentId = idToMarketItem[i+1].itemId;
      MarketItem storage currentItem= idToMarketItem[currentId];
      items[currentIndex]=currentItem;
      currentIndex+=1;

    }
  }

return items;
}


//Funzione che ritorna gli nft di un utente
function fetchMyNfts() public view returns (MarketItem[] memory){
  uint totalItemCount=_itemIds.current();
  uint itemCount=0;
  uint currentIndex=0;

//Trovo il numero di nft posseduti da chi ha chiamato la funzione
  for(uint i=0;i<totalItemCount;i++){
    if(idToMarketItem[i+1].owner==msg.sender){
      itemCount+=1;
    }
  }

  //Posso creare l'array di item una volta saputa la lunghezza (non ho array dinamici)
  MarketItem[] memory items= new MarketItem[](itemCount);
  for(uint i=0; i<totalItemCount; i++){
    if(idToMarketItem[i+1].owner==msg.sender){
    uint currentId=idToMarketItem[i+1].itemId;
    MarketItem storage currentItem=idToMarketItem[currentId];
    items[currentIndex]=currentItem;
    currentIndex+=1;
  }
  }
  return items;
}

function fetchItemsCreated() public view returns (MarketItem[] memory) {

  uint totalItemCount= _itemIds.current();
  uint itemCount=0;
  uint currentIndex=0;

  for(uint i=0; i<totalItemCount; i++){
    if(idToMarketItem[i+1].seller==msg.sender) {
      itemCount += 1; 
      }
  }

  MarketItem[] memory items=new MarketItem[](itemCount);
  for(uint i=0; i<totalItemCount; i++){
    if(idToMarketItem[i+1].seller==msg.sender){
      uint currentId=idToMarketItem[i+1].itemId;
      MarketItem storage currentItem=idToMarketItem[currentId];
      items[currentIndex]=currentItem;
      currentIndex +=1;
    }
  }
  return items;

}





}



