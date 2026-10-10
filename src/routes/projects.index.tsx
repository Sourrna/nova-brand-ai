import { createFileRoute } from "@tanstack/react-router";
import { ProjectList } from "./projects";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Project workspace — Sourena Brand Control Center" },
      {
        name: "description",
        content:
          "Owner project workspace with knowledge state, privacy, evidence and next actions.",
      },
      { property: "og:title", content: "Project workspace — Sourena Brand Control Center" },
      {
        property: "og:description",
        content: "Review documented work and unresolved project evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectList,
});
