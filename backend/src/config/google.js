const { OAuth2Client } = require('google-auth-library');
const env = require('./env');

function createOAuthClient() {
  return new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleCallbackUrl
  );
}

function getGoogleAuthUrl(state) {
  const client = createOAuthClient();

  return client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    state,
    scope: ['openid', 'email', 'profile'],
  });
}

async function getGoogleProfile(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    throw new Error('Google profile is missing email or id');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || '',
    emailVerified: Boolean(payload.email_verified),
  };
}

module.exports = {
  getGoogleAuthUrl,
  getGoogleProfile,
};
