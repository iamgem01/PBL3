// init-admin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const adminEmail = 'aeternusad01@gmail.com';
    const adminPassword = 'Ngochoai123@';
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log('📌 Admin user already exists');
      console.log('📧 Email:', adminExists.email);
      console.log('👤 Name:', adminExists.name);
      console.log('👑 Role:', adminExists.role);
      console.log('🔒 Permissions:', adminExists.permissions.join(', '));
      console.log('🟢 Status:', adminExists.isActive ? 'Active' : 'Inactive');
      
      // Update admin if needed
      if (adminExists.role !== 'admin' || !adminExists.permissions.includes('admin')) {
        adminExists.role = 'admin';
        adminExists.permissions = ['read', 'write', 'delete', 'admin'];
        adminExists.isActive = true;
        await adminExists.save();
        console.log('✅ Admin user updated');
      }
      
      return;
    }
    
    // Create new admin user
    console.log('🔄 Creating admin user...');
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      name: 'Aeternus Admin',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('');
    console.log('=================================');
    console.log('✅ Admin user created successfully');
    console.log('=================================');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminUser.name);
    console.log('👑 Role:', adminUser.role);
    console.log('🔒 Permissions:', adminUser.permissions.join(', '));
    console.log('🟢 Status: Active');
    console.log('=================================');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.code === 11000) {
      console.error('💡 User with this email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

createAdminUser();