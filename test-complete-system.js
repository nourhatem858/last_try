/**
 * اختبار شامل للنظام - اللوجين والسين اب والداتابيس
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testSystem() {
  try {
    log('\n🚀 بدء اختبار النظام الكامل...', 'cyan');
    log('═══════════════════════════════════════\n', 'cyan');

    // 1. اختبار الاتصال بالداتابيس
    log('📡 الخطوة 1: اختبار الاتصال بـ MongoDB...', 'blue');
    
    if (!process.env.MONGODB_URI) {
      log('❌ خطأ: MONGODB_URI غير موجود في .env.local', 'red');
      process.exit(1);
    }

    log(`   URI: ${process.env.MONGODB_URI.substring(0, 50)}...`, 'yellow');
    
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ تم الاتصال بـ MongoDB بنجاح!', 'green');
    log(`   Database: ${mongoose.connection.db.databaseName}`, 'green');
    log(`   Host: ${mongoose.connection.host}\n`, 'green');

    // 2. اختبار إنشاء مستخدم جديد (Sign Up)
    log('📝 الخطوة 2: اختبار إنشاء حساب جديد (Sign Up)...', 'blue');
    
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test123456';
    const testName = 'Test User';

    // حذف المستخدم إذا كان موجود
    await User.deleteOne({ email: testEmail });

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    // إنشاء المستخدم
    const newUser = await User.create({
      name: testName,
      email: testEmail,
      password: hashedPassword,
      role: 'user',
    });

    log('✅ تم إنشاء المستخدم بنجاح!', 'green');
    log(`   ID: ${newUser._id}`, 'green');
    log(`   Name: ${newUser.name}`, 'green');
    log(`   Email: ${newUser.email}\n`, 'green');

    // 3. اختبار تسجيل الدخول (Login)
    log('🔐 الخطوة 3: اختبار تسجيل الدخول (Login)...', 'blue');
    
    // البحث عن المستخدم
    const foundUser = await User.findOne({ email: testEmail });
    
    if (!foundUser) {
      log('❌ خطأ: لم يتم العثور على المستخدم', 'red');
      process.exit(1);
    }

    log('✅ تم العثور على المستخدم', 'green');

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(testPassword, foundUser.password);
    
    if (!isPasswordValid) {
      log('❌ خطأ: كلمة المرور غير صحيحة', 'red');
      process.exit(1);
    }

    log('✅ كلمة المرور صحيحة!', 'green');
    log(`   User ID: ${foundUser._id}`, 'green');
    log(`   Email: ${foundUser.email}\n`, 'green');

    // 4. اختبار قراءة البيانات
    log('📊 الخطوة 4: اختبار قراءة البيانات...', 'blue');
    
    const allUsers = await User.find({});
    log(`✅ تم العثور على ${allUsers.length} مستخدم في قاعدة البيانات`, 'green');
    
    if (allUsers.length > 0) {
      log('\n   المستخدمين الموجودين:', 'yellow');
      allUsers.slice(0, 5).forEach((user, index) => {
        log(`   ${index + 1}. ${user.name} (${user.email})`, 'yellow');
      });
    }

    // 5. تنظيف - حذف المستخدم التجريبي
    log('\n🧹 الخطوة 5: تنظيف البيانات التجريبية...', 'blue');
    await User.deleteOne({ email: testEmail });
    log('✅ تم حذف المستخدم التجريبي\n', 'green');

    // النتيجة النهائية
    log('═══════════════════════════════════════', 'cyan');
    log('🎉 جميع الاختبارات نجحت!', 'green');
    log('═══════════════════════════════════════\n', 'cyan');
    
    log('✅ الداتابيس شغال', 'green');
    log('✅ السين اب شغال', 'green');
    log('✅ اللوجين شغال', 'green');
    log('✅ قراءة البيانات شغالة\n', 'green');

  } catch (error) {
    log('\n❌ حدث خطأ:', 'red');
    log(error.message, 'red');
    
    if (error.message.includes('authentication failed')) {
      log('\n💡 الحل: تحقق من اسم المستخدم وكلمة المرور في MongoDB Atlas', 'yellow');
    } else if (error.message.includes('ENOTFOUND')) {
      log('\n💡 الحل: تحقق من عنوان الـ cluster في connection string', 'yellow');
    } else if (error.message.includes('IP')) {
      log('\n💡 الحل: أضف IP الخاص بك في MongoDB Atlas Network Access', 'yellow');
      log('   أو اسمح بالوصول من أي مكان (0.0.0.0/0)', 'yellow');
    }
    
    console.error('\nتفاصيل الخطأ الكاملة:');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n👋 تم إغلاق الاتصال بقاعدة البيانات', 'cyan');
  }
}

// تشغيل الاختبار
testSystem();
