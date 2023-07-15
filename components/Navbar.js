import {Avatar,Box,Flex,Heading,Link,Text} from "@chakra-ui/react";
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
import NextLink from 'next/link';
import React, { useEffect } from 'react';
const SparqlClient = require('sparql-http-client')







export function Navbar(){


    const address=useAddress();

    const endpointUrl = 'http://18.188.159.193:3030/CSOntology/sparql'; 
    const updateUrl = 'http://18.188.159.193:3030/CSOntology/update'; 
    const client = new SparqlClient({ endpointUrl ,updateUrl});
    


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
    
            const stream = await client.query.select(selectQuery);
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
                cs:Address_${address.slice(0,6)} rdf:type cs:BlockchainAddress.
                cs:Address_${address.slice(0,6)} cs:hasAddress "${address}".
              }
            `;
  
           
            client.query.update(insertQuery)
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
        <Box maxW={"1200px"} m={"auto"} py={"10px"}px={"40px"}>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Link as={NextLink} href='/'>
                <Heading>Tenacious NFT SLA Marketplace</Heading>
            </Link>
            <Flex direction={"row"}>
                <Link as={NextLink} href='/buy' mx={2.5}>
                    <Text>Buy</Text>
                </Link>
                <Link as={NextLink} href='/sell' mx={2.5}>
                    <Text>Sell</Text> 
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