import http from 'http';
import { createServerApp } from '../../server';
import { store } from '../data/store';

const TEST_PORT = 3099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

let serverInstance: http.Server | null = null;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    testsFailed++;
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; headers: Headers; body: T }> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  let body: any = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: res.status, headers: res.headers, body };
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 FIRME STUDIO — Integration & Security Test Suite');
  console.log('======================================================\n');

  // Reset store to predictable defaults
  store.resetToDefaults();

  const app = await createServerApp();
  await new Promise<void>((resolve) => {
    serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Health & Security Headers
    // ----------------------------------------------------
    console.log('\n[1] Health Check & Security Headers');
    const health = await apiRequest('/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.body.status === 'ok', 'Health body status is "ok"');
    assert(typeof health.body.metrics?.totalClients === 'number', 'Health includes studio business metrics');
    assert(
      health.headers.get('x-content-type-options') === 'nosniff',
      'Security header X-Content-Type-Options: nosniff present'
    );
    assert(
      health.headers.get('x-frame-options') === 'SAMEORIGIN',
      'Security header X-Frame-Options: SAMEORIGIN present'
    );
    assert(
      health.headers.get('referrer-policy') === 'strict-origin-when-cross-origin',
      'Security header Referrer-Policy present'
    );

    // ----------------------------------------------------
    // TEST GROUP 2: Class Management & Spot Capacity
    // ----------------------------------------------------
    console.log('\n[2] Class Management & Capacity Bounds');
    const createClassRes = await apiRequest('/classes', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Master Test Reformer',
        instructor: 'Valeria Soler',
        time: '11:00',
        day: 'mie',
        level: 'intermedio',
        classType: 'reformer',
        totalSpots: 2, // Tiny class with only 2 beds for capacity testing
      }),
    });

    assert(createClassRes.status === 201, 'POST /api/classes creates a new class');
    const testClass = createClassRes.body.data;
    assert(testClass.totalSpots === 2, 'Total spots configured strictly to 2');
    assert(testClass.occupiedSpots === 0, 'Initial occupied spots is 0');

    // ----------------------------------------------------
    // TEST GROUP 3: Concurrency, Overbooking & Duplicate Prevention
    // ----------------------------------------------------
    console.log('\n[3] Concurrency, Overbooking & Duplicate Prevention');

    // Student 1 books spot 1
    const book1 = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        classId: testClass.id,
        clientName: 'Alumna Uno',
        clientEmail: 'alumna1@firme.pe',
        clientPhone: '+51 988 111 222',
      }),
    });
    assert(book1.status === 201, 'Student 1 books spot 1 successfully');

    // Student 1 tries duplicate booking in the exact same class
    const dupBooking = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        classId: testClass.id,
        clientName: 'Alumna Uno',
        clientEmail: 'alumna1@firme.pe',
        clientPhone: '+51 988 111 222',
      }),
    });
    assert(dupBooking.status === 400, 'Duplicate booking for same student in same class is rejected (400)');
    assert(
      dupBooking.body.error.includes('reserva activa'),
      'Error message mentions active duplicate reservation'
    );

    // Student 2 books spot 2 (fills class 2/2)
    const book2 = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        classId: testClass.id,
        clientName: 'Alumna Dos',
        clientEmail: 'alumna2@firme.pe',
        clientPhone: '+51 988 222 333',
      }),
    });
    assert(book2.status === 201, 'Student 2 books spot 2 successfully');

    // Student 3 attempts to book the now-full class (2/2)
    const overbookRes = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        classId: testClass.id,
        clientName: 'Alumna Tres',
        clientEmail: 'alumna3@firme.pe',
        clientPhone: '+51 988 333 444',
      }),
    });
    assert(overbookRes.status === 400, 'Overbooking rejected when class is at capacity (400)');
    assert(
      overbookRes.body.error.includes('cupos disponibles'),
      'Overbooking error message informs about capacity cap'
    );

    // ----------------------------------------------------
    // TEST GROUP 4: Reformer Bed Assignment & Collision Prevention
    // ----------------------------------------------------
    console.log('\n[4] Reformer Bed Assignment & Collision Prevention (Beds 1-8)');
    const b1Id = book1.body.data.id;
    const b2Id = book2.body.data.id;

    // Assign Bed #3 to Student 1
    const assignBed1 = await apiRequest(`/bookings/${b1Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 3 }),
    });
    assert(assignBed1.status === 200, 'Assign Bed #3 to Student 1 succeeds');
    assert(assignBed1.body.data.bedNumber === 3, 'Booking has bedNumber = 3');

    // Attempt to assign the SAME Bed #3 to Student 2 in the same session
    const assignCollision = await apiRequest(`/bookings/${b2Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 3 }),
    });
    assert(assignCollision.status === 400, 'Bed collision rejected (400) when Bed #3 is already taken');
    assert(
      assignCollision.body.error.includes('ya está asignada') || assignCollision.body.error.includes('ocupada'),
      'Collision message indicates bed is already taken'
    );

    // Reject out-of-range or non-numeric beds (FIRME has beds 1-8)
    const invalidBed0 = await apiRequest(`/bookings/${b2Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 0 }),
    });
    assert(invalidBed0.status === 400, 'Bed #0 rejected as out of bounds');

    const invalidBed9 = await apiRequest(`/bookings/${b2Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 9 }),
    });
    assert(invalidBed9.status === 400, 'Bed #9 rejected as out of bounds');

    const invalidBedStr = await apiRequest(`/bookings/${b2Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 'no-es-numero' }),
    });
    assert(invalidBedStr.status === 400, 'Non-numeric bed value strictly rejected');

    // Assign available Bed #5 to Student 2
    const assignBed2 = await apiRequest(`/bookings/${b2Id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber: 5 }),
    });
    assert(assignBed2.status === 200, 'Assign available Bed #5 to Student 2 succeeds');

    // ----------------------------------------------------
    // TEST GROUP 5: Check-in Express & Attendance
    // ----------------------------------------------------
    console.log('\n[5] Express Reception Check-in');
    const checkInRes = await apiRequest(`/bookings/${b1Id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert(checkInRes.status === 200, 'Check-in returns 200 OK');
    assert(checkInRes.body.data.status === 'asistio', 'Status transitions to "asistio"');
    assert(Boolean(checkInRes.body.data.checkInTime), 'checkInTime is recorded');

    // ----------------------------------------------------
    // TEST GROUP 6: Fair Cancellation & Pack Credit Refund
    // ----------------------------------------------------
    console.log('\n[6] Fair Cancellation & Credit Refund');
    // Create client with pack of 5 credits
    const clientRes = await apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Carla Mendez',
        dni: '77889900',
        phone: '+51 911 222 333',
        email: 'carla.mendez@firme.pe',
        currentPlan: 'Pack 8 Clases',
        planType: 'pack',
        creditsLeft: 5,
      }),
    });
    assert(clientRes.status === 201, 'Create pack client with 5 credits');

    // Carla books class
    const carlaBooking = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        classId: 'lun-1',
        clientName: 'Carla Mendez',
        clientEmail: 'carla.mendez@firme.pe',
        clientPhone: '+51 911 222 333',
      }),
    });
    assert(carlaBooking.status === 201, 'Carla books class');

    // Verify credit was deducted to 4
    const clientAfterBook = store.getClients().find((c) => c.email === 'carla.mendez@firme.pe');
    assert(clientAfterBook?.creditsLeft === 4, '1 credit deducted upon booking (5 -> 4)');

    // Cancel with refund
    const cancelRes = await apiRequest(`/bookings/${carlaBooking.body.data.id}/cancel-with-refund`, {
      method: 'POST',
    });
    assert(cancelRes.status === 200, 'Cancel with refund succeeds');
    assert(cancelRes.body.refunded === true, 'Response confirms refunded: true');

    const clientAfterCancel = store.getClients().find((c) => c.email === 'carla.mendez@firme.pe');
    assert(clientAfterCancel?.creditsLeft === 5, 'Credit restored back to 5 upon cancellation');

    // ----------------------------------------------------
    // TEST GROUP 7: Financial Validation & Protection
    // ----------------------------------------------------
    console.log('\n[7] Financial Validation & Safe Numbers');
    const invalidTx = await apiRequest('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        concept: 'Pago inválido',
        amount: -50,
        paymentMethod: 'yape',
      }),
    });
    assert(invalidTx.status === 400, 'Negative amount transaction rejected (400)');

    const validTx = await apiRequest('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        concept: 'Pack 8 Clases Promo',
        amount: 578.0,
        paymentMethod: 'yape',
        clientName: 'Carla Mendez',
      }),
    });
    assert(validTx.status === 201, 'Valid transaction registered with status 201');
    assert(validTx.body.data.amount === 578.0, 'Amount recorded accurately');

    // ----------------------------------------------------
    // TEST GROUP 8: Unmatched Route 404 Handler
    // ----------------------------------------------------
    console.log('\n[8] Unknown Route 404 Behavior');
    const notFound = await apiRequest('/non-existent-endpoint');
    assert(notFound.status === 404, 'Unknown /api/* route returns 404');
    assert(notFound.body.success === false, 'Unknown route returns { success: false, error: ... }');

    // ----------------------------------------------------
    // TEST GROUP 9: High-Performance Pagination (Bookings & Clients)
    // ----------------------------------------------------
    console.log('\n[9] Pagination & Query Slicing');
    const paginatedBookings = await apiRequest('/bookings?page=1&limit=2');
    assert(paginatedBookings.status === 200, 'GET /api/bookings with pagination returns 200');
    assert(Array.isArray(paginatedBookings.body.data), 'Bookings data is array');
    assert(paginatedBookings.body.data.length <= 2, 'Page size respects limit = 2');
    assert(paginatedBookings.body.pagination?.page === 1, 'Pagination metadata reports page = 1');
    assert(paginatedBookings.body.pagination?.limit === 2, 'Pagination metadata reports limit = 2');
    assert(typeof paginatedBookings.body.pagination?.total === 'number', 'Pagination metadata reports total count');

    const paginatedClients = await apiRequest('/clients?page=1&limit=3');
    assert(paginatedClients.status === 200, 'GET /api/clients with pagination returns 200');
    assert(paginatedClients.body.data.length <= 3, 'Clients page size respects limit = 3');
    assert(paginatedClients.body.pagination?.limit === 3, 'Clients pagination limit is 3');

    // ----------------------------------------------------
    // TEST GROUP 10: HTTP Caching Headers
    // ----------------------------------------------------
    console.log('\n[10] HTTP Caching Headers (Classes)');
    const classesCached = await apiRequest('/classes');
    assert(classesCached.status === 200, 'GET /api/classes returns 200 OK');
    const cacheControl = classesCached.headers.get('cache-control');
    assert(
      Boolean(cacheControl && cacheControl.includes('public') && cacheControl.includes('max-age=30')),
      'Cache-Control header configured for public caching'
    );

    // ----------------------------------------------------
    // TEST GROUP 11: Telemetry & Memory Observability
    // ----------------------------------------------------
    console.log('\n[11] Health Telemetry & Memory Observability');
    const healthTelemetry = await apiRequest('/health');
    assert(healthTelemetry.status === 200, 'Health telemetry returns 200 OK');
    assert(typeof healthTelemetry.body.system?.rssMemoryMb === 'number', 'Health includes rssMemoryMb');
    assert(typeof healthTelemetry.body.system?.heapUsedMb === 'number', 'Health includes heapUsedMb');
    assert(typeof healthTelemetry.body.uptimeSeconds === 'number', 'Health includes uptimeSeconds');
    assert(typeof healthTelemetry.body.persistence === 'object', 'Health includes persistence telemetry');
  } catch (err: any) {
    console.error('Fatal test exception:', err);
    testsFailed++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`📊 Test Results: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log('------------------------------------------------------\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
