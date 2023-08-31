import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text ,Image,Button} from "@chakra-ui/react";
import { MediaRenderer, ThirdwebNftMedia, Web3Button, useContract, useMinimumNextBid, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import React, { useState } from "react";
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon } from '@chakra-ui/icons'
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
const SparqlClient = require('sparql-http-client')




export default function TokenPageProvider({ nft, contractMetadata }) {

    const address=useAddress()
    const signer=useSigner()
    
    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});






    async function handleDeleteCloudProvider() {

        
        let contract= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,signer)
        console.log(contract)
      
        let transaction= await contract.burn(nft.badgeProviderTokenId)
        let tx= await transaction.wait()
        console.log(tx)
        await deleteFromSPARQL(nft.tokenURI,nft.badgeProviderTokenId)
        
              
          }

          async function deleteFromSPARQL(tokenURI,tokenId) {

            const {cloudProviderName,cloudProviderMail,cloudProviderPictureURI,cloudProviderAddress}= nft
          
          
            const deleteQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
          
            INSERT DATA {
              cs:${cloudProviderName.replace(/ /g, "_")} rdf:type cs:CloudProvider.
              cs:${cloudProviderName.replace(/ /g, "_")} cs:hasMail "${cloudProviderMail}".
              cs:Picture_${cloudProviderName.replace(/ /g, "_")} rdf:type cs:Picture.
              cs:Picture_${cloudProviderName.replace(/ /g, "_")} cs:hasLink "${cloudProviderPictureURI.replace("https://ipfs.io/ipfs/","")}".
              cs:${cloudProviderName.replace(/ /g, "_")} cs:hasPicture cs:Picture_${cloudProviderName.replace(/ /g, "_")}.
              cs:${cloudProviderName.replace(/ /g, "_")} cs:hasBlockchainAddress cs:Address_${cloudProviderAddress} .
              cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")}  rdf:type cs:NFT-Badge .
              cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasOwner cs:Address_${cloudProviderAddress} .
              cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:tokenURI "${tokenURI}".
              cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasAddress "${NFT_BADGE_PROVIDER_CONTRACT}".
              cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasTokenID "${tokenId}".
            }
            
          `;
          
          const responseUpdate=clientSPARQL.query.update(deleteQuery)
          console.log(responseUpdate)
          
          
          
          }
    
    
    
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

                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"} overflow='auto'>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Contract Address</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{NFT_BADGE_PROVIDER_CONTRACT}</Text>
                            </Box>
                       
                            
                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                            <Link href={nft.cloudProviderPictureURI} isExternal>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Picture URI <ExternalLinkIcon mx='2px' />  </Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.cloudProviderPictureURI.replace('https://ipfs.io/ipfs/','')}</Text>
                                </Link>
                            </Box>

                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                            <Link href={`https://ipfs.io/ipfs/${nft.tokenURI}`} isExternal>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Token URI <ExternalLinkIcon mx='2px' />  </Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.tokenURI}</Text>
                                </Link>
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
                  
                        <Text fontSize={"md"} fontWeight={"bold"} mt={5}>
                                    This type of NFT is a Badge, it cannot be sold or transferred but you can: </Text>
                           
                        </Skeleton>
               
                    </Stack>


                                        
                    { address==nft.cloudProviderAddress ? (

                    
                    
                   
                    <Button 
                    onClick={handleDeleteCloudProvider}
                    leftIcon={<DeleteIcon />}
                    mt={2}
                    colorScheme="red"
                    borderRadius="md"
                    size='lg'
                    boxShadow="lg"
                    >
                    Delete Cloud Provider
                    </Button>


                  


                    ) :(
                    <></>
                    ) }

      
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
        tokenURI:tokenURI,
        badgeProviderTokenId:tokenId,
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
  