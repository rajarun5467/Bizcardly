const mongoose = require('mongoose');

mongoose.connect('mongodb://rajarun8078_db_user:4AakGgOA0EG6z7OW@ac-ls55oiw-shard-00-00.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-01.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-02.rdsr32z.mongodb.net:27017/bizcardly?ssl=true&replicaSet=atlas-129zuk-shard-0&authSource=admin&appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const gallerySchema = new mongoose.Schema({}, { strict: false });
    const Gallery = mongoose.model('Gallery', gallerySchema);
    
    // Find and delete items with invalid image URLs
    const invalidItems = await Gallery.find({ 
      $or: [
        { imageUrl: '/uploads/undefined' },
        { imageUrl: { $exists: false } },
        { imageUrl: null },
        { imageUrl: '' }
      ]
    });
    
    console.log(`\n🗑️  Found ${invalidItems.length} invalid gallery items`);
    
    if (invalidItems.length > 0) {
      const result = await Gallery.deleteMany({ 
        $or: [
          { imageUrl: '/uploads/undefined' },
          { imageUrl: { $exists: false } },
          { imageUrl: null },
          { imageUrl: '' }
        ]
      });
      
      console.log(`✅ Deleted ${result.deletedCount} invalid items`);
    }
    
    // Show remaining items
    const remainingItems = await Gallery.find({});
    console.log(`\n📊 Remaining gallery items: ${remainingItems.length}\n`);
    
    remainingItems.forEach((item, i) => {
      console.log(`${i + 1}. ID: ${item._id}`);
      console.log(`   Image URL: ${item.imageUrl}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
