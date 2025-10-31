import {
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import type { FilterTag } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterTag;
  onFilterChange: (filter: FilterTag) => void;
  statusCounts: Record<string, number>;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  statusCounts,
}: FilterBarProps) => {
  const filterBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const filters: { label: string; value: FilterTag; colorScheme: string }[] = [
    { label: 'All', value: 'all', colorScheme: 'tor.purple' },
    { label: 'Online', value: 'online', colorScheme: 'green' },
    { label: 'Offline', value: 'offline', colorScheme: 'red' },
    { label: 'Unknown', value: 'unknown', colorScheme: 'gray' },
  ];

  return (
    <HStack spacing={4} mb={6} flexWrap="wrap">
      <InputGroup maxW="400px" flex="1" minW="250px">
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray" />
        </InputLeftElement>
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          bg={filterBg}
          borderColor={borderColor}
        />
      </InputGroup>
      <Wrap spacing={2}>
        {filters.map((filter) => (
          <WrapItem key={filter.value}>
            <Tag
              size="lg"
              variant={selectedFilter === filter.value ? 'solid' : 'outline'}
              colorScheme={selectedFilter === filter.value ? filter.colorScheme : 'gray'}
              cursor="pointer"
              onClick={() => onFilterChange(filter.value)}
              _hover={{ opacity: 0.8 }}
            >
              <TagLabel>
                {filter.label} ({statusCounts[filter.value] || 0})
              </TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </HStack>
  );
};
