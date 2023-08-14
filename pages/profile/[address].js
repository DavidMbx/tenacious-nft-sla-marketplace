import { Container, Heading, Text } from "@chakra-ui/react";
import { useContract, useOwnedNFTs } from "@thirdweb-dev/react";
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

export default function ProfilePage() {
    const router = useRouter();
    const address=useAddress();


    const signer = useSigner();
    let nftBadgeProviderCollection= useContract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi)
   
    let marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFT_Market.abi,signer)

    const {data: ownedNfts, isLoading: loadingOwnedNfts} = useOwnedNFTs(
        nftBadgeProviderCollection,
        router.query.address
    );
        console.log(ownedNfts);
    return (
        <Container maxW={"1200px"} p={5}>
            <Heading>{"Owned NFT(s)"}</Heading>
            <Text>Browse and manage your NFTs from this collection.</Text>
            <NFTGridBadgeProvider 
                data={ownedNfts}
                isLoading={loadingOwnedNfts}
                emptyText={"You don't own any NFTs yet from this collection."}
            />
        </Container>
    )
}