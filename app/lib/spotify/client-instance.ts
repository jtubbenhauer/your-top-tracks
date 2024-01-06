'use client';

import { AuthUser } from '@/app/api/auth/[...nextauth]/auth-options';
import {
  IAuthStrategy,
  AccessToken,
  SdkConfiguration,
  SdkOptions,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk';
import { getSession, signIn } from 'next-auth/react';

/**
 * A class that implements the IAuthStrategy interface and wraps the NextAuth functionality.
 * It retrieves the access token and other information from the JWT session handled by NextAuth.
 */
class NextAuthStrategy implements IAuthStrategy {
  public getOrCreateAccessToken(): Promise<AccessToken> {
    return this.getAccessToken();
  }

  public async getAccessToken(): Promise<AccessToken> {
    const session: any = await getSession();
    if (!session) {
      return {} as AccessToken;
    }

    if (session?.error === 'RefreshAccessTokenError') {
      await signIn('spotify');
      return this.getAccessToken();
    }

    const { user }: { user: AuthUser } = session;

    return {
      access_token: user.access_token,
      token_type: 'Bearer',
      expires_in: user.expires_in,
      expires: user.expires_at,
      refresh_token: user.refresh_token,
    } as AccessToken;
  }

  public removeAccessToken(): void {
    // not implemented
  }

  public setConfiguration(configuration: SdkConfiguration): void {
    // not implemented
  }
}

export function getSpotifySdk(config?: SdkOptions): SpotifyApi {
  const strategy = new NextAuthStrategy();
  return new SpotifyApi(strategy, config);
}
