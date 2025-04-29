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

  if (!userId || isNaN(userId)) {
    return res.status(401).json({ error: 'Unauthorized or Invalid Token' });
  }

  const {
    riskPremium,
    reinsurancePremium,
    regulatorFee,
    opsFee,
    totalPremium
  } = req.body;

  if (
    !riskPremium || !reinsurancePremium ||
    !regulatorFee || !opsFee || !totalPremium
  ) {
    return res.status(400).json({ error: 'Missing payment breakdown fields' });
  }

  let db;
  try {
    db = await sql.connect(config);
    
    // 1. Insert into Contributions table
    await db.request()
      .input('userId', sql.Int, userId)
      .input('riskPremium', sql.Float, riskPremium)
      .input('reinsurancePremium', sql.Float, reinsurancePremium)
      .input('regulatorFee', sql.Float, regulatorFee)
      .input('opsFee', sql.Float, opsFee)
      .input('totalPremium', sql.Float, totalPremium)
      .query(`
        INSERT INTO Contributions (userId, riskPremium, reinsurancePremium, regulatorFee, opsFee, totalPremium)
        VALUES (@userId, @riskPremium, @reinsurancePremium, @regulatorFee, @opsFee, @totalPremium)
      `);

    // 2. Update premium field in Users table
    await db.request()
      .input('userId', sql.Int, userId)
      .input('totalPremium', sql.Float, totalPremium)
      .input('riskPremium', sql.Float, riskPremium)
      .query(`
        UPDATE Users
        SET premium = @totalPremium, riskPremium = @riskPremium
        WHERE id = @userId
      `);

    return res.status(200).json({ message: 'Contribution and premium updated successfully' });
  } catch (err) {
    console.error('❌ DB error:', err);
    return res.status(500).json({ error: 'Failed to save contribution or update premium' });
  } finally {
    if (db) await db.close();
  }
}
