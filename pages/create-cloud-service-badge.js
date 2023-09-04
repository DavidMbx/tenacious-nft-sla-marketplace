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
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
      
        INSERT DATA {
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
            cs:CloudService_${cloudServiceID}  cs:offeredBy cs:${cloudProviderName}.
            cs:NFT-Badge_${cloudServiceID}  rdf:type cs:NFT-Badge .
            cs:NFT-Badge_${cloudServiceID}  cs:hasCloudService cs:CloudService_${cloudServiceID} .
            cs:NFT-Badge_${cloudServiceID}  cs:hasAddress "${NFT_BADGE_SERVICE_CONTRACT}".
            cs:NFT-Badge_${cloudServiceID}  cs:hasOwner cs:Address_${cloudProviderAddress} .
            cs:NFT-Badge_${cloudServiceID}  cs:hasTokenURI "${tokenURI} ".
            cs:NFT-Badge_${cloudServiceID}  cs:hasTokenID "${tokenId} ".
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
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
    
        SELECT ?cloudActor
        WHERE {
      ?address cs:hasAddress "${cloudProviderAddress}" .
      ?cloudActor cs:hasBlockchainAddress ?address.
      ?cloudActor rdf:type cs:CloudProvider.
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

        // Query SPARQL per verificare se l'utente esiste già nel database
        const selectQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
    
        SELECT ?serviceType
        WHERE {
      
      ?address cs:hasAddress "${cloudProviderAddress}" .
      ?cloudActor cs:hasBlockchainAddress ?address.
      ?serviceType cs:createdBy ?cloudActor.
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
        <Flex justifyContent="center" alignItems="center" height="190vh">
          <Box w="50%" p={4} >


          {registerCPSuccess && 

          <Alert status='success'>
          <AlertIcon />
            Cloud Service successfully created!
          </Alert>
            }
            <FormControl isRequired>        
                <FormLabel mt={4}>Cloud Service Type</FormLabel>
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