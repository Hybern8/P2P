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

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await new ConnectionPool(config).connect();

    // Insert user into the database
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

    // Set auth_token cookie with user ID
    res.setHeader('Set-Cookie', serialize('auth_token', String(newUserId), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',  // Can change to 'strict' or 'none' depending on your auth policy
      maxAge: 60 * 60 * 24 // 1 day
    }));

    pool.close();

    return res.status(200).json({ message: 'User signed up successfully', userId: newUserId });
  } catch (error) {
    console.error('Error signing up user:', error);
    return res.status(500).json({ error: 'Error signing up user' });
  }
}
