import { Avatar, Box, Container, Flex, Input, SimpleGrid, Skeleton, Stack, Text ,Image,Button,DatePicker,
    FormLabel,NumberInput,NumberInputField,NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper, FormControl} from "@chakra-ui/react";
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,TriangleDownIcon } from '@chakra-ui/icons'
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
  
  




export default function TokenPageService({ nft, contractMetadata }) {


    const address=useAddress()
    const signer=useSigner()
    const [showNegotiaton, setShowNegotiation] = useState(false);
    console.log(nft)

    const [formNegotiation,updateFormNegotiation]=useState({ hoursToBuy:'0', maxPenalty:'', 
    slaEndingDate:'',totalPrice:'0'})
    

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});

    const [deletedSuccess,setDeletedSuccess]=useState(false)
    const [negotiateSuccess,setNegotiateSuccess]=useState(false)


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
    

    const handleNegotiate = () => {
        setShowNegotiation(!showNegotiaton);
    };

     async function handleBuyCloudService() {

        
  // Esempio di output dei dati per la demo
  console.log('Cloud SLA Form:', formNegotiation);
  createFileJSON()
       
             

               
        
    }

    async function handleDeleteCloudService() {

        
        let contract= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,signer)
        console.log(contract)
      
        let transaction= await contract.burn(nft.badgeServiceTokenId)
        let tx= await transaction.wait()
        console.log(tx)
        await deleteFromSPARQL(nft.tokenURI,nft.badgeServiceTokenId)
        setDeletedSuccess(true)
        
              
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
       

        const{ hoursToBuy, maxPenalty, 
            slaEndingDate,totalPrice
            }=formNegotiation
          const cloudServiceTokenURI=nft.tokenURI
          const originalPrice=totalPrice
          if(!hoursToBuy||!maxPenalty ||!totalPrice
               ) return  
               console.log("Errore, manca un campo")

        const data= JSON.stringify({
            cloudServiceTokenURI,hoursToBuy,maxPenalty,slaEndingDate,originalPrice
        })
    
        const formURI= await uploadToIPFS(data)
        console.log(data+"\n"+formURI)
    
        const tokenId=await uploadToBlockchain(formURI,nft.cloudServiceOwner,totalPrice);
        await uploadToSPARQL(formURI,tokenId);
        setNegotiateSuccess(true)
        
        
    }

    async function uploadToBlockchain(URI,cloudServiceOwner,priceMint) {


        let contract= new ethers.Contract(NFT_ERC721_CONTRACT,NFT_ERC721.abi,signer)
        console.log(contract)
      
        const price= ethers.utils.parseUnits(priceMint.toString(),'ether')
        let transaction= await contract.safeMintAndPay(address,URI,cloudServiceOwner,price,{value:price})
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

        const{ hoursToBuy, maxPenalty, 
            slaEndingDate,totalPrice
            }=formNegotiation
          const cloudServiceTokenURI=nft.tokenURI
          const cloudServicePictureURI=nft.cloudServicePictureURI.replace("https://ipfs.io/ipfs/","")
          const cloudServiceOwner=nft.cloudServiceOwner
          console.log(cloudServicePictureURI)

          const slaIstanceId=tokenURI
          
      
      
        const insertQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
      
        INSERT DATA {
          cs:CloudConsumer_${address} rdf:type cs:CloudConsumer .
          cs:CloudConsumer_${address} cs:hasBlockchainAddress cs:Address_${address} .
          cs:Parties_${address+cloudServiceOwner} rdf:type cs:Parties .
          cs:CloudSLA_${slaIstanceId} rdf:type cs:CloudSLA .
          cs:Terms_${slaIstanceId} rdf:type cs:Terms .
          cs:ServiceDefinitionTerms_${slaIstanceId} rdf:type cs:ServiceDefinitionTerms .
          cs:TerminationTerms_${slaIstanceId} rdf:type cs:TerminationTerms .
          cs:ViolationCausing_${slaIstanceId} rdf:type cs:ViolationCausing .
          cs:SLAEnding_${slaIstanceId} rdf:type cs:SLAEnding_${slaIstanceId} .
          cs:CloudSLA_${slaIstanceId} cs:hasTerms cs:Terms_${slaIstanceId} .
          cs:CloudSLA_${slaIstanceId} cs:hasParties cs:Parties_${address+cloudServiceOwner} .
          cs:Parties_${address+cloudServiceOwner} cs:hasCloudConsumer cs:CloudConsumer_${address} .
          cs:Parties_${address+cloudServiceOwner} cs:hasCloudProvider cs:CloudProvider_${cloudServiceOwner} .
          cs:Terms_${slaIstanceId} cs:hasTTerms cs:TerminationTerms_${slaIstanceId} .
          cs:Terms_${slaIstanceId} cs:hasSDTerms cs:ServiceDefinitionTerms_${slaIstanceId} .
          cs:ServiceDefinitionTerms_${slaIstanceId} cs:hoursAvailable "${hoursToBuy}" .
          cs:ViolationCausing_${slaIstanceId} cs:isATTerms cs:TerminationTerms_${slaIstanceId}  .
          cs:SLAEnding_${slaIstanceId} cs:isATTerms cs:TerminationTerms_${slaIstanceId} .
          cs:ViolationCausing_${slaIstanceId} cs:maxViolationNumber "${maxPenalty}"  .
          cs:SLAEnding_${slaIstanceId} cs:hasDate "${slaEndingDate}" .
          cs:NFT_ERC721_${slaIstanceId} rdf:type cs:NFT-ERC-721 .
          cs:NFT_ERC721_${slaIstanceId} cs:hasCloudSLA cs:CloudSLA_${slaIstanceId}  .
          cs:NFT_ERC721_${slaIstanceId} cs:hasAddress "${NFT_ERC721_CONTRACT}"  .
          cs:NFT_ERC721_${slaIstanceId} cs:hasOwner cs:Address_${address}  .
          cs:NFT_ERC721_${slaIstanceId} cs:tokenURI "${tokenURI}"  .
          cs:NFT_ERC721_${slaIstanceId} cs:hasTokenId "${tokenId}"  .
          cs:CloudSLA_${slaIstanceId} cs:hasCloudService cs:CloudService_${cloudServicePictureURI} .
        }
        
      `;
      
      const responseUpdate=clientSPARQL.query.update(insertQuery)
      console.log(responseUpdate)
      
      
      
      }


      async function deleteFromSPARQL(tokenURI,tokenId) {

        const { cloudServiceType, cloudServicePricingModel, 
            cloudServicePrice,cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
            cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
            cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty, cloudServicePictureURI,memory, storage, 
            version,region,cpuSpeed,
            cpuCores,architecture}= nft


           
    


        //Utilizzo come id quello della picture uploadata su IPFS
        const cloudServiceID=cloudServicePictureURI.replace("https://ipfs.io/ipfs/","") 
       
    
        //
        const deleteQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
      
        DELETE DATA {
            cs:CloudService_${cloudServiceID} rdf:type cs:CloudService .
            cs:Price_${cloudServiceID} cs:currency "Eth".
            cs:Price_${cloudServiceID}  cs:value "${cloudServicePrice}".
            cs:PricingModel_${cloudServiceID}  rdf:type cs:${cloudServicePricingModel}.
            cs:PricingModel_${cloudServiceID}  rdf:type cs:PricingModel.
            cs:PricingModel_${cloudServiceID}  cs:hasPrice cs:Price_${cloudServiceID} .
            cs:CloudService_${cloudServiceID} cs:hasPricingModel cs:PricingModel_${cloudServiceID} .
            cs:CloudService_${cloudServiceID} cs:hasServiceType cs:${cloudServiceType} .
            cs:Availability_${cloudServiceID}  rdf:type cs:Availability.
            cs:ErrorRate_${cloudServiceID}  rdf:type cs:ErrorRate.
            cs:ResponseTime_${cloudServiceID}  rdf:type cs:ResponseTime.
            cs:Availability_${cloudServiceID}  cs:targetValueSLO "${cloudServiceAvailabilityTarget} ".
            cs:ErrorRate_${cloudServiceID}  cs:targetValueSLO "${cloudServiceErrorRateTarget} ".
            cs:ResponseTime_${cloudServiceID}  cs:targetValueSLO "${cloudServiceResponseTimeTarget} ".
            cs:Penalty_${cloudServiceID} rdf:type cs:Penalty .
            cs:SLO_${cloudServiceID} rdf:type cs:SLO .
            cs:SLO_${cloudServiceID} cs:hasAvailability cs:Availability_${cloudServiceID} .
            cs:SLO_${cloudServiceID} cs:hasErrorRate cs:ErrorRate_${cloudServiceID}  .
            cs:SLO_${cloudServiceID} cs:hasResponseTime cs:ResponseTime_${cloudServiceID} .
            cs:SLO_${cloudServiceID} cs:hasPenalty cs:Penalty_${cloudServiceID} .
            cs:Penalty_${cloudServiceID} cs:penaltyValueAvailability "${cloudServiceAvailabilityPenalty}" .
            cs:Penalty_${cloudServiceID} cs:penaltyValueErrorRate "${cloudServiceErrorRatePenalty}" . 
            cs:Penalty_${cloudServiceID} cs:penaltyValueResponseTime "${cloudServiceResponseTimePenalty}" .
            cs:Penalty_${cloudServiceID} cs:currency "Ether" .
            cs:VirtualAppliance_${cloudServiceID} rdf:type cs:VirtualAppliance .
            cs:ImageType_${cloudServiceID} rdf:type cs:ImageType .
            cs:CloudService_${cloudServiceID} cs:hasImage cs:ImageType_${cloudServiceID}.
            cs:CloudService_${cloudServiceID} cs:hasAppliance cs:VirtualAppliance_${cloudServiceID}.
            cs:VirtualAppliance_${cloudServiceID} cs:memory "${memory}" .
            cs:VirtualAppliance_${cloudServiceID} cs:storage "${storage}" .
            cs:VirtualAppliance_${cloudServiceID} cs:version "${version}" .
            cs:VirtualAppliance_${cloudServiceID} cs:cpuSpeed "${cpuSpeed}" .
            cs:VirtualAppliance_${cloudServiceID} cs:cpuCores "${cpuCores}" .
            cs:VirtualAppliance_${cloudServiceID} cs:architecture "${architecture.replace(/ /g, "_")}" .
            cs:VirtualAppliance_${cloudServiceID} cs:hasRegion cs:${region}.
            cs:CloudService_${cloudServiceID}  cs:hasPicture cs:Picture_${cloudServiceID} .
            cs:Picture_${cloudServiceID}  rdf:type cs:Picture .
            cs:Picture_${cloudServiceID}  cs:hasLink "${cloudServicePictureURI} " .
            cs:NFT-Badge_${cloudServiceID}  rdf:type cs:NFT-Badge .
            cs:NFT-Badge_${cloudServiceID}  cs:hasCloudService cs:CloudService_${cloudServiceID} .
            cs:NFT-Badge_${cloudServiceID}  cs:hasAddress "${NFT_BADGE_SERVICE_CONTRACT}".
            cs:NFT-Badge_${cloudServiceID}  cs:hasOwner cs:Address_${nft.cloudProviderAddress} .
            cs:NFT-Badge_${cloudServiceID}  cs:hasTokenURI "${tokenURI} ".
            cs:NFT-Badge_${cloudServiceID}  cs:hasTokenID "${tokenId} ".
        }
        
      `;
      
      const responseUpdate=clientSPARQL.query.update(deleteQuery)
      
      console.log(responseUpdate)
      
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
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.badgeServiceTokenId}</Text>
                            </Box>
                            <Box direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Name</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServiceType.replace(/_/g,' ')}</Text>
                            </Box>
                          
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Memory</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.memory} GB</Text>
                            </Box>

                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Storage</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.storage} GB</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Region</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.region}</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>CPU Speed</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cpuSpeed} GHz</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>CPU Cores</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cpuCores}</Text>
                            </Box>
                         
                            <Box  direction={"column"} alignItems={"center"} justifyContent={"center"} borderWidth={1} p={"8px"} borderRadius={"4px"}>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"}>Pricing Model</Text>
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{nft.cloudServicePricingModel}</Text>
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
                                <Text textAlign="center" verticalAlign="middle" fontSize={"small"} fontWeight={"bold"}>{NFT_BADGE_SERVICE_CONTRACT}</Text>
                            </Box>
                       
                        </SimpleGrid>
                    </Box>
                </Stack>
                
                <Stack spacing={"20px"}>
                    {contractMetadata && (
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
                    )}
                    <Box mx={2.5}>
                        <Text fontSize={"4xl"} fontWeight={"bold"}>{nft.cloudServiceType.replace(/_/g, ' ')}</Text>
                        <Link
                            href={`/profile/${nft.cloudServiceOwner}`}
                        >
                            <Flex direction={"row"} alignItems={"center"}>
                                <Avatar  src='https://bit.ly/broken-link' h={"24px"} w={"24px"} mr={"10px"}/>
                                <Text fontSize={"small"}>{nft.cloudServiceOwner.slice(0,6)}...{nft.cloudServiceOwner.slice(-4)}</Text>
                            </Flex>
                        </Link>
                    </Box>
                    
                    <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                        <Text color={"darkgray"}>Price: </Text>
                        <Skeleton isLoaded={true}>
                  
                     
                        <Text fontSize={"xl"} fontWeight={"bold"}>
                        {nft.cloudServicePrice} ETH per day </Text>
                        <Text fontSize={"md"} fontWeight={"bold"} mt={5}>
                                    This type of NFT is a Badge, it cannot be sold or transferred but you can: </Text>
                           
                        </Skeleton>
               
                    </Stack>


                    { address==nft.cloudServiceOwner ? (

                    <>

                        {deletedSuccess && 

                            <Alert  mt={2} status='success'>
                            <AlertIcon />
                            Cloud Service Badge successfully deleted!
                            </Alert>
                            }

                       
                   
                     
                     <Button 
                     onClick={handleDeleteCloudService}
                      leftIcon={<DeleteIcon />}
                      mt={2}
                      colorScheme="red"
                      borderRadius="md"
                      size='lg'
                      boxShadow="lg"
                      >
                      Delete Cloud Service
                     </Button>

                     </>
                    
                    
                   


                    ) :(


                        <>

                        {negotiateSuccess  && 

                            <Alert mt={2} status='success'>
                            <AlertIcon />
                            Cloud Service SLA successfully negotiated and created!
                            </Alert>
                            }

                        <Button 
                        onClick={handleNegotiate}
                        leftIcon={<TriangleDownIcon />}
                        mt={2}
                        colorScheme="green"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                        Negotiate & Buy this Cloud Service
                       </Button>

                       </>

                    ) }

                {showNegotiaton  && (

            
                    <>
                    <FormControl isRequired>
                    <FormLabel mt={4} >Hours to Buy</FormLabel>
                    <NumberInput min={0}  precision={0} step={1}>
                    <NumberInputField 
                    placeholder="Hours"
                    onChange={e=> updateFormNegotiation({...formNegotiation,hoursToBuy: e.target.value,totalPrice:nft.cloudServicePrice*e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </FormControl>

                    <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>Termination Terms</Text>

                    <FormControl isRequired>
                    <FormLabel mt={4} >Max Penalty in a month</FormLabel>
                    <NumberInput min={0}  precision={2} step={0.01}>
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormNegotiation({...formNegotiation,maxPenalty: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </FormControl>

                    <FormLabel  mt={4} >SLA Ending Date (optional)</FormLabel>
                    <Input 
                        type="date"
                        placeholder="Insert a date"
                        onChange={e=> updateFormNegotiation({...formNegotiation,slaEndingDate: e.target.value})}
                    />

                    </Box>

                    <Text fontSize={"xl"} fontWeight={"bold"}>
                        You have to pay {formNegotiation.totalPrice} ETH  </Text>

                        <Button 
                        onClick={handleBuyCloudService}
                        leftIcon={<AddIcon />}
                        mt={2}
                        colorScheme="green"
                        borderRadius="md"
                        size='lg'
                        boxShadow="lg"
                        >
                         Buy this Cloud Service for {formNegotiation.totalPrice} ETH
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
   const nftBadgeServiceCollection= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,provider)
   const cloudServiceOwner=await nftBadgeServiceCollection.ownerOf(tokenId)

    const tokenURI = await nftBadgeServiceCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    
    let itemCloudService={

        tokenURI:tokenURI,
        badgeServiceTokenId:tokenId,
        cloudServiceOwner:cloudServiceOwner,
        cloudServiceType: response.data.cloudServiceType,
        memory: response.data.memory,
        storage: response.data.storage,
        region: response.data.region,
        cpuSpeed: response.data.cpuSpeed,
        cpuCores: response.data.cpuCores,
        cloudServicePricingModel: response.data.cloudServicePricingModel,
        cloudServicePrice: response.data.cloudServicePrice,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudServicePictureURI,

        cloudServiceAvailabilityTarget:response.data.cloudServiceAvailabilityTarget,
        cloudServiceAvailabilityPenalty:response.data.cloudServiceAvailabilityPenalty,
        cloudServiceErrorRateTarget:response.data.cloudServiceErrorRateTarget,
        cloudServiceErrorRatePenalty:response.data.cloudServiceErrorRatePenalty,
        cloudServiceResponseTimeTarget:response.data.cloudServiceResponseTimeTarget,
        cloudServiceResponseTimePenalty:response.data.cloudServiceResponseTimePenalty,
        architecture: response.data.architecture,
        version: response.data.version,

      }
    const nft = itemCloudService
  
    let contractMetadata;
  
    try {
      contractMetadata = nftBadgeServiceCollection.address;
      
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
    const nftBadgeServiceCollection= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,provider)
  
    const tokenIds=[]
  
    const events = await nftBadgeServiceCollection.queryFilter('Transfer', 0);

    console.log(events);

   // Cicla attraverso gli ID dei token e ottieni i metadati per ciascun token
   const itemsCloudService= await Promise.all(tokenIds.map(async tokenId =>{
    const tokenURI = await nftBadgeServiceCollection.tokenURI(tokenId);
    const response = await axios.get("https://ipfs.io/ipfs/"+tokenURI);
    let itemCloudService={

        //cambiare tutto ed inserire nuove cose
        badgeServiceTokenId:tokenId,
        cloudServiceType: response.data.cloudServiceType,
        memory: response.data.memory,
        storage: response.data.storage,
        region: response.data.region,
        cpuSpeed: response.data.cpuSpeed,
        cpuCores: response.data.cpuCores,
        cloudServicePricingModel: response.data.cloudServicePricingModel,
        cloudServicePrice: response.data.cloudServicePrice,
        cloudServicePictureURI: 'https://ipfs.io/ipfs/'+response.data.cloudServicePictureURI,
        cloudServiceAvailabilityTarget:response.data.cloudServiceAvailabilityTarget,
        cloudServiceAvailabilityPenalty:response.data.cloudServiceAvailabilityPenalty,
        cloudServiceErrorRateTarget:response.data.cloudServiceErrorRateTarget,
        cloudServiceErrorRatePenalty:response.data.cloudServiceErrorRatePenalty,
        cloudServiceResponseTimeTarget:response.data.cloudServiceResponseTimeTarget,
        cloudServiceResponseTimePenalty:response.data.cloudServiceResponseTimePenalty,
        architecture: response.data.architecture,
        version: response.data.version,

      }
    return itemCloudService
}))

    const paths = itemsCloudService.map((nft) => {
      return {
        params: {
          contractAddress: NFT_BADGE_SERVICE_CONTRACT,
          tokenId: nft.badgeServiceTokenId,
        },
      };
    });
  
    return {
      paths,
      fallback: "blocking", // can also be true or 'blocking'
    };
    
  };
  