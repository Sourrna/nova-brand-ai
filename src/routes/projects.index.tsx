import { createFileRoute } from "@tanstack/react-router";
import { ProjectList } from "./projects";

export const Route = createFileRoute("/projects/")({ component: ProjectList });
