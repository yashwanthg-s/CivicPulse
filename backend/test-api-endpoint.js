const http = require('http');

function testEndpoint(category, status) {
  return new Promise((resolve) => {
    const url = `http://localhost:5003/api/complaints?role=officer&category=${category}&status=${status}`;
    console.log(`\n📍 Testing: ${url}`);
    
    http.get(url, { headers: { 'Authorization': 'Bearer test' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   ✓ Status: ${res.statusCode}`);
          console.log(`   ✓ Count: ${json.count}`);
          console.log(`   ✓ Complaints: ${json.complaints.length}`);
          if (json.complaints.length > 0) {
            console.log(`   Complaints:`);
            json.complaints.forEach(c => {
              console.log(`     - ID ${c.id}: ${c.title} (status: ${c.status})`);
            });
          }
        } catch (e) {
          console.log(`   ✗ Error parsing response: ${e.message}`);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log(`   ✗ Request error: ${e.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');
  
  const categories = ['infrastructure', 'sanitation', 'traffic', 'utilities'];
  
  for (const cat of categories) {
    await testEndpoint(cat, 'resolved');
  }
  
  console.log('\n✅ Tests complete');
  process.exit(0);
}

runTests();
