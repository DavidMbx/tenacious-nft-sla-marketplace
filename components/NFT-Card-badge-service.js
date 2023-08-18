import React from "react";
import { NFT } from "@thirdweb-dev/sdk";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_SERVICE_CONTRACT 
} from "../const/addresses";
import { ThirdwebNftMedia, useContract, useValidDirectListings, useValidEnglishAuctions } from "@thirdweb-dev/react";
import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";




export default function NFTComponentBadgeService({ nft }) {

    //implementare per bene qui

    return (
        <Flex direction={"column"} backgroundColor={"#EEE"} justifyContent={"center"} padding={"2.5"} borderRadius={"6px"} borderColor={"lightgray"} borderWidth={1}>
        <Box borderRadius={"4px"} overflow={"hidden"}>
        <img src={nft.cloudProviderPictureURI}  height={"100%"} width={"100%"} />
        </Box>
        <Text fontSize={"small"} color={"darkgray"}>Cloud Service ID #{nft.badgeProviderTokenId}</Text>
        <Text fontWeight={"bold"}>{nft.cloudProviderName}</Text>
        <Text fontSize={"medium"} >{nft.cloudProviderMail}</Text>

        <Box>
  
        </Box>
    </Flex>
    )
};