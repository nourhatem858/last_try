/**
 * إنشاء مستخدم تجريبي للاختبار
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createDemoUser() {
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح!\n');

    // بيانات المستخدم التجريبي
    const demoUser = {
      name: 'مستخدم تجريبي',
      email: 'demo@test.com',
      password: '123456',
      role: 'user',
    };

    // حذف المستخدم إذا كان موجود
    await User.deleteOne({ email: demoUser.email });
    console.log('🧹 تنظيف البيانات القديمة...\n');

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoUser.password, salt);

    // إنشاء المستخدم
    const user = await User.create({
      name: demoUser.name,
      email: demoUser.email,
      password: hashedPassword,
      role: demoUser.role,
    });

    console.log('═══════════════════════════════════════');
    console.log('✅ تم إنشاء المستخدم التجريبي بنجاح!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📧 البريد الإلكتروني:', demoUser.email);
    console.log('🔑 كلمة المرور:', demoUser.password);
    console.log('👤 الاسم:', demoUser.name);
    console.log('🆔 ID:', user._id.toString());
    
    console.log('\n═══════════════════════════════════════');
    console.log('🚀 يمكنك الآن تسجيل الدخول بهذه البيانات');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 تأكد من السماح بالـ IP في MongoDB Atlas Network Access');
    }
  } finally {
    await mongoose.connection.close();
    console.log('👋 تم إغلاق الاتصال\n');
  }
}

createDemoUser();
