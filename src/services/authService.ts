export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private readonly DEV_MODE = true;
  
  private readonly TSID_AUTH_URL = 'https://id.teamsystem.com/auth/login';
  private readonly TSID_TOKEN_URL = 'https://id.teamsystem.com/token';
  private readonly TSID_USER_URL = 'https://id.teamsystem.com/userinfo';
  private readonly CLIENT_ID = 'navify-extension';

  async login(): Promise<{ success: boolean; error?: string }> {
    console.log('[AuthService] Starting login flow...');
    
    if (this.DEV_MODE) {
      console.warn('[AuthService] DEV_MODE is enabled - bypassing OAuth!');
      console.log('[AuthService] Creating fake authentication...');
      console.log('[AuthService] Simulating authentication delay...');
      
      await new Promise(resolve => setTimeout(resolve, 3200));
      
      const fakeUser: UserProfile = {
        id: 'dev-user-1',
        email: 'b.skendaj@teamsystem.com',
        name: 'Bruno Skendaj',
      };
      
      const fakeToken: AuthToken = {
        access_token: 'dev-fake-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
        timestamp: Date.now(),
      };
      
      await this.storeAuthData(fakeToken, fakeUser);
      console.log('[AuthService] Fake authentication created successfully!');
      console.log('[AuthService] Logged in as:', fakeUser.name);
      
      return { success: true };
    }
    
    console.log('[AuthService] Configuration check:');
    console.log('  - TSID_AUTH_URL:', this.TSID_AUTH_URL);
    console.log('  - CLIENT_ID:', this.CLIENT_ID);
    console.log('  - TSID_USER_URL:', this.TSID_USER_URL);
    
    try {
      const redirectUri = chrome.identity.getRedirectURL();
      console.log('[AuthService] Redirect URI:', redirectUri);
      console.log('[AuthService] Extension ID:', chrome.runtime.id);
      
      console.log('[AuthService] Constructing authorization URL...');
      const authUrl = new URL(this.TSID_AUTH_URL);
      authUrl.searchParams.set('client_id', this.CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'token');
      authUrl.searchParams.set('scope', 'openid profile email');

      const fullAuthUrl = authUrl.toString();
      console.log('[AuthService] Full Authorization URL:', fullAuthUrl);
      console.log('[AuthService] OAuth Parameters:', {
        client_id: this.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid profile email',
        auth_endpoint: this.TSID_AUTH_URL
      });

      console.log('[AuthService] Launching web auth flow...');
      console.warn('[AuthService] If this fails, the OAuth URL might be incorrect!');
      console.warn('[AuthService] Try opening this URL in a new tab to verify it works:');
      console.warn('   ', fullAuthUrl);
      
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: fullAuthUrl,
        interactive: true,
      });

      console.log('[AuthService] Received response URL:', responseUrl);

      if (!responseUrl) {
        console.error('[AuthService] No response URL received');
        return { success: false, error: 'No response from authentication server' };
      }

      console.log('[AuthService] Parsing token from response...');
      const token = this.parseTokenFromUrl(responseUrl);
      
      if (!token) {
        console.error('[AuthService] Failed to parse token from URL');
        return { success: false, error: 'Failed to parse authentication token' };
      }

      console.log('[AuthService] Token parsed successfully:', {
        token_type: token.token_type,
        expires_in: token.expires_in,
        has_access_token: !!token.access_token
      });

      console.log('[AuthService] Fetching user profile...');
      const userProfile = await this.getUserProfile(token.access_token);
      
      if (!userProfile) {
        console.error('[AuthService] Failed to retrieve user profile');
        return { success: false, error: 'Failed to retrieve user profile' };
      }

      console.log('[AuthService] User profile retrieved:', userProfile);

      console.log('[AuthService] Storing auth data...');
      await this.storeAuthData(token, userProfile);
      console.log('[AuthService] Auth data stored successfully');

      return { success: true };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      
      let errorMessage = 'Unknown error occurred';
      let errorDetails: any = {};
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorDetails = { stringError: error };
      } else if (error && typeof error === 'object') {
        errorDetails = JSON.parse(JSON.stringify(error));
        errorMessage = JSON.stringify(error);
      }
      
      console.error('[AuthService] Error details:', errorDetails);
      console.error('[AuthService] Error type:', typeof error);
      console.error('[AuthService] Error constructor:', error?.constructor?.name);
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  private parseTokenFromUrl(url: string): AuthToken | null {
    console.log('[AuthService] Parsing token from URL:', url);
    
    try {
      const urlObj = new URL(url);
      console.log('[AuthService] URL components:', {
        protocol: urlObj.protocol,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash
      });
      
      const hash = urlObj.hash.substring(1);
      console.log('[AuthService] Hash parameters:', hash);
      
      const params = new URLSearchParams(hash);
      
      const allParams: any = {};
      params.forEach((value, key) => {
        allParams[key] = key === 'access_token' ? value.substring(0, 20) + '...' : value;
      });
      console.log('[AuthService] Parsed parameters:', allParams);

      const access_token = params.get('access_token');
      const token_type = params.get('token_type') || 'Bearer';
      const expires_in = parseInt(params.get('expires_in') || '3600', 10);

      if (!access_token) {
        console.error('[AuthService] No access_token found in response');
        return null;
      }

      console.log('[AuthService] Token parsed successfully');
      return {
        access_token,
        token_type,
        expires_in,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[AuthService] Error parsing token:', error);
      return null;
    }
  }

  private async getUserProfile(accessToken: string): Promise<UserProfile | null> {
    console.log('[AuthService] Fetching user profile from:', this.TSID_USER_URL);
    
    try {
      const response = await fetch(this.TSID_USER_URL, {
        headers: {
          Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
        },
      });

      console.log('[AuthService] User profile response status:', response.status);

      if (!response.ok) {
        console.error('[AuthService] Failed to fetch user profile:', {
          status: response.status,
          statusText: response.statusText
        });
        
        const errorText = await response.text().catch(() => 'Unable to read error');
        console.error('[AuthService] Error response:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('[AuthService] User profile data received:', {
        has_sub: !!data.sub,
        has_id: !!data.id,
        has_email: !!data.email,
        has_name: !!data.name,
        keys: Object.keys(data)
      });

      const profile = {
        id: data.sub || data.id,
        email: data.email,
        name: data.name || data.given_name || data.email,
      };
      
      console.log('[AuthService] User profile parsed:', profile);
      return profile;
    } catch (error) {
      console.error('[AuthService] Error fetching user profile:', error);
      return null;
    }
  }

  private async storeAuthData(token: AuthToken, user: UserProfile): Promise<void> {
    await chrome.storage.local.set({
      authToken: token.access_token,
      tokenExpiry: token.timestamp + token.expires_in * 1000,
      user: user,
    });
  }

  async isAuthenticated(): Promise<boolean> {
    console.log('[AuthService] Checking authentication status...');
    
    try {
      const result = await chrome.storage.local.get(['authToken', 'tokenExpiry', 'user']);
      
      console.log('[AuthService] Storage data:', {
        has_token: !!result.authToken,
        has_expiry: !!result.tokenExpiry,
        has_user: !!result.user,
        expiry: result.tokenExpiry ? new Date(result.tokenExpiry).toISOString() : 'N/A',
        now: new Date().toISOString()
      });
      
      if (!result.authToken || !result.tokenExpiry) {
        console.log('[AuthService] No token or expiry found');
        return false;
      }

      if (Date.now() > result.tokenExpiry) {
        console.log('[AuthService] Token expired, logging out');
        await this.logout();
        return false;
      }

      console.log('[AuthService] User is authenticated');
      return true;
    } catch (error) {
      console.error('[AuthService] Error checking authentication:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(['authToken', 'tokenExpiry']);
      
      if (!result.authToken || !result.tokenExpiry) {
        return null;
      }

      if (Date.now() > result.tokenExpiry) {
        await this.logout();
        return null;
      }

      return result.authToken;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    await chrome.storage.local.remove(['authToken', 'tokenExpiry', 'user']);
  }
}

export const authService = new AuthService();

