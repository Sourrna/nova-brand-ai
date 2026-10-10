export interface Tool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
  validate?(input: unknown): { valid: boolean; errors?: string[] };
  requiresApproval?: boolean;
}

const registry = new Map<string, Tool>();

export function registerTool(tool: Tool): void {
  registry.set(tool.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return registry.get(name);
}

export function listTools(): Tool[] {
  return Array.from(registry.values());
}

export function hasTool(name: string): boolean {
  return registry.has(name);
}
