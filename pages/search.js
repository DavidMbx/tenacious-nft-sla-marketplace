import  SearchBar  from "../components/SearchBar"
import React, { useState } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NextLink from 'next/link'
import { Button, Container, Flex, Heading, Image, Stack,Text,Box,Tabs,TabList,Tab,TabPanels,TabPanel ,
  NumberInput,NumberInputField,
  NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper,Link,IconButton,FormLabel,
  Checkbox,CheckboxGroup,InputGroup,InputLeftElement,Input,InputRightAddon} from '@chakra-ui/react';
  import { SearchIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
import Hero from "../components/sections/Hero";
import { useRouter } from "next/router";
import NFTGridBadgeProvider from "../components/NFT-Grid-badge-provider";
import NFT_Badge_Provider from   '../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'

import NFTGridBadgeService from "../components/NFT-Grid-badge-service";
import NFT_Badge_Service from   '../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'

import NFTGridERC721SLA from "../components/NFT-Grid-erc721-sla";
import NFT_ERC721 from   '../artifacts/contracts/NFT_ERC721.sol/NFT_ERC721.json'
import { Search2Icon } from "@chakra-ui/icons";
const SparqlClient = require('sparql-http-client')



export default function SearchPage() {

  const [tabIndex, setTabIndex] = useState(1)

  const [searchText, setSearchText] = useState();

  const [nftsProvider, setNftsProvider]=useState([])
  const [nftsService, setNftsService]=useState([])
  const [nftsSLA, setNftsSLA]=useState([])
  const[loadingStateProvider,setLoadingStateProvider]=useState(true)
  const[loadingStateService,setLoadingStateService]=useState(true)
  const[loadingStateSLA,setLoadingStateSLA]=useState(true)


  //console.log("Search",searchText)

  const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
  const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
  const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});

  


  const [formInputFilterService,updateFormInputFilterService]=useState({ memoryMin:'', memoryMax:'', 
  storageMin:'',storageMax:'',
  cpuSpeedMin:'',cpuSpeedMax:'',
  cpuCoresMin:'',cpuCoresMax:'',
  targetAvailabilityMin:'',targetAvailabilityMax:'',penaltyAvailabilityMin:'',penaltyAvailabilityMax:'',
  targetErrorRateMin:'',targetErrorRateMax:'',penaltyErrorRateMin:'',penaltyErrorRateMax:'',
  targetRTimeMin:'',targetRTimeMax:'',penaltyRTimeMin:'',penaltyRTimeMax:''})
  //console.log(formInputFilterService)

  const [formInputFilterSLA,updateFormInputFilterSLA]=useState({ 
  maxPenaltyMin:'',maxPenaltyMax:'',
  endingDateMin:'',endingDateMax:'',
  hoursAvailableMin:'',hoursAvailableMax:'',  
  memoryMin:'', memoryMax:'', 
  storageMin:'',storageMax:'',
  cpuSpeedMin:'',cpuSpeedMax:'',
  cpuCoresMin:'',cpuCoresMax:'',
  targetAvailabilityMin:'',targetAvailabilityMax:'',penaltyAvailabilityMin:'',penaltyAvailabilityMin:'',
  targetErrorRateMin:'',targetErrorRateMax:'',penaltyErrorRateMin:'',penaltyErrorRateMax:'',
  targetRTimeMin:'',targetRTimeMax:'',penaltyRTimeMin:'',penaltyRTimeMax:''})
  //console.log(formInputFilterSLA)

  const [checkedItemsRegion, setCheckedItemsRegion] = useState({'AF-North':false,'AF-South':false,'EU-North':false,'EU-South':false,'US-East':false,'US-West':false 
    });
  const [checkedItemsPModel, setCheckedItemsPModel] = useState({Subscription:false,PayAsYouGo:false});
  const [checkedItemsCloudProvider, setCheckedItemsCloudProvider] = useState({Amazon: false, OpenStack: false, MicrosoftAzure: false, Agnostic: false});
  const [checkedItemsListed, setCheckedItemsListed] = useState({listed:false});

  //console.log(checkedItemsRegion)
  //console.log(checkedItemsPModel)
  //console.log(checkedItemsCloudProvider)
  //console.log(checkedItemsListed)
    // Gestore per gli eventi di modifica della checkbox
    const handleCheckboxRegionChange = (event) => {
      const { name, checked } = event.target;
      setCheckedItemsRegion({ ...checkedItemsRegion, [name]: checked });
    };

    const handleCheckboxListedChange = (event) => {
      const { name, checked } = event.target;
      setCheckedItemsListed({ ...checkedItemsListed, [name]: checked });
    };


    // Gestore per gli eventi di modifica della checkbox
    const handleCheckboxPModelChange = (event) => {
      const { name, checked } = event.target;
      setCheckedItemsPModel({ ...checkedItemsPModel, [name]: checked });
    };

    const handleCheckboxCloudProviderChange = (event) => {
      const { name, checked } = event.target;
      setCheckedItemsCloudProvider({ ...checkedItemsCloudProvider, [name]: checked });
    };

    async function handleFilterCloudService() {


      setLoadingStateService(false)
     


     
             
      
  }

  async function handleFilterCloudSLA() {

    setLoadingStateSLA(false)

   
           
    
}
async function handleSearchCloudProvider() {

  setLoadingStateProvider(false)




     
             
      
}
async function handleSearchCloudService() {

  setLoadingStateService(false)




     
             
      
}

async function handleSearchCloudSLA() {


  setLoadingStateSLA(false)

  

         
  
}

async function buildSparqlQueryCloudService() {

  const {memoryMin,memoryMax,storageMin,storageMax,cpuSpeedMin,cpuSpeedMax,cpuCoresMin,cpuCoresMax,targetAvailabilityMin,
  targetAvailabilityMax,penaltyAvailabilityMin,penaltyAvailabilityMax,targetErrorRateMin,targetErrorRateMax,
  penaltyErrorRateMin,penaltyErrorRateMax,targetRTimeMin,targetRTimeMax,penaltyRTimeMin,penaltyRTimeMax}=formInputFilterService

  let baseQuery = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>

  SELECT ?uri ?tokenId WHERE {
      ?nftBadge ts:tokenURI ?uri .
      ?nftBadge ts:hasTokenId ?tokenId .
      ?nftBadge ts:hasCloudService ?cloudService .
      ?cloudService ts:hasAppliance ?virtualAppliance .

  `;
  
  let filters = [];


  //Filtro sul Provider
  if (checkedItemsCloudProvider['Amazon']==false && checkedItemsCloudProvider['MicrosoftAzure']==false && 
    checkedItemsCloudProvider['OpenStack']==false && checkedItemsCloudProvider['Agnostic']==false) {
  
    
  }
  else{
    let providerSelected = [];

    for (var key in checkedItemsCloudProvider) {
      if (checkedItemsCloudProvider.hasOwnProperty(key)) {
         if(checkedItemsCloudProvider[key]==true){
          providerSelected.push({key})
         }
      }
    }
      let providerList = providerSelected.map(p => `ts:${p}`).join(", ");
      filters.push(`    ?cloudService ts:offeredBy ?cloudProvider .
      FILTER (?cloudProvider IN (${providerList}))`);
  }

  //Filtro sulla memoria
  if (memoryMin && memoryMax) {
    filters.push(`     ?virtualAppliance ts:memory ?memory .
      FILTER (?memory >= ${parseInt(memoryMin)} && ?memory <= ${parseInt(memoryMax)})`);
      
  }

  //Filtro sullo storage
  if (storageMin && storageMax) {
    filters.push(`     ?virtualAppliance ts:size ?storage .
      FILTER (?storage >= ${parseInt(storageMin)} && ?storage <= ${parseInt(storageMax)})`);
      
  }

   //Filtro sulla location
   if (checkedItemsRegion['US-East']==false && checkedItemsRegion['US-West']==false && 
   checkedItemsRegion['EU-South']==false && checkedItemsRegion['EU-North']==false
   && checkedItemsRegion['AF-South']==false && checkedItemsRegion['AF-North']==false) {
 
   
 }
 else{
   let locationSelected = [];

   for (var key in checkedItemsRegion) {
     if (checkedItemsRegion.hasOwnProperty(key)) {
        if(checkedItemsRegion[key]==true){
          locationSelected.push({key})
        }
     }
   }
     let locationList = locationSelected.map(p => `ts:${p}`).join(", ");
     filters.push(`    ?virtualAppliance ts:hasRegion ?location .
     FILTER (?location IN (${locationList}))`);
 }

   //Filtro sullo cpuspeed
   if (cpuSpeedMin && cpuSpeedMax) {
    filters.push(`     ?virtualAppliance ts:cpuSpeed ?cpuSpeed .
      FILTER (?cpuSpeed >= ${parseInt(cpuSpeedMin)} && ?cpuSpeed <= ${parseInt(cpuSpeedMax)})`);
      
  }


   //Filtro sullo cpucores
   if (cpuCoresMin && cpuCoresMax) {
    filters.push(`     ?virtualAppliance ts:cpuCores ?cpuCores .
      FILTER (?cpuCores >= ${parseInt(cpuCoresMin)} && ?cpuCores <= ${parseInt(cpuCoresMax)})`);
      
  }

    //Filtro sul PricingModel
    if (checkedItemsPModel['Subscription']==false && checkedItemsPModel['PayAsYouGo']==false) {
  
    
  }
  else{
    let pModelSelected = [];

    for (var key in checkedItemsPModel) {
      if (checkedItemsPModel.hasOwnProperty(key)) {
         if(checkedItemsPModel[key]==true){
          pModelSelected.push({key})
         }
      }
    }
      let pModelList = pModelSelected.map(p => `ts:${p}`).join(", ");
      filters.push(`    ?cloudService ts:hasPricingModel ?pricingModel .
                        ?pricingModel rdf:type ?typeModel .
      FILTER (?cloudProvider IN (${pModelList}))`);
  }







  let filterStr = filters.join("\n");
  let completeQuery = `${baseQuery}${filterStr}\n    }}`;
  
  return completeQuery;
}

async function buildSparqlQueryCloudSLA() {

  const {memoryMin,memoryMax,storageMin,storageMax,cpuSpeedMin,cpuSpeedMax,cpuCoresMin,cpuCoresMax,targetAvailabilityMin,
  targetAvailabilityMax,penaltyAvailabilityMin,penaltyAvailabilityMax,targetErrorRateMin,targetErrorRateMax,
  penaltyErrorRateMin,penaltyErrorRateMax,targetRTimeMin,targetRTimeMax,penaltyRTimeMin,penaltyRTimeMax}=formInputFilterService

  let baseQuery = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>

  SELECT ?uri ?tokenId WHERE {
      ?nftERC721 ts:tokenURI ?uri .
      ?nftERC721 ts:hasTokenId ?tokenId .
      ?nftERC721 ts:hasCloudSLA ?cloudSLA .
      ?cloudSLA ts:hasCloudService ?cloudService .
      ?cloudService ts:hasAppliance ?virtualAppliance .

  `;
  
  let filters = [];


  //Filtro sul list del marketplace

  if(checkedItemsListed['listed']==true){

    filters.push(`    ?nftERC721 ts:onTheMarketplace "true" .`);

  }
  else{

    filters.push(`    ?nftERC721 ts:onTheMarketplace "false" .`);

  }

  //Filtro sulla MaxPenalty
  if (maxPenaltyMin && maxPenaltyMax) {
    filters.push(`      ?cloudSLA ts:hasTerms ?terms .
                        ?terms ts:hasTTerms ?violationCausing .
                        ?violationCausing ts:maxViolationNumber ?violationNumber .
      FILTER (?violationNumber >= ${parseInt(maxPenaltyMin)} && ?violationNumber <= ${parseInt(maxPenaltyMax)})`);
      
  }

   //Filtro sulla HoursAvailable
   if (hoursAvailableMin && hoursAvailableMax) {
    filters.push(`      ?cloudSLA ts:hasTerms ?terms .
                        ?terms ts:hasSDTerms ?serviceDefinitionTerms .
                        ?serviceDefinitionTerms ts:hoursAvailable ?hours .
      FILTER (?hours >= ${parseInt(hoursAvailableMin)} && ?hours <= ${parseInt(hoursAvailableMax)})`);
      
  }

  //Filtro sul Provider
  if (checkedItemsCloudProvider['Amazon']==false && checkedItemsCloudProvider['MicrosoftAzure']==false && 
    checkedItemsCloudProvider['OpenStack']==false && checkedItemsCloudProvider['Agnostic']==false) {
  
    
  }
  else{
    let providerSelected = [];

    for (var key in checkedItemsCloudProvider) {
      if (checkedItemsCloudProvider.hasOwnProperty(key)) {
         if(checkedItemsCloudProvider[key]==true){
          providerSelected.push({key})
         }
      }
    }
      let providerList = providerSelected.map(p => `ts:${p}`).join(", ");
      filters.push(`    ?cloudService ts:offeredBy ?cloudProvider .
      FILTER (?cloudProvider IN (${providerList}))`);
  }

  //Filtro sulla memoria
  if (memoryMin && memoryMax) {
    filters.push(`     ?virtualAppliance ts:memory ?memory .
      FILTER (?memory >= ${parseInt(memoryMin)} && ?memory <= ${parseInt(memoryMax)})`);
      
  }

  //Filtro sullo storage
  if (storageMin && storageMax) {
    filters.push(`     ?virtualAppliance ts:size ?storage .
      FILTER (?storage >= ${parseInt(storageMin)} && ?storage <= ${parseInt(storageMax)})`);
      
  }

   //Filtro sulla location
   if (checkedItemsRegion['US-East']==false && checkedItemsRegion['US-West']==false && 
   checkedItemsRegion['EU-South']==false && checkedItemsRegion['EU-North']==false
   && checkedItemsRegion['AF-South']==false && checkedItemsRegion['AF-North']==false) {
 
   
 }
 else{
   let locationSelected = [];

   for (var key in checkedItemsRegion) {
     if (checkedItemsRegion.hasOwnProperty(key)) {
        if(checkedItemsRegion[key]==true){
          locationSelected.push({key})
        }
     }
   }
     let locationList = locationSelected.map(p => `ts:${p}`).join(", ");
     filters.push(`    ?virtualAppliance ts:hasRegion ?location .
     FILTER (?location IN (${locationList}))`);
 }

   //Filtro sullo cpuspeed
   if (cpuSpeedMin && cpuSpeedMax) {
    filters.push(`     ?virtualAppliance ts:cpuSpeed ?cpuSpeed .
      FILTER (?cpuSpeed >= ${parseInt(cpuSpeedMin)} && ?cpuSpeed <= ${parseInt(cpuSpeedMax)})`);
      
  }


   //Filtro sullo cpucores
   if (cpuCoresMin && cpuCoresMax) {
    filters.push(`     ?virtualAppliance ts:cpuCores ?cpuCores .
      FILTER (?cpuCores >= ${parseInt(cpuCoresMin)} && ?cpuCores <= ${parseInt(cpuCoresMax)})`);
      
  }

    //Filtro sul PricingModel
    if (checkedItemsPModel['Subscription']==false && checkedItemsPModel['PayAsYouGo']==false) {
  
    
  }
  else{
    let pModelSelected = [];

    for (var key in checkedItemsPModel) {
      if (checkedItemsPModel.hasOwnProperty(key)) {
         if(checkedItemsPModel[key]==true){
          pModelSelected.push({key})
         }
      }
    }
      let pModelList = pModelSelected.map(p => `ts:${p}`).join(", ");
      filters.push(`    ?cloudService ts:hasPricingModel ?pricingModel .
                        ?pricingModel rdf:type ?typeModel .
      FILTER (?cloudProvider IN (${pModelList}))`);
  }







  let filterStr = filters.join("\n");
  let completeQuery = `${baseQuery}${filterStr}\n    }}`;
  
  return completeQuery;
}



async function searchQuerySPARQL() {


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
  
 stream.on('data', row => {
       Object.entries(row).forEach(([key, value]) => {
        console.log(`${key}: ${value.value} (${value.termType})`)
        datiRicevuti=true;

      })
    })

    stream.on('end', () => {
      
      if (!datiRicevuti) {
       // L'utente non è registrato già come cloud provider, procedo con l'inserimento
       console.log("L'indirizzo non risulta associato a nessun Cloud Provider")
       createFileJSON()
      }
      else{
        console.log("L'indirizzo risulta già associato ad un Cloud Provider")
      }

      })
    
    
    stream.on('error', err => {
      console.error(err)
    })
}




  

  const handleTabsChange = (index) => {
    setTabIndex(index)
  }

  return (
    <Container maxW={"1200px"}>
      <Flex alignItems={"center"} justifyContent={"center"}>
      <Box w="100%" p={4} >
      <Heading mt={4} size='lg' >Search</Heading>
      <Text mt={1} md={8} size='md' color='grey' >Search in the RDF Triplestore your favourite Cloud Provider, Cloud Service to negotiate or a SLA contract already negotiated. </Text>

      <InputGroup mt={10}  borderRadius={5} size="lg">
        <InputLeftElement
          pointerEvents="none"
          children={<Search2Icon color="gray.600" />}
        />
        <Input onChange={(e)=>setSearchText(e.target.value)}type="text" placeholder="Search..." border="1px solid #949494" />
        <InputRightAddon
          p={0}
          border="none"
        >


        {tabIndex==0 &&
          <Button onClick={handleSearchCloudProvider} size="lg" borderLeftRadius={0} borderRightRadius={3.3} border="1px solid #949494">
          Search
        </Button>
          
          }

          {tabIndex==1 &&
          <Button onClick={handleSearchCloudService} size="lg" borderLeftRadius={0} borderRightRadius={3.3} border="1px solid #949494">
          Search
        </Button>
          
          }
          {tabIndex==2 &&
          <Button onClick={handleSearchCloudSLA} size="lg" borderLeftRadius={0} borderRightRadius={3.3} border="1px solid #949494">
          Search
        </Button>

          }
          
        </InputRightAddon>
      </InputGroup>


        <Tabs mt={6} isFitted variant='enclosed'index={tabIndex} onChange={handleTabsChange} >
          <TabList mb='1em'>
            <Tab>Cloud Provider</Tab>
            <Tab>Cloud Service</Tab>
            <Tab>Cloud SLA</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
            <Flex>
                    <Box width={"20%"} height={"100%"} mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Filter</Heading>

                  

                    </Box>
                    <Box width={"80%"}  mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Cloud Provider Search Result</Heading>
                    <NFTGridBadgeProvider
                     data={nftsProvider}
                     isLoading={loadingStateProvider}
                     emptyText={"No Cloud Provider found"}/>


                    </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
            <Flex>
                  <Box width={"21%"} height={"100%"} mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    
                    <Heading align={"center"} size='md' >Filter</Heading>


                    <FormLabel mt={4} >Cloud Provider</FormLabel>
                   <CheckboxGroup size='sm' colorScheme='messenger' >
                  <Stack spacing={[1, 7]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["Amazon"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='Amazon'>Amazon</Checkbox>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["MicrosoftAzure"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='MicrosoftAzure'>Azure</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["OpenStack"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='OpenStack'>Openstack</Checkbox>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["Agnostic"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='Agnostic'>Other</Checkbox>
                    </Stack>
                 
                    </CheckboxGroup>

                    
                    <FormLabel mt={4} >Memory</FormLabel>
                    <Flex>
                    <NumberInput size='xs' maxW={16} min={0}>
                    <NumberInputField
                     placeholder="Min"
                     onChange={e=> updateFormInputFilterService({...formInputFilterService,memoryMin: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                   </NumberInput>

               
                    <NumberInput size='xs' ml={2} maxW={16} min={0}>
                    <NumberInputField
                     placeholder="Max"
                     onChange={e=> updateFormInputFilterService({...formInputFilterService,memoryMax: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                   </NumberInput>

                   </Flex>

                   <FormLabel mt={4} >Storage</FormLabel>
                    <Flex>
                    <NumberInput size='xs' maxW={16} min={0}>
                    <NumberInputField
                     placeholder="Min"
                     onChange={e=> updateFormInputFilterService({...formInputFilterService,storageMin: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                   </NumberInput>

               
                    <NumberInput size='xs' ml={2} maxW={16} min={0}>
                    <NumberInputField
                     placeholder="Max"
                     onChange={e=> updateFormInputFilterService({...formInputFilterService,storageMax: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                   </NumberInput>

                   </Flex>
                   
                   <FormLabel mt={4} >Region</FormLabel>
                   <CheckboxGroup size='sm' colorScheme='messenger' >
                  <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsRegion["AF-North"] || false}
                    onChange={handleCheckboxRegionChange}
                    name='AF-North'>AF-North</Checkbox>
                    <Checkbox name='AF-South'
                    isChecked={checkedItemsRegion["AF-South"] || false}
                    onChange={handleCheckboxRegionChange}>
                      AF-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                     isChecked={checkedItemsRegion["EU-North"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='EU-North'>EU-North</Checkbox>
                    <Checkbox 
                     isChecked={checkedItemsRegion["EU-South"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='EU-South'>EU-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 5]} direction={['column', 'row']}>
                    <Checkbox 
                     isChecked={checkedItemsRegion["US-East"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='US-East'>US-East</Checkbox>
                    <Checkbox 
                     isChecked={checkedItemsRegion["US-West"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='US-West'>US-West</Checkbox>
                    </Stack>
                 
                    </CheckboxGroup>


                    

                    <FormLabel mt={4} >CPU Speed</FormLabel>
                    <Flex>
                    <NumberInput size='xs' maxW={16} min={0}>
                    <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterService({...formInputFilterService,cpuSpeedMin: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                    </NumberInput>


                    <NumberInput size='xs' ml={2} maxW={16} min={0}>
                    <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterService({...formInputFilterService,cpuSpeedMax: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                    </NumberInput>

                    </Flex>



                    <FormLabel mt={4} >CPU Cores</FormLabel>
                    <Flex>
                    <NumberInput size='xs' maxW={16} min={0}>
                    <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterService({...formInputFilterService,cpuCoresMin: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                    </NumberInput>


                    <NumberInput size='xs' ml={2} maxW={16} min={0}>
                    <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterService({...formInputFilterService,cpuCoresMax: e.target.value})}  />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                    </NumberInput>

                    </Flex>


                    <FormLabel mt={4} >Pricing Model</FormLabel>
                   <CheckboxGroup size='sm' colorScheme='messenger' >
                    <Checkbox 
                     isChecked={checkedItemsPModel["Subscription"] || false}
                     onChange={handleCheckboxPModelChange}
                    name='Subscription'>Subscription</Checkbox>
                    <Checkbox 
                      isChecked={checkedItemsPModel["PayAsYouGo"] || false}
                      onChange={handleCheckboxPModelChange}
                    name='PayAsYouGo'>Pay as You Go</Checkbox>
                    </CheckboxGroup>


                    <Button align={"center"} mt={8} leftIcon={<SearchIcon />} colorScheme='messenger' variant='solid' onClick={handleFilterCloudService}>
                      Filter
                    </Button>


                

                  </Box>
                    <Box width={"80%"}  mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Cloud Service Search Result</Heading>
                    <NFTGridBadgeService
                     data={nftsService}
                     isLoading={loadingStateService}
                     emptyText={"No Cloud Service found"}/>


                </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
            <Flex>
                    <Box width={"20%"} height={"100%"} mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Filter</Heading>

                    <FormLabel mt={4} >Listed on Marketplace</FormLabel>
                    <Checkbox defaultChecked size='sm' colorScheme='messenger'
                      name="listed"
                      isChecked={checkedItemsListed["listed"] || false}
                      onChange={handleCheckboxListedChange}>Yes</Checkbox>


                    <FormLabel mt={4} >Cloud Provider</FormLabel>
                   <CheckboxGroup size='sm' colorScheme='messenger' >
                  <Stack spacing={[1, 7]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["Amazon"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='Amazon'>Amazon</Checkbox>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["MicrosoftAzure"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='MicrosoftAzure'>Azure</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["OpenStack"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='OpenStack'>Openstack</Checkbox>
                    <Checkbox 
                    isChecked={checkedItemsCloudProvider["Agnostic"] || false}
                    onChange={handleCheckboxCloudProviderChange}
                    name='Agnostic'>Other</Checkbox>
                    </Stack>
                 
                    </CheckboxGroup>


                    <FormLabel mt={4} >SLA Max Penalty</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,maxPenaltyMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,maxPenaltyMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>

                      <FormLabel mt={4} >Hours Available</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,hoursAvailableMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,hoursAvailableMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>

                      <FormLabel mt={4} >Memory</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,memoryMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,memoryMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>

                      <FormLabel mt={4} >Storage</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Min"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,storageMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                      placeholder="Max"
                      onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,storageMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>

                      <FormLabel mt={4} >Region</FormLabel>
                      <CheckboxGroup size='sm' colorScheme='messenger' >
                  <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                    isChecked={checkedItemsRegion["AF-North"] || false}
                    onChange={handleCheckboxRegionChange}
                    name='AF-North'>AF-North</Checkbox>
                    <Checkbox name='AF-South'
                    isChecked={checkedItemsRegion["AF-South"] || false}
                    onChange={handleCheckboxRegionChange}>
                      AF-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox 
                     isChecked={checkedItemsRegion["EU-North"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='EU-North'>EU-North</Checkbox>
                    <Checkbox 
                     isChecked={checkedItemsRegion["EU-South"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='EU-South'>EU-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 5]} direction={['column', 'row']}>
                    <Checkbox 
                     isChecked={checkedItemsRegion["US-East"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='US-East'>US-East</Checkbox>
                    <Checkbox 
                     isChecked={checkedItemsRegion["US-West"] || false}
                     onChange={handleCheckboxRegionChange}
                    name='US-West'>US-West</Checkbox>
                    </Stack>
                 
                    </CheckboxGroup>





                      <FormLabel mt={4} >CPU Speed</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                        placeholder="Min"
                        onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,cpuSpeedMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                        placeholder="Max"
                        onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,cpuSpeedMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>



                      <FormLabel mt={4} >CPU Cores</FormLabel>
                      <Flex>
                      <NumberInput size='xs' maxW={16} min={0}>
                      <NumberInputField
                        placeholder="Min"
                        onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,cpuCoresMin: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>


                      <NumberInput size='xs' ml={2} maxW={16} min={0}>
                      <NumberInputField
                        placeholder="Max"
                        onChange={e=> updateFormInputFilterSLA({...formInputFilterSLA,cpuCoresMax: e.target.value})}  />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                      </NumberInput>

                      </Flex>


                      <FormLabel mt={4} >Pricing Model</FormLabel>
                      <CheckboxGroup size='sm' colorScheme='messenger' >
                    <Checkbox 
                     isChecked={checkedItemsPModel["Subscription"] || false}
                     onChange={handleCheckboxPModelChange}
                    name='Subscription'>Subscription</Checkbox>
                    <Checkbox 
                      isChecked={checkedItemsPModel["PayAsYouGo"] || false}
                      onChange={handleCheckboxPModelChange}
                    name='PayAsYouGo'>Pay as You Go</Checkbox>
                    </CheckboxGroup>

                      <Button align={"center"} mt={8} leftIcon={<SearchIcon />} colorScheme='messenger' variant='solid' onClick={handleFilterCloudSLA}>
                        Filter
                      </Button>



             
                    </Box>
                    <Box width={"75%"}  mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Cloud SLA Search Result</Heading>
                    <NFTGridERC721SLA
                     data={nftsSLA}
                     isLoading={loadingStateSLA}
                     emptyText={"No Cloud SLA found"}/>


                    </Box>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      
      </Box>
      </Flex>
    </Container>
  );
}
