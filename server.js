// ================================
// Load Environment Variables
// ================================
require('dotenv').config();

// ================================
// Import Required Packages
// ================================
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

// ================================
// Initialize Express App
// ================================
const app = express();
app.use(cors());
app.use(express.json());

// ================================
// MySQL Connection
// ================================
const db = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
});

// ================================
// Nodemailer Setup
// ================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
 // ================================
// STATUS  EMAIL  
// ================================ 

async function sendStatusEmail(toEmail,name, status) {
    try {
   
        let subject;
        let htmlContent;
        
        switch(status) {
            case 'approved':
                subject = 'Your Application Has Been Approved!';
                htmlContent = `
                    <h2>Congratulations ${name}!</h2>
                    <p>Your application to Black Leopards Academy has been approved.</p>
                    <p>Welcome to the team! We're excited to have you join us.</p>
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Attend orientation on [date]</li>
                        <li>Bring your training gear</li>
                       
                    </ul>
                    <p>If you have any questions, please contact us at info@blackleopards.com</p>
                `;
                break;
                
            case 'rejected':
                subject = 'Your Application Status Update';
                htmlContent = `
                    <h2>Application Update</h2>
                    <p>Dear ${name},</p>
                    <p>After careful consideration, we regret to inform you that your application to Black Leopards Academy has not been successful at this time.</p>
                    <p>We appreciate your interest in our academy and encourage you to continue developing your skills.</p>
                    <p>You may reapply in the future if circumstances change.</p>
                    <p>Best regards,<br>Black Leopards Academy</p>
                `;
                break;
                
            default:
                return; 
        }

        const mailOptions = {
            from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Status email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending status email:', error);
        // Don't fail the whole request if email fails
    }
} 

// ================================
// Welcome Email
// ================================

async function sendWelcomeEmail(toEmail, full_name) {
    try {
        const mailOptions = {
            from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to Black Leopards Academy!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="upload/logo.png" alt="Black Leopards Academy" style="max-height: 80px;">
                    </div>
                    <h2 style="color: #ff6b00;">Welcome, ${full_name}!</h2>
                    <p>Thank you for registering with Black Leopards Academy!</p>
                    <p>Your application has been received and is being processed. Here's what you can expect next:</p>
                    
                    <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Next Steps</h3>
                        <ol>
                            <li>Your application will be reviewed by our team</li>
                            <li>You'll receive a status update within 3-5 business days</li>
                            <li>Check your email regularly for updates</li>
                        </ol>
                    </div>
                    
                    <p>If you have any questions, please contact us at <a href="mailto:support@blackleopards.com">support@blackleopards.com</a></p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6c757d;">
                        <p>Black Leopards Academy</p>
                        <p>55 Hoog Street, Polokwane central</p>
                        <p>Phone: (27) 68 338 1465</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't fail the registration if email fails
    }
} 

async function sendSignupEmail(toEmail, name) {
    try {
        const mailOptions = {
            from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to Black Leopards Academy!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="upload/logo.png" alt="Black Leopards Academy" style="max-height: 80px;">
                    </div>
                    <h2 style="color: #d1c5bdff;">Welcome, ${name}!</h2>
                    <p>Thank you for creating an account with Black Leopards Academy!</p>
                    
                    <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Your Account Details</h3>
                        <p><strong>Email:</strong> ${toEmail}</p>
                        <p><strong>Account Type:</strong> Player Portal Access</p>
                    </div>
                    
                    <p>You can now:</p>
                    <ul>
                        <li>Log in to your account</li>
                        <li>Complete player registration</li>
                        
                    </ul>
                    
                    <p style="margin-top: 20px;">
                        <a href="${process.env.BASE_URL}/login" 
                           style="background-color: #ff6b00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Go to Login
                        </a>
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6c757d;">
                        <p>If you didn't create this account, please contact us immediately at <a href="mailto:support@blackleopards.com">support@blackleopards.com</a></p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Signup email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending signup email:', error);
        // Don't fail the signup process if email fails
    }
} 


async function sendPasswordResetEmail(email, userName, token) {
    try {
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="upload/logo.png" alt="Black Leopards Academy" style="max-height: 80px;">
                    </div>
                    <h2 style="color: #ff6b00;">Password Reset</h2>
                    <p>Hello ${userName},</p>
                    <p>We received a request to reset your password. Click the button below to proceed:</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #ff6b00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    
                    <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6c757d;">
                        <p>For security reasons, we don't store your password. This link gives you one-time access.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
}

async function sendPasswordResetConfirmation(email) {
    try {
        const mailOptions = {
            from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6b00;">Password Updated</h2>
                    <p>Your Black Leopards Academy password has been successfully changed.</p>
                    <p>If you didn't make this change, please contact us immediately at <a href="mailto:support@blackleopards.com">support@blackleopards.com</a></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset confirmation sent to ${email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}




// ================================
// Middleware Functions
// ================================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Session expired. Please login.' });
    req.user = decoded;
    next();
  });
}

function verifyAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Access denied: Admins only' });
}

// ================================
// Routes
// ================================




// ================================
// Local Email/Password Signup
// ================================
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 1. Check if user exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 2. Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [insertResult] = await db.promise().query(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'user', name]
    );

    // 3. Get the new user's ID (MySQL returns it in insertResult.insertId)
    const userId = insertResult.insertId;

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'user', name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Send welcome email (fire-and-forget)
    sendSignupEmail(email, name)
      .catch(e => console.error('Email error:', e));

    // 6. Return success + token
    res.status(201).json({ 
      message: 'Signup successful',
      token,
      role: 'user',
      name,
      userId  // Optional: Send back the ID if needed
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// ================================
// Local Email/Password Login
// ================================

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email); // Debug log

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    console.log('Database results:', rows); // Debug log

    if (rows.length === 0) {
      console.log('No user found with this email');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    console.log('Found user:', user.email, 'Role:', user.role); // Debug log

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch); // Debug log

    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role , name:user.name},
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful for:', user.email); // Debug log
    res.json({ 
      token, 
      role: user.role,
      name: user.name 
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ================================
// PLAYER REGISTRATION ENDPOINTS
// ================================

// Create a new player registration (all steps combined)
app.post('/api/players', verifyToken, async (req, res) => {
  try {
    // Start transaction
    await db.promise().query('START TRANSACTION');

    // 1. Insert player basic info
    const [playerResult] = await db.promise().query(
      'INSERT INTO players (full_name, date_of_birth, physical_address, email, mobile_number, school_attending) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.full_name,
        req.body.date_of_birth,
        req.body.physical_address,
        req.body.email,
        req.body.mobile_number,
        req.body.school_attending
      ]
    );
    const playerId = playerResult.insertId;

    // 2. Insert parent/guardian info
    if (req.body.parents) {
      for (const parent of req.body.parents) {
        await db.promise().query(
          'INSERT INTO parents (player_id, relationship, full_name, email, mobile_number, id_number, address, work_number, is_fee_payer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            playerId,
            parent.relationship,
            parent.full_name,
            parent.email,
            parent.mobile_number,
            parent.id_number,
            parent.address,
            parent.work_number,
            parent.is_fee_payer || false
          ]
        );
      }
    }

    // 3. Insert medical info
    if (req.body.medical_info) {
      const med = req.body.medical_info;
      await db.promise().query(
        'INSERT INTO medical_info (player_id, has_chest_condition, has_ear_condition, has_heart_condition, has_lung_condition, has_low_muscle_tone, has_physical_injuries, has_allergies, on_medication, medical_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          playerId,
          med.has_chest_condition || false,
          med.has_ear_condition || false,
          med.has_heart_condition || false,
          med.has_lung_condition || false,
          med.has_low_muscle_tone || false,
          med.has_physical_injuries || false,
          med.has_allergies || false,
          med.on_medication || false,
          med.medical_details || null
        ]
      );
    }

    // 4. Insert football experience
    if (req.body.football_experience) {
      const exp = req.body.football_experience;
      await db.promise().query(
        'INSERT INTO football_experience (player_id, has_previous_training, training_details, bad_experiences, additional_info) VALUES (?, ?, ?, ?, ?)',
        [
          playerId,
          exp.has_previous_training || false,
          exp.training_details || null,
          exp.bad_experiences || null,
          exp.additional_info || null
        ]
      );
    }

   
    // 6. Insert terms acceptance
    if (req.body.terms_acceptance) {
      const terms = req.body.terms_acceptance;
      await db.promise().query(
        'INSERT INTO terms_acceptance (player_id, agreed_to_terms, medical_consent) VALUES (?, ?, ?)',
        [
          playerId,
          terms.agreed_to_terms || false,
          terms.medical_consent || false
        ]
      );
    }

    // Commit transaction
    await db.promise().query('COMMIT'); 
    await sendWelcomeEmail(req.body.email, req.body.full_name);

    res.status(201).json({ message: 'Player registration created successfully', playerId });
  } catch (err) {
    await db.promise().query('ROLLBACK');
    console.error('Player registration error:', err);
    res.status(500).json({ error: 'Failed to create player registration' });
  }
});

// Get all players (for admin dashboard)
app.get('/api/players', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [players] = await db.promise().query('SELECT * FROM players ORDER BY registration_date DESC');
    res.json(players);
  } catch (err) {
    console.error('Get players error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get single player with all related data
app.get('/api/players/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const playerId = req.params.id;
    
    // Get player basic info
    const [player] = await db.promise().query('SELECT * FROM players WHERE player_id = ?', [playerId]);
    if (player.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get all related data
    const [parents] = await db.promise().query('SELECT * FROM parents WHERE player_id = ?', [playerId]);
    const [medicalInfo] = await db.promise().query('SELECT * FROM medical_info WHERE player_id = ?', [playerId]);
    const [medicalAid] = await db.promise().query('SELECT * FROM medical_aid_info WHERE player_id = ?', [playerId]);
    const [footballExp] = await db.promise().query('SELECT * FROM football_experience WHERE player_id = ?', [playerId]);
    const [terms] = await db.promise().query('SELECT * FROM terms_acceptance WHERE player_id = ?', [playerId]);

    res.json({
      ...player[0],
      parents,
      medical_info: medicalInfo[0],
      medical_aid_info: medicalAid[0],
      football_experience: footballExp[0],
    
      terms_acceptance: terms[0]
    });
  } catch (err) {
    console.error('Get player error:', err);
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
});

// Update player status (approve/reject)
app.patch('/api/players/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const playerId = req.params.id;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // First get player email and name
        const [player] = await db.promise().query(
            'SELECT email FROM players  WHERE player_id = ?',
            [playerId]
        );

        if (player.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const playerData = player[0];
        
        // Update status
        await db.promise().query(
            'UPDATE players SET status = ? WHERE player_id = ?',
            [status, playerId]
        );

        // Send email notification
        await sendStatusEmail(playerData.email, playerData.full_name, status);

        res.json({ message: 'Player status updated successfully' });
    } catch (err) {
        console.error('Update player status error:', err);
        res.status(500).json({ error: 'Failed to update player status' });
    }
});

// Delete a player registration
app.delete('/api/players/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.promise().query('DELETE FROM players WHERE player_id = ?', [req.params.id]);
    res.json({ message: 'Player registration deleted successfully' });
  } catch (err) {
    console.error('Delete player error:', err);
    res.status(500).json({ error: 'Failed to delete player registration' });
  }
});

// ================================
// DASHBOARD STATISTICS ENDPOINTS
// ================================

// Get registration statistics
app.get('/api/stats/registrations', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [total] = await db.promise().query('SELECT COUNT(*) as total FROM players');
    const [pending] = await db.promise().query('SELECT COUNT(*) as pending FROM players WHERE status = "pending"');
    const [approved] = await db.promise().query('SELECT COUNT(*) as approved FROM players WHERE status = "approved"');
    const [rejected] = await db.promise().query('SELECT COUNT(*) as rejected FROM players WHERE status = "rejected"');

    res.json({
      total: total[0].total,
      pending: pending[0].pending,
      approved: approved[0].approved,
      rejected: rejected[0].rejected
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch registration statistics' });
  }
});

// Get recent registrations
app.get('/api/stats/recent', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [players] = await db.promise().query(
      'SELECT player_id, full_name, date_of_birth, status, registration_date FROM players ORDER BY registration_date DESC LIMIT 10'
    );
    res.json(players);
  } catch (err) {
    console.error('Get recent registrations error:', err);
    res.status(500).json({ error: 'Failed to fetch recent registrations' });
  }
});

// ================================
// SEARCH & FILTER ENDPOINTS
// ================================

// Search players by name or email
app.get('/api/players/search', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchQuery = `%${query}%`;
    const [players] = await db.promise().query(
      'SELECT player_id, full_name, email, mobile_number, status FROM players WHERE full_name LIKE ? OR email LIKE ? LIMIT 20',
      [searchQuery, searchQuery]
    );
    res.json(players);
  } catch (err) {
    console.error('Search players error:', err);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

// Filter players by status
app.get('/api/players/filter/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const [players] = await db.promise().query(
      'SELECT player_id, full_name, email, mobile_number, registration_date FROM players WHERE status = ? ORDER BY registration_date DESC',
      [status]
    );
    res.json(players);
  } catch (err) {
    console.error('Filter players error:', err);
    res.status(500).json({ error: 'Failed to filter players' });
  }
}); 


// ================================
// CONTACT FORM ENDPOINTS
// ================================

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, message } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !contactNumber || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert into database
    await db.promise().query(
      'INSERT INTO contact_submissions (first_name, last_name, email, contact_number, message) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, contactNumber, message]
    );

    // Send confirmation email (optional)
    const mailOptions = {
      from: `Black Leopards Academy <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting us',
      text: `Dear ${firstName},\n\nThank you for your message. We have received your submission and will respond as soon as possible.\n\nBest regards,\nBlack Leopards Academy`
    };
   
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (err) {
    console.error('Contact form submission error:', err);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});  
// Add this DELETE endpoint
app.delete('/api/admin/contact-submissions/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const messageId = req.params.id;
        
        await db.promise().query(
            'DELETE FROM contact_submissions WHERE id = ?',
            [messageId]
        );
        
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});
// Get all contact submissions (for admin dashboard)
app.get('/api/admin/contact-submissions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [submissions] = await db.promise().query(
      'SELECT * FROM contact_submissions ORDER BY submission_date DESC'
    );
    res.json(submissions);
  } catch (err) {
    console.error('Get contact submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

// Get single contact submission
app.get('/api/admin/contact-submissions/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [submission] = await db.promise().query(
      'SELECT * FROM contact_submissions WHERE id = ?',
      [req.params.id]
    );
    
    if (submission.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission[0]);
  } catch (err) {
    console.error('Get contact submission error:', err);
    res.status(500).json({ error: 'Failed to fetch contact submission' });
  }
});  

// ================================
// USER STATISTICS ENDPOINT
// ================================

// Get user signup statistics
app.get('/api/stats/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Total users
    const [total] = await db.promise().query('SELECT COUNT(*) as total FROM users');
    
    // Users by role
    const [byRole] = await db.promise().query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    // Signups by date (last 30 days)
    const [byDate] = await db.promise().query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) 
       ORDER BY date DESC`
    );

    res.json({
      total: total[0].total,
      byRole: byRole.reduce((acc, curr) => {
        acc[curr.role] = curr.count;
        return acc;
      }, {}),
      byDate
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});
// 1. Request Password Reset
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
      const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email dont exist' });
    }

        // Generate token (expires in 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Store token in database
        await db.promise().query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, resetTokenExpiry, email]
        );

        // Send email
        await sendPasswordResetEmail(email, user[0].name, resetToken);

        res.json({ 
            message: 'If this email exists, you will receive a reset link' 
        });

    } 
    catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Error processing request' });
    }
});
 
// 2. Reset Password
app.post('/api/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find user by valid token
        const [user] = await db.promise().query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (user.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid or expired token' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password and clear token
        await db.promise().query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user[0].id]
        );

        // Send confirmation email
        await sendPasswordResetConfirmation(user[0].email);

        res.json({ 
            message: 'Password updated successfully' 
        });

        
    } catch (err) {
        console.error('Password update error:', err);
        res.status(500).json({ error: 'Error resetting password' });
    }
});
// ================================
// Server
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
