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

// Utility to calculate Age Next Birthday
function calculateAgeNextBirthday(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();

  const birthMonth = dob.getMonth();
  const currentMonth = today.getMonth();

  const birthYear = dob.getFullYear();
  const currentYear = today.getFullYear();

  const age = currentYear - birthYear;

  // If birth month is earlier than or same as current month, birthday has happened or is this month → +1
  // Otherwise, birthday is yet to come this year → age remains the same
  return currentMonth >= birthMonth ? age + 1 : age;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10);
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No valid auth token' });

  const { policy, benefit, startDate, dob, gender, occupation } = req.body;

  const validPolicies = ['OneLife Policy'];
  const validBenefits = ['1000000', '2000000', '3000000', '4000000'];
  const validGenders = ['Male', 'Female'];
  const validOccupations = [
    'IT Executive',
    'Creative Executive',
    'Health Executive',
    'Business Executive'
  ];

  if (!validPolicies.includes(policy)) return res.status(400).json({ error: 'Invalid policy type' });
  if (!validBenefits.includes(benefit)) return res.status(400).json({ error: 'Invalid benefit value' });
  if (!startDate || !dob) return res.status(400).json({ error: 'Start date and DOB are required' });
  if (!validGenders.includes(gender)) return res.status(400).json({ error: 'Invalid gender' });
  if (!validOccupations.includes(occupation)) return res.status(400).json({ error: 'Invalid occupation' });

  const ageNextBirthday = calculateAgeNextBirthday(dob);

  let db;
  try {
    db = await sql.connect(config);

    // 🔍 Look up pool based on age
    const poolResult = await db.request()
      .input('age', sql.Int, ageNextBirthday)
      .query(`SELECT TOP 1 pool FROM age_pool WHERE age = @age`);

    if (!poolResult.recordset.length) {
      return res.status(400).json({ error: 'No suitable pool found for age ${ageNextBirthday}' });
    }

    const matchedPool = poolResult.recordset[0].pool;

    // ✅ Update user with full info
    const updateResult = await db.request()
      .input('userId', sql.Int, userId)
      .input('policy', sql.VarChar, policy)
      .input('benefit', sql.Int, benefit)
      .input('startDate', sql.Date, startDate)
      .input('dob', sql.Date, dob)
      .input('gender', sql.VarChar, gender)
      .input('occupation', sql.VarChar, occupation)
      .input('age', sql.Int, ageNextBirthday)
      .input('pool', sql.VarChar, matchedPool)
      .query(`
        UPDATE Users
        SET policy = @policy,
            benefit = @benefit,
            startDate = @startDate,
            dob = @dob,
            gender = @gender,
            occupation = @occupation,
            age = @age,
            pool = @pool
        WHERE id = @userId
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found or not updated' });
    }

    return res.status(200).json({
      message: 'Policy info updated successfully',
      ageNextBirthday,
      pool: matchedPool
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Server error: Failed to update user' });
  } finally {
    if (db) await db.close();
  }
}
