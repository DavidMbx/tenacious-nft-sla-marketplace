import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text ,Image,Button,DatePicker,
    FormLabel,NumberInput,NumberInputField,NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper, FormControl, LightMode} from "@chakra-ui/react";
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,TriangleDownIcon,LinkIcon,MinusIcon } from '@chakra-ui/icons'
import { MediaRenderer, ThirdwebNftMedia, Web3Button, useContract, useMinimumNextBid, useValidDirectListings, 
    useValidEnglishAuctions } from "@thirdweb-dev/react";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
const SparqlClient = require('sparql-http-client')
import { create } from 'ipfs-http-client';

import React, { useState } from "react";
import { 
    NFT_MARKETPLACE_CONTRACT, 
    NFT_BADGE_PROVIDER_CONTRACT,
    NFT_BADGE_SERVICE_CONTRACT,
    NFT_ERC721_CONTRACT 
} from "../../../../const/addresses";
import NFT_Badge_Service from   '../../../../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'
import NFT_ERC721 from   '../../../../artifacts/contracts/NFT_ERC721.sol/NFT_ERC721.json'
import NFTMarket from   '../../../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import {ethers} from 'ethers'
const axios = require('axios');
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
  } from '@chakra-ui/react'
  




export default function TokenPageSLA({ nft, contractMetadata }) {


    const address=useAddress()
    const signer=useSigner()
    const [showFragment, setShowFragment] = useState(false);
    const [priceText, setpriceText] = useState(" ETH");
    const [priceToSellForm, setPriceToSellForm] = useState();
    const [showPriceForm, setShowPriceForm] = useState(false);
    const [tokenOnMarket,setTokenOnMarket]=useState(nft.cloudSLAOwner==NFT_MARKETPLACE_CONTRACT)

    const contractMarketplace= new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFTMarket.abi,signer)
    const contractERC721= new ethers.Contract(NFT_ERC721_CONTRACT,NFT_ERC721.abi,signer)
 
    console.log(nft)
    

    const [formFragmentation,updateFormFragmentation]=useState({ numberFragment:'',hoursSingleFragment:''})

    const [success,setSuccess]=useState({state:false,message:""})
   
    

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});


    const projectId=process.env.NEXT_PUBLIC_PROJECT_ID_IPFS_INFURA
    const projectSecret=process.env.NEXT_PUBLIC_PRIVATE_KEY_IPFS_INFURA
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret,'utf8').toString('base64');
    
    
    // Configura il client IPFS
    const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        },
      });
    

    const handleFragment = () => {
        setShowFragment(!showFragment);
    };

     async function handleFragmentSLA() {

   
      if(!formFragmentation.numberFragment=="" && !formFragmentation.numberFragment=="0"){
      
        console.log(contractERC721)
        let transaction= await contractERC721.burn(nft.erc721SLATokenId)
        let tx= await transaction.wait()
        console.log(tx)
        await deleteFromSPARQL(nft.tokenURI,nft.erc721SLATokenId)
        
        for(let i=0;i<formFragmentation.numberFragment;i++){
            await createFileJSON()
            }   
            setSuccess({state:true,message:"Cloud Service SLA NFT successfully fragmented in "+formFragmentation.numberFragment+" fragments!"})
        }
        else{
            console.log("Inserisci un numero valido di frammentazione ")
        }   
             
               
        
    }


        async function handleBuy() {


        console.log(contractERC721)
        console.log(contractMarketplace)
        const price= ethers.utils.parseUnits(nft.marketItemPrice.toString(),'ether')
        const transaction=await contractMarketplace.createMarketSale(NFT_ERC721_CONTRACT,nft.erc721SLATokenId,{value:price})
        const tx=await transaction.wait()
        console.log(tx)
        await updateToSPARQL(nft.tokenURI)
        setSuccess({state:true,message:"You sucessfully bought this Cloud SLA NFT"})

    
                   
            
        }

        async function handleRemove() {


            console.log(contractMarketplace)
            const price= ethers.utils.parseUnits(nft.marketItemPrice.toString(),'ether')
            const transaction=await contractMarketplace.removeMarketItem(nft.erc721SLATokenId)
            const tx=await transaction.wait()
            console.log(tx)
            await updateToSPARQLSelling(nft.tokenURI,false)
            setSuccess({state:true,message:"You sucessfully removed this Cloud SLA NFT from the marketplace"})           
    
                   
            
        }

        async function handleSell() {

        
            setShowPriceForm(!showPriceForm)


           
                   
            
        }

        async function handleSellCloudSLA() {

        

            console.log(contractERC721)
            console.log(contractMarketplace)
          
            const price= ethers.utils.parseUnits(priceToSellForm.toString(),'ether')
            let listingPrice=await contractMarketplace.getListingPrice()
            listingPrice=ethers.utils.parseUnits(listingPrice.toString(),'ether')
            console.log(listingPrice)

            if(!await contractERC721.isApprovedForAll(address, NFT_MARKETPLACE_CONTRACT)){
            const txApproval = await contractERC721.setApprovalForAll(NFT_MARKETPLACE_CONTRACT, true);
            await txApproval.wait();
            }

         
           if(nft.marketItemPrice==0.0){
            let transaction= await contractMarketplace.createMarketItem(NFT_ERC721_CONTRACT,nft.erc721SLATokenId,price,{value: listingPrice})
            let tx= await transaction.wait()
            console.log(tx)

           }
           else{
            let transaction= await contractMarketplace.resellToken(nft.erc721SLATokenId,price,{value: listingPrice})
            let tx= await transaction.wait()
            console.log(tx)

           }
            
    
            await updateToSPARQLSelling(nft.tokenURI,true)
            
            setSuccess({state:true,message:"Cloud Service SLA NFT successfully listed on the marketplace!"})
    
                   
            
        }

    // Funzione per caricare un file su IPFS
async function uploadToIPFS(file) {
    try {
      const { cid } = await client.add(file); // Carica il file su IPFS
  
      console.log('File caricato su IPFS. CID:', cid.toString());
      const url= `https://nftslamarket.infura-ipfs.io/${cid.path}`
      return cid.toString(); // Restituisci l'hash IPFS del file
    } catch (error) {
      console.error('Errore durante il caricamento su IPFS:', error);
      return null;
    }
  }

    async function createFileJSON() {
       


            const hoursToBuy=formFragmentation.hoursSingleFragment
            const maxPenalty=nft.maxPenalty
            const slaEndingDate=nft.slaEndingDate
          const cloudServiceTokenURI=nft.cloudServiceTokenURI
          const originalPrice=(nft.originalPrice/formFragmentation.numberFragment).toFixed(2)
          console.log(hoursToBuy)
          console.log(maxPenalty)
          console.log(originalPrice)

          if(!hoursToBuy||!maxPenalty ||!originalPrice
               ) return  
               console.log("Errore, manca un campo")

        const data= JSON.stringify({
            cloudServiceTokenURI,hoursToBuy,maxPenalty,slaEndingDate,originalPrice
        })
    
        const formURI= await uploadToIPFS(data)
        console.log(data+"\n"+formURI)
    
        const tokenId=await uploadToBlockchain(formURI,nft.cloudServiceOwner,nft.originalPrice);
        uploadToSPARQL(formURI,tokenId);
        
        
    }

    async function uploadToBlockchain(URI,cloudServiceOwner,priceMint) {


      
        console.log(contractERC721)
      
    
        let transaction= await contractERC721.safeMintAndPay(address,URI,cloudServiceOwner,0,{value:0})
        let tx= await transaction.wait()
        let event= tx.events[0]
        let value=event.args[2]
        let tokenId=value.toNumber()
        console.log(event)
        console.log(value)
        console.log(tokenId)
        return tokenId

      
    }

    async function uploadToSPARQL(tokenURI,tokenId) {

        const hoursToBuy=formFragmentation.hoursSingleFragment
        const maxPenalty=nft.maxPenalty
        const slaEndingDate=nft.slaEndingDate
    
      const originalPrice=(nft.originalPrice/formFragmentation.numberFragment).toFixed(2)

          const cloudServiceTokenURI=nft.cloudServiceTokenURI
          const cloudServicePictureURI=nft.cloudServicePictureURI.replace("https://ipfs.io/ipfs/","")
          const cloudServiceOwner=nft.cloudServiceOwner
          console.log(cloudServicePictureURI)

          const slaIstanceId=tokenURI
          
      
      
        const insertQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
      
        INSERT DATA {
          ts:CloudConsumer_${address} rdf:type ts:CloudConsumer .
          ts:CloudConsumer_${address} ts:hasBlockchainAddress ts:Address_${address} .
          ts:Parties_${address+cloudServiceOwner} rdf:type ts:Parties .
          ts:CloudSLA_${slaIstanceId} rdf:type ts:CloudSLA .
          ts:Terms_${slaIstanceId} rdf:type ts:Terms .
          ts:ServiceDefinitionTerms_${slaIstanceId} rdf:type ts:ServiceDefinitionTerms .
          ts:TerminationTerms_${slaIstanceId} rdf:type ts:TerminationTerms .
          ts:ViolationCausing_${slaIstanceId} rdf:type ts:ViolationCausing .
          ts:SLAEnding_${slaIstanceId} rdf:type ts:SLAEnding_${slaIstanceId} .
          ts:CloudSLA_${slaIstanceId} ts:hasTerms ts:Terms_${slaIstanceId} .
          ts:CloudSLA_${slaIstanceId} ts:hasParties ts:Parties_${address+cloudServiceOwner} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudConsumer ts:CloudConsumer_${address} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudProvider ts:CloudProvider_${cloudServiceOwner} .
          ts:Terms_${slaIstanceId} ts:hasTTerms ts:TerminationTerms_${slaIstanceId} .
          ts:Terms_${slaIstanceId} ts:hasSDTerms ts:ServiceDefinitionTerms_${slaIstanceId} .
          ts:ServiceDefinitionTerms_${slaIstanceId} ts:hoursAvailable "${hoursToBuy}" .
          ts:ViolationCausing_${slaIstanceId} ts:isATTerms ts:TerminationTerms_${slaIstanceId}  .
          ts:SLAEnding_${slaIstanceId} ts:isATTerms ts:TerminationTerms_${slaIstanceId} .
          ts:ViolationCausing_${slaIstanceId} ts:maxViolationNumber "${maxPenalty}"  .
          ts:SLAEnding_${slaIstanceId} ts:hasDate "${slaEndingDate}" .
          ts:NFT_ERC721_${slaIstanceId} rdf:type ts:NFT-ERC-721 .
          ts:NFT_ERC721_${slaIstanceId} ts:hasCloudSLA ts:CloudSLA_${slaIstanceId}  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasAddress "${NFT_ERC721_CONTRACT}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasOwner ts:Address_${address}  .
          ts:NFT_ERC721_${slaIstanceId} ts:tokenURI "${tokenURI}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasTokenId "${tokenId}"  .
          ts:CloudSLA_${slaIstanceId} ts:hasCloudService ts:CloudService_${cloudServicePictureURI} .
        }
        
      `;
      
      const responseUpdate=clientSPARQL.query.update(insertQuery)
      console.log(responseUpdate)
      
      
      
      }

      async function deleteFromSPARQL(tokenURI,tokenId) {

        const hoursToBuy=nft.hoursToBuy
        const maxPenalty=nft.maxPenalty
        const slaEndingDate=nft.slaEndingDate
    
      const originalPrice=nft.originalPrice

          const cloudServiceTokenURI=nft.cloudServiceTokenURI
          const cloudServicePictureURI=nft.cloudServicePictureURI.replace("https://ipfs.io/ipfs/","")
          const cloudServiceOwner=nft.cloudServiceOwner
          console.log(cloudServicePictureURI)

          const slaIstanceId=tokenURI
          
      
      
        const deleteQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
      
        DELETE DATA {
          ts:CloudConsumer_${address} rdf:type ts:CloudConsumer .
          ts:CloudConsumer_${address} ts:hasBlockchainAddress ts:Address_${address} .
          ts:Parties_${address+cloudServiceOwner} rdf:type ts:Parties .
          ts:CloudSLA_${slaIstanceId} rdf:type ts:CloudSLA .
          ts:Terms_${slaIstanceId} rdf:type ts:Terms .
          ts:ServiceDefinitionTerms_${slaIstanceId} rdf:type ts:ServiceDefinitionTerms .
          ts:TerminationTerms_${slaIstanceId} rdf:type ts:TerminationTerms .
          ts:ViolationCausing_${slaIstanceId} rdf:type ts:ViolationCausing .
          ts:SLAEnding_${slaIstanceId} rdf:type ts:SLAEnding_${slaIstanceId} .
          ts:CloudSLA_${slaIstanceId} ts:hasTerms ts:Terms_${slaIstanceId} .
          ts:CloudSLA_${slaIstanceId} ts:hasParties ts:Parties_${address+cloudServiceOwner} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudConsumer ts:CloudConsumer_${address} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudProvider ts:CloudProvider_${cloudServiceOwner} .
          ts:Terms_${slaIstanceId} ts:hasTTerms ts:TerminationTerms_${slaIstanceId} .
          ts:Terms_${slaIstanceId} ts:hasSDTerms ts:ServiceDefinitionTerms_${slaIstanceId} .
          ts:ServiceDefinitionTerms_${slaIstanceId} ts:hoursAvailable "${hoursToBuy}" .
          ts:ViolationCausing_${slaIstanceId} ts:isATTerms ts:TerminationTerms_${slaIstanceId}  .
          ts:SLAEnding_${slaIstanceId} ts:isATTerms ts:TerminationTerms_${slaIstanceId} .
          ts:ViolationCausing_${slaIstanceId} ts:maxViolationNumber "${maxPenalty}"  .
          ts:SLAEnding_${slaIstanceId} ts:hasDate "${slaEndingDate}" .
          ts:NFT_ERC721_${slaIstanceId} rdf:type ts:NFT-ERC-721 .
          ts:NFT_ERC721_${slaIstanceId} ts:hasCloudSLA ts:CloudSLA_${slaIstanceId}  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasAddress "${NFT_ERC721_CONTRACT}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasOwner ts:Address_${address}  .
          ts:NFT_ERC721_${slaIstanceId} ts:tokenURI "${tokenURI}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasTokenId "${tokenId}"  .
          ts:CloudSLA_${slaIstanceId} ts:hasCloudService ts:CloudService_${cloudServicePictureURI} .
        }
        
      `;
      
      const responseUpdate=clientSPARQL.query.update(deleteQuery)
      console.log(responseUpdate)
      
      
      
      }

      async function updateToSPARQL(tokenURI) {

  

          const slaIstanceId=tokenURI
          
      
      
        const deleteQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
      
        DELETE DATA {

          ts:NFT_ERC721_${slaIstanceId} ts:hasOwner ts:Address_${nft.marketItemSeller}  .
          ts:NFT_ERC721_${slaIstanceId} ts:onTheMarketplace "true"  .
   
        }
 
        
      `;
      const insertQuery = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
    
     
      INSERT DATA{

          ts:NFT_ERC721_${slaIstanceId} ts:hasOwner ts:Address_${address}  .
          ts:NFT_ERC721_${slaIstanceId} ts:onTheMarketplace "false"  .

      }
      
    `;
      
      const responseDelete=clientSPARQL.query.update(deleteQuery)
      console.log(responseDelete)
      const responseInsert=clientSPARQL.query.update(insertQuery)
      console.log(responseInsert)
      
      
      
      
      }
      async function updateToSPARQLSelling(tokenURI,selling) {

  

        const slaIstanceId=tokenURI
        
    
    
      const deleteQuery = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
    
      DELETE DATA {

        ts:NFT_ERC721_${slaIstanceId} ts:onTheMarketplace "${!selling}"  .
 
      }

      
    `;
    const insertQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
  
   
    INSERT DATA{

        ts:NFT_ERC721_${slaIstanceId} ts:onTheMarketplace "${selling}"  .

    }
    
  `;
    
    const responseDelete=clientSPARQL.query.update(deleteQuery)
    console.log(responseDelete)
    const responseInsert=clientSPARQL.query.update(insertQuery)
    console.log(responseInsert)
    
    
    
    
    }
    
   
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
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.erc721SLATokenId}</Text>
                            </Box>
                            <Box direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Name</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServiceName.replace(/_/g,' ')+" SLA"}</Text>
                            </Box>
                          
                       

                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Hours Available</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.hoursToBuy} hours</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Max Penalty</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.maxPenalty} ETH</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>SLA Ending Date</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.slaEndingDate}</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Cloud SLA Original Price</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.originalPrice} ETH</Text>
                            </Box>


                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                            <Link href={`https://ipfs.io/ipfs/${nft.cloudServiceTokenURI}`} >
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Cloud Service Original URI <ExternalLinkIcon mx='2px' /></Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServiceTokenURI}</Text>
                            </Link>
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
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{NFT_ERC721_CONTRACT}</Text>
                            </Box>
                       
                        </SimpleGrid>
                    </Box>
                </Stack>
                
                <Stack spacing={"20px"}>
                    {contractMetadata && (
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
                    )}
                    <Box mx={2.5}>
                        <Text fontSize={"4xl"} fontWeight={"bold"}>{nft.cloudServiceName.replace(/_/g, ' ')+" SLA #"+nft.erc721SLATokenId}</Text>
                        
                        {tokenOnMarket && 
                         <Link
                         href={`/profile/${nft.marketItemSeller}`}
                            >
                         <Flex direction={"row"} alignItems={"center"}>
                             <Avatar   h={"24px"} w={"24px"} mr={"10px"}/>
                             <Text fontSize={"small"}>{nft.marketItemSeller.slice(0,6)}...{nft.marketItemSeller.slice(-4)}</Text>
                         </Flex>
                        </Link>
                        }

                        {!tokenOnMarket && 
                         <Link
                         href={`/profile/${nft.cloudSLAOwner}`}
                            >
                         <Flex direction={"row"} alignItems={"center"}>
                             <Avatar   h={"24px"} w={"24px"} mr={"10px"}/>
                             <Text fontSize={"small"}>{nft.cloudSLAOwner.slice(0,6)}...{nft.cloudSLAOwner.slice(-4)}</Text>
                         </Flex>
                        </Link>
                        }
                       
                    </Box>
                    
                    


                    {success.state && 

                        <Alert  mt={2} status='success'>
                        <AlertIcon />
                        {success.message}
                        </Alert>
                        }


                    { !tokenOnMarket &&  (
                         
                 
                         <>
                            {address==nft.cloudSLAOwner  && 

                                <>

                                <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                                <Text color={"darkgray"}>Price: </Text>
                                <Skeleton isLoaded={true}>
                                <Text fontSize={"xl"} fontWeight={"bold"}>
                                {"This item is not listed on the markeplace"}  </Text>
                                </Skeleton>
                                </Stack>

                                <Button 
                                onClick={handleSell}
                                leftIcon={<MinusIcon />}
                                mt={2}
                                colorScheme="red"
                                borderRadius="md"
                                size='lg'
                                boxShadow="lg"
                                >
                                Sell this Cloud Service SLA Contract
                                </Button>



                                <Button 
                                onClick={handleFragment}
                                leftIcon={<TriangleDownIcon />}
                                mt={2}
                                colorScheme="messenger"
                                borderRadius="md"
                                size='lg'
                                boxShadow="lg"
                                >
                                Fragment this Cloud Service SLA Contract
                                </Button>
                                </>

                            }
                            {address!=nft.cloudSLAOwner  && address!=nft.marketItemSeller && 

                                <>

                                <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                                <Text color={"darkgray"}>Price: </Text>
                                <Skeleton isLoaded={true}>
                                <Text fontSize={"xl"} fontWeight={"bold"}>
                                {"This item is not listed on the markeplace"}  </Text>
                                </Skeleton>
                                </Stack>

                                </>
                            }
                            
                   
                        </>
                    ) }
                     
                    {tokenOnMarket  &&
                           
                           <>
                            {address==nft.marketItemSeller  && 

                                <>
                                <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                                <Text color={"darkgray"}>Price: </Text>
                                <Skeleton isLoaded={true}>
                                <Text fontSize={"xl"} fontWeight={"bold"}>
                                {nft.marketItemPrice+" ETH"}  </Text>
                                </Skeleton>
                                </Stack>

                            
                                <Button 
                                onClick={handleRemove}
                                leftIcon={<MinusIcon />}
                                mt={2}
                                colorScheme="green"
                                borderRadius="md"
                                size='lg'
                                boxShadow="lg"
                                >
                                Remove this SLA Contract from Marketplace
                                </Button>

                                </>
                            
                            }

                            {address!=nft.marketItemSeller  && 

                            <>

                            <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                            <Text color={"darkgray"}>Price: </Text>
                            <Skeleton isLoaded={true}>
                            <Text fontSize={"xl"} fontWeight={"bold"}>
                            {nft.marketItemPrice+" ETH"}  </Text>
                            </Skeleton>
                            </Stack>
                            
                             <Button 
                            onClick={handleBuy}
                            leftIcon={<TriangleDownIcon />}
                            mt={2}
                            colorScheme="green"
                            borderRadius="md"
                            size='lg'
                            boxShadow="lg"
                            >
                            Buy this Cloud Service SLA Contract for ETH
                            </Button>
                        
                            </>
                            }
                         
                         </>
                    }

                      
                {showFragment  && (

            
                    <>
                    


                    <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>Fragmentation</Text>

                    <FormControl isRequired>
                    <FormLabel mt={4} >Number of Fragments</FormLabel>
                    <NumberInput min={0}  precision={0} step={1}>
                    <NumberInputField 
                    placeholder="e.g. 4"
                    onChange={e=> updateFormFragmentation({...formFragmentation,numberFragment: e.target.value,hoursSingleFragment:(nft.hoursToBuy/e.target.value).toFixed(2)})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </FormControl>

        
            
                    </Box>

                    <Text fontSize={"xl"} fontWeight={"bold"}>
                        You will have {formFragmentation.numberFragment} Cloud SLA of {formFragmentation.hoursSingleFragment} hours each    </Text>

                        <Button 
                        onClick={handleFragmentSLA}
                        leftIcon={<LinkIcon />}
                        mt={2}
                        colorScheme="messenger"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                         Fragment this in {formFragmentation.numberFragment} SLA of {formFragmentation.hoursSingleFragment} hours each 
                       </Button>

                    </>
                        )}

                        {showPriceForm  && (

                                    
                        <>



                        <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                        <Text as='b' fontSize='lg'>Price Cloud SLA NFT</Text>

                        <FormControl isRequired>
                        <FormLabel mt={4} >Price</FormLabel>
                        <NumberInput min={0.001}  precision={3} step={1}>
                        <NumberInputField 
                        placeholder="e.g. 10"
                        onChange={e=> setPriceToSellForm(e.target.value)}/>
                            <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        </FormControl>



                        </Box>

                        <Text fontSize={"xl"} fontWeight={"bold"}>
                            You will sell this Cloud SLA NFT for {priceToSellForm} ETH    </Text>

                            <Button 
                        onClick={handleSellCloudSLA}
                        leftIcon={<MinusIcon />}
                        mt={2}
                        colorScheme="red"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                        Sell this Cloud Service SLA Contract NFT for {priceToSellForm} ETH 
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
   
   const nftERC721_SLACollection= new ethers.Contract(NFT_ERC721_CONTRACT,NFT_ERC721.abi,provider)
   let marketContract= new ethers.Contract(NFT_MARKETPLACE_CONTRACT,NFTMarket.abi,provider)
   const marketItem=await marketContract.getMarketItemById(tokenId)
   
   

   const cloudSLAOwner=await nftERC721_SLACollection.ownerOf(tokenId)

    const tokenURI = await nftERC721_SLACollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    const responseCloudService=await axios.get("https://ipfs.io/ipfs/"+response.data.cloudServiceTokenURI);

    
    let itemCloudSLA={

        tokenURI:tokenURI,
        cloudSLAOwner:cloudSLAOwner,
        erc721SLATokenId:tokenId,
        cloudServiceName: responseCloudService.data.cloudServiceType,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+responseCloudService.data.cloudServicePictureURI,
        cloudServiceTokenURI: response.data.cloudServiceTokenURI,
        hoursToBuy: response.data.hoursToBuy,
        maxPenalty: response.data.maxPenalty,
        slaEndingDate: response.data.slaEndingDate,
        originalPrice: response.data.originalPrice,
        marketItemSold: marketItem.sold,
        marketItemSeller: marketItem.seller,
        marketItemOwner: marketItem.owner,
        marketItemSeller: marketItem.seller,
        marketItemPrice: ethers.utils.formatUnits(marketItem.price.toString(),'ether'),
        cloudServiceOwner:responseCloudService.data.cloudProviderAddress,
        


      }
    const nft = itemCloudSLA
  
    let contractMetadata;
  
    try {
      contractMetadata = nftERC721_SLACollection.address;
      
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
    const nftERC721_SLACollection= new ethers.Contract(NFT_ERC721_CONTRACT,NFT_ERC721.abi,provider)
  
   
    
  
    const tokenIds=[]
  
    const events = await nftERC721_SLACollection.queryFilter('Transfer', 0);

    console.log(events);

   // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
   const itemsCloudSLA= await Promise.all(tokenIds.map(async tokenId =>{
    const tokenURI = await nftERC721_SLACollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    const responseCloudService=await axios.get("https://ipfs.io/ipfs/"+response.data.cloudServiceTokenURI);
    
    let itemCloudSLA={

        tokenURI:tokenURI,
        cloudSLAOwner:cloudSLAOwner,
        erc721SLATokenId:tokenId.toNumber(),
        cloudServiceName: responseCloudService.data.cloudServiceType,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+responseCloudService.data.cloudServicePictureURI,
        cloudServiceTokenURI: response.data.cloudServiceTokenURI,
        hoursToBuy: response.data.hoursToBuy,
        maxPenalty: response.data.maxPenalty,
        slaEndingDate: response.data.slaEndingDate,
        originalPrice: response.data.originalPrice,
        cloudServiceOwner:responseCloudService.data.cloudProviderAddress,
        marketItem: marketItem.sold,
      


      }
    return itemCloudSLA
}))

    const paths = itemsCloudSLA.map((nft) => {
      return {
        params: {
          contractAddress: NFT_ERC721_CONTRACT,
          tokenId: nft.erc721SLATokenId,
        },
      };
    });
  
    return {
      paths,
      fallback: "blocking", // can also be true or 'blocking'
    };
    
  };
  