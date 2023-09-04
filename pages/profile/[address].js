import { Container, Heading, Text ,Image} from "@chakra-ui/react";
import { useContract, useOwnedNFTs, useNFT } from "@thirdweb-dev/react";
import { Input, Button, FormControl, FormLabel, Box ,Flex} from '@chakra-ui/react';
import { useEffect,useState } from 'react'
import React from "react";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT,
    NFT_BADGE_SERVICE_CONTRACT,
    NFT_ERC721_CONTRACT 
} from "../../const/addresses";

import { useRouter } from "next/router";
import NFTGridBadgeProvider from "../../components/NFT-Grid-badge-provider";
import NFT_Badge_Provider from   '../../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'

import NFTGridBadgeService from "../../components/NFT-Grid-badge-service";
import NFT_Badge_Service from   '../../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'

import NFTGridERC721SLA from "../../components/NFT-Grid-erc721-sla";
import NFT_ERC721 from   '../../artifacts/contracts/NFT_ERC721.sol/NFT_ERC721.json'

import NFT_Market from   '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import {ethers} from 'ethers'
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";
import {create } from 'ipfs-http-client'
const axios = require('axios');

import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,RepeatIcon } from '@chakra-ui/icons'


export default function ProfilePage() {
    
    
    const router = useRouter();
    const signer = useSigner();
    const userAddress=useAddress()

    const [nftsProvider, setNftsProvider]=useState([])
    const [nftsService, setNftsService]=useState([])
    const [nftsSLA, setNftsSLA]=useState([])
    const [nftsSLAOnSale, setNftsSLAOnSale]=useState([])
    const[loadingState,setLoadingState]=useState(true)
    

    
    
    const nftBadgeProviderCollection= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,signer)
    const nftBadgeServiceCollection= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,signer)
    const nftERC721_SLACollection= new ethers.Contract(NFT_ERC721_CONTRACT,NFT_ERC721.abi,signer)
    let marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFT_Market.abi,signer)


    useEffect(()=> {
        loadNFTs()
       
      }, [])
    

 


   

    async function loadNFTs() {
        
        if(userAddress!=undefined){
       
       console.log(userAddress)
        

       //Ricerca di tutti i CloudProvider NFT
        try {

            // Chiamata a getUserTokens per ottenere l'array degli ID dei token dell'utente
            const tokenIds = await nftBadgeProviderCollection.getUserTokens(userAddress);
            console.log(tokenIds)

           
    
            // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
            const itemsCloudProvider= await Promise.all(tokenIds.map(async tokenId =>{
                const tokenURI = await nftBadgeProviderCollection.tokenURI(tokenId);
                const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
                let itemCloudProvider={
                    badgeProviderTokenId:tokenId.toNumber(),
                    cloudProviderAddress: response.data.cloudProviderAddress,
                    cloudProviderMail: response.data.cloudProviderMail,
                    cloudProviderName: response.data.cloudProviderName,
                    cloudProviderPictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudProviderPictureURI,
            
                  }
                return itemCloudProvider
            }))
    
            console.log("Metadati degli NFT Provider dell'utente:", itemsCloudProvider);

            setNftsProvider(itemsCloudProvider)
          

        } catch (error) {
            console.error("Errore durante la chiamata:", error);
        }


        //Ricerca di tutti i CloudService NFT
        try {

            // Chiamata a getUserTokens per ottenere l'array degli ID dei token dell'utente
            const tokenIds = await nftBadgeServiceCollection.getUserTokens(userAddress);
        
    
            // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
            const itemsCloudService= await Promise.all(tokenIds.map(async tokenId =>{
                const tokenURI = await nftBadgeServiceCollection.tokenURI(tokenId);
                const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
                let itemCloudService={

                    
                    badgeServiceTokenId:tokenId.toNumber(),
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
    
            console.log("Metadati degli NFT Service dell'utente:", itemsCloudService);
            setNftsService(itemsCloudService)
            setLoadingState(false)

        } catch (error) {
            console.error("Errore durante la chiamata:", error);
        }


        //Ricerca di tutti i CloudSLA NFT
        try {

            // Chiamata a getUserTokens per ottenere l'array degli ID dei token dell'utente
            const tokenIds = await nftERC721_SLACollection.getUserTokens(userAddress);

            const marketItems=await marketplace.fetchMarketItems()

            // Supponiamo che marketItems sia l'array di oggetti di tipo MarketItem
                const myMarketItems = marketItems.filter(item => {
                    return item.owner.toLowerCase() === NFT_MARKETPLACE_CONTRACT.toLowerCase() &&
                        item.seller.toLowerCase() === userAddress.toLowerCase();
                });
                
               
                
        
        
    
            // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
            const itemsCloudSLA= await Promise.all(tokenIds.map(async tokenId =>{
                const tokenURI = await nftERC721_SLACollection.tokenURI(tokenId);
                const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
                const responseCloudService=await axios.get("https://ipfs.io/ipfs/"+response.data.cloudServiceTokenURI);
              
                let itemCloudSLA={

                    
                    erc721SLATokenId:tokenId.toNumber(),
                    cloudServiceName: responseCloudService.data.cloudServiceType,
                    cloudServicePictureURI: 'https://ipfs.io/ipfs/'+responseCloudService.data.cloudServicePictureURI,
                    cloudServiceTokenURI: response.data.cloudServiceTokenURI,
                    hoursToBuy: response.data.hoursToBuy,
                    maxPenalty: response.data.maxPenalty,
                    slaEndingDate: response.data.slaEndingDate,
                    originalPrice: response.data.originalPrice,
            
                  }
                return itemCloudSLA
            }))

               // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
               const itemsCloudSLAOnSale= await Promise.all(myMarketItems.map(async myMarketItem =>{
                const tokenURI = await nftERC721_SLACollection.tokenURI(myMarketItem.tokenId);
                const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
                const responseCloudService=await axios.get("https://ipfs.io/ipfs/"+response.data.cloudServiceTokenURI);
              
                let itemCloudSLAOnSale={

                    
                    erc721SLATokenId:myMarketItem.tokenId.toNumber(),
                    cloudServiceName: responseCloudService.data.cloudServiceType,
                    cloudServicePictureURI: 'https://ipfs.io/ipfs/'+responseCloudService.data.cloudServicePictureURI,
                    cloudServiceTokenURI: response.data.cloudServiceTokenURI,
                    hoursToBuy: response.data.hoursToBuy,
                    maxPenalty: response.data.maxPenalty,
                    slaEndingDate: response.data.slaEndingDate,
                    originalPrice: response.data.originalPrice,
            
                  }
                return itemCloudSLAOnSale
            }))
    
            console.log("Metadati degli NFT SLA dell'utente:", itemsCloudSLA);
            console.log("Metadati degli NFT SLA dell'utente sul mercato:", itemsCloudSLAOnSale);
            setNftsSLA(itemsCloudSLA)
            setNftsSLAOnSale(itemsCloudSLAOnSale)
            setLoadingState(false)

        } catch (error) {
            console.error("Errore durante la chiamata:", error);
        }

    }
    }


    return (
        <Container maxW={"1200px"} p={5}>
            <Flex>
            <Heading>{"Your NFTs"}</Heading>
            <Button
            
            onClick={loadNFTs}
            ml={6}
            colorScheme="teal"
            borderRadius="md"
            leftIcon={<RepeatIcon />}
            boxShadow="lg"
            variant='outline'
          >
            Load NFTs
          </Button>
            </Flex>


            <Box mt={8} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
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
                    <NFTGridBadgeProvider
                data={nftsProvider}
                isLoading={loadingState}
                emptyText={"You don't own any badge as Cloud Provider"}
            />
            </Box>

            <Box mt={8} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
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
                    <NFTGridBadgeService
                data={nftsService}
                isLoading={loadingState}
                emptyText={"You don't own any Cloud Service Badge"}
            />
            </Box>

            <Box mt={8} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
            <Flex alignItems={"center"}>
                            <Box borderRadius={"4px"} overflow={"hidden"} mr={"10px"}>
                                <Image
                                    src={"https://imageupload.io/ib/3cCSQgrtrs0XR6r_1692719274.png"}
                                    height="32px"
                                    width="32px"
                                />
                            </Box>
                            <Text fontWeight={"bold"}>Cloud Service SLA NFT</Text>
                        </Flex>
                        <Text mt={4} fontWeight={"bold"}>On Sale:</Text>
                        <NFTGridERC721SLA
                        data={nftsSLAOnSale}
                        isLoading={loadingState}
                        emptyText={"You don't have any Cloud Service SLA NFT on sale"}
                    />
                    <Text fontWeight={"bold"}>Not on sale:</Text>
                            <NFTGridERC721SLA
                        data={nftsSLA}
                        isLoading={loadingState}
                        emptyText={"You don't own any Cloud Service SLA NFT"}
            />
            </Box>

           
          

        </Container>
    )
}