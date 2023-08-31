import React from "react";
import { NFT } from "@thirdweb-dev/sdk";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_ERC721_CONTRACT 
} from "../const/addresses";
import { ThirdwebNftMedia, useContract, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { Box, Flex, Skeleton, Text,Image } from "@chakra-ui/react";




export default function NFTComponentERC721({ nft }) {
    
    /*const  {contract: marketplace, isLoading: loadingMarketplace } = useContract(NFT_MARKETPLACE_CONTRACT, "marketplace-v3");

    const { data: directListing, isLoading: loadingDirectListing } = 
        useValidDirectListings(marketplace, {
            tokenContract: NFT_ERC721_CONTRACT,
            tokenId: nft.metadata.id,
        });

    //Add for auciton section
    const { data: auctionListing, isLoading: loadingAuction} = 
        useValidEnglishAuctions(marketplace, {
            tokenContract: NFT_ERC721_CONTRACT,
            tokenId: nft.metadata.id,
        });

        */
    return (
        <Flex direction={"column"} backgroundColor={"#EEE"} justifyContent={"center"} padding={"2.5"} borderRadius={"6px"} borderColor={"lightgray"} borderWidth={1}>
        <Box  borderRadius={"4px"}  overflow={"hidden"} height="200px"  >
        <Image src={nft.cloudServicePictureURI} height={"100%"} width={"100%"} objectFit='contain'  />
        </Box>
        <Text fontSize={"small"} color={"darkgray"} mt={2}>Cloud SLA ID #{nft.erc721SLATokenId}</Text>
        <Text fontWeight={"bold"}>{nft.cloudServiceName.replace(/_/g,' ')+" SLA #"+nft.erc721SLATokenId}</Text>
        <Text fontSize={"small"} mt={2} >Ending Date: {nft.slaEndingDate}</Text>
        <Text fontSize={"small"} >Max Penalty in a Month: {nft.maxPenalty} ETH</Text>
        <Text fontSize={"small"} >Original Price: {nft.originalPrice} ETH </Text>
        <Text fontWeight={"bold"} mt={4}>{"Hours Available: "+nft.hoursToBuy} </Text>

        <Box>
  
        </Box>
    </Flex>
    )
};