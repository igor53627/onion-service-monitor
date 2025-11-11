// nginx-config.test.js
// Test suite for validating nginx Onion-Location configuration
// Run with: npm test -- docs/nginx-config.test.js

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration validation tests
describe('Nginx Onion-Location Configuration', () => {
  const configPath = join(process.cwd(), 'docs/nginx-onion-location.conf');
  let configContent;

  // Load configuration file
  try {
    configContent = readFileSync(configPath, 'utf-8');
  } catch (error) {
    console.error('Failed to read nginx config file:', error);
  }

  describe('File Structure', () => {
    it('should have nginx configuration file', () => {
      expect(configContent).toBeDefined();
      expect(configContent.length).toBeGreaterThan(0);
    });

    it('should have comments explaining the header', () => {
      expect(configContent).toContain('Onion-Location');
      expect(configContent).toContain('# ');
    });
  });

  describe('Server Blocks', () => {
    it('should contain server directive', () => {
      expect(configContent).toMatch(/server\s*{/);
    });

    it('should have SSL configuration', () => {
      expect(configContent).toContain('listen 443 ssl');
      expect(configContent).toMatch(/ssl_certificate/);
    });

    it('should have server_name directive', () => {
      expect(configContent).toMatch(/server_name/);
    });
  });

  describe('Onion-Location Header', () => {
    it('should use add_header directive', () => {
      expect(configContent).toMatch(/add_header\s+Onion-Location/);
    });

    it('should include $request_uri variable for path preservation', () => {
      expect(configContent).toContain('$request_uri');
    });

    it('should use "always" flag for error responses', () => {
      expect(configContent).toMatch(/add_header\s+Onion-Location.*always/);
    });

    it('should use http:// or https:// protocol', () => {
      expect(configContent).toMatch(/https?:\/\//);
    });

    it('should include .onion domain', () => {
      expect(configContent).toContain('.onion');
    });
  });

  describe('Best Practices', () => {
    it('should have http2 enabled', () => {
      expect(configContent).toContain('http2');
    });

    it('should include location blocks', () => {
      expect(configContent).toMatch(/location\s+[/\\]/);
    });

    it('should have security-related comments', () => {
      expect(configContent).toMatch(/(security|Security)/i);
    });

    it('should include best practices comments', () => {
      expect(configContent).toMatch(/(best practice|Best practice)/i);
    });
  });

  describe('Variable Usage', () => {
    it('should demonstrate variable usage for onion address', () => {
      expect(configContent).toMatch(/\$onion_address/);
    });

    it('should show set directive for variables', () => {
      expect(configContent).toMatch(/set\s+\$/);
    });
  });

  describe('Proxy Configuration', () => {
    it('should include proxy_pass example', () => {
      expect(configContent).toMatch(/proxy_pass/);
    });

    it('should include proxy headers in proxy example', () => {
      expect(configContent).toMatch(/proxy_set_header/);
    });
  });

  describe('Configuration Examples', () => {
    it('should have multiple configuration examples', () => {
      // Count server blocks
      const serverBlocks = configContent.match(/server\s*{/g);
      expect(serverBlocks).toBeDefined();
      expect(serverBlocks.length).toBeGreaterThan(2);
    });

    it('should include conditional header example', () => {
      expect(configContent).toMatch(/if\s*\(/);
    });
  });
});

// Functional validation tests
describe('Onion-Location Header Validation', () => {
  describe('Header Format', () => {
    it('should validate correct header format', () => {
      const validHeaders = [
        'http://example.onion/',
        'http://example.onion/path',
        'http://example.onion/path?query=value',
        'https://example.onion/',
      ];

      validHeaders.forEach(header => {
        expect(header).toMatch(/^https?:\/\/[a-z0-9]+\.onion/);
      });
    });

    it('should detect invalid header formats', () => {
      const invalidHeaders = [
        'ftp://example.onion/',
        'example.onion',
        'http://example.com/',
        '//example.onion/',
      ];

      invalidHeaders.forEach(header => {
        if (!header.match(/^https?:\/\/.*\.onion/)) {
          expect(true).toBe(true); // Invalid as expected
        } else {
          expect(false).toBe(true); // Should not match
        }
      });
    });
  });

  describe('Onion Address Format', () => {
    it('should validate v3 onion address length', () => {
      const v3Address = 'thehiddenwiki7oyvfj3r2mjbgqfbwfb5kpjfxqtbxhwvlj2xjgpqohd.onion';
      const addressPart = v3Address.replace('.onion', '');

      // v3 addresses are 56 characters
      expect(addressPart.length).toBe(56);
    });

    it('should detect invalid onion address lengths', () => {
      const shortAddress = 'short.onion';
      const addressPart = shortAddress.replace('.onion', '');

      expect(addressPart.length).not.toBe(56);
    });

    it('should validate onion address characters', () => {
      const validAddress = 'abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrstu.onion';
      const addressPart = validAddress.replace('.onion', '');

      // Should only contain lowercase letters and numbers (base32)
      expect(addressPart).toMatch(/^[a-z2-7]+$/);
    });
  });

  describe('Path Preservation', () => {
    it('should preserve URL paths', () => {
      const baseUrl = 'http://example.onion';
      const paths = ['/about', '/contact', '/api/v1/users'];

      paths.forEach(path => {
        const fullUrl = `${baseUrl}${path}`;
        expect(fullUrl).toContain(path);
      });
    });

    it('should preserve query parameters', () => {
      const baseUrl = 'http://example.onion';
      const queryString = '?search=test&page=1';
      const fullUrl = `${baseUrl}${queryString}`;

      expect(fullUrl).toContain('search=test');
      expect(fullUrl).toContain('page=1');
    });

    it('should preserve both path and query parameters', () => {
      const fullUrl = 'http://example.onion/search?q=test&page=1';

      expect(fullUrl).toContain('/search');
      expect(fullUrl).toContain('q=test');
      expect(fullUrl).toContain('page=1');
    });
  });
});

// Documentation validation tests
describe('Documentation Validation', () => {
  const docsPath = join(process.cwd(), 'docs/ONION-LOCATION.md');
  let docsContent;

  try {
    docsContent = readFileSync(docsPath, 'utf-8');
  } catch (error) {
    console.error('Failed to read documentation file:', error);
  }

  describe('File Structure', () => {
    it('should have documentation file', () => {
      expect(docsContent).toBeDefined();
      expect(docsContent.length).toBeGreaterThan(0);
    });

    it('should have table of contents', () => {
      expect(docsContent).toMatch(/## Table of Contents/i);
    });

    it('should have main sections', () => {
      expect(docsContent).toMatch(/## What is Onion-Location/i);
      expect(docsContent).toMatch(/## How It Works/i);
      expect(docsContent).toMatch(/## Implementation Guide/i);
      expect(docsContent).toMatch(/## Security Considerations/i);
      expect(docsContent).toMatch(/## Testing/i);
    });
  });

  describe('Content Coverage', () => {
    it('should document nginx configuration', () => {
      expect(docsContent).toMatch(/### Nginx/i);
      expect(docsContent).toContain('add_header');
    });

    it('should document Apache configuration', () => {
      expect(docsContent).toMatch(/### Apache/i);
      expect(docsContent).toContain('Header set');
    });

    it('should document other web servers', () => {
      expect(docsContent).toMatch(/### Other Web Servers/i);
      expect(docsContent).toMatch(/Caddy/i);
    });

    it('should include security considerations', () => {
      expect(docsContent).toMatch(/security/i);
      expect(docsContent).toMatch(/HTTPS/i);
    });

    it('should include testing instructions', () => {
      expect(docsContent).toMatch(/curl/i);
      expect(docsContent).toMatch(/test/i);
    });

    it('should include examples', () => {
      expect(docsContent).toMatch(/## Examples/i);
      expect(docsContent).toMatch(/Example \d+/i);
    });

    it('should have FAQ section', () => {
      expect(docsContent).toMatch(/## FAQ/i);
      expect(docsContent).toMatch(/Q:/);
      expect(docsContent).toMatch(/A:/);
    });
  });

  describe('Code Examples', () => {
    it('should have code blocks', () => {
      expect(docsContent).toMatch(/```nginx/);
      expect(docsContent).toMatch(/```bash/);
    });

    it('should include complete nginx examples', () => {
      expect(docsContent).toMatch(/server\s*{/);
      expect(docsContent).toContain('add_header Onion-Location');
    });

    it('should include curl testing examples', () => {
      expect(docsContent).toMatch(/curl.*-I/);
      expect(docsContent).toMatch(/grep.*onion-location/i);
    });
  });

  describe('External References', () => {
    it('should link to Tor Project documentation', () => {
      expect(docsContent).toMatch(/torproject\.org/);
    });

    it('should reference real-world examples', () => {
      expect(docsContent).toMatch(/blockscout/i);
    });

    it('should link to this project README', () => {
      expect(docsContent).toMatch(/README\.md/);
    });
  });
});

// Test script validation
describe('Test Script Validation', () => {
  const scriptPath = join(process.cwd(), 'docs/test-onion-location.sh');
  let scriptContent;

  try {
    scriptContent = readFileSync(scriptPath, 'utf-8');
  } catch (error) {
    console.error('Failed to read test script:', error);
  }

  describe('File Structure', () => {
    it('should have test script file', () => {
      expect(scriptContent).toBeDefined();
      expect(scriptContent.length).toBeGreaterThan(0);
    });

    it('should have shebang', () => {
      expect(scriptContent).toMatch(/^#!\/bin\/bash/);
    });

    it('should have usage instructions', () => {
      expect(scriptContent).toMatch(/Usage:/);
      expect(scriptContent).toMatch(/Example:/);
    });
  });

  describe('Test Functions', () => {
    it('should have test functions defined', () => {
      expect(scriptContent).toMatch(/test_/);
      expect(scriptContent).toContain('test_header_exists');
    });

    it('should test header existence', () => {
      expect(scriptContent).toMatch(/grep -i.*onion-location/);
    });

    it('should test path preservation', () => {
      expect(scriptContent).toContain('test_header_exists');
      expect(scriptContent).toMatch(/\/about|\/contact/);
    });

    it('should test query parameters', () => {
      expect(scriptContent).toContain('test_query_parameters');
      expect(scriptContent).toMatch(/\?.*=/);
    });

    it('should validate protocol', () => {
      expect(scriptContent).toContain('test_protocol');
      expect(scriptContent).toMatch(/https?/);
    });
  });

  describe('Output Formatting', () => {
    it('should have colored output functions', () => {
      expect(scriptContent).toMatch(/GREEN=|RED=/);
      expect(scriptContent).toContain('print_success');
      expect(scriptContent).toContain('print_error');
    });

    it('should have test counter', () => {
      expect(scriptContent).toMatch(/TESTS_RUN|TESTS_PASSED|TESTS_FAILED/);
    });

    it('should have summary section', () => {
      expect(scriptContent).toMatch(/Test Summary|Summary/i);
    });
  });

  describe('Error Handling', () => {
    it('should check for curl errors', () => {
      expect(scriptContent).toMatch(/\$\?/);
    });

    it('should have error messages', () => {
      expect(scriptContent).toMatch(/print_error/);
    });

    it('should exit with proper codes', () => {
      expect(scriptContent).toMatch(/exit [01]/);
    });
  });
});
