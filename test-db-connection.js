const net = require('net');

const HOST = 'ep-square-breeze-aqtwrpnv-pooler.c-8.us-east-1.aws.neon.tech';
const PORT = 5432;

console.log(`Testing TCP connection to ${HOST}:${PORT}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.connect(PORT, HOST, () => {
  console.log('✅ SUCCESS: Successfully established a TCP connection to Neon database!');
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ ERROR: Could not connect to Neon database.');
  console.error(err);
  console.log('\n💡 Diagnostic Tip:');
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    console.log('This usually means your current internet connection (WiFi/network) is blocking outgoing connections on port 5432.');
    console.log('Try switching to a mobile hotspot or another network to see if it connects successfully.');
  }
  process.exit(1);
});

socket.on('timeout', () => {
  console.error('❌ ERROR: Connection timed out after 5 seconds.');
  console.log('\n💡 Diagnostic Tip:');
  console.log('Your network is blocking outgoing traffic on port 5432 (default PostgreSQL port). Try a different internet connection (like a mobile hotspot).');
  socket.destroy();
  process.exit(1);
});
