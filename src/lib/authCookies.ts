// Cookie names must be unique for every NextAuth application on shc.sut.ac.th.
// NextAuth defaults to __Secure-next-auth.*, which otherwise makes sibling
// applications overwrite each other's sessions.

export const useSecureAuthCookies =
  process.env.NEXTAUTH_URL?.startsWith('https://') ||
  process.env.NODE_ENV === 'production'

const cookiePrefix = useSecureAuthCookies ? '__Secure-' : ''
const cookieNamespace = 'new-borrows'

const cookieName = (suffix: string) =>
  `${cookiePrefix}${cookieNamespace}.${suffix}`

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: useSecureAuthCookies,
}

export const authCookieNames = {
  sessionToken: cookieName('session-token'),
  callbackUrl: cookieName('callback-url'),
  csrfToken: cookieName('csrf-token'),
  pkceCodeVerifier: cookieName('pkce.code-verifier'),
  state: cookieName('state'),
  nonce: cookieName('nonce'),
}

export const authCookies = {
  sessionToken: {
    name: authCookieNames.sessionToken,
    options: cookieOptions,
  },
  callbackUrl: {
    name: authCookieNames.callbackUrl,
    options: cookieOptions,
  },
  csrfToken: {
    name: authCookieNames.csrfToken,
    options: cookieOptions,
  },
  pkceCodeVerifier: {
    name: authCookieNames.pkceCodeVerifier,
    options: { ...cookieOptions, maxAge: 60 * 15 },
  },
  state: {
    name: authCookieNames.state,
    options: { ...cookieOptions, maxAge: 60 * 15 },
  },
  nonce: {
    name: authCookieNames.nonce,
    options: cookieOptions,
  },
}
