const ComplaintController = require('./controllers/complaintController');
const Complaint = require('./models/Complaint');
require('dotenv').config();

async function testController() {
  try {
    console.log('🧪 Testing controller directly...\n');

    // Mock request and response objects
    const mockReq = {
      query: {
        role: 'officer',
        category: 'traffic',
        status: 'resolved'
      }
    };

    const mockRes = {
      json: function(data) {
        console.log('Response:', JSON.stringify(data, null, 2));
      },
      status: function(code) {
        return this;
      }
    };

    console.log('Mock request query:', mockReq.query);
    console.log('\nCalling ComplaintController.getComplaints...\n');

    await ComplaintController.getComplaints(mockReq, mockRes);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testController();
