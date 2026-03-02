const { getSession, createSession } = require('./sessionManager.js');
const { setCookie } = require('hono/cookie');
const bot_id = '1234'; // change
const redirect = 'https://verycoolouathfallbackurlwebsite.cool/oauth-fallback'; // change
const scopes = ['identify', 'guilds']; // change

module.exports = async (c) => {
  try {
    const state = c.req.query('state');
    const code = c.req.query('code');
    const next = c.req.query('next');
    const error = c.req.query('error');
    let next_path = next ? decodeURIComponent(next) : '/home'; // change this to whatever fallbacl u want :p

    if (!state) {
      const session = await createSession(next_path);
      const oauth_url = `https://discord.com/api/oauth2/authorize?client_id=${bot_id}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scopes.join('+')}&state=${encodeURIComponent(session)}&response_type=code`;
      return c.redirect(oauth_url);
    }

    const session = await getSession(decodeURIComponent(state));
    if (!session) return c.redirect(c.req.path);

    if (session?.next) next_path = session?.next;
    const oauth_url = `https://discord.com/api/oauth2/authorize?client_id=${bot_id}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scopes.join('+')}&state=${encodeURIComponent(state)}&response_type=code`;

    if (error && error === 'access_denied') {
      return c.redirect(next_path);
    }
    
    if (!code) {
      return c.redirect(oauth_url);
    }

    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: new URLSearchParams({
        client_id: bot_id,
        client_secret: process.env.client_secret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect
      })
    });
    
    if (!tokenResponse.ok) {
      return c.text('Internal Server Error', 500);
    }

    const tokenResponse2 = await tokenResponse.json();

    const token = tokenResponse2.access_token;

    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });

    if (!userResponse.ok) {
      return c.text('Internal Server Error', 500);
    }

    const data = await userResponse.json();

    const cookie = {
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7
    };

    setCookie(c, 'token', token, { ...cookie, httpOnly: true });
    setCookie(c, 'user_id', data.id, cookie);
    setCookie(c, 'username', data.username, cookie);
    setCookie(c, 'avatar', data.avatar || '', cookie);
    setCookie(c, 'display', data.display_name || '', cookie);

    return c.redirect(next_path);
  } catch (err) {
    return c.text('Internal Server Error', 500);
  }
};
