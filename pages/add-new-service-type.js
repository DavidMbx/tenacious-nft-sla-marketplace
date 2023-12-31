import React, { useState,useEffect } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex,Select,Checkbox,Heading} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,RepeatIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'




export default function AddNewServiceType() {




        const [formInput,updateFormInput]=useState({ serviceTypeName:'', serviceCategory:''})
        const [successAddService,setSuccessAddService]=useState(false)

        const cloudProviderAddress= useAddress();
        

            // Stato per memorizzare le opzioni del Select
        const [optionsCategory, setOptionsCategory] = useState([
            // Puoi aggiungere altre opzioni qui
        ]);

        
        const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
        const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
        const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});


  async function createOptionsCategory() {


    //Le inizializzo dapprima
    
    setOptionsCategory([]);


    const selectQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>

    SELECT ?serviceCategory
WHERE {
  ?serviceCategory rdf:type/rdfs:subClassOf* ts:ServiceCategory .
}


    `;

    const stream = await clientSPARQL.query.select(selectQuery);
    let datiRicevuti=false;
    
   stream.on('data', row => {
         Object.entries(row).forEach(([key, value]) => {
          console.log(`${key}: ${value.value} (${value.termType})`)

          const newValue=value.value.slice(value.value.indexOf('#')+1,value.value.indexOf('_'))
          const newOption = {
            value: newValue,
            label: newValue
          };
          setOptionsCategory((prevOptions) => [...prevOptions, newOption]);
          datiRicevuti=true;
          

        })
      })

      stream.on('end', () => {
        
        if (!datiRicevuti) {

         // Non ho trovato categorie di servizi cloud
         console.log("Non ho trovato categorie di servizi cloud")
        }
        else{
          console.log("Ho trovato le seguenti categorie di servizi cloud:"+optionsCategory)

        }

        })
      
      
      stream.on('error', err => {
        console.error(err)
      })

  
};

async function checkCloudProviderName() {


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

            console.log("Utente è Cloud Provider, può creare nuovi servizi Cloud")
            
            //Aggiustare qui, il nome non viene aggiornato e resta null perchè il set è un operazione asincrona
            
          
            uploadToSPARQL(newName)
         
           
             
            
      

        }

        })
      
      
      stream.on('error', err => {
        console.error(err)
      })
}


async function uploadToSPARQL(cloudProviderName) {

    const { serviceCategory,serviceTypeName}= formInput
    console.log(cloudProviderName)
    console.log(serviceTypeName)



    const insertQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
  
    INSERT DATA {
        ts:${serviceTypeName.replace(/ /g, "_")} rdf:type ts:ServiceType .
        ts:${serviceTypeName.replace(/ /g, "_")} ts:offeredBy ts:${cloudProviderName} .
        ts:${serviceTypeName.replace(/ /g, "_")} ts:aKindOf ts:${serviceCategory+"_Category"} .
         }
  `;
  
  const responseUpdate=clientSPARQL.query.update(insertQuery)
  
  console.log(responseUpdate)
  setSuccessAddService(true)

  
  }

const handleAddNewServiceType= () => {
    // Qui puoi implementare la logica per registrare il fornitore cloud come NFT
    // Utilizza i dati inseriti dall'utente: cloudProviderName, cloudProviderMail, cloudProviderPicture
    // Puoi inviare una transazione Ethereum per creare l'NFT e salvarlo sulla blockchain
    // Ricorda di gestire anche la connessione al wallet dell'utente tramite Metamask o altro

    // Esempio di output dei dati per la demo
    console.log('Cloud Service Form:', formInput);
    console.log('Cloud Provider Address:',cloudProviderAddress);
    

    checkCloudProviderName()


  };

    return (
        <Flex justifyContent="center" alignItems="center" >
          <Box w="50%" p={4} >

          <Heading mt={4} size='lg' >Add new Service Type</Heading>
      <Text mt={1} size='md' color='grey' >Add a new cloud service type with name and category to RDF Triplestore, you can use this to create a new cloud service later  </Text>


          {successAddService && 

          <Alert status='success'>
          <AlertIcon />
            New Service Type successfully added!
          </Alert>
            }
            <FormControl isRequired>
        
            <FormLabel mt={8}>Cloud Service Category</FormLabel>
                    <Select 
                    placeholder='Select Cloud Service Category'
                    onChange={e=> updateFormInput({...formInput,serviceCategory: e.target.value})} >
                  {optionsCategory.map((option) => (
                  <option key={option.value} value={option.value}>
                  {option.label}
                  </option>
                  ))}
                    </Select>

                    <Button
                      onClick={createOptionsCategory}
                      leftIcon={<RepeatIcon />}
                      mt={2}
                      mr={2}
                      colorScheme="teal"
                      variant='outline'
                      borderRadius="md"
                      size="sm"
                      boxShadow="lg"
                      >
                      Load all Cloud Service Categories
                     </Button>
                     
                     <FormLabel mt={4}>Cloud Service Type Name</FormLabel>
              <Input
                placeholder="es. Amazon AWS EC2"
                onChange={e=> updateFormInput({...formInput,serviceTypeName: e.target.value})}
                borderRadius="md"
              />

    
              <Button
                onClick={handleAddNewServiceType}
                leftIcon={<AddIcon />}
                mt={6}
                colorScheme="green"
                borderRadius="md"
                size="lg"
                boxShadow="lg"
              >
               Add new Service Type
              </Button>
            </FormControl>
          </Box>
        </Flex>
      );


}