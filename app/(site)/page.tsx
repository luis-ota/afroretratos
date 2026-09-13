import type { Metadata } from "next";
import { FeedInvite } from "@/components/home/FeedInvite";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { NextEvents } from "@/components/home/NextEvents";
import { Pillars } from "@/components/home/Pillars";
import { WeaveStrip } from "@/components/ui/WeaveStrip";
import { listEvents, splitEvents } from "@/services/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plataforma cultural",
  description:
    "AfroRetratos: projeto da PUCPR sobre o impacto da representatividade na autoestima de pessoas negras: ações ao longo do semestre e um Feed de relatos anônimos.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { upcoming } = splitEvents(await listEvents());

  return (
    <>
      <Hero />
      <WeaveStrip />
      <Manifesto />
      <Pillars />
      <NextEvents events={upcoming.slice(0, 3)} />
      <FeedInvite />
    </>
  );
}
