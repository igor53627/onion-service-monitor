import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Badge,
  useColorModeValue,
  useToast,
  Link,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaCopy, FaGithub, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import type { OnionService } from '../types';

interface ServiceCardProps {
  service: OnionService;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  const getStatusColor = (status: string): string => {
    if (status === 'online') return 'green';
    if (status === 'offline') return 'red';
    if (status.startsWith('error-')) return 'orange';
    return 'gray';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'online') return 'Online';
    if (status === 'offline') return 'Offline';
    if (status.startsWith('error-')) return `Error ${status.replace('error-', '')}`;
    return 'Unknown';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(service.onion_address);
      toast({
        title: 'Copied!',
        description: 'Onion address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const formatLastChecked = (lastChecked: string | null): string => {
    if (!lastChecked) return 'Never';
    const date = new Date(lastChecked);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={1} flex="1">
            <HStack>
              <Heading size="md">{service.title}</Heading>
              <Badge colorScheme={getStatusColor(service.status)} fontSize="sm">
                {getStatusLabel(service.status)}
              </Badge>
            </HStack>
            {service.category && (
              <Text fontSize="sm" color="gray.500">
                {service.category}
              </Text>
            )}
          </VStack>
        </Flex>

        {service.description && (
          <Text fontSize="sm" color={descriptionColor}>
            {service.description}
          </Text>
        )}

        <Box
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={3}
          borderRadius="md"
          fontSize="sm"
          fontFamily="mono"
          wordBreak="break-all"
        >
          {service.onion_address}
        </Box>

        {service.tags && service.tags.length > 0 && (
          <Wrap spacing={2}>
            {service.tags.map((tag) => (
              <WrapItem key={tag}>
                <Badge colorScheme="purple" variant="subtle">
                  {tag}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        )}

        <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack spacing={2} fontSize="sm" color="gray.500">
            <FaClock />
            <Text>{formatLastChecked(service.last_checked)}</Text>
          </HStack>

          <HStack spacing={2}>
            {service.official_website && (
              <Link href={service.official_website} isExternal>
                <Button size="sm" leftIcon={<FaExternalLinkAlt />} variant="ghost">
                  Website
                </Button>
              </Link>
            )}
            {service.github && (
              <Link href={service.github} isExternal>
                <Button size="sm" leftIcon={<FaGithub />} variant="ghost">
                  GitHub
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              leftIcon={<FaCopy />}
              onClick={copyToClipboard}
              colorScheme="tor.purple"
            >
              Copy
            </Button>
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};
