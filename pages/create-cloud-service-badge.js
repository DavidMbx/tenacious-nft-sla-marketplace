import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex,Select,NumberInput,NumberInputField,
NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper,Heading,Link,IconButton,Spacer} from '@chakra-ui/react';
import { useRouter } from 'next/router'
import NextLink from 'next/link';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress,useSigner } from "@thirdweb-dev/react";
import {ethers} from 'ethers'
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')
import { 
  NFT_BADGE_SERVICE_CONTRACT
} from "../const/addresses";
import NFT_Badge_Service from   '../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,RepeatIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'



export default function CreateCloudServiceBadge() {


  const router = useRouter()
  const signer = useSigner();


   // Stato per memorizzare le opzioni del Select
  const [options, setOptions] = useState([
    // Puoi aggiungere altre opzioni qui
  ]);
        const [cloudServicePicture, setCloudServicePicture] = useState(null);
        const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
        const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
        const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});

        const [registerCPSuccess, setRegisterCPSuccess]=useState(false)
  
      
  
      const [formInput,updateFormInput]=useState({ cloudServiceType:'', cloudServicePricingModel:'', 
      cloudServicePrice:'',cloudServiceAvailabilityTarget:'',cloudServiceAvailabilityPenalty:'',
      cloudServiceErrorRateTarget:'',cloudServiceErrorRatePenalty:'',
      cloudServiceResponseTimeTarget:'',cloudServiceResponseTimePenalty:'',cloudServicePictureURI:''})

      const[formVirtualAppliance, updateFormVirtualAppliance]=useState({ memory:'', storage:'', 
      version:'',region:'',cpuSpeed:'',
      cpuCores:'',architecture:'',
      })

      const cloudProviderAddress= useAddress();
      
  
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



    async function handlePictureChange(event) {
        const file=event.target.files[0]
        
        try{
            const added=await client.add(file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
                )
                const url=`https://tenacious.infura-ipfs.io/${added.path}`
                updateFormInput({...formInput,cloudServicePictureURI: added.path})
                setCloudServicePicture(file)
                

        } catch (e){
            console.log(e)
        }
    }

    async function createFileJSON(newName) {
       
        const { cloudServiceType, cloudServicePricingModel, 
        cloudServicePrice,cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
        cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
        cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty, cloudServicePictureURI}= formInput

        const{ memory, storage, 
          version,region,cpuSpeed,
          cpuCores,architecture,
          }=formVirtualAppliance
        
        if(!cloudServiceType||!cloudServicePricingModel ||!cloudServicePrice
            ||!cloudServiceAvailabilityTarget  ||!cloudServiceAvailabilityPenalty 
            ||!cloudServiceErrorRateTarget ||! cloudServiceErrorRatePenalty ||! cloudServiceResponseTimeTarget
            ||! cloudServiceResponseTimePenalty||! cloudServicePictureURI ||! cloudProviderAddress
            ||! memory ||! storage ||! version ||! region ||! cpuSpeed ||! cpuCores ||! architecture
             ) return  
             console.log("Errore, manca un campo")
    
        const data= JSON.stringify({
            cloudProviderAddress,cloudServiceType,memory,storage,version,region,
            cpuSpeed,cpuCores,architecture,cloudServicePricingModel,cloudServicePrice,
            cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
            cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
            cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty,
            cloudServicePictureURI
        })
        const formURI=uploadToIPFS(data)
        console.log(data+"\n"+formURI)
    
        const tokenId=await uploadToBlockchain(formURI);
        await uploadToSPARQL(newName,formURI,tokenId);
        setRegisterCPSuccess(true)
        
        
        
    }

    async function uploadToBlockchain(URI) {

        
  let contract= new ethers.Contract(NFT_BADGE_SERVICE_CONTRACT,NFT_Badge_Service.abi,signer)
  console.log(contract)
  let transaction= await contract.safeMint(cloudProviderAddress,URI)
  let tx= await transaction.wait()
  let event= tx.events[0]
  let value=event.args[2]
  let tokenId=value.toNumber()
  console.log(event)
  console.log(value)
  console.log(tokenId)
  return tokenId


    }

    async function uploadToSPARQL(cloudProviderName,tokenURI,tokenId) {

        const { cloudServiceType, cloudServicePricingModel, 
            cloudServicePrice,cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
            cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
            cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty, cloudServicePictureURI}= formInput


            const{ memory, storage, 
            version,region,cpuSpeed,
            cpuCores,architecture,
            }=formVirtualAppliance

           

        //Utilizzo come id quello della picture uploadata su IPFS
        const cloudServiceID=cloudServicePictureURI 
        console.log(formInput)
        console.log(formVirtualAppliance)
        console.log(cloudServiceID)
        console.log(cloudProviderName)
        //
        const insertQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
      
        INSERT DATA {
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
            ts:VirtualAppliance_${cloudServiceID} ts:storage "${storage}" .
            ts:VirtualAppliance_${cloudServiceID} ts:version "${version}" .
            ts:VirtualAppliance_${cloudServiceID} ts:cpuSpeed "${cpuSpeed}" .
            ts:VirtualAppliance_${cloudServiceID} ts:cpuCores "${cpuCores}" .
            ts:VirtualAppliance_${cloudServiceID} ts:architecture "${architecture.replace(/ /g, "_")}" .
            ts:VirtualAppliance_${cloudServiceID} ts:hasRegion ts:${region}.
            ts:CloudService_${cloudServiceID}  ts:hasPicture ts:Picture_${cloudServiceID} .
            ts:Picture_${cloudServiceID}  rdf:type ts:Picture .
            ts:Picture_${cloudServiceID}  ts:hasLink "${cloudServicePictureURI} " .
            ts:CloudService_${cloudServiceID}  ts:offeredBy ts:${cloudProviderName}.
            ts:NFT-Badge_${cloudServiceID}  rdf:type ts:NFT-Badge .
            ts:NFT-Badge_${cloudServiceID}  ts:hasCloudService ts:CloudService_${cloudServiceID} .
            ts:NFT-Badge_${cloudServiceID}  ts:hasAddress "${NFT_BADGE_SERVICE_CONTRACT}".
            ts:NFT-Badge_${cloudServiceID}  ts:hasOwner ts:Address_${cloudProviderAddress.replace(/ /g, "_")} .
            ts:NFT-Badge_${cloudServiceID}  ts:hasTokenURI "${tokenURI} ".
            ts:NFT-Badge_${cloudServiceID}  ts:hasTokenID "${tokenId} ".
        }
        
      `;
      
      const responseUpdate=clientSPARQL.query.update(insertQuery)
      
      console.log(responseUpdate)
      
      }
    
    

    async function checkIfCloudProvider() {


        // Query SPARQL per verificare se l'utente esiste già nel database
        const selectQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
    
        SELECT ?cloudActor
        WHERE {
      ?address ts:hasAddress "${cloudProviderAddress}" .
      ?cloudActor ts:hasBlockchainAddress ?address.
      ?cloudActor rdf:type ts:CloudProvider.
    }
    
        `;
    
        const stream = await clientSPARQL.query.select(selectQuery);
        let datiRicevuti=false;
        let newName=""

       stream.on('data', row => {
             Object.entries(row).forEach(([key, value]) => {
              console.log(`${key}: ${value.value} (${value.termType})`)
              datiRicevuti=true;
              newName=value.value.slice(value.value.indexOf('#')+1)
              
    
            })
          })
    
          stream.on('end', () => {
            
            if (!datiRicevuti) {

             // L'utente non è registrato già come cloud provider, non può creare un nuovo servizio cloud
             console.log("Utente non è Cloud Provider, non può creare nuovi servizi Cloud")
            }
            else{

                //L'utente è registrato come cloud provider, procedo con la creazione del servizio cloud

                createFileJSON(newName)

            }
    
            })
          
          
          stream.on('error', err => {
            console.error(err)
          })
    }

    const handleCreateCloudService = () => {
        // Qui puoi implementare la logica per registrare il fornitore cloud come NFT
        // Utilizza i dati inseriti dall'utente: cloudProviderName, cloudProviderMail, cloudProviderPicture
        // Puoi inviare una transazione Ethereum per creare l'NFT e salvarlo sulla blockchain
        // Ricorda di gestire anche la connessione al wallet dell'utente tramite Metamask o altro
    
        // Esempio di output dei dati per la demo
        console.log('Cloud Service Form:', formInput);
        console.log('Cloud Service Picture:', cloudServicePicture);
        console.log('Cloud Provider Address:',cloudProviderAddress)
        checkIfCloudProvider()
      
  
      };

      const reloadPage = () => {
        window.location.reload();
      };



       // Funzione per creare il vettore dei service types in base alle query sparql
       //Viene effettuata query sparql che seleziona il cloud provider a cui è associato l'indirizzo e carica i suoi servizi
      async function createOptions() {


        //Le inizializzo dapprima
        
        setOptions([]);

        // Query SPARQL per prelevare tutti i service type afferenti ad un dato utente
        const selectQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
    
        SELECT ?serviceType
        WHERE {
      
      ?address ts:hasAddress "${cloudProviderAddress}" .
      ?cloudActor ts:hasBlockchainAddress ?address.
      ?serviceType ts:createdBy ?cloudActor.
    }

    
    
        `;

    
        const stream = await clientSPARQL.query.select(selectQuery);
        let datiRicevuti=false;
        
       stream.on('data', row => {
             Object.entries(row).forEach(([key, value]) => {
              console.log(`${key}: ${value.value} (${value.termType})`)

              const newValue=value.value.slice(value.value.indexOf('#')+1)
            const newOption = {
            value: newValue,
            label: newValue
            };
            
              setOptions((prevOptions) => [...prevOptions, newOption]);
              datiRicevuti=true;
              
    
            })
          })
    
          stream.on('end', () => {
            
            if (!datiRicevuti) {

             // Non ho trovato tipi di servizi cloud afferenti all'utente
             console.log("Non ho trovato tipi di servizi cloud afferenti all'utente")
            }
            else{
              console.log("Ho trovato tipi di servizi cloud afferenti all'utente:"+options)

            }
    
            })
          
          
          stream.on('error', err => {
            console.error(err)
          })

      
    };


    



    return (
        <Flex justifyContent="center" alignItems="center" >
          <Box w="50%" p={4} >
          <Heading mt={4} size='lg' >Create new Cloud Service</Heading>
      <Text mt={1} size='md' color='grey' >Create a new cloud service NFT Badge to store in the blockchain and an entity to store in the RDF Triplestore </Text>



          {registerCPSuccess && 

          <Alert status='success'>
          <AlertIcon />
            Cloud Service successfully created!
          </Alert>
            }
            <FormControl isRequired>        
                <FormLabel mt={8}>Cloud Service Type</FormLabel>
                    <Select 
                    placeholder='Select Cloud Service Type'
                    onChange={e=> updateFormInput({...formInput,cloudServiceType: e.target.value})} >
                  {options.map((option) => (
                  <option key={option.value} value={option.value}>
                  {option.label}
                  </option>
                  ))}
                    </Select>

                  <Flex>
                    <Button
                     leftIcon={<RepeatIcon />}
                      onClick={createOptions}
                      mt={2}
                      mr={2}
                      colorScheme="teal"
                      variant='outline'
                      borderRadius="md"
                      size="sm"
                      boxShadow="lg"
                      >
                      Load your Cloud Service Types
                     </Button>

                     <Link  as={NextLink}  href='/add-new-service-type' >
                     <Button 
                      leftIcon={<AddIcon />}
                     
                      mt={2}
                      colorScheme="teal"
                      variant='outline'
                      borderRadius="md"
                      size="sm"
                      boxShadow="lg"
                      >
                      Add new Cloud Service Type
                     </Button>
                     </Link>
                   </Flex>


                   <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>Virtual Appliance</Text>

                   
                    <FormLabel mt={4} >Memory</FormLabel>
                    <NumberInput min={1} precision={0} step={1} >
                    <NumberInputField 
                    placeholder="GB"
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,memory: e.target.value})} 
                    />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <Spacer />

                    <FormLabel mt={4} >Storage</FormLabel>
                    <NumberInput min={1} precision={0} step={1} >
                    <NumberInputField 
                    placeholder="GB"
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,storage: e.target.value})} 
                    />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    

                    <FormLabel mt={4} >Version</FormLabel>
                    <NumberInput min={0} precision={1} step={0.1} >
                    <NumberInputField 
                    placeholder="1.0"
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,version: e.target.value})} 
                    />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4}>Region</FormLabel>
                    <Select 
                    placeholder='Select Region'
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,region: e.target.value})} 
                    >
                        <option>AF-North</option>
                        <option>AF-South</option>
                        <option>EU-North</option>
                        <option>EU-South</option>
                        <option>US-East</option>
                        <option>US-West</option>
                    </Select>

                    <FormLabel mt={4} >CPU Speed</FormLabel>
                    <NumberInput min={1} precision={2} step={0.01} >
                    <NumberInputField 
                    placeholder="GHz"
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,cpuSpeed: e.target.value})} 
                    />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4} >CPU Cores</FormLabel>
                    <NumberInput min={1} precision={0} step={1} >
                    <NumberInputField 
                    placeholder="Core"
                    onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,cpuCores: e.target.value})} 
                    />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4} >Architecture</FormLabel>
                    <Input
                      placeholder="Type"
                      onChange={e=> updateFormVirtualAppliance({...formVirtualAppliance,architecture: e.target.value})} 
                       borderRadius="md"
          />


                   </Box>
                  
                  

                 
                   <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>Pricing</Text>
                    <FormLabel mt={4}>Pricing Model</FormLabel>
                    <Select 
                    placeholder='Select Pricing Model'
                    onChange={e=> updateFormInput({...formInput,cloudServicePricingModel: e.target.value})}>
                        <option>PayAsYouGo</option>
                        <option>Subscription</option>
                    </Select>


                    <FormLabel mt={4} >Price per hour</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1} >
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormInput({...formInput,cloudServicePrice: e.target.value})} />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    </Box>

                    <Flex>
                    <Box mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Availability</Text>

                    
                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} max={100} precision={1} step={0.1}>
                    <NumberInputField 
                    placeholder="%"
                    onChange={e=> updateFormInput({...formInput,cloudServiceAvailabilityTarget: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4} >Penalty per Day (if target not reached)</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormInput({...formInput,cloudServiceAvailabilityPenalty: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                   
                    </Box>

                    <Box mt={5} p={5} mr={4}  borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Error Rate</Text>

                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} max={100} precision={1} step={0.1}>
                    <NumberInputField 
                    placeholder="%"
                    onChange={e=> updateFormInput({...formInput,cloudServiceErrorRateTarget: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4} >Penalty per Day (if target not reached)</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormInput({...formInput,cloudServiceErrorRatePenalty: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </Box>

                   

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Response Time</Text>
                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} precision={0} step={1}>
                    <NumberInputField 
                    placeholder="ms"
                    onChange={e=> updateFormInput({...formInput,cloudServiceResponseTimeTarget: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <FormLabel mt={4} >Penalty per Day (if target not reached)</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormInput({...formInput,cloudServiceResponseTimePenalty: e.target.value})}/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </Box>
                    </Flex>

          <FormLabel mt={4}>Choose Cloud Service Picture</FormLabel>
          <Input type="file" id="photoCS" mt={2} onChange={handlePictureChange} borderRadius="md" />
          
          {/* Al posto dell'immagine commentata */}
          {cloudServicePicture && (
            <img className="rounded mt-4" width="200" src={URL.createObjectURL(cloudServicePicture)} alt="Cloud Service" />
          )}
          
          <Button
           leftIcon={<AddIcon />}
            onClick={handleCreateCloudService}
            mt={7}
            colorScheme="green"
            borderRadius="md"
            size="lg"
            boxShadow="lg"
          >
            Create Cloud Service Badge
          </Button>

            </FormControl>
          </Box>
        </Flex>
      );



}