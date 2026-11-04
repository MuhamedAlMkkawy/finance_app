import bcrypt from 'bcryptjs';
import { DataStore } from '../../data/store';
import { setUserSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name } = body || {};

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const existing = DataStore.findUserByEmail(cleanEmail);
  if (existing) {
    throw createError({ statusCode: 409, message: 'User with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = DataStore.createUser(
    name || cleanEmail.split('@')[0],
    cleanEmail,
    passwordHash,
    'manager'
  );

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };

  setUserSession(event, sessionUser);
  return { success: true, user: sessionUser };
});
