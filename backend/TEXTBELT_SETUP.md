# 📱 TextBelt SMS Morning Digest Setup

## 🚀 **What This Feature Does**

Every morning at 7 AM, you'll receive a **FREE text message** with:
- **Today's appointment schedule**
- **Client names and services**
- **Appointment times and payments**
- **Total appointment count**

## 🆓 **Why TextBelt?**
- **1 FREE SMS per day** - Perfect for daily morning digest
- **No credit card required** - Truly free
- **Simple setup** - Just need your phone number
- **Reliable delivery** - Good for daily reminders

## ⚙️ **Setup Requirements**

### **1. Environment Variables**
Create a `.env` file in the backend folder with:

```bash
# Your phone number (10 digits, no country code)
OWNER_PHONE_NUMBER=1234567890

# TextBelt API Key (optional - uses test mode by default)
TEXTBELT_API_KEY=textbelt_test

# Other existing variables...
SESSION_SECRET=your_secure_session_secret_here
DATABASE_PATH=./spa_management.db
PORT=5001
NODE_ENV=development
```

### **2. Install Dependencies**
```bash
cd backend
npm install
```

## 🧪 **Testing the Feature**

### **Manual Test**
Visit: `http://localhost:5001/api/test/morning-digest`

This will immediately send you a test morning digest SMS.

### **Automatic Schedule**
The service runs automatically at **7 AM daily** in Eastern Time.

## 📱 **Sample SMS Message**

```
🌅 Good morning! Here's your schedule for today:

1. 2:00 PM - august may (Facial + Massage) - $200.00
2. 4:00 PM - second ofthis (Massage) - $120.00
3. 6:00 PM - some body (Facial + Massage) - $200.00

Total appointments: 3
```

## 🔧 **Customization Options**

### **Change Time Zone**
Edit `backend/services/morningDigestService.js`:
```javascript
timezone: 'America/New_York' // Change to your timezone
```

### **Change Schedule**
Edit the cron expression:
```javascript
// Current: 7 AM daily
cron.schedule('0 7 * * *', () => {
  // Change to: 8 AM daily
  cron.schedule('0 8 * * *', () => {
```

### **Customize Message Format**
Edit `backend/utils/smsService.js` in the `sendMorningDigest` function.

## 🚨 **Important Limitations**

### **Daily SMS Limit**
- **Only 1 SMS per day** (TextBelt free tier)
- Service automatically skips if limit reached
- Perfect for daily morning digest

### **Phone Number Format**
- Must be **10 digits** (e.g., 1234567890)
- No country code needed
- No dashes or parentheses

## 🚨 **Troubleshooting**

### **SMS Not Sending**
1. Check phone number format (10 digits only)
2. Verify environment variables are set
3. Check server logs for errors
4. Ensure daily limit not reached

### **Wrong Time Zone**
1. Update timezone in `morningDigestService.js`
2. Restart the server
3. Check server logs for timezone info

### **Service Not Starting**
1. Check if all dependencies are installed
2. Verify environment variables are set
3. Check server logs for initialization errors

## 💰 **Costs**

- **TextBelt Free Tier**: 1 SMS per day - **COMPLETELY FREE**
- **No monthly charges**
- **No credit card required**
- **No hidden fees**

## 🔒 **Security Notes**

- Keep phone number secure
- Don't commit `.env` file to git
- Use environment variables in production
- Monitor SMS delivery rates

## 📞 **Support**

If you need help:
1. Check server logs for error messages
2. Verify phone number format
3. Test with manual trigger endpoint
4. Check environment variable configuration

## 🎯 **Perfect Use Case**

This setup is ideal for:
- **Small businesses** with daily appointment schedules
- **Solo practitioners** who need morning reminders
- **Anyone** who wants free daily SMS reminders
- **Testing SMS functionality** before upgrading to paid services

## 🚀 **Ready to Go!**

Once you set your phone number in the `.env` file, the service will:
1. **Start automatically** when you run the server
2. **Send daily reminders** at 7 AM
3. **Respect the 1 SMS/day limit**
4. **Provide detailed appointment summaries**

No setup fees, no monthly charges, no credit card required! 🎉
