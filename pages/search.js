import  SearchBar  from "../components/SearchBar"
import React, { useState } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NextLink from 'next/link'
import { Button, Container, Flex, Heading, Image, Stack,Text,Box,Tabs,TabList,Tab,TabPanels,TabPanel ,
  NumberInput,NumberInputField,
  NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper,Link,IconButton,FormLabel,
  Checkbox,CheckboxGroup} from '@chakra-ui/react';
  import { SearchIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
import Hero from "../components/sections/Hero";
import { useRouter } from "next/router";
import NFTGridBadgeProvider from "../components/NFT-Grid-badge-provider";
import NFT_Badge_Provider from   '../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'

import NFTGridBadgeService from "../components/NFT-Grid-badge-service";
import NFT_Badge_Service from   '../artifacts/contracts/NFT_Badge_Service.sol/NFT_Badge_Service.json'

import NFTGridERC721SLA from "../components/NFT-Grid-erc721-sla";
import NFT_ERC721 from   '../artifacts/contracts/NFT_ERC721.sol/NFT_ERC721.json'



export default function SearchPage() {

  const [tabIndex, setTabIndex] = useState(1)

  const [sliderValues, setSliderValues] = useState([20, 60]);

  const [formInputFilterService,updateFormInputFilterService]=useState({ memoryMin:'', memoryMax:'', 
  storageMin:'',storageMax:'',
  cpuSpeedMin:'',cpuSpeedMax:'',
  cpuCoresMin:'',cpuCoresMax:'',
  targetAvailabilityMin:'',targetAvailabilityMax:'',penaltyAvailabilityMin:'',penaltyAvailabilityMax:'',
  targetErrorRateMin:'',targetErrorRateMax:'',penaltyErrorRateMin:'',penaltyErrorRateMax:'',
  targetRTimeMin:'',targetRTimeMax:'',penaltyRTimeMin:'',penaltyRTimeMax:''})

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

  const [checkedItemsRegion, setCheckedItemsRegion] = useState({});
  const [checkedItemsPModel, setCheckedItemsPModel] = useState({});
  const [checkedItemsCloudProvider, setCheckedItemsCloudProvider] = useState({});

    // Gestore per gli eventi di modifica della checkbox
    const handleCheckboxRegionChange = (event) => {
      const { name, checked } = event.target;
      setCheckedItemsRegion({ ...checkedItemsRegion, [name]: checked });
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


  

  const handleTabsChange = (index) => {
    setTabIndex(index)
  }

  return (
    <Container maxW={"1200px"}>
      <Flex alignItems={"center"} justifyContent={"center"}>
      <Box w="100%" p={4} >
      <Heading mt={4} size='lg' >Search</Heading>
      <Text mt={1} md={8} size='md' color='grey' >Search in the RDF Triplestore your favourite Cloud Provider, Cloud Service to negotiate or a SLA contract already negotiated. </Text>

        <SearchBar />

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
                     isLoading={true}
                     emptyText={"No Cloud Provider found"}/>


                    </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
            <Flex>
                  <Box width={"21%"} height={"100%"} mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    
                    <Heading align={"center"} size='md' >Filter</Heading>


                    <FormLabel mt={4} >Cloud Provider</FormLabel>
                   <CheckboxGroup size='sm' colorScheme='messenger' defaultValue={['amazon', 'azure','openstack','other']}>
                  <Stack spacing={[1, 7]} direction={['column', 'row']}>
                    <Checkbox value='amazon'>Amazon</Checkbox>
                    <Checkbox value='azure'>Azure</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox value='openstack'>Openstack</Checkbox>
                    <Checkbox value='other'>Other</Checkbox>
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
                   <CheckboxGroup size='sm' colorScheme='messenger' defaultValue={['afnorth', 'afsouth','eunorth','eusouth','useast','uswest']}>
                  <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox value='afnorth'>AF-North</Checkbox>
                    <Checkbox value='afsouth'>AF-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 3]} direction={['column', 'row']}>
                    <Checkbox value='eunorth'>EU-North</Checkbox>
                    <Checkbox value='eusouth'>EU-South</Checkbox>
                    </Stack>
                    <Stack spacing={[1, 5]} direction={['column', 'row']}>
                    <Checkbox value='useast'>US-East</Checkbox>
                    <Checkbox value='uswest'>US-West</Checkbox>
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
                   <CheckboxGroup size='sm' colorScheme='messenger' defaultValue={['subscription', 'payasyougo']}>
                    <Checkbox value='subscription'>Subscription</Checkbox>
                    <Checkbox value='payasyougo'>Pay as You Go</Checkbox>
                    </CheckboxGroup>


                    <Button align={"center"} mt={8} leftIcon={<SearchIcon />} colorScheme='messenger' variant='solid'>
                      Filter
                    </Button>


                

                  </Box>
                    <Box width={"80%"}  mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Cloud Service Search Result</Heading>
                    <NFTGridBadgeService
                     isLoading={true}
                     emptyText={"No Cloud Service found"}/>


                </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
            <Flex>
                    <Box width={"20%"} height={"100%"} mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Filter</Heading>

                    <FormLabel mt={4} >Listed on Marketplace</FormLabel>
                    <Checkbox defaultChecked size='sm' colorScheme='messenger'>Yes</Checkbox>

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
                      <CheckboxGroup size='sm' colorScheme='messenger' defaultValue={['afnorth', 'afsouth','eunorth','eusouth','useast','uswest']}>
                      <Stack spacing={[1, 3]} direction={['column', 'row']}>
                      <Checkbox value='afnorth'>AF-North</Checkbox>
                      <Checkbox value='afsouth'>AF-South</Checkbox>
                      </Stack>
                      <Stack spacing={[1, 3]} direction={['column', 'row']}>
                      <Checkbox value='eunorth'>EU-North</Checkbox>
                      <Checkbox value='eusouth'>EU-South</Checkbox>
                      </Stack>
                      <Stack spacing={[1, 5]} direction={['column', 'row']}>
                      <Checkbox value='useast'>US-East</Checkbox>
                      <Checkbox value='uswest'>US-West</Checkbox>
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
                      <CheckboxGroup size='sm' colorScheme='messenger' defaultValue={['subscription', 'payasyougo']}>
                      <Checkbox value='subscription'>Subscription</Checkbox>
                      <Checkbox value='payasyougo'>Pay as You Go</Checkbox>
                      </CheckboxGroup>


                      <Button align={"center"} mt={8} leftIcon={<SearchIcon />} colorScheme='messenger' variant='solid'>
                        Filter
                      </Button>



             
                    </Box>
                    <Box width={"75%"}  mt={5} p={5} mr={4} borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Heading align={"center"} size='md' >Cloud SLA Search Result</Heading>
                    <NFTGridERC721SLA
                     isLoading={true}
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
