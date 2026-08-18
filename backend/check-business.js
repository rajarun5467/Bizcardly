const mongoose = require('mongoose');

mongoose.connect('mongodb://rajarun8078_db_user:4AakGgOA0EG6z7OW@ac-ls55oiw-shard-00-00.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-01.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-02.rdsr32z.mongodb.net:27017/bizcardly?ssl=true&replicaSet=atlas-129zuk-shard-0&authSource=admin&appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const businessSchema = new mongoose.Schema({}, { strict: false });
    const Business = mongoose.model('Business', businessSchema);
    
    const businesses = await Business.find({});
    console.log(`\n📊 Business records: ${businesses.length}\n`);
    
    if (businesses.length === 0) {
      console.log('No business records found in database');
    } else {
      businesses.forEach((business, i) => {
        console.log(`${i + 1}. ID: ${business._id}`);
        console.log(`   User ID: ${business.userId}`);
        console.log(`   Name: ${business.name || business.businessName || 'N/A'}`);
        console.log(`   Logo: ${business.logo || 'N/A'}`);
        console.log(`   Profile Image: ${business.profileImage || 'N/A'}`);
        console.log(`   Payment QR: ${business.paymentQR || 'N/A'}`);
        console.log('');
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
