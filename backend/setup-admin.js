const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Admin Password Setup');
console.log('========================\n');

rl.question('Enter your desired admin username (default: admin): ', (username) => {
  username = username || 'admin';
  
  rl.question('Enter your desired admin password: ', async (password) => {
    if (!password || password.length < 8) {
      console.log('\n❌ Password must be at least 8 characters long!');
      rl.close();
      return;
    }
    
    try {
      // Generate password hash
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      console.log('\n✅ Admin credentials generated successfully!');
      console.log('==========================================');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      console.log(`\n🔒 Password Hash (copy this to adminAuth.js):`);
      console.log('==========================================');
      console.log(passwordHash);
      console.log('\n📝 Instructions:');
      console.log('1. Copy the password hash above');
      console.log('2. Open backend/routes/adminAuth.js');
      console.log('3. Replace the ADMIN_PASSWORD_HASH value with the hash above');
      console.log('4. Restart your backend server');
      console.log('\n⚠️  Keep your password secure and don\'t share it!');
      
    } catch (error) {
      console.error('❌ Error generating password hash:', error);
    }
    
    rl.close();
  });
});
