import type { Express } from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import EmailVerificationToken from '../src/models/email-verification-token.model.js'
import LoginChallenge from '../src/models/login-challenge.model.js'
import PasswordResetToken from '../src/models/password-reset-token.model.js'
import Session from '../src/models/session.model.js'
import User from '../src/models/user.model.js'

const TEST_UA
  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function setCookieHeaders(res: { headers: Record<string, string | string[] | undefined> }): string[] {
  const raw = res.headers['set-cookie']
  if (!raw)
    return []
  return Array.isArray(raw) ? raw : [raw]
}

function cookieValueFromSetCookies(setCookie: string[], name: string): string | undefined {
  for (const line of setCookie) {
    const [pair] = line.split(';')
    if (!pair?.includes('='))
      continue
    const eq = pair.indexOf('=')
    const key = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (key === name)
      return decodeURIComponent(value)
  }
  return undefined
}

describe('auth integration', () => {
  let mongoServer: MongoMemoryServer
  let app: Express

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    Object.assign(process.env, {
      NODE_ENV: 'test',
      MONGO_URI: mongoUri,
      JWT_SECRET: 'test-jwt-secret-for-integration-tests-32',
      JWT_REFRESH_SECRET: 'test-refresh-secret-for-integration-tests-32',
      CRYPTR_KEY: '12345678901234567890123456789012',
      FRONTEND_URL: 'http://localhost:5173',
      CLIENT_URL: 'http://localhost:5173',
      EMAIL_USER: '',
      REFRESH_TOKEN_LIFETIME_MS: '172800000',
      SESSION_IDLE_TIMEOUT_MS: '1800000',
      SESSION_LAST_USED_TOUCH_INTERVAL_MS: '30000',
      SESSION_ABSOLUTE_TIMEOUT_MS: '2592000000',
    })

    await mongoose.connect(mongoUri)
    ;({ default: app } = await import('../src/app.js'))
  })

  beforeEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
    await EmailVerificationToken.deleteMany({})
    await PasswordResetToken.deleteMany({})
    await LoginChallenge.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('get /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('register sets session cookies and GET /api/auth/status is true', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    const reg = await agent
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password12',
      })
    expect(reg.status).toBe(201)
    expect(reg.body.email).toBe('test@example.com')

    const status = await agent.get('/api/auth/status')
    expect(status.status).toBe(200)
    expect(status.body).toBe(true)
  })

  it('rejects duplicate register with 400', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    await agent.post('/api/auth/register').send({
      name: 'A',
      email: 'dup@example.com',
      password: 'password12',
    })
    const second = await agent.post('/api/auth/register').send({
      name: 'B',
      email: 'dup@example.com',
      password: 'password12',
    })
    expect(second.status).toBe(400)
  })

  it('login fails with wrong password', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password12',
    })
    const bad = await agent.post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    })
    expect(bad.status).toBe(401)
  })

  it('login returns 403 for suspended user without setting session', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    await agent.post('/api/auth/register').send({
      name: 'Suspended User',
      email: 'suspended@example.com',
      password: 'password12',
    })
    await User.updateOne({ email: 'suspended@example.com' }, { role: 'suspended' })

    const login = await agent.post('/api/auth/login').send({
      email: 'suspended@example.com',
      password: 'password12',
    })
    expect(login.status).toBe(403)
    expect(login.body.code).toBe('ACCOUNT_SUSPENDED')

    const status = await agent.get('/api/auth/status')
    expect(status.body).toBe(false)
  })

  it('upgradeUser to suspended revokes all sessions immediately', async () => {
    const victim = request.agent(app).set('User-Agent', TEST_UA)
    await victim.post('/api/auth/register').send({
      name: 'Victim',
      email: 'victim@example.com',
      password: 'password12',
    })
    const victimUser = await User.findOne({ email: 'victim@example.com' })
    expect(victimUser).toBeTruthy()
    expect(await Session.countDocuments({ userId: victimUser!._id })).toBe(1)

    const admin = request.agent(app).set('User-Agent', TEST_UA)
    const adminReg = await admin.post('/api/auth/register').send({
      name: 'Admin',
      email: 'admin-suspend@example.com',
      password: 'password12',
    })
    expect(adminReg.status).toBe(201)
    await User.updateOne({ email: 'admin-suspend@example.com' }, { role: 'admin' })
    const adminCsrf = cookieValueFromSetCookies(setCookieHeaders(adminReg), 'csrfToken')
    expect(adminCsrf).toBeTruthy()

    const upgrade = await admin
      .post('/api/users/upgradeUser')
      .set('x-csrf-token', adminCsrf!)
      .send({ id: victimUser!._id.toString(), role: 'suspended' })
    expect(upgrade.status).toBe(200)

    expect(await Session.countDocuments({ userId: victimUser!._id })).toBe(0)

    const refresh = await victim.post('/api/auth/refresh')
    expect(refresh.status).toBe(401)

    const profile = await victim.get('/api/users/me')
    expect(profile.status).toBe(401)
  })

  it('login succeeds with same trusted device as register', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'loginok@example.com',
      password: 'password12',
    })
    const ok = await agent.post('/api/auth/login').send({
      email: 'loginok@example.com',
      password: 'password12',
    })
    expect(ok.status).toBe(200)
  })

  it('post /api/auth/refresh returns 200 when session valid', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'refresh@example.com',
      password: 'password12',
    })
    const res = await agent.post('/api/auth/refresh')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Session refreshed')
  })

  it('post /api/auth/logout clears session', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    const reg = await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'logout@example.com',
      password: 'password12',
    })
    expect(reg.status).toBe(201)
    const csrf = cookieValueFromSetCookies(setCookieHeaders(reg), 'csrfToken')
    expect(csrf).toBeTruthy()

    const out = await agent.post('/api/auth/logout').set('x-csrf-token', csrf!)
    expect(out.status).toBe(200)

    const status = await agent.get('/api/auth/status')
    expect(status.status).toBe(200)
    expect(status.body).toBe(false)
  })

  it('blocks PATCH without CSRF header on protected route', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    const reg = await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'csrf@example.com',
      password: 'password12',
    })
    expect(reg.status).toBe(201)

    const blocked = await agent
      .patch('/api/users/updateUser')
      .send({ name: 'Updated Name' })
    expect(blocked.status).toBe(403)
    expect(blocked.body.message).toBe('Invalid CSRF token')
  })

  it('allows PATCH with matching x-csrf-token', async () => {
    const agent = request.agent(app).set('User-Agent', TEST_UA)
    const reg = await agent.post('/api/auth/register').send({
      name: 'Test User',
      email: 'csrfok@example.com',
      password: 'password12',
    })
    expect(reg.status).toBe(201)

    const csrf = cookieValueFromSetCookies(setCookieHeaders(reg), 'csrfToken')
    expect(csrf).toBeTruthy()

    const ok = await agent
      .patch('/api/users/updateUser')
      .set('x-csrf-token', csrf!)
      .send({ name: 'Updated Name' })
    expect(ok.status).toBe(200)
    expect(ok.body.name).toBe('Updated Name')
  })
})
