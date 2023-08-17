import React from "react";
import { NFT } from "@thirdweb-dev/sdk";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT 
} from "../const/addresses";
import { ThirdwebNftMedia, useContract, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import NFT_Market from   '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'





export default function NFTComponentBadgeProvider({ nft }) {
    
    let marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFT_Market.abi,signer)

    

    const { data: directListing, isLoading: loadingDirectListing } = 
        useValidDirectListings(marketplace, {
            tokenContract: NFT_BADGE_PROVIDER_CONTRACT,
            tokenId: nft.metadata.id,
        });

    //Add for auciton section
    const { data: auctionListing, isLoading: loadingAuction} = 
        useValidEnglishAuctions(marketplace, {
            tokenContract: NFT_BADGE_PROVIDER_CONTRACT,
            tokenId: nft.metadata.id,
        });

    return (
        <Flex direction={"column"} backgroundColor={"#EEE"} justifyContent={"center"} padding={"2.5"} borderRadius={"6px"} borderColor={"lightgray"} borderWidth={1}>
            <Box borderRadius={"4px"} overflow={"hidden"}>
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              
               <div className="p-4">
                <p style={{height:'64px'}} classname="text-2xl font-semibold">{nft.cloudProviderName}</p>
                <div style={{height:'70px',oveflow: 'hidden'}}>
                  <p className="text-gray-400">{nft.cloudProviderName}</p>
                  </div>
                  </div>
                  <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.cloudProviderAddress}</p>
                  <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" 
                    onClick={()=> buyNft(nft)}>Compra</button>
                </div>
            </div>
            </Box>
            <Text fontSize={"small"} color={"darkgray"}>Token ID #{nft.badgeProviderTokenId}</Text>
            <Text fontWeight={"bold"}>{nft.cloudProviderName}</Text>

            <Box>
                {loadingMarketplace || loadingDirectListing || loadingAuction ? (
                    <Skeleton></Skeleton>
                ) : directListing && directListing[0] ? (
                    <Box>
                        <Flex direction={"column"}>
                            <Text fontSize={"small"}>Price</Text>
                            <Text fontSize={"small"}>{`${directListing[0]?.currencyValuePerToken.displayValue} ${directListing[0]?.currencyValuePerToken.symbol}`}</Text>
                        </Flex>
                    </Box>
                ) : auctionListing && auctionListing[0] ? (
                    <Box>
                        <Flex direction={"column"}>
                            <Text fontSize={"small"}>Minimum Bid</Text>
                            <Text fontSize={"small"}>{`${auctionListing[0]?.minimumBidCurrencyValue.displayValue} ${auctionListing[0]?.minimumBidCurrencyValue.symbol}`}</Text>
                        </Flex>
                    </Box>
                ) : (
                    <Box>
                        <Flex direction={"column"}>
                            <Text fontSize={"small"}>Price</Text>
                            <Text fontSize={"small"}>Not Listed</Text>
                        </Flex>
                    </Box>
                )}
            </Box>
        </Flex>
    )
};