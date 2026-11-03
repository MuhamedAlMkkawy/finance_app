import { db } from '../../database';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { setUserSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name } = body || {};

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).get();
  if (existing) {
    throw createError({ statusCode: 409, message: 'User with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const [newUser] = await db.insert(users).values({
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    passwordHash,
    role: 'manager'
  }).returning();

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };

  setUserSession(event, sessionUser);
  return { success: true, user: sessionUser };
});

