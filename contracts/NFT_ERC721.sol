// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT_ERC721 is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    address contractAddress;

    mapping(address => uint256[]) private _userTokens;
    constructor(address marketplaceAddress) ERC721("SLA NFT", "SL") {
        contractAddress=marketplaceAddress;
    }

    function safeMintAndPay(address to, string memory uri,address payable originalOwner,uint256 mintPrice) public payable {
        
         require(msg.value == mintPrice, "Incorrect Ether sent");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _userTokens[to].push(tokenId);

         // Transfer the payment to the payee
        originalOwner.transfer(mintPrice);

    }

    function revoke(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

        function burn(uint256 tokenId) external  {
        require(ownerOf(tokenId) == msg.sender, "Only owner of the token can burn it");
        _burn(tokenId);

         _removeTokenFromUser(msg.sender, tokenId);
    }


    function _removeTokenFromUser(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = _userTokens[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                // Rimuovi l'ID del token dall'array
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

        function getUserTokens(address user) public view returns (uint256[] memory) {
        return _userTokens[user];
    }


    function _afterTokenTransfer(address from, address to, uint256 tokenId,uint256 batchSize) internal override  {

   _userTokens[to].push(tokenId);
    _removeTokenFromUser(from, tokenId);
    
    }



    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }


    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}