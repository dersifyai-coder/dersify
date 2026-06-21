import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from './context.service';
import { LearnerService } from '../learner/learner.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContextBudgetManager } from './context-budget.manager';
import { RagService } from '../rag/rag.service';
import { initSessionInsights } from './session-insights';
import { MOTIVATION_FRAMING } from './motivation-framing';

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'learner-uuid',
    fullName: 'Test Learner',
    email: 'test@example.com',
    motivation: 'curiosity',
    learningApproach: 'visual examples',
    struggleResponse: 'take a break',
    hoursPerWeek: '3-5',
    learningPace: 'steady',
    onboardingCompleted: true,
    calibrationScore: 0.0,
    subscriptionTier: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeKnowledgeSummary(overrides: Record<string, unknown> = {}) {
  return {
    confirmed: [{ displayName: 'Variables', confidence: 0.8, canonicalId: 'js.variables' }],
    shaky: [{ displayName: 'Closures', confidence: 0.45, canonicalId: 'js.closures' }],
    newConcepts: [{ displayName: 'Generators', confidence: 0.1, canonicalId: 'js.generators' }],
    ...overrides,
  };
}

function makeMisconception(overrides: Record<string, unknown> = {}) {
  return {
    id: 'misc-uuid',
    learnerId: 'learner-uuid',
    conceptId: 'js.closures',
    topic: 'javascript',
    description: 'Thinks closures only apply to inner functions',
    misconceptionType: 'overgeneralization',
    severity: 'surface',
    remediationStrategy: 'Show counter-example with outer scope access',
    frequency: 2,
    resolved: false,
    resolvedInSession: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    concept: { displayName: 'Closures' },
    ...overrides,
  };
}

describe('ContextService', () => {
  let service: ContextService;
  let learnerService: {
    getProfile: jest.Mock;
    getTopicKnowledgeSummary: jest.Mock;
    getActiveMisconceptions: jest.Mock;
  };
  let prisma: { sessionMessage: { findMany: jest.Mock } };
  let budgetManager: { estimateTokens: jest.Mock; buildCompressionSummary: jest.Mock };

  beforeEach(async () => {
    learnerService = {
      getProfile: jest.fn().mockResolvedValue(makeProfile()),
      getTopicKnowledgeSummary: jest.fn().mockResolvedValue(makeKnowledgeSummary()),
      getActiveMisconceptions: jest.fn().mockResolvedValue([makeMisconception()]),
    };

    prisma = {
      sessionMessage: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    budgetManager = {
      estimateTokens: jest.fn().mockReturnValue(100),
      buildCompressionSummary: jest.fn().mockResolvedValue('[Turn 0-4 summary]: covered basics.'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextService,
        { provide: LearnerService, useValue: learnerService },
        { provide: PrismaService, useValue: prisma },
        { provide: ContextBudgetManager, useValue: budgetManager },
      ],
    }).compile();

    service = module.get<ContextService>(ContextService);
  });

  async function buildPrompt(insightsOverrides = {}) {
    const insights = { ...initSessionInsights('intermediate'), ...insightsOverrides };
    return service.buildSystemPrompt('learner-uuid', 'session-uuid', 'javascript', insights, 'free');
  }

  describe('Layer 1 — permanent context', () => {
    it('includes motivation framing instruction in system prompt', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ motivation: 'build-project' }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain(MOTIVATION_FRAMING['build-project']);
    });

    it('includes calibration instruction when score > 0.5 (underestimator)', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ calibrationScore: 0.8 }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('underestimates their ability');
      expect(systemPrompt).toContain('Probe deeper');
    });

    it('includes calibration instruction when score < -0.5 (overestimator)', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ calibrationScore: -0.8 }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('overestimates their ability');
      expect(systemPrompt).toContain('Check understanding before advancing');
    });

    it('indicates well-calibrated when score is between -0.5 and 0.5', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ calibrationScore: 0.1 }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('well-calibrated');
    });

    it('correctly shows confirmed concepts (confidence >= 0.65)', async () => {
      learnerService.getTopicKnowledgeSummary.mockResolvedValue(
        makeKnowledgeSummary({
          confirmed: [
            { displayName: 'Variables', confidence: 0.8, canonicalId: 'js.variables' },
            { displayName: 'Functions', confidence: 0.70, canonicalId: 'js.functions' },
          ],
        }),
      );
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Variables');
      expect(systemPrompt).toContain('Functions');
      expect(systemPrompt).toContain('Confirmed (confidence >= 0.65)');
    });

    it('correctly shows shaky concepts (confidence 0.30–0.65)', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Closures');
      expect(systemPrompt).toContain('Shaky (confidence 0.30–0.65)');
    });

    it('correctly shows new concepts (confidence < 0.30)', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Generators');
      expect(systemPrompt).toContain('New to learner (confidence < 0.30)');
    });

    it('includes active misconceptions with type and remediation strategy', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Thinks closures only apply to inner functions');
      expect(systemPrompt).toContain('overgeneralization');
      expect(systemPrompt).toContain('Show counter-example with outer scope access');
    });

    it('shows "No active misconceptions" when there are none', async () => {
      learnerService.getActiveMisconceptions.mockResolvedValue([]);
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('No active misconceptions on this topic.');
    });

    it('falls back to "curiosity" when profile motivation is null', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ motivation: null }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain(MOTIVATION_FRAMING['curiosity']);
    });

    it('falls back to curiosity framing for an unknown motivation key', async () => {
      learnerService.getProfile.mockResolvedValue(makeProfile({ motivation: 'unknown_key' }));
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain(MOTIVATION_FRAMING['curiosity']);
    });

    it('shows "not specified" when learningApproach and struggleResponse are null', async () => {
      learnerService.getProfile.mockResolvedValue(
        makeProfile({ learningApproach: null, struggleResponse: null }),
      );
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Learning approach: not specified');
      expect(systemPrompt).toContain('When stuck: not specified');
    });

    it('shows "None yet" / "None" when all knowledge arrays are empty', async () => {
      learnerService.getTopicKnowledgeSummary.mockResolvedValue({
        confirmed: [],
        shaky: [],
        newConcepts: [],
      });
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Confirmed (confidence >= 0.65): None yet');
      expect(systemPrompt).toContain('Shaky (confidence 0.30–0.65): None');
      expect(systemPrompt).toContain('New to learner (confidence < 0.30): None');
    });

    it('omits remediation strategy when it is null', async () => {
      learnerService.getActiveMisconceptions.mockResolvedValue([
        makeMisconception({ remediationStrategy: null }),
      ]);
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('Closures');
      // When remediationStrategy is null the Remediation line must not appear
      expect(systemPrompt).not.toContain('Show counter-example with outer scope access');
    });
  });

  describe('Layer 2 — session delta', () => {
    it('includes current mode with mode instruction', async () => {
      const { systemPrompt } = await buildPrompt({ currentMode: 'rescue' });
      expect(systemPrompt).toContain('Mode: rescue');
      expect(systemPrompt).toContain('struggling');
    });

    it('includes struggle and momentum signal counts', async () => {
      const { systemPrompt } = await buildPrompt({
        struggleSignals: 3,
        momentumSignals: 1,
      });
      expect(systemPrompt).toContain('3 struggles');
      expect(systemPrompt).toContain('1 momentum signals');
    });

    it('includes new misconceptions detected this session', async () => {
      const { systemPrompt } = await buildPrompt({
        newMisconceptionsDetected: [
          { conceptId: 'js.closures', description: 'Wrong scope assumption', type: 'detected', detectedAt: 3 },
        ],
      });
      expect(systemPrompt).toContain('Wrong scope assumption');
    });

    it('shows "None detected yet" when no session misconceptions', async () => {
      const { systemPrompt } = await buildPrompt({ newMisconceptionsDetected: [] });
      expect(systemPrompt).toContain('None detected yet');
    });

    it('lists concepts confirmed this session when array is non-empty', async () => {
      const { systemPrompt } = await buildPrompt({ conceptsConfirmed: ['Variables', 'Functions'] });
      expect(systemPrompt).toContain('Variables, Functions');
    });
  });

  describe('System prompt structure', () => {
    it('includes the Dersify identity header', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('You are Dersify');
      expect(systemPrompt).toContain('javascript');
    });

    it('includes RULES section', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('RULES:');
      expect(systemPrompt).toContain('Never mention modes, calibration scores');
    });

    it('includes all three layer markers', async () => {
      const { systemPrompt } = await buildPrompt();
      expect(systemPrompt).toContain('LEARNER PROFILE:');
      expect(systemPrompt).toContain('KNOWLEDGE ON THIS TOPIC');
      expect(systemPrompt).toContain('CURRENT SESSION STATE:');
    });
  });

  describe('Layer 3 — conversation history', () => {
    it('returns empty history when no messages exist', async () => {
      prisma.sessionMessage.findMany.mockResolvedValue([]);
      const { conversationHistory } = await buildPrompt();
      expect(conversationHistory).toHaveLength(0);
    });

    it('returns raw content for non-compressed messages', async () => {
      prisma.sessionMessage.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          sessionId: 'session-uuid',
          role: 'user',
          content: 'What is a closure?',
          turnIndex: 0,
          compressed: false,
          compressionSummary: null,
          createdAt: new Date(),
        },
        {
          id: 'msg-2',
          sessionId: 'session-uuid',
          role: 'assistant',
          content: 'A closure is a function that captures its lexical scope.',
          turnIndex: 1,
          compressed: false,
          compressionSummary: null,
          createdAt: new Date(),
        },
      ]);

      const { conversationHistory } = await buildPrompt();
      expect(conversationHistory).toHaveLength(2);
      expect(conversationHistory[0]).toEqual({ role: 'user', content: 'What is a closure?' });
      expect(conversationHistory[1]).toEqual({
        role: 'assistant',
        content: 'A closure is a function that captures its lexical scope.',
      });
    });

    it('replaces compressed message content with compressionSummary', async () => {
      prisma.sessionMessage.findMany.mockResolvedValue([
        {
          id: 'msg-old',
          sessionId: 'session-uuid',
          role: 'user',
          content: 'Original raw content — should not appear',
          turnIndex: 0,
          compressed: true,
          compressionSummary: '[Turn 0–4 summary]: Covered variable hoisting basics.',
          createdAt: new Date(),
        },
      ]);

      const { conversationHistory } = await buildPrompt();
      expect(conversationHistory[0]?.content).toBe('[Turn 0–4 summary]: Covered variable hoisting basics.');
      expect(conversationHistory[0]?.content).not.toContain('Original raw content');
    });
  });

  describe('caching', () => {
    it('calls DB only once for repeated calls with the same learnerId + topic', async () => {
      await buildPrompt();
      await buildPrompt();

      // Profile + knowledge summary + misconceptions should each be called once
      expect(learnerService.getProfile).toHaveBeenCalledTimes(1);
      expect(learnerService.getTopicKnowledgeSummary).toHaveBeenCalledTimes(1);
      expect(learnerService.getActiveMisconceptions).toHaveBeenCalledTimes(1);
    });

    it('expired cache entry is evicted and DB is re-queried on next call', async () => {
      await buildPrompt();
      expect(learnerService.getProfile).toHaveBeenCalledTimes(1);

      // Advance Date.now() by 11 minutes so the 10-minute TTL expires
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() + 11 * 60 * 1000);
      try {
        await buildPrompt();
        expect(learnerService.getProfile).toHaveBeenCalledTimes(2);
      } finally {
        Date.now = realDateNow;
      }
    });
  });

  describe('RAG section', () => {
    async function buildPromptWithRag(
      mockRagService: unknown,
      insightsOverrides = {},
    ) {
      const moduleWithRag = await Test.createTestingModule({
        providers: [
          ContextService,
          { provide: LearnerService, useValue: learnerService },
          { provide: PrismaService, useValue: prisma },
          { provide: ContextBudgetManager, useValue: budgetManager },
          { provide: RagService, useValue: mockRagService },
        ],
      }).compile();

      const svc = moduleWithRag.get<ContextService>(ContextService);
      const insights = { ...initSessionInsights('intermediate'), ...insightsOverrides };
      return svc.buildSystemPrompt('learner-uuid', 'session-uuid', 'javascript', insights, 'free');
    }

    it('includes RAG section when ragService has a search method and returns results', async () => {
      const mockRag = {
        search: jest.fn().mockResolvedValue([
          { content: 'Closures capture the surrounding lexical scope.' },
          { content: 'Inner functions access outer variables via closure.' },
        ]),
      };

      const { systemPrompt } = await buildPromptWithRag(mockRag);

      expect(systemPrompt).toContain("LEARNER'S OWN MATERIALS");
      expect(systemPrompt).toContain('Closures capture the surrounding lexical scope.');
      expect(mockRag.search).toHaveBeenCalledWith('learner-uuid', 'javascript', 3);
    });

    it('excludes RAG section when search returns an empty array', async () => {
      const mockRag = { search: jest.fn().mockResolvedValue([]) };
      const { systemPrompt } = await buildPromptWithRag(mockRag);
      expect(systemPrompt).not.toContain("LEARNER'S OWN MATERIALS");
    });

    it('excludes RAG section and does not throw when search rejects', async () => {
      const mockRag = { search: jest.fn().mockRejectedValue(new Error('vector DB unavailable')) };
      const { systemPrompt } = await buildPromptWithRag(mockRag);
      expect(systemPrompt).not.toContain("LEARNER'S OWN MATERIALS");
    });

    it('excludes RAG section when ragService exists but has no search method', async () => {
      // ragService is injected but the search method is missing (e.g., F-05 stub)
      const mockRag = {};
      const { systemPrompt } = await buildPromptWithRag(mockRag);
      expect(systemPrompt).not.toContain("LEARNER'S OWN MATERIALS");
    });
  });
});
