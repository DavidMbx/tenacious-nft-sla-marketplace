import { SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import NFTCardService from "./NFT-Card-badge-service";
import { NFT_BADGE_SERVICE_CONTRACT } from "../const/addresses";


export default function NFTGridBadgeService({
    isLoading,
    data,
    overrideOnclickBehavior,
    emptyText = "No NFTs found",
}) {
    return (

        <SimpleGrid columns={4} spacing={6} w={"100%"} padding={2.5} my={5}>
        {isLoading ? (
            [...Array(20)].map((_, index) => (
                <Skeleton key={index} height={"312px"} width={"100%"} />
            )) 
        ) : data && data.length > 0 ? (
            data.map((nft) => 
                !overrideOnclickBehavior ? (
                    <Link
                        href={`/token/${NFT_BADGE_SERVICE_CONTRACT}/${nft.badgeServiceTokenId}`}
                        key={nft.badgeServiceTokenId}
                    >
                    <NFTCardService nft={nft} />
                    </Link>
                ) : (
                    <div
                        key={nft.badgeServiceTokenId}
                        onClick={() => overrideOnclickBehavior(nft)}
                    >
                        <NFTCardService nft={nft} />
                    </div>
                ))
        ) : (
            <Text>{emptyText}</Text>
        )}
    </SimpleGrid>
        
    )
};