import { execSync } from 'node:child_process';
import pg from 'pg';

const dbUrl = execSync(
  'gcloud secrets versions access latest --secret=DATABASE_URL --project=airborne-aviation-505100',
  { encoding: 'utf8' }
).trim();
const u = new URL(dbUrl);
const directUrl = `postgresql://${u.username}:${u.password}@34.93.180.179:5432${u.pathname}?sslmode=disable`;

const client = new pg.Client({ connectionString: directUrl, ssl: false });

async function runSmokeTest() {
  console.log('--- 1. Testing Live Website Intake: https://www.airborneaviation.in/api/lead ---');
  const testPhone = '+919871112233';
  const payload = {
    name: 'Pooja Sharma (Webinar Test)',
    email: 'pooja.sharma.test@gmail.com',
    phone: testPhone,
    source: 'WEBINAR_REGISTRATION',
    courseInterest: 'Parents Aviation Guidance Webinar',
    notes: 'Smoke test for webinar unpaid lead flow',
    customFields: {
      webinar: {
        eventDate: '2026-11-01',
        eventTime: '7:00 PM IST',
        paymentStatus: 'UNPAID',
        registeredAt: new Date().toISOString()
      }
    },
    tags: ['webinar', 'parents_webinar']
  };

  const response = await fetch('https://www.airborneaviation.in/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await response.json();
  console.log(`Intake API Status: ${response.status}`);
  console.log('Intake API Response:', resJson);

  if (!response.ok) {
    throw new Error(`Failed to submit lead: ${response.statusText}`);
  }

  console.log('\n--- 2. Verifying Cloud SQL Database Persistence ---');
  await client.connect();

  const leadRes = await client.query(
    'SELECT id, name, email, phone, status, source, tags, "customFields", "lastActivityAt", "createdAt" FROM leads WHERE phone = $1;',
    [testPhone]
  );

  if (leadRes.rows.length === 0) {
    throw new Error(`Lead with phone ${testPhone} not found in Cloud SQL!`);
  }

  const lead = leadRes.rows[0];
  console.log('Lead Record in Cloud SQL:');
  console.log({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    tags: lead.tags,
    paymentStatus: lead.customFields?.webinar?.paymentStatus,
    lastActivityAt: lead.lastActivityAt,
    createdAt: lead.createdAt
  });

  const actRes = await client.query(
    'SELECT id, "activityType", title, notes, "completedAt" FROM lead_activities WHERE "leadId" = $1 ORDER BY "completedAt" DESC LIMIT 5;',
    [lead.id]
  );
  console.log('\nLead Activities in Cloud SQL:');
  console.log(actRes.rows);

  console.log('\n--- 3. Testing Admin CRM Leads Query (Webinar Filter) ---');
  // Simulating Admin query: tags has 'webinar' ordered by lastActivityAt DESC
  const webinarLeadsRes = await client.query(
    `SELECT id, name, phone, status, tags, "customFields"->'webinar'->>'paymentStatus' as webinar_payment_status, "lastActivityAt"
     FROM leads
     WHERE "deletedAt" IS NULL AND tags @> ARRAY['webinar']::text[]
     ORDER BY "lastActivityAt" DESC NULLS LAST
     LIMIT 10;`
  );

  console.log(`Found ${webinarLeadsRes.rows.length} Webinar Leads in CRM:`);
  console.table(webinarLeadsRes.rows);

  console.log('\n--- 4. Testing Re-enquiry Flow (Reactivating and Updating Lead) ---');
  const updatePayload = {
    name: 'Pooja Sharma (Updated Webinar Test)',
    email: 'pooja.sharma.updated@gmail.com',
    phone: testPhone,
    source: 'WEBINAR_REGISTRATION',
    courseInterest: 'Parents Aviation Guidance Webinar',
    notes: 'Second submission test',
    customFields: {
      webinar: {
        eventDate: '2026-11-01',
        eventTime: '7:00 PM IST',
        paymentStatus: 'UNPAID',
        registeredAt: new Date().toISOString()
      }
    },
    tags: ['webinar', 'parents_webinar']
  };

  const updateResponse = await fetch('https://www.airborneaviation.in/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });

  const updateResJson = await updateResponse.json();
  console.log(`Re-enquiry API Status: ${updateResponse.status}`);
  console.log('Re-enquiry API Response:', updateResJson);

  const updatedLeadRes = await client.query(
    'SELECT id, name, email, phone, status, "lastActivityAt" FROM leads WHERE phone = $1;',
    [testPhone]
  );
  console.log('Updated Lead Record in Cloud SQL:');
  console.log(updatedLeadRes.rows[0]);

  await client.end();
  console.log('\n=== SMOKE TEST COMPLETED SUCCESSFULLY ===');
}

runSmokeTest().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
