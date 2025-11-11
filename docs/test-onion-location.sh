#!/bin/bash
# test-onion-location.sh
# Test script for validating Onion-Location header configuration
#
# Usage: ./test-onion-location.sh <domain> <expected-onion-address>
# Example: ./test-onion-location.sh https://example.com your-onion-address.onion

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-https://example.com}"
EXPECTED_ONION="${2:-your-onion-address.onion}"
VERBOSE="${3:-false}"

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo "=================================================="
    echo "$1"
    echo "=================================================="
}

test_header_exists() {
    ((TESTS_RUN++))
    local url="$1"
    local path="$2"
    local full_url="$url$path"

    if [ "$VERBOSE" = true ]; then
        print_info "Testing: $full_url"
    fi

    # Fetch headers
    RESPONSE=$(curl -s -I -L "$full_url" 2>&1)

    # Check if curl succeeded
    if [ $? -ne 0 ]; then
        print_error "Failed to fetch $full_url"
        return 1
    fi

    # Extract Onion-Location header
    HEADER=$(echo "$RESPONSE" | grep -i "onion-location:" | head -1)

    if [ -z "$HEADER" ]; then
        print_error "No Onion-Location header found at $path"
        if [ "$VERBOSE" = true ]; then
            echo "Response headers:"
            echo "$RESPONSE"
        fi
        return 1
    fi

    # Extract onion address from header
    ONION_URL=$(echo "$HEADER" | sed 's/.*: //' | tr -d '\r')

    if [ "$VERBOSE" = true ]; then
        print_info "Found header: $ONION_URL"
    fi

    # Check if expected onion address is in the header
    if [[ "$ONION_URL" != *"$EXPECTED_ONION"* ]]; then
        print_error "Onion address mismatch at $path"
        print_info "Expected: $EXPECTED_ONION"
        print_info "Found: $ONION_URL"
        return 1
    fi

    # Check if path is preserved
    if [ "$path" != "/" ]; then
        if [[ "$ONION_URL" != *"$path"* ]]; then
            print_error "Path not preserved in header at $path"
            print_info "Expected path: $path"
            print_info "Header: $ONION_URL"
            return 1
        fi
    fi

    print_success "Header correct at $path"
    return 0
}

test_query_parameters() {
    ((TESTS_RUN++))
    local url="$1"
    local path="/search?q=test&page=1"
    local full_url="$url$path"

    if [ "$VERBOSE" = true ]; then
        print_info "Testing query parameters: $full_url"
    fi

    RESPONSE=$(curl -s -I -L "$full_url" 2>&1)

    if [ $? -ne 0 ]; then
        print_error "Failed to fetch $full_url"
        return 1
    fi

    HEADER=$(echo "$RESPONSE" | grep -i "onion-location:" | head -1)

    if [ -z "$HEADER" ]; then
        print_error "No Onion-Location header found with query parameters"
        return 1
    fi

    ONION_URL=$(echo "$HEADER" | sed 's/.*: //' | tr -d '\r')

    # Check if query parameters are preserved
    if [[ "$ONION_URL" != *"q=test"* ]] || [[ "$ONION_URL" != *"page=1"* ]]; then
        print_error "Query parameters not preserved"
        print_info "Expected: ...q=test&page=1"
        print_info "Found: $ONION_URL"
        return 1
    fi

    print_success "Query parameters preserved correctly"
    return 0
}

test_protocol() {
    ((TESTS_RUN++))
    local url="$1"

    RESPONSE=$(curl -s -I -L "$url" 2>&1)
    HEADER=$(echo "$RESPONSE" | grep -i "onion-location:" | head -1)
    ONION_URL=$(echo "$HEADER" | sed 's/.*: //' | tr -d '\r')

    # Check protocol (should be http:// or https://)
    if [[ "$ONION_URL" =~ ^https?:// ]]; then
        print_success "Valid protocol detected in Onion-Location"
        if [[ "$ONION_URL" =~ ^https:// ]]; then
            print_info "Using HTTPS for .onion (requires valid certificate)"
        else
            print_info "Using HTTP for .onion (recommended)"
        fi
        return 0
    else
        print_error "Invalid protocol in Onion-Location header"
        print_info "Found: $ONION_URL"
        return 1
    fi
}

test_onion_format() {
    ((TESTS_RUN++))

    # v3 onion addresses are 56 characters + .onion
    local expected_length=56
    local actual_length=${#EXPECTED_ONION}
    actual_length=$((actual_length - 6)) # Remove .onion

    if [ "$actual_length" -eq "$expected_length" ]; then
        print_success "Onion address format is valid (v3)"
    else
        print_error "Onion address may not be valid v3 format"
        print_info "Expected length: 56 characters (+ .onion)"
        print_info "Actual length: $actual_length characters"
        return 1
    fi
}

# Main test execution
main() {
    print_header "Onion-Location Header Validation"

    echo "Domain: $DOMAIN"
    echo "Expected Onion: $EXPECTED_ONION"
    echo ""

    # Validate input
    if [ -z "$DOMAIN" ] || [ -z "$EXPECTED_ONION" ]; then
        echo "Usage: $0 <domain> <expected-onion-address> [verbose]"
        echo "Example: $0 https://example.com your-onion-address.onion true"
        exit 1
    fi

    # Test onion address format
    print_header "Test 1: Onion Address Format"
    test_onion_format

    # Test root path
    print_header "Test 2: Root Path"
    test_header_exists "$DOMAIN" "/"

    # Test common paths
    print_header "Test 3: Path Preservation"
    test_header_exists "$DOMAIN" "/about"
    test_header_exists "$DOMAIN" "/contact"
    test_header_exists "$DOMAIN" "/api/v1/status"

    # Test query parameters
    print_header "Test 4: Query Parameters"
    test_query_parameters "$DOMAIN"

    # Test protocol
    print_header "Test 5: Protocol Validation"
    test_protocol "$DOMAIN"

    # Summary
    print_header "Test Summary"
    echo "Tests run: $TESTS_RUN"
    echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        print_success "All tests passed! Onion-Location header is configured correctly."
        exit 0
    else
        echo ""
        print_error "Some tests failed. Please review your configuration."
        exit 1
    fi
}

# Help message
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Onion-Location Header Test Script"
    echo ""
    echo "Usage: $0 <domain> <expected-onion-address> [verbose]"
    echo ""
    echo "Arguments:"
    echo "  domain                 Full domain URL (e.g., https://example.com)"
    echo "  expected-onion-address Expected .onion address (e.g., your-onion.onion)"
    echo "  verbose                Optional: 'true' for detailed output"
    echo ""
    echo "Examples:"
    echo "  $0 https://example.com your-onion-address.onion"
    echo "  $0 https://example.com your-onion-address.onion true"
    echo ""
    echo "Requirements:"
    echo "  - curl must be installed"
    echo "  - Domain must be accessible"
    echo "  - Onion-Location header must be configured"
    exit 0
fi

# Run tests
main
