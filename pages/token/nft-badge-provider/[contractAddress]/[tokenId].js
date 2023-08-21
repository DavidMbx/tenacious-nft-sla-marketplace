import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { MediaRenderer, ThirdwebNftMedia, Web3Button, useContract, useMinimumNextBid, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import React, { useState } from "react";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT,
    NFT_BADGE_SERVICE_CONTRACT,
    NFT_ERC721_CONTRACT 
} from "../../../../const/addresses";
import NFT_Badge_Provider from   '../../../../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import {ethers} from 'ethers'
const axios = require('axios');
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";




export default function TokenPage({ nft, contractMetadata }) {

       

    
    
    return (
        <Container maxW={"1200px"} p={5} my={5}>
            <SimpleGrid columns={2} spacing={6}>
                <Stack spacing={"20px"}>
                    <Box borderRadius={"6px"} overflow={"hidden"}>
                        <Skeleton isLoaded={!loadingMarketplace && !loadingDirectListing}>
                            <ThirdwebNftMedia
                                metadata={nft.metadata}
                                width="100%"
                                height="100%"
                            />
                        </Skeleton>
                    </Box>
                    <Box>
                        <Text fontWeight={"bold"}>Description:</Text>
                        <Text>{nft.metadata.description}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight={"bold"}>Traits:</Text>
                        <SimpleGrid columns={2} spacing={4}>
                        {Object.entries(nft?.metadata?.attributes || {}).map(
                        ([key, value]) => (
                            <Flex key={key} direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text fontSize={"small"}>{value.trait_type}</Text>
                                <Text fontSize={"small"} fontWeight={"bold"}>{value.value}</Text>
                            </Flex>
                        )
                        )}
                        </SimpleGrid>
                    </Box>
                </Stack>
                
                <Stack spacing={"20px"}>
                    {contractMetadata && (
                        <Flex alignItems={"center"}>
                            <Box borderRadius={"4px"} overflow={"hidden"} mr={"10px"}>
                                <MediaRenderer
                                    src={contractMetadata.image}
                                    height="32px"
                                    width="32px"
                                />
                            </Box>
                            <Text fontWeight={"bold"}>{contractMetadata.name}</Text>
                        </Flex>
                    )}
                    <Box mx={2.5}>
                        <Text fontSize={"4xl"} fontWeight={"bold"}>{nft.metadata.name}</Text>
                        <Link
                            href={`/profile/${nft.owner}`}
                        >
                            <Flex direction={"row"} alignItems={"center"}>
                                <Avatar  src='https://bit.ly/broken-link' h={"24px"} w={"24px"} mr={"10px"}/>
                                <Text fontSize={"small"}>{nft.owner.slice(0,6)}...{nft.owner.slice(-4)}</Text>
                            </Flex>
                        </Link>
                    </Box>
                    
                    <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                        <Text color={"darkgray"}>Price:</Text>
                        <Skeleton isLoaded={!loadingMarketplace && !loadingDirectListing}>
                            {directListing && directListing[0] ? (
                                <Text fontSize={"3xl"} fontWeight={"bold"}>
                                    {directListing[0]?.currencyValuePerToken.displayValue}
                                    {" " + directListing[0]?.currencyValuePerToken.symbol}
                                </Text>
                            ) : auctionListing && auctionListing[0] ? (
                                <Text fontSize={"3xl"} fontWeight={"bold"}>
                                    {auctionListing[0]?.buyoutCurrencyValue.displayValue}
                                    {" " + auctionListing[0]?.buyoutCurrencyValue.symbol}
                                </Text>
                            ) : (
                                <Text fontSize={"3xl"} fontWeight={"bold"}>Not for sale</Text>
                            )}
                        </Skeleton>
                        <Skeleton isLoaded={!loadingAuction}>
                            {auctionListing && auctionListing[0] && (
                                <Flex direction={"column"}>
                                    <Text color={"darkgray"}>Bids starting from</Text>
                                <Text fontSize={"3xl"} fontWeight={"bold"}>
                                    {auctionListing[0]?.minimumBidCurrencyValue.displayValue}
                                    {" " + auctionListing[0]?.minimumBidCurrencyValue.symbol}
                                </Text>
                                <Text></Text>
                                </Flex>
                            )}
                        </Skeleton>
                    </Stack>
                    <Skeleton isLoaded={!loadingMarketplace || !loadingDirectListing || !loadingAuction}>
                        <Stack spacing={5}>
                            <Web3Button
                                contractAddress={MARKETPLACE_ADDRESS}
                                action={async () => buyListing()}
                                isDisabled={(!auctionListing || !auctionListing[0]) && (!directListing || !directListing[0])}
                            >Buy at asking price</Web3Button>
                            <Text textAlign={"center"}>or</Text>
                            <Flex direction={"column"}>
                                <Input
                                    mb={5}
                                    defaultValue={
                                        auctionListing?.[0]?.minimumBidCurrencyValue?.displayValue || 0
                                    }
                                    type={"number"}
                                    onChange={(e) => setBidValue(e.target.value)}
                                />
                                <Web3Button
                                    contractAddress={MARKETPLACE_ADDRESS}
                                    action={async () => await createBidOffer()}
                                    isDisabled={!auctionListing || !auctionListing[0]}
                                >Place Bid</Web3Button>
                            </Flex>
                        </Stack>
                    </Skeleton>
                </Stack>
            </SimpleGrid>
            
        </Container>
    )
};

export const getStaticProps = async (context) => {
    const tokenId = context.params?.tokenId 

    const provider= new ethers.providers.JsonRpcProvider()
   const nftBadgeProviderCollection= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,provider)

    const tokenURI = await nftBadgeProviderCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    let itemCloudProvider={
        badgeProviderTokenId:tokenId.toNumber(),
        cloudProviderAddress: response.data.cloudProviderAddress,
        cloudProviderMail: response.data.cloudProviderMail,
        cloudProviderName: response.data.cloudProviderName,
        cloudProviderPictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudProviderPictureURI,

      }
    const nft = itemCloudProvider
  
    let contractMetadata;
  
    try {
      contractMetadata = await nftBadgeProviderCollection.metadata.get();
    } catch (e) {}
  
    return {
      props: {
        nft,
        contractMetadata: contractMetadata || null,
      },
      revalidate: 1, // https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
    };
  };

  
  export const getStaticPaths = async () => {
   
    const provider= new ethers.providers.JsonRpcProvider()
    const nftBadgeProviderCollection= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,provider)
  
    const nfts = await nftBadgeProviderCollection.getAll();
  
    const myContract = new web3.eth.Contract(abiJson, contractAddress);
myContract.getPastEvents('Transfer', {
    filter: {
        _from: '0x0000000000000000000000000000000000000000'
    },
    fromBlock: 0
}).then((events) => {
    for (let event of events) {
        console.log(event.returnValues._tokenId);
    }
});

    const paths = nfts.map((nft) => {
      return {
        params: {
          contractAddress: NFT_COLLECTION_ADDRESS,
          tokenId: nft.metadata.id,
        },
      };
    });
  
    return {
      paths,
      fallback: "blocking", // can also be true or 'blocking'
    };
    
  };
  