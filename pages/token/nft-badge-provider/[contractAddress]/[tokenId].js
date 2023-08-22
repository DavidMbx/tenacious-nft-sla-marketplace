import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text ,Image} from "@chakra-ui/react";
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




export default function TokenPageProvider({ nft, contractMetadata }) {


    
    
    return (
        <Container maxW={"1200px"} p={5} my={5}>
            <SimpleGrid columns={2} spacing={6}>
                <Stack spacing={"20px"}>
                <Flex borderWidth={1}  borderRadius={"4px"}  width="100%" height="500px"  
            justifyContent="center" >
                        <Skeleton isLoaded={true} >
                        <Image src={nft.cloudProviderPictureURI}  height={"100%"} width={"100%"} objectFit='contain'  alignItems="center"
            justifyContent="center" />
                        </Skeleton>
                    </Flex>
                    
                    <Box>
                        <Text fontWeight={"bold"}>Attributes:</Text>
                        <SimpleGrid columns={2} spacing={4} mt={3}>
                     
                            <Box direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Token ID</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.badgeProviderTokenId}</Text>
                            </Box>
                         
                            <Box key='ciao' direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Name</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudProviderName}</Text>
                            </Box>

                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Mail</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudProviderMail}</Text>
                            </Box>
                            
                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Picture URI</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.cloudProviderPictureURI.replace('https://ipfs.io/ipfs/','')}</Text>
                            </Box>

                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Token URI</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.tokenURI}</Text>
                            </Box>


                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"} overflow='auto'>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Contract Address</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{NFT_BADGE_PROVIDER_CONTRACT}</Text>
                            </Box>
                       
                        </SimpleGrid>
                    </Box>
                </Stack>
                
                <Stack spacing={"20px"}>
                    {contractMetadata && (
                        <Flex alignItems={"center"}>
                            <Box borderRadius={"4px"} overflow={"hidden"} mr={"10px"}>
                                <Image
                                    src={"https://imageupload.io/ib/S2StK64vxTX544v_1692715755.png"}
                                    height="32px"
                                    width="32px"
                                />
                            </Box>
                            <Text fontWeight={"bold"}>Cloud Provider Badge NFT</Text>
                        </Flex>
                    )}
                    <Box mx={2.5}>
                        <Text fontSize={"4xl"} fontWeight={"bold"}>{nft.cloudProviderName}</Text>
                        <Link
                            href={`/profile/${nft.cloudProviderAddress}`}
                        >
                            <Flex direction={"row"} alignItems={"center"}>
                                <Avatar  src='https://bit.ly/broken-link' h={"24px"} w={"24px"} mr={"10px"}/>
                                <Text fontSize={"small"}>{nft.cloudProviderAddress.slice(0,6)}...{nft.cloudProviderAddress.slice(-4)}</Text>
                            </Flex>
                        </Link>
                    </Box>
                    
                    <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                        <Text color={"darkgray"}>Price:</Text>
                        <Skeleton isLoaded={true}>
                  
                                <Text fontSize={"xl"} fontWeight={"bold"}>
                                    This type of NFT is a Badge: it cannot be sold or transferred </Text>
                           
                        </Skeleton>
               
                    </Stack>
                   

      
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
        tokenURI:tokenURI,
        badgeProviderTokenId:tokenId,
        cloudProviderAddress: response.data.cloudProviderAddress,
        cloudProviderMail: response.data.cloudProviderMail,
        cloudProviderName: response.data.cloudProviderName,
        cloudProviderPictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudProviderPictureURI,

      }
    const nft = itemCloudProvider
  
    let contractMetadata;
  
    try {
      contractMetadata = nftBadgeProviderCollection.address;
      
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
  
    const tokenIds=[]
  
    const events = await nftBadgeProviderCollection.queryFilter('Transfer', 0);

    console.log(events);

 // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
 const itemsCloudProvider= await Promise.all(tokenIds.map(async tokenId =>{
    const tokenURI = await nftBadgeProviderCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    let itemCloudProvider={
        badgeProviderTokenId:tokenURI,
        cloudProviderAddress: response.data.cloudProviderAddress,
        cloudProviderMail: response.data.cloudProviderMail,
        cloudProviderName: response.data.cloudProviderName,
        cloudProviderPictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudProviderPictureURI,

      }
    return itemCloudProvider
}))

    const paths = itemsCloudProvider.map((nft) => {
      return {
        params: {
          contractAddress: NFT_BADGE_PROVIDER_CONTRACT,
          tokenId: nft.badgeProviderTokenId,
        },
      };
    });
  
    return {
      paths,
      fallback: "blocking", // can also be true or 'blocking'
    };
    
  };
  