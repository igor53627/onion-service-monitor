import { useState, useMemo } from 'react';
import {
  ChakraProvider,
  Container,
  SimpleGrid,
  Text,
  VStack,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import theme from './theme';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FilterBar } from './components/FilterBar';
import { ServiceCard } from './components/ServiceCard';
import type { OnionService, FilterTag } from './types';
import servicesData from './data/services.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterTag>('all');

  const services = servicesData as OnionService[];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'online' && service.status === 'online') ||
        (selectedFilter === 'offline' && service.status === 'offline') ||
        (selectedFilter === 'unknown' && service.status === 'unknown');

      return matchesSearch && matchesFilter;
    });
  }, [services, searchQuery, selectedFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: services.length,
      online: services.filter((s) => s.status === 'online').length,
      offline: services.filter((s) => s.status === 'offline').length,
      unknown: services.filter((s) => s.status === 'unknown').length,
    };
  }, [services]);

  const emptyBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh">
        <Header />
        <Container maxW="container.xl" pb={10}>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            statusCounts={statusCounts}
          />

          {filteredServices.length === 0 ? (
            <VStack
              spacing={4}
              py={20}
              bg={emptyBg}
              borderRadius="lg"
              borderWidth="1px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                No services found
              </Text>
              <Text color="gray.400">
                Try adjusting your search or filter criteria
              </Text>
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {filteredServices.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </SimpleGrid>
          )}
        </Container>
        <Footer />
      </Box>
    </ChakraProvider>
  );
}

export default App;
