import {Avatar,Box,Flex,Heading,Link,Text,Image} from "@chakra-ui/react";
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
import NextLink from 'next/link';
import React, { useEffect } from 'react';
const SparqlClient = require('sparql-http-client')
import LogoTenacious from "../public/Tenacious_Logo_Completo.png";



export function Navbar(){


    const address=useAddress();
    

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});
    


    useEffect(() => {
        const checkAndInsertUser = async () => {
          if (address) {

            // Query SPARQL per verificare se l'utente esiste già nel database
            const selectQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
            
            SELECT ?user
            WHERE {
              ?user rdf:type cs:BlockchainAddress.
              ?user cs:hasAddress "${address}".
            }
            `;
    
            const stream = await clientSPARQL.query.select(selectQuery);
            let datiRicevuti=false;
            
           stream.on('data', row => {
                 Object.entries(row).forEach(([key, value]) => {
                  console.log(`${key}: ${value.value} (${value.termType})`)
                  datiRicevuti=true;

                })
              })

              stream.on('end', () => {
                
                if (!datiRicevuti) {
                 // L'utente non esiste nel database, esegui l'inserimento
              const insertQuery = `
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>
  
              INSERT DATA {
                cs:Address_${address} rdf:type cs:BlockchainAddress.
                cs:Address_${address} cs:hasAddress "${address}".
              }
            `;
  
           
            clientSPARQL.query.update(insertQuery)
                }
              });
              
              stream.on('error', err => {
                console.error(err)
              })
            

          }
        };
    
        checkAndInsertUser();
      }, [address]);
    
    
    
    return(
        <Box maxW={"1200px"} m={"auto"} py={"10px"}px={"40px"} mt={6}>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Link as={NextLink} href='/' mr={6}>
            <Image
            width='400px'
             objectFit='contain'
            src="https://imageupload.io/ib/4lWENKf8rPeKDSU_1692366943.png"
            alt='logoTenacious'
              />
            </Link>
            <Flex direction={"row"}>
                <Link as={NextLink} href='/buy' mx={2.5}>
                    <Text>Buy</Text>
                </Link>
                <Link as={NextLink} href='/sell' mx={2.5}>
                    <Text>Sell</Text> 
                </Link>
                <Link as={NextLink} href='/register-cloud-provider' mx={2.5}>
                    <Text>Register as Cloud Provider</Text> 
                </Link>
                <Link as={NextLink} href='/create-cloud-service-badge' mx={2.5}>
                    <Text>Create Cloud Service</Text> 
                </Link>
            </Flex>
            <Flex dir={"row"} alignItems={"center"}>
                <ConnectWallet/>
                { address && (

                    
                <>
                <Link as={NextLink} href={`/profile/${address}`}>
                <Avatar src='https://bit.ly/broken-link' ml={"20px"}/>
                </Link>

                {
                   
                }
                    
                </>
                  )}
            </Flex>
        </Flex>
    </Box>
    )
};