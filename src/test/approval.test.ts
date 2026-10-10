import { describe, it, expect } from "vitest";
import { approve, invalidateApproval, isApprovalValid, computeApprovalHash } from "@/lib/approval";
import type { ContentItem } from "@/lib/memory";

describe("approval model", () => {
  it("defaults false", () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
    };
    expect(item.publicationApproved).toBeUndefined();
  });

  it("approve sets metadata and valid", async () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
      body: "hello",
    };
    await approve(
      item,
      {
        body: "hello",
        claims: [],
        platform: "web",
        approvedScope: "public",
        version: "1",
        title: "T",
      },
      {
        approvedBy: "Sourena",
        approvedAt: "2026-10-09",
        approvedScope: "public",
        approvedPlatform: "web",
        approvedVersion: "1",
      },
    );
    expect(item.publicationApproved).toBe(true);
    expect(item.approvalHash).toBeDefined();
    const valid = await isApprovalValid(item, {
      body: "hello",
      claims: [],
      platform: "web",
      approvedScope: "public",
      version: "1",
      title: "T",
    });
    expect(valid).toBe(true);
  });

  it("edit body invalidates", async () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
      body: "hello",
    };
    await approve(
      item,
      { body: "hello", claims: [], platform: "web", approvedScope: "public", version: "1" },
      {
        approvedBy: "Sourena",
        approvedAt: "2026-10-09",
        approvedScope: "public",
        approvedPlatform: "web",
        approvedVersion: "1",
      },
    );
    item.body = "hello world";
    const valid = await isApprovalValid(item, {
      body: "hello world",
      claims: [],
      platform: "web",
      approvedScope: "public",
    });
    expect(valid).toBe(false);
  });

  it("claims change invalidates", async () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
      body: "hi",
      claims: ["a"],
    };
    await approve(
      item,
      { body: "hi", claims: ["a"], platform: "web", approvedScope: "public", version: "1" },
      {
        approvedBy: "Sourena",
        approvedAt: "2026-10-09",
        approvedScope: "public",
        approvedPlatform: "web",
        approvedVersion: "1",
      },
    );
    item.claims = ["a", "b"];
    const valid = await isApprovalValid(item, {
      body: "hi",
      claims: ["a", "b"],
      platform: "web",
      approvedScope: "public",
    });
    expect(valid).toBe(false);
  });

  it("platform change affects validity", async () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
      body: "hi",
    };
    await approve(
      item,
      { body: "hi", platform: "web", approvedScope: "public", version: "1" },
      {
        approvedBy: "Sourena",
        approvedAt: "2026-10-09",
        approvedScope: "public",
        approvedPlatform: "web",
        approvedVersion: "1",
      },
    );
    const validDiff = await isApprovalValid(item, {
      body: "hi",
      platform: "linkedin",
      approvedScope: "public",
    });
    expect(validDiff).toBe(false);
  });

  it("invalidateApproval clears fields", async () => {
    const item: ContentItem = {
      id: "c1",
      stage: "draft",
      title: "T",
      pillar: "p",
      sourceRecord: "r1",
      body: "hi",
    };
    await approve(
      item,
      { body: "hi", approvedScope: "public" },
      {
        approvedBy: "Sourena",
        approvedAt: "2026-10-09",
        approvedScope: "public",
        approvedPlatform: null,
        approvedVersion: "1",
      },
    );
    invalidateApproval(item);
    expect(item.publicationApproved).toBe(false);
    expect(item.approvalHash).toBeUndefined();
    expect(item.approvedAt).toBeUndefined();
  });

  it("hash is stable regardless of claim order", async () => {
    const h1 = await computeApprovalHash({ body: "hi", claims: ["a", "b"] });
    const h2 = await computeApprovalHash({ body: "hi", claims: ["b", "a"] });
    expect(h1).toBe(h2);
  });
});
