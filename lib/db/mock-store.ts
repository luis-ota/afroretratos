import {
  mockBlockedOrigins,
  mockEvents,
  mockPosts,
  mockReports,
  type MockBlockedOrigin,
  type MockEvent,
  type MockPost,
  type MockReport,
} from "./mock-data";

export type MockState = {
  events: MockEvent[];
  posts: MockPost[];
  blocked: MockBlockedOrigin[];
  reports: MockReport[];
};

const globalForMock = globalThis as typeof globalThis & {
  __afroretratosMock?: MockState;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Store em memoria usado somente quando DATABASE_URL nao esta configurada.
 * Permite rodar e validar o produto sem banco; em producao o PostgreSQL e
 * a unica fonte de verdade.
 */
export function mockDb(): MockState {
  if (!globalForMock.__afroretratosMock) {
    globalForMock.__afroretratosMock = {
      events: clone(mockEvents),
      posts: clone(mockPosts),
      blocked: clone(mockBlockedOrigins),
      reports: clone(mockReports),
    };
  }
  return globalForMock.__afroretratosMock;
}

export function newId(): string {
  return crypto.randomUUID();
}
