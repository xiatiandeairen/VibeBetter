import { Hono } from 'hono';
import { prisma } from '@vibebetter/db';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const oauth = new Hono();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

oauth.get('/github', (c) => {
  if (!GITHUB_CLIENT_ID) {
    return c.json(
      {
        success: false,
        data: null,
        error: 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      },
      501,
    );
  }
  const redirectUri = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host')}/api/v1/oauth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email,repo`;
  return c.redirect(url);
});

oauth.get('/github/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.json({ success: false, data: null, error: 'Missing authorization code' }, 400);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      return c.json({ success: false, data: null, error: tokenData.error || 'Failed to get access token' }, 400);
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const ghUser = (await userRes.json()) as {
      id: number;
      login: string;
      email: string | null;
      name: string | null;
      avatar_url: string;
    };

    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github.v3+json' },
      });
      const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean }>;
      email = emails.find((e) => e.primary)?.email || emails[0]?.email || `${ghUser.login}@github.com`;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: ghUser.name || ghUser.login,
          password: '',
          role: 'VIEWER',
        },
      });
      logger.info({ userId: user.id, email }, 'Created new user via GitHub OAuth');
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    logger.error({ err }, 'GitHub OAuth callback error');
    return c.json({ success: false, data: null, error: 'OAuth authentication failed' }, 500);
  }
});

oauth.get('/status', (c) => {
  return c.json({
    success: true,
    data: {
      github: {
        configured: !!GITHUB_CLIENT_ID,
        loginUrl: GITHUB_CLIENT_ID ? '/api/v1/oauth/github' : null,
      },
    },
    error: null,
  });
});

export default oauth;
