const mongoose = require('mongoose');
const env = require('./src/config/env');

const KitSchema = new mongoose.Schema({
  title: String,
  status: String,
  study_days: Number,
  kitData: mongoose.Schema.Types.Mixed
}, { collection: 'kits' });

const Kit = mongoose.model('Kit', KitSchema);

async function run() {
  await mongoose.connect(env.config.mongoUri);
  const kit = await Kit.findOne({ status: 'completed' }).sort({ _id: -1 });
  if (kit) {
    console.log("Kit title:", kit.title);
    console.log("Root study days:", kit.study_days);
    console.log("kitData schedule days available:", kit.kitData?.schedule?.days_available);
    console.log("kitData schedule array length:", kit.kitData?.schedule?.days?.length);
  } else {
    console.log("No kit found");
  }
  process.exit(0);
}

run();
