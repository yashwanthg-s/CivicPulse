const ComplaintController = require('./controllers/complaintController');
const Complaint = require('./models/Complaint');
require('dotenv').config();

async function testGrouping() {
  try {
    console.log('🧪 Testing duplicate grouping...\n');

    // Get complaints for each category
    const categories = ['infrastructure', 'sanitation', 'traffic', 'utilities'];

    for (const category of categories) {
      console.log(`\n📋 Category: ${category.toUpperCase()}`);
      console.log('='.repeat(50));

      // Get raw complaints
      const rawComplaints = await Complaint.findAll({
        category: category,
        status: 'submitted'
      });

      console.log(`Raw complaints: ${rawComplaints.length}`);
      rawComplaints.forEach(c => {
        console.log(`  - ID ${c.id}: ${c.title}`);
      });

      // Group duplicates
      const groupedComplaints = await ComplaintController.groupDuplicateComplaints(rawComplaints);

      console.log(`\nGrouped complaints: ${groupedComplaints.length}`);
      groupedComplaints.forEach(c => {
        const badge = c.duplicate_count > 1 ? `🔄 ${c.duplicate_count}` : '';
        console.log(`  - ID ${c.id}: ${c.title} ${badge}`);
      });
    }

    console.log('\n✅ Grouping test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testGrouping();
