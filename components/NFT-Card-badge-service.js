import React from "react";
import { NFT } from "@thirdweb-dev/sdk";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_SERVICE_CONTRACT 
} from "../const/addresses";
import { ThirdwebNftMedia, useContract, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { Box, Flex, Skeleton, Text ,Image} from "@chakra-ui/react";




export default function NFTComponentBadgeService({ nft }) {

    //implementare per bene qui

    return (
        <Flex direction={"column"} backgroundColor={"#EEE"} justifyContent={"center"} padding={"2.5"} borderRadius={"6px"} borderColor={"lightgray"} borderWidth={1}>
        <Box  borderRadius={"4px"}  overflow={"hidden"} height="200px"  >
        <Image src={nft.cloudServicePictureURI} height={"100%"} width={"100%"} objectFit='contain'  />
        </Box>
        <Text fontSize={"small"} color={"darkgray"} mt={2}>Cloud Service ID #{nft.badgeServiceTokenId}</Text>
        <Text fontWeight={"bold"}>{nft.cloudServiceType.replace(/_/g,' ')}</Text>
        <Text fontSize={"small"} mt={2} >Memory: {nft.memory} GB, Storage: {nft.storage} GB</Text>
        <Text fontSize={"small"} >CPU Speed: {nft.cpuSpeed} GHz, Core: {nft.cpuCores}</Text>
        <Text fontSize={"small"} >Region: {nft.region} </Text>
        <Text fontSize={"small"} >Pricing Model: {nft.cloudServicePricingModel}</Text>
        <Text fontWeight={"bold"} mt={4}>{nft.cloudServicePrice} ETH per Hour</Text>


        <Box>
  
        </Box>
    </Flex>
    )
};