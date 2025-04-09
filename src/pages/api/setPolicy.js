import sql from 'mssql';
import { parse } from 'cookie';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No valid auth token' });
  }

  const { policy, pool, benefit, startDate, dob, gender, occupation } = req.body;

  const validPolicies = ['basic', 'premium', 'comprehensive'];
  const validPools = ['Car A', 'Car B', 'Car C', 'Car D'];
  const validBenefits = ['200000', '500000', '750000', '1000000'];
  const validGenders = ['male', 'female'];
  const validOccupations = ['IT Executive', 'Business Executive', 'Artisan', 'Health Executive'];

  // Validation
  if (!validPolicies.includes(policy?.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid policy type' });
  }
  if (!validPools.includes(pool)) {
    return res.status(400).json({ error: 'Invalid pool selection' });
  }
  if (!validBenefits.includes(benefit)) {
    return res.status(400).json({ error: 'Invalid benefit value' });
  }
  if (!startDate) {
    return res.status(400).json({ error: 'Start date is required' });
  }
  if (!dob) {
    return res.status(400).json({ error: 'Date of birth is required' });
  }
  if (!validGenders.includes(gender?.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid gender value' });
  }
  if (!validOccupations.includes(occupation)) {
    return res.status(400).json({ error: 'Invalid occupation' });
  }

  let db;

  try {
    db = await sql.connect(config);

    const result = await db.request()
      .input('userId', sql.Int, userId)
      .input('policy', sql.VarChar, policy)
      .input('pool', sql.VarChar, pool)
      .input('benefit', sql.Int, benefit)
      .input('startDate', sql.Date, startDate)
      .input('dob', sql.Date, dob)
      .input('gender', sql.VarChar, gender)
      .input('occupation', sql.VarChar, occupation)
      .query(`
        UPDATE Users
        SET policy = @policy,
            pool = @pool,
            benefit = @benefit,
            startDate = @startDate,
            dob = @dob,
            gender = @gender,
            occupation = @occupation
        WHERE id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found or not updated' });
    }

    return res.status(200).json({ message: 'Policy info updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update policy info' });
  } finally {
    if (db) await db.close();
  }
}
