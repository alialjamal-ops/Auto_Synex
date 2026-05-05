import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration
export const options = {
  // Scenario 1: Smoke Test (1 user for 1 minute)
  // Scenario 2: Load Test (up to 100 users over 5 minutes)
  // Scenario 3: Stress Test (up to 500 users over 10 minutes)
  
  stages: [
    { duration: '1m', target: 20 },  // Ramp-up to 20 users
    { duration: '3m', target: 50 },  // Stay at 50 users (Load)
    { duration: '1m', target: 100 }, // Ramp-up to 100 users (Stress start)
    { duration: '2m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp-down to 0 users
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

// Target URL - Replace with your deployed URL or local server
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5173';

export default function () {
  // 1. Load Main Page
  const res = http.get(BASE_URL);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'contains Auto Synex': (r) => r.body.includes('Auto Synex'),
  });

  // 2. Load Assets (Simulate browser loading)
  // In a real scenario, you would list important assets here
  // http.get(`${BASE_URL}/assets/logo.svg`);
  
  sleep(1); // Wait for 1 second between iterations to simulate real user behavior
}

/*
  HOW TO RUN:
  1. Install k6 (https://k6.io/docs/getting-started/installation/)
  2. Start your local server: npm run dev
  3. Run the test:
     k6 run load_test.js
  
  TO TEST A DEPLOYED SITE:
     k6 run -e TARGET_URL=https://your-site.com load_test.js
*/
