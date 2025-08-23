const axios = require('axios');

/**
 * TextBelt SMS Service
 * Provides 1 free SMS per day via TextBelt API
 */
class TextBeltService {
  constructor() {
    this.apiKey = process.env.TEXTBELT_API_KEY || 'textbelt_test'; // Use test key by default
    this.baseUrl = 'https://textbelt.com/text';
    this.dailyLimit = 1;
    this.lastSentDate = null;
  }

  /**
   * Check if we can send SMS today
   * @returns {boolean} - Whether SMS can be sent today
   */
  canSendToday() {
    const today = new Date().toDateString();
    return this.lastSentDate !== today;
  }

  /**
   * Send SMS via TextBelt
   * @param {string} phoneNumber - Phone number to send to (10 digits)
   * @param {string} message - Message content
   * @returns {Promise<Object>} - Response from TextBelt API
   */
  async sendSMS(phoneNumber, message) {
    try {
      console.log(`📱 SMS Service Debug: Attempting to send SMS to ${phoneNumber}`);
      
      // Check daily limit
      if (!this.canSendToday()) {
        throw new Error('Daily SMS limit reached. Only 1 free SMS per day allowed.');
      }

      // Format phone number (remove any non-digits)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      console.log(`📱 SMS Service Debug: Cleaned phone number: ${cleanNumber}`);
      
      // Validate phone number format
      if (cleanNumber.length !== 10) {
        throw new Error('Phone number must be 10 digits (e.g., 1234567890)');
      }

      // Prepare request data
      const requestData = {
        phone: cleanNumber,
        message: message,
        key: this.apiKey
      };

      console.log('📱 SMS Service Debug: Request data:', requestData);
      console.log('📱 SMS Service Debug: TextBelt API URL:', this.baseUrl);
      console.log('📱 Sending SMS via TextBelt...');
      
      // Send SMS via TextBelt API
      const response = await axios.post(this.baseUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const result = response.data;
      console.log('📱 SMS Service Debug: TextBelt API response:', result);

      if (result.success) {
        // Mark as sent today
        this.lastSentDate = new Date().toDateString();
        console.log(`✅ SMS sent successfully to ${cleanNumber} via TextBelt`);
        console.log(`📊 Remaining quota: ${result.quotaRemaining || 'Unknown'}`);
        return {
          success: true,
          messageId: result.textId,
          quotaRemaining: result.quotaRemaining,
          message: 'SMS sent successfully'
        };
      } else {
        console.log(`❌ SMS Service Debug: TextBelt API error: ${result.error || 'Unknown error'}`);
        throw new Error(`TextBelt API error: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send morning digest SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {Array} appointments - Today's appointments
   * @returns {Promise<Object>} - Result of SMS sending
   */
  async sendMorningDigest(phoneNumber, appointments) {
    try {
      if (!appointments || appointments.length === 0) {
        const message = "🌅 Good morning! You have no appointments scheduled for today. Enjoy your day!";
        return await this.sendSMS(phoneNumber, message);
      }

      let message = "🌅 Good morning! Here's your schedule for today:\n\n";
      
      appointments.forEach((appointment, index) => {
        const { time, client, category, payment } = appointment;
        message += `${index + 1}. ${time} - ${client} (${category}) - $${payment.toFixed(2)}\n`;
      });
      
      message += `\nTotal appointments: ${appointments.length}`;
      
      return await this.sendSMS(phoneNumber, message);

    } catch (error) {
      console.error('❌ Error sending morning digest:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test SMS service
   * @param {string} phoneNumber - Phone number to test
   * @returns {Promise<Object>} - Test result
   */
  async testService(phoneNumber) {
    const testMessage = "🧪 Test message from MySpaWebsite! If you receive this, the TextBelt SMS service is working correctly.";
    return await this.sendSMS(phoneNumber, testMessage);
  }

  /**
   * Get service status
   * @returns {Object} - Current service status
   */
  getStatus() {
    return {
      provider: 'TextBelt',
      dailyLimit: this.dailyLimit,
      canSendToday: this.canSendToday(),
      lastSentDate: this.lastSentDate,
      apiKey: this.apiKey === 'textbelt_test' ? 'Test Mode' : 'Production Mode'
    };
  }
}

// Create singleton instance
const textBeltService = new TextBeltService();

module.exports = {
  textBeltService,
  sendSMS: (phoneNumber, message) => textBeltService.sendSMS(phoneNumber, message),
  sendMorningDigest: (phoneNumber, appointments) => textBeltService.sendMorningDigest(phoneNumber, appointments),
  testService: (phoneNumber) => textBeltService.testService(phoneNumber),
  getStatus: () => textBeltService.getStatus()
};
