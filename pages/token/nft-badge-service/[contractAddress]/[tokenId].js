import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text ,Image,Button,DatePicker,
    FormLabel,NumberInput,NumberInputField,NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper, FormControl} from "@chakra-ui/react";
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,TriangleDownIcon } from '@chakra-ui/icons'
import { MediaRenderer, ThirdwebNftMedia, Web3Button, useContract, useMinimumNextBid, useValidDirectListings, 
    useValidEnglishAuctions } from "@thirdweb-dev/react";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";

import React, { useState } from "react";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT,
    NFT_BADGE_SERVICE_CONTRACT,
    NFT_ERC721_CONTRACT 
} from "../../../../const/addresses";
import NFT_Badge_Service from   '../../../../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import {ethers} from 'ethers'
const axios = require('axios');
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";




export default function TokenPageService({ nft, contractMetadata }) {


    const address=useAddress()
    const [showNegotiaton, setShowNegotiation] = useState(false);

    const [formNegotiation,updateFormNegotiation]=useState({ hoursToBuy:'0', maxPenalty:'', 
    slaEndingDate:'',totalPrice:'0'})
    console.log(formNegotiation)
    

    const handleNegotiate = () => {
        setShowNegotiation(!showNegotiaton);
    };

    const handleBuyCloudService = () => {

        const{ hoursToBuy, maxPenalty, 
            slaEndingDate,totalPrice
            }=formNegotiation
          
          if(!hoursToBuy||!maxPenalty ||!totalPrice
               ) return  
               console.log("Errore, manca un campo")

               
        
    };
    
   
    return (
        <Container maxW={"1200px"} p={5} my={5}>
            <SimpleGrid columns={2} spacing={6}>
                <Stack spacing={"20px"}>
                    <Flex borderWidth={1}  borderRadius={"4px"}  width="100%" height="500px" justifyContent="center" >
                        <Skeleton isLoaded={true} >
                        <Image src={nft.cloudServicePictureURI}  height={"100%"} width={"100%"} objectFit='contain' />
                        </Skeleton>
                    </Flex>
                    
                    <Box>
                        <Text fontWeight={"bold"}>Attributes:</Text>
                        <SimpleGrid columns={2} spacing={4} mt={3}>
                     
                            <Box direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Token ID</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.badgeServiceTokenId}</Text>
                            </Box>
                            <Box direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Name</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServiceType.replace('_',' ')}</Text>
                            </Box>
                          
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Memory</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.memory} GB</Text>
                            </Box>

                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Storage</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.storage} GB</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Region</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.region}</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>CPU Speed</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cpuSpeed} GHz</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>CPU Cores</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cpuCores}</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Pricing Model</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServicePricingModel}</Text>
                            </Box>
                         
                         
                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                            <Link href={nft.cloudServicePictureURI} >
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Picture URI  <ExternalLinkIcon mx='2px' />  </Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.cloudServicePictureURI.replace('https://ipfs.io/ipfs/','')}  
                               
                                </Text>
                                </Link>
                            </Box>

                            <Box borderWidth={1} p={"8px"} borderRadius={"4px"} >
                            <Link href={`https://ipfs.io/ipfs/${nft.tokenURI}`} >
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Token URI  <ExternalLinkIcon mx='2px' /> </Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize='small' fontWeight={"bold"} whiteSpace="pre-wrap" >{nft.tokenURI}</Text>
                               
                                </Link>
                            </Box>


                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"} overflow='auto'>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Contract Address</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{NFT_BADGE_SERVICE_CONTRACT}</Text>
                            </Box>
                       
                        </SimpleGrid>
                    </Box>
                </Stack>
                
                <Stack spacing={"20px"}>
                    {contractMetadata && (
                        <Flex alignItems={"center"}>
                            <Box borderRadius={"4px"} overflow={"hidden"} mr={"10px"}>
                                <Image
                                    src={"https://imageupload.io/ib/9CgNf9vqyjOab0q_1692719074.png"}
                                    height="32px"
                                    width="32px"
                                />
                            </Box>
                            <Text fontWeight={"bold"}>Cloud Service Badge NFT</Text>
                        </Flex>
                    )}
                    <Box mx={2.5}>
                        <Text fontSize={"4xl"} fontWeight={"bold"}>{nft.cloudServiceType.replace('_',' ')}</Text>
                        <Link
                            href={`/profile/${nft.cloudServiceOwner}`}
                        >
                            <Flex direction={"row"} alignItems={"center"}>
                                <Avatar  src='https://bit.ly/broken-link' h={"24px"} w={"24px"} mr={"10px"}/>
                                <Text fontSize={"small"}>{nft.cloudServiceOwner.slice(0,6)}...{nft.cloudServiceOwner.slice(-4)}</Text>
                            </Flex>
                        </Link>
                    </Box>
                    
                    <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                        <Text color={"darkgray"}>Price: </Text>
                        <Skeleton isLoaded={true}>
                  
                     
                        <Text fontSize={"xl"} fontWeight={"bold"}>
                        {nft.cloudServicePrice} ETH per day </Text>
                        <Text fontSize={"md"} fontWeight={"bold"} mt={5}>
                                    This type of NFT is a Badge, it cannot be sold or transferred but you can: </Text>
                           
                        </Skeleton>
               
                    </Stack>


                    { address==nft.cloudServiceOwner ? (

                    <Flex justifyContent="center" alignItems="center">

                       
                    <Button
                     leftIcon={<EditIcon />}
                    mr={4}
                      mt={2}
                      colorScheme="messenger"
                      borderRadius="md"
                      size='lg'
                      boxShadow="lg"
                      >
                      Update Cloud Service
                     </Button>

                     
                     <Button 
                      leftIcon={<DeleteIcon />}
                      mt={2}
                      colorScheme="red"
                      borderRadius="md"
                      size='lg'
                      boxShadow="lg"
                      >
                      Delete Cloud Service
                     </Button>
                    
                    
                   </Flex>


                    ) :(

                        <Button 
                        onClick={handleNegotiate}
                        leftIcon={<TriangleDownIcon />}
                        mt={2}
                        colorScheme="green"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                        Negotiate & Buy this Cloud Service
                       </Button>

                    ) }

                {showNegotiaton  && (

            
                    <>
                    <FormControl isRequired>
                    <FormLabel mt={4} >Hours to Buy</FormLabel>
                    <NumberInput min={0}  precision={0} step={1}>
                    <NumberInputField 
                    placeholder="Hours"
                    onChange={e=> updateFormNegotiation({...formNegotiation,hoursToBuy: e.target.value,totalPrice:nft.cloudServicePrice*e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </FormControl>

                    <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>Termination Terms</Text>

                    <FormControl isRequired>
                    <FormLabel mt={4} >Max Penalty in a month</FormLabel>
                    <NumberInput min={0}  precision={2} step={0.01}>
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormNegotiation({...formNegotiation,maxPenalty: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </FormControl>

                    <FormLabel  mt={4} >SLA Ending Date (optional)</FormLabel>
                    <Input 
                        type="date"
                        placeholder="Insert a date"
                        onChange={e=> updateFormNegotiation({...formNegotiation,slaEndingDate: e.target.value})}
                    />

                    </Box>

                    <Text fontSize={"xl"} fontWeight={"bold"}>
                        You have to pay {formNegotiation.totalPrice} ETH  </Text>

                        <Button 
                        onClick={handleBuyCloudService}
                        leftIcon={<AddIcon />}
                        mt={2}
                        colorScheme="green"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                         Buy this Cloud Service for {formNegotiation.totalPrice} ETH
                       </Button>

                    </>
                        )}

                     




                  
      
                </Stack>
            </SimpleGrid>
            
        </Container>
    )
};

export const getStaticProps = async (context) => {
    const tokenId = context.params?.tokenId 

    const provider= new ethers.providers.JsonRpcProvider()
   const nftBadgeServiceCollection= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,provider)
   const cloudServiceOwner=await nftBadgeServiceCollection.ownerOf(tokenId)

    const tokenURI = await nftBadgeServiceCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    
    let itemCloudService={

        tokenURI:tokenURI,
        badgeServiceTokenId:tokenId,
        cloudServiceOwner:cloudServiceOwner,
        cloudServiceType: response.data.cloudServiceType,
        memory: response.data.memory,
        storage: response.data.storage,
        region: response.data.region,
        cpuSpeed: response.data.cpuSpeed,
        cpuCores: response.data.cpuCores,
        cloudServicePricingModel: response.data.cloudServicePricingModel,
        cloudServicePrice: response.data.cloudServicePrice,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudServicePictureURI,

      }
    const nft = itemCloudService
  
    let contractMetadata;
  
    try {
      contractMetadata = nftBadgeServiceCollection.address;
      
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
    const nftBadgeServiceCollection= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,provider)
  
    const tokenIds=[]
  
    const events = await nftBadgeServiceCollection.queryFilter('Transfer', 0);

    console.log(events);

   // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
   const itemsCloudService= await Promise.all(tokenIds.map(async tokenId =>{
    const tokenURI = await nftBadgeServiceCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    let itemCloudService={

        //cambiare tutto ed inserire nuove cose
        badgeServiceTokenId:tokenId,
        cloudServiceType: response.data.cloudServiceType,
        memory: response.data.memory,
        storage: response.data.storage,
        region: response.data.region,
        cpuSpeed: response.data.cpuSpeed,
        cpuCores: response.data.cpuCores,
        cloudServicePricingModel: response.data.cloudServicePricingModel,
        cloudServicePrice: response.data.cloudServicePrice,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudServicePictureURI,

      }
    return itemCloudService
}))

    const paths = itemsCloudService.map((nft) => {
      return {
        params: {
          contractAddress: NFT_BADGE_SERVICE_CONTRACT,
          tokenId: nft.badgeServiceTokenId,
        },
      };
    });
  
    return {
      paths,
      fallback: "blocking", // can also be true or 'blocking'
    };
    
  };
  