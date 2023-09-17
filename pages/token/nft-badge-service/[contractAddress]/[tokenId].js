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
          ts:SLAEnding_${slaIstanceId} rdf:type ts:SLAEnding .
          ts:CloudSLA_${slaIstanceId} ts:hasTerms ts:Terms_${slaIstanceId} .
          ts:CloudSLA_${slaIstanceId} ts:hasParties ts:Parties_${address+cloudServiceOwner} .
          ts:CloudSLA_${slaIstanceId} ts:hasPicture ts:Picture_${cloudServicePictureURI} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudConsumer ts:CloudConsumer_${address} .
          ts:Parties_${address+cloudServiceOwner} ts:hasCloudProvider ts:CloudProvider_${cloudServiceOwner} .
          ts:Terms_${slaIstanceId} ts:hasSDTerms ts:ServiceDefinitionTerms_${slaIstanceId} .
          ts:ServiceDefinitionTerms_${slaIstanceId} ts:hoursAvailable "${hoursToBuy}" .
          ts:Terms_${slaIstanceId} ts:hasTTerms ts:ViolationCausing_${slaIstanceId} .
          ts:Terms_${slaIstanceId} ts:hasTTerms ts:SLAEnding_${slaIstanceId} .
          ts:ViolationCausing_${slaIstanceId} ts:maxViolationNumber "${maxPenalty}"  .
          ts:SLAEnding_${slaIstanceId} ts:hasDate "${slaEndingDate}" .
          ts:NFT_ERC721_${slaIstanceId} rdf:type ts:NFT-ERC-721 .
          ts:NFT_ERC721_${slaIstanceId} ts:hasCloudSLA ts:CloudSLA_${slaIstanceId}  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasAddress "${NFT_ERC721_CONTRACT}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasOwner ts:Address_${address}  .
          ts:NFT_ERC721_${slaIstanceId} ts:tokenURI "${tokenURI}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:hasTokenID "${tokenId}"  .
          ts:NFT_ERC721_${slaIstanceId} ts:onTheMarketplace "false"  .
          ts:CloudSLA_${slaIstanceId} ts:hasCloudService ts:CloudService_${cloudServicePictureURI} .
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
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
      
        DELETE DATA {
            ts:CloudService_${cloudServiceID} rdf:type ts:CloudService .
            ts:Price_${cloudServiceID} rdf:type ts:Price.
            ts:Price_${cloudServiceID} ts:currency "Eth".
            ts:Price_${cloudServiceID}  ts:value "${cloudServicePrice}".
            ts:PricingModel_${cloudServiceID}  rdf:type ts:${cloudServicePricingModel}.
            ts:PricingModel_${cloudServiceID}  rdf:type ts:PricingModel.
            ts:CloudService_${cloudServiceID}  ts:hasPrice ts:Price_${cloudServiceID} .
            ts:CloudService_${cloudServiceID} ts:hasPricingModel ts:PricingModel_${cloudServiceID} .
            ts:CloudService_${cloudServiceID} ts:hasServiceType ts:${cloudServiceType} .
            ts:Availability_${cloudServiceID}  rdf:type ts:Availability.
            ts:ErrorRate_${cloudServiceID}  rdf:type ts:ErrorRate.
            ts:ResponseTime_${cloudServiceID}  rdf:type ts:ResponseTime.
            ts:Availability_${cloudServiceID}  ts:targetValueSLO "${cloudServiceAvailabilityTarget}".
            ts:ErrorRate_${cloudServiceID}  ts:targetValueSLO "${cloudServiceErrorRateTarget}".
            ts:ResponseTime_${cloudServiceID}  ts:targetValueSLO "${cloudServiceResponseTimeTarget}".
            ts:Penalty_Availability_${cloudServiceID} rdf:type ts:Penalty .
            ts:Penalty_ErrorRate_${cloudServiceID} rdf:type ts:Penalty .
            ts:Penalty_ResponseTime_${cloudServiceID} rdf:type ts:Penalty .
            ts:SLO_${cloudServiceID} rdf:type ts:SLO .
            ts:Availability_${cloudServiceID}  ts:hasPenalty ts:Penalty_Availability_${cloudServiceID}.
            ts:ErrorRate_${cloudServiceID}  ts:hasPenalty ts:Penalty_ErrorRate_${cloudServiceID}.
            ts:ResponseTime_${cloudServiceID}  ts:hasPenalty ts:Penalty_ResponseTime_${cloudServiceID}.
            ts:Price_PenaltyAvailability_${cloudServiceID} rdf:type ts:Price.
            ts:Price_PenaltyAvailability_${cloudServiceID} ts:currency "Eth".
            ts:Price_PenaltyAvailability_${cloudServiceID}  ts:value "${cloudServiceAvailabilityPenalty}".
            ts:Price_PenaltyErrorRate_${cloudServiceID} rdf:type ts:Price.
            ts:Price_PenaltyErrorRate_${cloudServiceID} ts:currency "Eth".
            ts:Price_PenaltyErrorRate_${cloudServiceID}   ts:value "${cloudServiceErrorRatePenalty}".
            ts:Price_PenaltyResponseTime_${cloudServiceID} rdf:type ts:Price.
            ts:Price_PenaltyResponseTime_${cloudServiceID} ts:currency "Eth".
            ts:Price_PenaltyResponseTime_${cloudServiceID}  ts:value "${cloudServiceResponseTimePenalty}".
            ts:Penalty_Availability_${cloudServiceID} ts:hasPrice ts:Price_PenaltyAvailability_${cloudServiceID} .
            ts:Penalty_ErrorRate_${cloudServiceID} ts:hasPrice  ts:Price_PenaltyErrorRate_${cloudServiceID}  .
            ts:Penalty_ResponseTime_${cloudServiceID} ts:hasPrice  ts:Price_PenaltyResponseTime_${cloudServiceID}.
            ts:VirtualAppliance_${cloudServiceID} rdf:type ts:VirtualAppliance .
            ts:ImageType_${cloudServiceID} rdf:type ts:ImageType .
            ts:CloudService_${cloudServiceID} ts:hasImage ts:ImageType_${cloudServiceID}.
            ts:CloudService_${cloudServiceID} ts:hasAppliance ts:VirtualAppliance_${cloudServiceID}.
            ts:VirtualAppliance_${cloudServiceID} ts:memory "${memory}" .
            ts:VirtualAppliance_${cloudServiceID} ts:size "${storage}" .
            ts:VirtualAppliance_${cloudServiceID} ts:version "${version}" .
            ts:VirtualAppliance_${cloudServiceID} ts:cpuSpeed "${cpuSpeed}" .
            ts:VirtualAppliance_${cloudServiceID} ts:cpuCores "${cpuCores}" .
            ts:VirtualAppliance_${cloudServiceID} ts:architecture "${architecture.replace(/ /g, "_")}" .
            ts:VirtualAppliance_${cloudServiceID} ts:hasRegion ts:${region}.
            ts:CloudService_${cloudServiceID}  ts:hasPicture ts:Picture_${cloudServiceID} .
            ts:Picture_${cloudServiceID}  rdf:type ts:Picture .
            ts:Picture_${cloudServiceID}  ts:hasLink "${cloudServiceID} " .
            ts:NFT-Badge_${cloudServiceID}  rdf:type ts:NFT-Badge .
            ts:NFT-Badge_${cloudServiceID}  ts:hasCloudService ts:CloudService_${cloudServiceID} .
            ts:NFT-Badge_${cloudServiceID}  ts:hasAddress "${NFT_BADGE_SERVICE_CONTRACT}".
            ts:NFT-Badge_${cloudServiceID}  ts:hasOwner ts:Address_${cloudProviderAddress.replace(/ /g, "_")} .
            ts:NFT-Badge_${cloudServiceID}  ts:hasTokenURI "${tokenURI} ".
            ts:NFT-Badge_${cloudServiceID}  ts:hasTokenID "${tokenId} ".
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
                                <Avatar   h={"24px"} w={"24px"} mr={"10px"}/>
                                <Text fontSize={"small"}>{nft.cloudServiceOwner.slice(0,6)}...{nft.cloudServiceOwner.slice(-4)}</Text>
                            </Flex>
                        </Link>
                    </Box>
                    
                    <Stack backgroundColor={"#EEE"} p={2.5} borderRadius={"6px"}>
                        <Text color={"darkgray"}>Price: </Text>
                        <Skeleton isLoaded={true}>
                  
                     
                        <Text fontSize={"xl"} fontWeight={"bold"}>
                        {nft.cloudServicePrice} ETH per hour </Text>
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
  