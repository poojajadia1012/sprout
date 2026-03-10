import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

export const linkingConfig = {
  prefixes: ['recipeapp://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

export function useDeepLink() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, []);
}

async function handleUrl(url: string) {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams ?? {};

  // Password reset deep links are routed by React Navigation linking config.
  // Only handle email verification (magic link) here.
  if (params['type'] === 'recovery') return;

  // PKCE magic link: recipeapp://?token_hash=xxx&type=email
  if (params['token_hash'] && params['type'] === 'email') {
    await supabase.auth.verifyOtp({
      token_hash: params['token_hash'] as string,
      type: 'email',
    });
    return;
  }

  // Implicit flow fallback: tokens in URL hash fragment
  if (url.includes('#')) {
    const hash = url.split('#')[1];
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    }
  }
}
