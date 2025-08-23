const cron = require('node-cron');
const moment = require('moment');
const { getDatabase } = require('../database/init');
const { sendMorningDigest, getStatus } = require('../utils/smsService');

/**
 * Morning Digest Service
 * Sends daily appointment summary at 7 AM via TextBelt SMS
 */
class MorningDigestService {
  constructor() {
    this.isRunning = false;
    this.ownerPhoneNumber = process.env.OWNER_PHONE_NUMBER;
    this.smsService = null;
  }
  
  /**
   * Start the morning digest service
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Morning digest service is already running');
      return;
    }
    
    // Schedule morning digest at 7 AM daily
    cron.schedule('0 7 * * *', () => {
      this.sendMorningDigest();
    }, {
      timezone: 'America/New_York' // Adjust timezone as needed
    });
    
    console.log('✅ Morning digest service started - will send daily at 7 AM');
    console.log('📱 Using TextBelt SMS service (1 free SMS per day)');
    this.isRunning = true;
  }
  
  /**
   * Stop the morning digest service
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Morning digest service is not running');
      return;
    }
    
    cron.getTasks().forEach(task => task.destroy());
    console.log('✅ Morning digest service stopped');
    this.isRunning = false;
  }
  
  /**
   * Send morning digest for today's appointments
   */
  async sendMorningDigest() {
    try {
      console.log('🌅 Sending morning digest...');
      console.log('🌅 Debug: Owner phone number:', this.ownerPhoneNumber);
      
      if (!this.ownerPhoneNumber) {
        console.warn('⚠️ Owner phone number not configured. Skipping morning digest.');
        return;
      }
      
      // Check SMS service status
      const smsStatus = getStatus();
      console.log('🌅 Debug: SMS service status:', smsStatus);
      if (!smsStatus.canSendToday) {
        console.warn('⚠️ Daily SMS limit reached. Skipping morning digest.');
        return;
      }
      
      // Get today's appointments
      const today = moment().format('YYYY-MM-DD');
      console.log('🌅 Debug: Fetching appointments for date:', today);
      const appointments = await this.getTodaysAppointments(today);
      console.log('🌅 Debug: Found appointments:', appointments);
      
      // Send the digest
      console.log('🌅 Debug: Calling sendMorningDigest with phone:', this.ownerPhoneNumber);
      const result = await sendMorningDigest(this.ownerPhoneNumber, appointments);
      
      if (result.success) {
        console.log(`✅ Morning digest sent successfully for ${appointments.length} appointments`);
        console.log(`📊 SMS Quota: ${result.quotaRemaining || 'Unknown'}`);
      } else {
        console.error('❌ Failed to send morning digest:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error sending morning digest:', error);
    }
  }
  
  /**
   * Get today's appointments from database
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} - Array of appointments
   */
  async getTodaysAppointments(date) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const query = `
        SELECT time, client, category, payment, status
        FROM appointments 
        WHERE date = ? AND status = 'pending'
        ORDER BY time ASC
      `;
      
      db.all(query, [date], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching today\'s appointments:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }
  
  /**
   * Manually trigger morning digest (for testing)
   */
  async triggerNow() {
    console.log('🧪 Manually triggering morning digest...');
    await this.sendMorningDigest();
  }
  
  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      ownerPhoneNumber: this.ownerPhoneNumber ? 'Configured' : 'Not configured',
      nextRun: '7:00 AM daily',
      timezone: 'America/New_York',
      smsService: getStatus()
    };
  }
}

module.exports = MorningDigestService;
