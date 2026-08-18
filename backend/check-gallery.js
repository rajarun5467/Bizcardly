const mongoose = require('mongoose');

mongoose.connect('mongodb://rajarun8078_db_user:4AakGgOA0EG6z7OW@ac-ls55oiw-shard-00-00.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-01.rdsr32z.mongodb.net:27017,ac-ls55oiw-shard-00-02.rdsr32z.mongodb.net:27017/bizcardly?ssl=true&replicaSet=atlas-129zuk-shard-0&authSource=admin&appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const gallerySchema = new mongoose.Schema({}, { strict: false });
    const Gallery = mongoose.model('Gallery', gallerySchema);
    
    const items = await Gallery.find({});
    console.log(`\n📊 Gallery items: ${items.length}\n`);
    
    if (items.length === 0) {
      console.log('No gallery items found in database');
    } else {
      items.forEach((item, i) => {
        console.log(`${i + 1}. ID: ${item._id}`);
        console.log(`   Business ID: ${item.businessId}`);
        console.log(`   Image URL: ${item.imageUrl}`);
        console.log(`   Created: ${item.createdAt}`);
        console.log('');
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
