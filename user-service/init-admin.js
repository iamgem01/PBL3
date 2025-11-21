// init-admin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import crypto from 'crypto';

dotenv.config();

const createAdminUser = async () => {
    try {
        console.log(' Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Connected to MongoDB');

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
            console.log('🔑 Login Methods:', adminExists.loginMethods?.join(', ') || 'password');

            // Update admin với passwordless options
            adminExists.role = 'admin';
            adminExists.permissions = ['read', 'write', 'delete', 'admin'];
            adminExists.isActive = true;

            //
            adminExists.allowPasswordless = true;
            adminExists.loginMethods = ['password', 'magic_link'];

            // Tạo magic link secret nếu chưa có
            if (!adminExists.magicLinkSecret) {
                adminExists.magicLinkSecret = crypto.randomBytes(32).toString('hex');
            }

            await adminExists.save();
            console.log('Admin user updated with passwordless login');

            // Hiển thị magic link demo
            console.log('\n Magic Link Demo:');
            console.log(`http://yourapp.com/auth/magic-login?token=DEMO_TOKEN&email=${adminEmail}`);

            return;
        }

        // Create new admin user với passwordless capability
        console.log('🔄 Creating admin user...');
        const adminUser = new User({
            email: adminEmail,
            password: adminPassword,
            name: 'Aeternus Admin',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin'],
            isActive: true,
            // 🔓 THÊM: Passwordless options
            allowPasswordless: true,
            loginMethods: ['password', 'magic_link'],
            magicLinkSecret: crypto.randomBytes(32).toString('hex')
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
        console.log('🔓 Passwordless Login: ENABLED');
        console.log('🔒 Permissions:', adminUser.permissions.join(', '));
        console.log('🟢 Status: Active');
        console.log('=================================');
        console.log('');
        console.log('⚠️  You can now login with password OR magic link!');

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