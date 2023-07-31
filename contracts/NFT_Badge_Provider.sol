// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT_Badge_Provider is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("CloudProviderBadge", "CP") {} 

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the token can burn it.");
        _burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId,uint256 batchSize) internal override(ERC721) {
        require(from == address(0) || to == address(0), "Non puo essere trasferito");
        super._beforeTokenTransfer(from, to, tokenId,batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
        _burn(tokenId);
    }
}