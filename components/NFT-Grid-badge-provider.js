import { SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import React from "react";
import NFTCardProvider from "./NFT-Card-badge-provider";
import Link from "next/link";
import { NFT_BADGE_PROVIDER_CONTRACT } from "../const/addresses";


export default function NFTGridBadgeProvider({
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
                            href={`/token/${NFT_BADGE_PROVIDER_CONTRACT}/${nft.badgeProviderTokenId}`}
                            key={nft.badgeProviderTokenId}
                        >
                        <NFTCardProvider nft={nft} />
                        </Link>
                    ) : (
                        <div
                            key={nft.badgeProviderTokenId}
                            onClick={() => overrideOnclickBehavior(nft)}
                        >
                            <NFTCardProvider nft={nft} />
                        </div>
                    ))
            ) : (
                <Text>{emptyText}</Text>
            )}
        </SimpleGrid>
        
    )
};