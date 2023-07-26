import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex,Select,NumberInput,NumberInputField,
NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper,Heading} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')

export default function CreateCloudServiceBadge() {

        const [cloudServicePicture, setCloudServicePicture] = useState(null);
        const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
        const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
        const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});
  
      
  
      const [formInput,updateFormInput]=useState({ cloudServiceType:'', cloudServicePricingModel:'', 
      cloudServicePrice:'',cloudServiceAvailabilityTarget:'',cloudServiceAvailabilityPenalty:'',
      cloudServiceErrorRateTarget:'',cloudServiceErrorRatePenalty:'',
      cloudServiceResponseTimeTarget:'',cloudServiceResponseTimePenalty:'',cloudServicePictureURL:''})

      const cloudProviderAddress= useAddress();
      const [cloudProviderName,setCloudProviderName]=useState(null)
  
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
  


    async function handlePictureChange(event) {
        const file=event.target.files[0]
        
        try{
            const added=await client.add(file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
                )
                const url=`https://tenacious.infura-ipfs.io/${added.path}`
                updateFormInput({...formInput,cloudServicePictureURL: url})
                setCloudServicePicture(file)
                

        } catch (e){
            console.log(e)
        }
    }

    async function createFileJSON() {
       
        const { cloudServiceType, cloudServicePricingModel, 
        cloudServicePrice,cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
        cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
        cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty, cloudServicePictureURL}= formInput
        
        if(!cloudServiceType||!cloudServicePricingModel ||!cloudServicePrice
            ||!cloudServiceAvailabilityTarget  ||!cloudServiceAvailabilityPenalty 
            ||!cloudServiceErrorRateTarget ||! cloudServiceErrorRatePenalty ||! cloudServiceResponseTimeTarget
            ||! cloudServiceResponseTimePenalty||! cloudServicePictureURL ||! cloudProviderAddress
             ) return  
             console.log("Errore, manca un campo")
    
        const data= JSON.stringify({
            cloudProviderAddress,cloudServiceType,cloudServicePricingModel,cloudServicePrice,
            cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
            cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
            cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty,
            cloudServicePictureURL
        })
        const formURI=uploadToIPFS(data)
        console.log(data+"\n"+formURI)
    
        uploadToBlockchain();
        uploadToSPARQL();
        
        
    }

    async function uploadToBlockchain() {

    }

    async function uploadToSPARQL() {

        const { cloudServiceType, cloudServicePricingModel, 
            cloudServicePrice,cloudServiceAvailabilityTarget,cloudServiceAvailabilityPenalty,
            cloudServiceErrorRateTarget,cloudServiceErrorRatePenalty,
            cloudServiceResponseTimeTarget,cloudServiceResponseTimePenalty, cloudServicePictureURL}= formInput

        //Utilizzo come id quello della picture uploadata su IPFS
        const cloudServiceID=$cloudServicePictureURL.slice(33) 
        const insertQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
      
        INSERT DATA {
            cs:CloudService_${cloudServiceID} rdf:type cs:CloudService .
            cs:Subscription_${cloudServiceID}  rdf:type cs:Subscription .
            cs:Subscription_${cloudServiceID} cs:hasPrice cs:Price_${cloudServiceID}.
            cs:Price_${cloudServiceID} cs:currency "Euro".
            cs:Price_${cloudServiceID}  cs:value "".
            cs:CloudService_${cloudServiceID} cs:hasServiceType cs:${cloudServiceType} .
            cs:CloudService_${cloudServiceID} cs:hasPricingModel cs:PricingModel_${cloudServiceID} .
            cs:PricingModel_${cloudServiceID}  rdf:type cs:${cloudServicePricingModel}.
            cs:Availability_${cloudServiceID}  rdf:type cs:Availability.
            cs:ErrorRate_${cloudServiceID}  rdf:type cs:ErrorRate.
            cs:ResponseTime_${cloudServiceID}  rdf:type cs:ResponseTime.
            cs:Availability_${cloudServiceID}  cs:targetValueSLO "${cloudServiceAvailabilityTarget} ".
            cs:ErrorRate_${cloudServiceID}  cs:targetValueSLO "${cloudServiceErrorRateTarget} ".
            cs:ResponseTime_${cloudServiceID}  cs:targetValueSLO "${cloudServiceResponseTimeTarget} ".
            cs:Penalty_${cloudServiceID} rdf:type cs:Penalty
            cs:SLO_${cloudServiceID} rdf:type cs:SLO
            cs:SLO_${cloudServiceID} cs:hasAvailability cs:Availability_${cloudServiceID}
            cs:SLO_${cloudServiceID} cs:hasErrorRate cs:ErrorRate_${cloudServiceID} 
            cs:SLO_${cloudServiceID} cs:hasResponseTime cs:ResponseTime_${cloudServiceID} 
            cs:SLO_${cloudServiceID} cs:hasPenalty cs:Penalty_${cloudServiceID}
            cs:Penalty_${cloudServiceID} cs:penaltyValueAvailability "${cloudServiceAvailabilityPenalty}"
            cs:Penalty_${cloudServiceID} cs:penaltyValueErrorRate "${cloudServiceErrorRatePenalty}"
            cs:Penalty_${cloudServiceID} cs:penaltyValueResponseTime "${cloudServiceResponseTimePenalty}"
            cs:Penalty_${cloudServiceID} cs:currency "Ether"
            

            //Implementare anche virtual Appliance
        
            cs:CloudService_${cloudServiceID}  cs:hasPicture cs:Picture_${cloudServiceID} .
            cs:Picture_${cloudServiceID}  rdf:type cs:Picture .
            cs:Picture_${cloudServiceID}  cs:hasLink "${cloudServicePictureURL} " .
            cs:CloudService_${cloudServiceID}  cs:offeredBy cs:${cloudProviderName}.
            cs:NFT-Badge_${cloudServiceID}  rdf:type cs:NFT-Badge .
            cs:NFT-Badge_${cloudServiceID}  cs:hasCloudService cs:CloudService_${cloudServiceID} .
            cs:NFT-Badge_${cloudServiceID}  cs:hasAddress "address".
            cs:NFT-Badge_${cloudServiceID}  cs:hasTokenURI "tokenURI".
          
        
      `;
      
      const streamUpdate=clientSPARQL.query.update(insertQuery)
      
      streamUpdate.on('end', () => {
        
        //Alla fine aggiorno la pagina e scrivo dati correttamente inseriti
        console.log(streamUpdate.on('data'))
      
        })
      
      
      streamUpdate.on('error', err => {
        console.error(err)
      })
      
      }
    
    

    async function checkIfCloudProvider() {


        // Query SPARQL per verificare se l'utente esiste già nel database
        const selectQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
    
        SELECT ?typeCloudActor
        WHERE {
      ?address cs:hasAddress "${cloudProviderAddress}" .
      ?cloudActor cs:hasBlockchainAddress ?address.
      ?cloudActor rdf:type cs:CloudProvider.
    }
    
        `;
    
        const stream = await clientSPARQL.query.select(selectQuery);
        let datiRicevuti=false;
        
       stream.on('data', row => {
             Object.entries(row).forEach(([key, value]) => {
              console.log(`${key}: ${value.value} (${value.termType})`)
              datiRicevuti=true;
              setCloudProviderName(value.value)
    
            })
          })
    
          stream.on('end', () => {
            
            if (!datiRicevuti) {

             // L'utente non è registrato già come cloud provider, non può creare un nuovo servizio cloud
             console.log("Utente non è Cloud Provider, non può creare nuovi servizi Cloud")
            }
            else{

                //L'utente è registrato come cloud provider, procedo con la creazione del servizio cloud

                createFileJSON()

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
        //checkIfCloudProvider()
        
  
      };




    return (
        <Flex justifyContent="center" alignItems="center" height="190vh">
          <Box w="50%" p={4} >
            <FormControl isRequired>
                <FormLabel>Cloud Service Type</FormLabel>
                    <Select 
                    placeholder='Select Cloud Service Type'
                    onChange={e=> updateFormInput({...formInput,cloudServiceType: e.target.value})}
                    >
                        <option>United Arab Emirates</option>
                        <option>Nigeria</option>
                    </Select>

                    <FormLabel mt={4}>Pricing Model</FormLabel>
                    <Select 
                    placeholder='Select Pricing Model'
                    onChange={e=> updateFormInput({...formInput,cloudServicePricingModel: e.target.value})}>
                        <option>United Arab Emirates</option>
                        <option>Nigeria</option>
                    </Select>

                    <FormLabel mt={4} >Price per Hour</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1} >
                    <NumberInputField 
                    placeholder="ETH"
                    onChange={e=> updateFormInput({...formInput,cloudServicePrice: e.target.value})} />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
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

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
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


          <FormLabel mt={4}>Choose Cloud Service Picture</FormLabel>
          <Input type="file" id="photoCS" mt={2} onChange={handlePictureChange} borderRadius="md" />
          
          {/* Al posto dell'immagine commentata */}
          {cloudServicePicture && (
            <img className="rounded mt-4" width="200" src={URL.createObjectURL(cloudServicePicture)} alt="Cloud Service" />
          )}
          
          <Button
            onClick={handleCreateCloudService}
            mt={4}
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