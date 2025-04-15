import bcrypt from 'bcryptjs';
import { ConnectionPool } from 'mssql';
import { serialize } from 'cookie';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  let pool;
  try {
    pool = await new ConnectionPool(config).connect();

    // 1. Check if user with the same email already exists
    const existingUser = await pool.request()
      .input('email', email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // 2. Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.request()
      .input('name', name)
      .input('email', email)
      .input('password', hashedPassword)
      .query(`
        INSERT INTO Users (name, email, password)
        OUTPUT INSERTED.id
        VALUES (@name, @email, @password)
      `);

    const newUserId = insertResult.recordset[0].id;

    // 3. Set auth_token cookie
    res.setHeader('Set-Cookie', serialize('auth_token', String(newUserId), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    }));

    return res.status(200).json({ message: 'User signed up successfully', userId: newUserId });
  } catch (error) {
    console.error('Error signing up user:', error);
    return res.status(500).json({ error: 'Error signing up user' });
  } finally {
    if (pool) await pool.close();
  }
}
