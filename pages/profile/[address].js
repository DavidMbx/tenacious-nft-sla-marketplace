import { Container, Heading, Text } from "@chakra-ui/react";
import { useContract, useOwnedNFTs, useNFT } from "@thirdweb-dev/react";
import { Input, Button, FormControl, FormLabel, Box ,Flex} from '@chakra-ui/react';
import { useEffect,useState } from 'react'
import React from "react";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT 
} from "../../const/addresses";
import { useRouter } from "next/router";
import NFTGridBadgeProvider from "../../components/NFT-Grid-badge-provider";

import NFT_Badge_Provider from   '../../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'
import NFT_Market from   '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import {ethers} from 'ethers'
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";
import {create } from 'ipfs-http-client'
const axios = require('axios');

export default function ProfilePage() {
    
    
    const router = useRouter();
    const signer = useSigner();
    const userAddress=useAddress()

    const [nfts, setNfts]=useState([])
    const[loadingState,setLoadingState]=useState(true)
    

    
    
    const nftBadgeProviderCollection= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,signer)
    let marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFT_Market.abi,signer)


    useEffect(()=> {
        loadNFTs()
       
      }, [])
    

 


   

    async function loadNFTs() {
        
        if(userAddress!=undefined){
       
       console.log(userAddress)
        
        try {

            // Chiamata a getUserTokens per ottenere l'array degli ID dei token dell'utente
            const tokenIds = await nftBadgeProviderCollection.getUserTokens(userAddress);
        
    
            // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
            const items= await Promise.all(tokenIds.map(async tokenId =>{
                const tokenURI = await nftBadgeProviderCollection.tokenURI(tokenId);
                const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
                let item={
                    badgeProviderTokenId:tokenId.toNumber(),
                    cloudProviderAddress: response.data.cloudProviderAddress,
                    cloudProviderMail: response.data.cloudProviderMail,
                    cloudProviderName: response.data.cloudProviderName,
                    cloudProviderPictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudProviderPictureURI,
            
                  }
                return item
            }))
    
            console.log("Metadati degli NFT dell'utente:", items);

            setNfts(items)
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
            loadingState
            onClick={loadNFTs}
            ml={6}
            colorScheme="teal"
            borderRadius="md"
           
            boxShadow="lg"
            variant='outline'
          >
            Load NFTs
          </Button>
            </Flex>
            <Text as='b' fontSize='lg'>Virtual Appliance</Text>
           
          <NFTGridBadgeProvider
                data={nfts}
                isLoading={loadingState}
                emptyText={"You don't own any NFTs yet from this collection."}
            />

        </Container>
    )
}