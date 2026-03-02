import { getSession, createSession } from './sessionManager.js';
const bot_id = '1234'; // change
const redirect = 'https://verycoolouathfallbackurlwebsite.cool/oauth-fallback'; // change
const scopes = ['identify', 'guilds']; // change

export default async (req, res) => {
  try {
    const state = req.query.state;
    const code = req.query.code;
    const next = req.query.next;
    const error = req.query.error;
    let next_path = next ? decodeURIComponent(next) : '/home'; // change this to whatever fallbacl u want :p

    if (!state) {
      const session = await createSession(next_path);
      const oauth_url = `https://discord.com/api/oauth2/authorize?client_id=${bot_id}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scopes.join('+')}&state=${encodeURIComponent(session)}&response_type=code`;
      return res.redirect(oauth_url);
    }

    const session = await getSession(decodeURIComponent(state));
    if (!session) return res.redirect(req.path);

    if (session?.next) next_path = session?.next;
    const oauth_url = `https://discord.com/api/oauth2/authorize?client_id=${bot_id}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scopes.join('+')}&state=${encodeURIComponent(state)}&response_type=code`;

    if (error && error === 'access_denied') {
      return res.redirect(next_path);
    }
    
    if (!code) {
      return res.redirect(oauth_url);
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
      return res.status(500).send('Internal Server Error');
    }

    const tokenResponse2 = await tokenResponse.json();

    const token = tokenResponse2.access_token;

    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });

    if (!userResponse.ok) {
      return res.status(500).send('Internal Server Error');
    }

    const data = await userResponse.json();

    const cookieOptions = {
      path: '/',
      secure: true,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    };

    res.cookie('token', token, { ...cookieOptions, httpOnly: true });
    res.cookie('user_id', data.id, cookieOptions);
    res.cookie('username', data.username, cookieOptions);
    res.cookie('avatar', data.avatar || '', cookieOptions);
    res.cookie('display', data.display_name || '', cookieOptions);

    return res.redirect(next_path);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
};
