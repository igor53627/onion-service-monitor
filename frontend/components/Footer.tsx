import {
  Box,
  Container,
  HStack,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { SiTorbrowser } from 'react-icons/si';

export const Footer = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const linkColor = useColorModeValue('tor.purple.500', 'tor.purple.300');

  return (
    <Box
      as="footer"
      bg={bg}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
      mt={12}
      position="sticky"
      top="100vh"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8, lg: 12 }}>
        <HStack justify="center" spacing={2} flexWrap="wrap">
          <HStack spacing={2}>
            <Box as={SiTorbrowser} />
            <Text color={textColor}>Onion Service Monitor</Text>
          </HStack>
          <Text color={textColor}>•</Text>
          <Text color={textColor}>
            Powered by{' '}
            <Link
              href="https://gitlab.torproject.org/tpo/core/arti"
              isExternal
              color={linkColor}
              fontWeight="semibold"
              _hover={{ textDecoration: 'underline', color: linkColor }}
            >
              Arti
            </Link>
            {' '}(Rust Tor implementation)
          </Text>
        </HStack>
      </Container>
    </Box>
  );
};
