const fs = require('fs');
const path = require('path');

console.log('Checking environment configuration...');

// Check NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
    if (nextAuthUrl.includes('77.110.115.3')) {
        console.warn('\x1b[33m%s\x1b[0m', 'WARNING: NEXTAUTH_URL is set to the public IP (77.110.115.3).');
        console.warn('This causes internal requests to fail with ETIMEDOUT due to NAT loopback issues.');
        console.warn('Please change NEXTAUTH_URL to "http://localhost:3000" or similar internal address in your .env file.');
        console.warn('Example: NEXTAUTH_URL=http://localhost:3000');
    }
} else {
    console.log('NEXTAUTH_URL is not set. Assuming default (origin) or VERCEL_URL.');
}

console.log('Environment check complete.');
