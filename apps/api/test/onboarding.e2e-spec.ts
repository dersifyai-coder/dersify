import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Requires .env.test with a real test database.
 * Run with: jest --config jest.e2e.json
 */
describe('OnboardingController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Replace with a valid JWT for a test learner created in beforeAll
  let bearerToken: string;
  let learnerId: string;

  const validBody = {
    motivation:        'build-project',
    learning_approach: 'example-first',
    struggle_response: 'hints',
    hours_per_week:    '3-5',
    learning_pace:     'steady',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a test profile + get a token via the auth endpoint
    // In CI this hits the real test DB configured in .env.test
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email:    `e2e-onboarding-${Date.now()}@test.dersify.com`,
        password: 'TestPassword1!',
        fullName: 'E2E Test User',
      });

    const session = registerRes.body?.data?.session as { access_token?: string } | undefined;
    bearerToken = session?.access_token ?? '';
    learnerId   = registerRes.body?.data?.user?.id as string ?? '';
  });

  afterAll(async () => {
    if (learnerId) {
      await prisma.profile.deleteMany({ where: { id: learnerId } }).catch(() => null);
    }

    await app.close();
  });

  describe('POST /api/v1/onboarding/complete', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding/complete')
        .send(validBody)
        .expect(401);
    });

    it('returns 400 with an invalid enum value', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding/complete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ ...validBody, motivation: 'invalid-value' })
        .expect(400);
    });

    it('returns 201 with a valid body and token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/onboarding/complete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(validBody)
        .expect(201);

      expect(res.body).toMatchObject({ success: true, message: 'Onboarding completed.' });
    });

    it('returns 409 if called a second time', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/onboarding/complete')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(validBody)
        .expect(409);
    });
  });
});
