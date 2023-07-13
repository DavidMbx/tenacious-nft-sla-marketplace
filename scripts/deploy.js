// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const NFTMarket= await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket= await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT_ERC721=await hre.ethers.getContractFactory("NFT_ERC721");
  const nft_erc721= await NFT_ERC721.deploy(nftMarket.address);
  await nft_erc721.deployed();
  console.log("nft erc721 deployed to:", nft_erc721.address);

  const NFT_Badge=await hre.ethers.getContractFactory("NFT_Badge");
  const nft_badge= await NFT_Badge.deploy();
  await nft_badge.deployed();
  console.log("nft badge deployed to:", nft_badge.address);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
