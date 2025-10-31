import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  useColorMode,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { SiTorbrowser } from 'react-icons/si';

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      bg={colorMode === 'dark' ? 'tor.purple.800' : 'tor.purple.600'}
      color="white"
      py={6}
      mb={8}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box fontSize="4xl">
              <SiTorbrowser />
            </Box>
            <Box>
              <Heading size="xl">Onion Service Monitor</Heading>
              <Text fontSize="md" opacity={0.9}>
                Privacy-preserving Tor hidden services directory
              </Text>
            </Box>
          </HStack>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </Flex>
      </Container>
    </Box>
  );
};
