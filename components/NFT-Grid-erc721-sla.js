import { SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import { NFT_ERC721_CONTRACT } from "../const/addresses";
import NFTCardERC721 from "./NFT-Card-erc721-sla";



export default function NFTGridERC721({
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
                        href={`/token/nft-sla-erc721/${NFT_ERC721_CONTRACT}/${nft.slaTokenId}`}
                        key={nft.slaTokenId}
                    >
                    <NFTCardERC721 nft={nft} />
                    </Link>
                ) : (
                    <div
                        key={nft.slaTokenId}
                        onClick={() => overrideOnclickBehavior(nft)}
                    >
                        <NFTCardERC721 nft={nft} />
                    </div>
                ))
        ) : (
            <Text>{emptyText}</Text>
        )}
    </SimpleGrid>
        
    )
};