import type { EventStatus, PostStatus } from "@/lib/types";

export type MockEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  location: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type MockPost = {
  id: string;
  content: string;
  contactEncrypted: string | null;
  eventId: string | null;
  ipHash: string;
  ipEncrypted: string | null;
  userAgent: string | null;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

export type MockReport = {
  id: string;
  postId: string;
  reason: string;
  reporterIpHash: string;
  createdAt: string;
};

export type MockBlockedOrigin = {
  id: string;
  ipHash: string;
  reason: string;
  blockedAt: string;
  expiresAt: string | null;
  createdBy: string | null;
};

/**
 * Acoes do projeto conforme o cronograma e as descricoes oficiais
 * (Projeto IV: Somativa 01). Datas sem horario definido: o evento e tratado
 * como "dia inteiro" e a interface mostra apenas a data.
 */
export const mockEvents: MockEvent[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "manifesto",
    title: "Manifesto",
    description:
      "Apresentar o projeto e explicar qual o nosso objetivo, propósito e missão ao longo do semestre, bem como a marca positiva que pretendemos deixar no mundo.",
    coverImage: null,
    startsAt: "2026-09-21T00:00:00-03:00",
    endsAt: "2026-09-25T00:00:00-03:00",
    venue: "A definir",
    location: "Curitiba, PR",
    status: "upcoming",
    createdAt: "2026-09-13T00:00:00-03:00",
    updatedAt: "2026-09-13T00:00:00-03:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "roda-de-conversa-pucpr",
    title: "Roda de Conversa PUCPR",
    description:
      "Promover encontros com pessoas negras, mostrando suas trajetórias profissionais, desafios e conquistas e discutindo como a representatividade pode influenciar a autoestima e o sentimento de pertencimento.",
    coverImage: null,
    startsAt: "2026-09-28T00:00:00-03:00",
    endsAt: "2026-10-02T00:00:00-03:00",
    venue: "PUCPR",
    location: "Curitiba, PR",
    status: "upcoming",
    createdAt: "2026-09-13T00:00:00-03:00",
    updatedAt: "2026-09-13T00:00:00-03:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "dia-das-criancas",
    title: "Dia das Crianças",
    description:
      "Promover a autoestima e a valorização da identidade de crianças negras por meio de histórias infantis que apresentem personagens negros de forma positiva, abordando temas como cabelo, beleza, identidade e representatividade. A atividade busca apresentar referências negras positivas desde a infância, ajudando as crianças a reconhecerem sua própria beleza e identidade e mostrando que existem personagens e histórias que se parecem com elas.",
    coverImage: null,
    startsAt: "2026-10-05T00:00:00-03:00",
    endsAt: "2026-10-09T00:00:00-03:00",
    venue: "A definir",
    location: "Curitiba, PR",
    status: "upcoming",
    createdAt: "2026-09-13T00:00:00-03:00",
    updatedAt: "2026-09-13T00:00:00-03:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "roda-de-conversa-coletivo-preto",
    title: "Roda de Conversa Coletivo Preto",
    description:
      "Promover encontros com pessoas negras, mostrando suas trajetórias profissionais, desafios e conquistas e discutindo como a representatividade pode influenciar a autoestima e o sentimento de pertencimento.",
    coverImage: null,
    startsAt: "2026-10-12T00:00:00-03:00",
    endsAt: "2026-10-16T00:00:00-03:00",
    venue: "Coletivo Preto",
    location: "Curitiba, PR",
    status: "upcoming",
    createdAt: "2026-09-13T00:00:00-03:00",
    updatedAt: "2026-09-13T00:00:00-03:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    slug: "evento-de-beleza",
    title: "Evento de Beleza",
    description:
      "O Evento de Beleza, Estética e Identidade Negra será um espaço de valorização da beleza, da identidade e da autoestima da população negra, aberto para homens, mulheres e crianças. A proposta é promover uma experiência de cuidado, expressão e reconhecimento, criando um ambiente em que cada participante possa conhecer, valorizar e celebrar suas próprias características.",
    coverImage: null,
    startsAt: "2026-11-07T00:00:00-03:00",
    endsAt: null,
    venue: "A definir",
    location: "Curitiba, PR",
    status: "upcoming",
    createdAt: "2026-09-13T00:00:00-03:00",
    updatedAt: "2026-09-13T00:00:00-03:00",
  },
];

/**
 * O Feed comeca vazio de proposito: os relatos sao da comunidade e nenhum
 * relato real foi publicado ainda. O estado vazio convida a primeira pessoa.
 */
export const mockPosts: MockPost[] = [];

export const mockBlockedOrigins: MockBlockedOrigin[] = [];
export const mockReports: MockReport[] = [];
