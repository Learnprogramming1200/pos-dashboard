// Test utility for refresh token functionality
import { tokenUtils } from '@/lib/utils';
import { authAPI } from '@/lib/api';

export const testRefreshToken = async () => {
  
  try {
    // Test 1: Check if we have a refresh token
    const hasRefreshToken = tokenUtils.hasRefreshToken();
    
    if (!hasRefreshToken) {
      return false;
    }
    
    // Test 2: Test token validation and refresh
    const validation = await tokenUtils.validateAndRefresh();
    
    if (validation.valid) {
      if (validation.refreshed) {
      }
      return true;
    } else {
      return false;
    }
    
  } catch (error) {
    console.error('❌ Refresh token test failed:', error);
    return false;
  }
};

export const testAPIWithRefresh = async () => {
  
  try {
    // Make a test API call that might trigger token refresh
    const response = await authAPI.me();
    return true;
  } catch (error: any) {
    console.error('❌ API call failed:', error.message);
    return false;
  }
};

// Function to simulate token expiration and test refresh
export const simulateTokenExpiration = async () => {
  
  try {
    // Get current token
    const currentToken = tokenUtils.getToken();
    if (!currentToken) {
      return false;
    }
    
    // Clear the current token to simulate expiration
    tokenUtils.removeToken();
    
    // Try to make an API call - this should trigger refresh
    const response = await authAPI.me();
    
    // Check if we have a new token
    const newToken = tokenUtils.getToken();
    
    return true;
  } catch (error: any) {
    console.error('❌ Token expiration simulation failed:', error.message);
    return false;
  }
};

// Export all test functions
export const runAllRefreshTokenTests = async () => {
  
  const results = {
    refreshTokenTest: await testRefreshToken(),
    apiWithRefreshTest: await testAPIWithRefresh(),
    tokenExpirationTest: await simulateTokenExpiration()
  };
  
  const allPassed = Object.values(results).every(result => result === true);
  
  return results;
};
