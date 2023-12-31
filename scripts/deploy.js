// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
//import {ThirdwebSDK} from "@thirdweb-dev/sdk"

async function main() {

  const NFTMarket= await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket= await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT_ERC721=await hre.ethers.getContractFactory("NFT_ERC721");
  const nft_erc721= await NFT_ERC721.deploy(nftMarket.address);
  await nft_erc721.deployed();
  console.log("nft erc721 deployed to:", nft_erc721.address);

  const NFT_Badge_Provider=await hre.ethers.getContractFactory("NFT_Badge_Provider");
  const nft_badge_provider= await NFT_Badge_Provider.deploy();
  await nft_badge_provider.deployed();
  console.log("nft badge provider deployed to:", nft_badge_provider.address);

  const NFT_Badge_Service=await hre.ethers.getContractFactory("NFT_Badge_Service");
  const nft_badge_service= await NFT_Badge_Service.deploy();
  await nft_badge_service.deployed();
  console.log("nft badge service deployed to:", nft_badge_service.address);


  


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
