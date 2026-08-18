const mongoose = require('mongoose');

mongoose.connect('mongodb://rajarun8078_db_user:4AakGgOA0EG6z7OW@ac-ls55oiw-shard-00-00.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-01.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-02.rdsr32z.mongodb.net:27017/bizcardly?ssl=true&replicaSet=atlas-129zuk-shard-0&authSource=admin&appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const businessSchema = new mongoose.Schema({}, { strict: false });
    const Business = mongoose.model('Business', businessSchema);
    
    // Find and update items with invalid image URLs
    const invalidItems = await Business.find({ 
      $or: [
        { logo: '/uploads/undefined' },
        { logo: { $exists: false } },
        { logo: null },
        { logo: '' },
        { profileImage: '/uploads/undefined' },
        { profileImage: { $exists: false } },
        { profileImage: null },
        { profileImage: '' }
      ]
    });
    
    console.log(`\n🔍 Found ${invalidItems.length} business records with invalid images`);
    
    if (invalidItems.length > 0) {
      const result = await Business.updateMany(
        { 
          $or: [
            { logo: '/uploads/undefined' },
            { logo: { $exists: false } },
            { logo: null },
            { logo: '' },
            { profileImage: '/uploads/undefined' },
            { profileImage: { $exists: false } },
            { profileImage: null },
            { profileImage: '' }
          ]
        },
        { 
          $set: { 
            logo: '',
            profileImage: ''
          }
        }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} business records`);
    }
    
    // Show remaining items
    const remainingItems = await Business.find({});
    console.log(`\n📊 Business records: ${remainingItems.length}\n`);
    
    remainingItems.forEach((item, i) => {
      console.log(`${i + 1}. Name: ${item.name || item.businessName || 'N/A'}`);
      console.log(`   Logo: ${item.logo || 'N/A'}`);
      console.log(`   Profile Image: ${item.profileImage || 'N/A'}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
