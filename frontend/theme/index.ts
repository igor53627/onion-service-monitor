import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    tor: {
      purple: {
        50: '#f5e9ff',
        100: '#e0c3ff',
        200: '#c99dff',
        300: '#b177ff',
        400: '#9a51ff',
        500: '#7d2be6',
        600: '#6221b4',
        700: '#471882',
        800: '#2d0e50',
        900: '#130420',
      },
      green: {
        50: '#e8fff5',
        100: '#c3f5de',
        200: '#9eecc7',
        300: '#77e3b0',
        400: '#50da99',
        500: '#37c180',
        600: '#279663',
        700: '#186b46',
        800: '#084128',
        900: '#00170a',
      },
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      variants: {
        tor: (props: { colorMode: string }) => ({
          bg: props.colorMode === 'dark' ? 'tor.purple.600' : 'tor.purple.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'tor.purple.500' : 'tor.purple.600',
          },
        }),
      },
    },
    Badge: {
      variants: {
        online: {
          bg: 'tor.green.500',
          color: 'white',
        },
        offline: {
          bg: 'red.500',
          color: 'white',
        },
        unknown: {
          bg: 'gray.500',
          color: 'white',
        },
      },
    },
  },
});

export default theme;
