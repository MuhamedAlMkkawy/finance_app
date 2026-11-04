import bcrypt from 'bcryptjs';
import { DataStore } from '../../data/store';
import { setUserSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body || {};

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' });
  }

  const user = DataStore.findUserByEmail(String(email));

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' });
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  setUserSession(event, sessionUser);
  return { success: true, user: sessionUser };
});
