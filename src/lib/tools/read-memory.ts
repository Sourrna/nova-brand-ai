import { registerTool } from "./registry";
import { filterForExport } from "../memory";
import { memoryStore } from "../store";

/**
 * Read-only memory tool. Reads the live session memory store and reports
 * aggregate counts and snapshot metadata only. It never returns record
 * values, so PRIVATE, INTERNAL_STRATEGY, and SENSITIVE records are not
 * exposed; public counts are derived from the same public export filter the
 * app uses.
 */
registerTool({
  name: "read-memory",
  description: "Read aggregate memory statistics (read-only, public-safe).",
  validate(input) {
    if (input !== undefined && input !== null) {
      return { valid: false, errors: ["read-memory takes no input"] };
    }
    return { valid: true };
  },
  async execute() {
    const m = memoryStore.get();
    const pub = filterForExport(m, "public");
    return {
      schemaVersion: m.schemaVersion,
      snapshotVersion: m.snapshotVersion,
      updatedAt: m.updatedAt,
      owner: m.owner,
      recordCount: m.records.length,
      contentCount: m.content.length,
      accountsCount: m.accounts.length,
      publicRecordCount: pub.records.length,
      publicContentCount: pub.content.length,
    };
  },
});
