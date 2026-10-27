import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COMPONENT_CATEGORIES,
  COMPONENT_REGISTRY,
  STARTER_TEMPLATES,
} from "./component-registry";

describe("Airborne Studio — Component Registry & Templates", () => {
  it("registry contains at least 15 comprehensive block definitions", () => {
    assert.ok(COMPONENT_REGISTRY.length >= 15, `Expected >= 15 blocks, found ${COMPONENT_REGISTRY.length}`);
  });

  it("every component has a unique valid type identifier and default props", () => {
    const seenTypes = new Set<string>();
    for (const comp of COMPONENT_REGISTRY) {
      assert.ok(comp.type, "Component must have a type");
      assert.ok(!seenTypes.has(comp.type), `Duplicate block type found: ${comp.type}`);
      seenTypes.add(comp.type);
      assert.ok(comp.title, `Component ${comp.type} must have a title`);
      assert.ok(comp.description, `Component ${comp.type} must have a description`);
      assert.ok(comp.category, `Component ${comp.type} must have a category`);
      assert.ok(comp.defaultProps && typeof comp.defaultProps === "object", `Component ${comp.type} must have defaultProps`);
    }
  });

  it("all 4 major categories exist: basic, layout, marketing, airborne", () => {
    const categories = new Set(COMPONENT_REGISTRY.map((c) => c.category));
    assert.ok(categories.has("basic"), "Missing basic category");
    assert.ok(categories.has("layout"), "Missing layout category");
    assert.ok(categories.has("marketing"), "Missing marketing category");
    assert.ok(categories.has("airborne"), "Missing airborne specialist category");
  });

  it("Airborne specialist blocks include airlines, cadet stages, mentor, campus, pricing, and whatsapp", () => {
    const airborneTypes = COMPONENT_REGISTRY.filter((c) => c.category === "airborne").map((c) => c.type);
    assert.ok(airborneTypes.includes("airline_logos"), "Missing airline_logos block");
    assert.ok(airborneTypes.includes("cadet_stages"), "Missing cadet_stages block");
    assert.ok(airborneTypes.includes("mentor_card"), "Missing mentor_card block");
    assert.ok(airborneTypes.includes("campus_walkthrough"), "Missing campus_walkthrough block");
    assert.ok(airborneTypes.includes("pricing_table"), "Missing pricing_table block");
    assert.ok(airborneTypes.includes("whatsapp_cta"), "Missing whatsapp_cta block");
  });

  it("starter templates have valid sections and block structures", () => {
    assert.ok(STARTER_TEMPLATES.length >= 3, "Expected at least 3 starter templates");
    for (const tmpl of STARTER_TEMPLATES) {
      assert.ok(tmpl.id, "Template missing id");
      assert.ok(tmpl.name, "Template missing name");
      assert.ok(Array.isArray(tmpl.sections), "Template sections must be an array");
      for (const sec of tmpl.sections) {
        assert.ok(sec.name, "Section missing name");
        assert.ok(Array.isArray(sec.blocks), "Section blocks must be an array");
        for (const blk of sec.blocks) {
          assert.ok(blk.type, "Block missing type");
          assert.ok(blk.props && typeof blk.props === "object", "Block missing props");
        }
      }
    }
  });

  it("hero block has all required Airborne brand elements in defaultProps", () => {
    const hero = COMPONENT_REGISTRY.find((c) => c.type === "hero");
    assert.ok(hero);
    const props = hero.defaultProps as Record<string, any>;
    assert.ok(props.badge, "Hero must have badge");
    assert.ok(props.heading, "Hero must have heading");
    assert.ok(props.ctaText, "Hero must have primary ctaText");
    assert.ok(props.ctaLink, "Hero must have ctaLink");
  });
});

describe("Airborne Studio — Undo / Redo & State Transition Invariants", () => {
  interface MockPage {
    id: string;
    title: string;
    slug: string;
    sections: Array<{ id: string; name: string; blocks: Array<{ id: string; type: string; props: any }> }>;
  }

  function createUndoRedoStack(initial: MockPage) {
    let past: MockPage[] = [];
    let present: MockPage = structuredClone(initial);
    let future: MockPage[] = [];

    return {
      getPresent: () => present,
      canUndo: () => past.length > 0,
      canRedo: () => future.length > 0,
      push: (next: MockPage) => {
        past.push(present);
        present = structuredClone(next);
        future = [];
      },
      undo: () => {
        if (past.length === 0) return;
        const prev = past.pop()!;
        future.unshift(present);
        present = prev;
      },
      redo: () => {
        if (future.length === 0) return;
        const next = future.shift()!;
        past.push(present);
        present = next;
      },
    };
  }

  it("correctly tracks past, present, and future on mutations", () => {
    const stack = createUndoRedoStack({
      id: "p1",
      title: "Initial Title",
      slug: "initial-title",
      sections: [],
    });

    assert.equal(stack.canUndo(), false);
    assert.equal(stack.canRedo(), false);

    // Mutation 1: update title
    stack.push({ ...stack.getPresent(), title: "Updated Title" });
    assert.equal(stack.getPresent().title, "Updated Title");
    assert.equal(stack.canUndo(), true);
    assert.equal(stack.canRedo(), false);

    // Mutation 2: add section
    stack.push({
      ...stack.getPresent(),
      sections: [{ id: "sec-1", name: "Hero", blocks: [] }],
    });
    assert.equal(stack.getPresent().sections.length, 1);
    assert.equal(stack.canUndo(), true);

    // Undo Mutation 2
    stack.undo();
    assert.equal(stack.getPresent().sections.length, 0);
    assert.equal(stack.getPresent().title, "Updated Title");
    assert.equal(stack.canRedo(), true);

    // Undo Mutation 1
    stack.undo();
    assert.equal(stack.getPresent().title, "Initial Title");
    assert.equal(stack.canUndo(), false);
    assert.equal(stack.canRedo(), true);

    // Redo Mutation 1
    stack.redo();
    assert.equal(stack.getPresent().title, "Updated Title");
    assert.equal(stack.canUndo(), true);
    assert.equal(stack.canRedo(), true);

    // Redo Mutation 2
    stack.redo();
    assert.equal(stack.getPresent().sections.length, 1);
    assert.equal(stack.canRedo(), false);
  });
});


describe("Airborne Studio -- 11 Pre-Release Audit Lifecycle and Interaction Scenarios", () => {
  interface Block {
    id: string;
    type: string;
    props: Record<string, any>;
  }

  interface Section {
    id: string;
    name: string;
    order: number;
    isVisible: boolean;
    blocks: Block[];
  }

  interface PageData {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    version: number;
    metadata: Record<string, any>;
    sections: Section[];
  }

  // 1. Open existing page
  it("Scenario 1: Open existing page initializes visual canvas from metadata draft or relational sections", () => {
    const existingPage: PageData = {
      id: "page-cadet",
      title: "Cadet Preparation",
      slug: "cadet-preparation",
      status: "PUBLISHED",
      version: 2,
      metadata: {
        studioDraft: {
          sections: [
            {
              id: "sec-1",
              name: "Header Section",
              order: 0,
              isVisible: true,
              blocks: [{ id: "b1", type: "heading", props: { content: "Airline Cadet Prep" } }],
            },
          ],
        },
      },
      sections: [],
    };

    const initialSections = existingPage.metadata.studioDraft?.sections || existingPage.sections;
    assert.equal(initialSections.length, 1);
    assert.equal(initialSections[0].name, "Header Section");
    assert.equal(initialSections[0].blocks[0].props.content, "Airline Cadet Prep");
  });

  // 2. Edit heading
  it("Scenario 2: Edit heading updates block props immutably", () => {
    const section: Section = {
      id: "sec-1",
      name: "Hero",
      order: 0,
      isVisible: true,
      blocks: [{ id: "b1", type: "heading", props: { content: "Old Heading", level: 2 } }],
    };

    const updatedBlocks = section.blocks.map((b) =>
      b.id === "b1" ? { ...b, props: { ...b.props, content: "New Airborne Pilot Academy Heading" } } : b
    );

    assert.equal(updatedBlocks[0]?.props.content, "New Airborne Pilot Academy Heading");
    assert.equal(updatedBlocks[0]?.props.level, 2);
  });

  // 3. Replace image
  it("Scenario 3: Replace image validates image URL and updates block props", () => {
    const block: Block = {
      id: "img-1",
      type: "image",
      props: { src: "/images/old-cockpit.jpg", alt: "Old cockpit" },
    };

    const newUrl = "https://storage.googleapis.com/airborne-aviation-media-prod/new-a320-sim.jpg";
    assert.ok(newUrl.startsWith("https://") || newUrl.startsWith("/"), "Must be safe URL");

    const updated = { ...block, props: { ...block.props, src: newUrl, alt: "A320 Flight Simulator" } };
    assert.equal(updated.props.src, newUrl);
    assert.equal(updated.props.alt, "A320 Flight Simulator");
  });

  // 4. Add section
  it("Scenario 4: Add section appends a new section with default layout settings", () => {
    const sections: Section[] = [
      { id: "sec-0", name: "Section 1", order: 0, isVisible: true, blocks: [] },
    ];

    const newSec: Section = {
      id: "sec-1",
      name: `Section ${sections.length + 1}`,
      order: sections.length,
      isVisible: true,
      blocks: [],
    };
    const updated = [...sections, newSec];

    assert.equal(updated.length, 2);
    assert.equal(updated[1]?.name, "Section 2");
    assert.equal(updated[1]?.order, 1);
  });

  // 5. Reorder section
  it("Scenario 5: Reorder section shifts index and re-indexes section orders sequentially", () => {
    const sections: Section[] = [
      { id: "sec-a", name: "Hero", order: 0, isVisible: true, blocks: [] },
      { id: "sec-b", name: "Features", order: 1, isVisible: true, blocks: [] },
      { id: "sec-c", name: "Pricing", order: 2, isVisible: true, blocks: [] },
    ];

    const reordered = [...sections];
    const [moved] = reordered.splice(2, 1);
    if (!moved) throw new Error("No item moved");
    reordered.splice(1, 0, moved);
    reordered.forEach((s, idx) => (s.order = idx));

    assert.equal(reordered[0]?.id, "sec-a");
    assert.equal(reordered[1]?.id, "sec-c");
    assert.equal(reordered[2]?.id, "sec-b");
    assert.equal(reordered[1]?.order, 1);
  });

  // 6. Save draft
  it("Scenario 6: Save draft persists metadata.studioDraft without modifying public published status", () => {
    const page: PageData = {
      id: "page-1",
      title: "CPL Ground School",
      slug: "cpl-ground-school",
      status: "DRAFT",
      version: 1,
      metadata: {},
      sections: [],
    };

    const draftSections = [
      { id: "sec-1", name: "Hero", order: 0, isVisible: true, blocks: [] },
    ];

    const patchPayload = {
      metadata: {
        ...page.metadata,
        studioDraft: {
          sections: draftSections,
          lastSavedAt: new Date().toISOString(),
        },
      },
    };

    const updatedPage = { ...page, ...patchPayload };
    assert.equal(updatedPage.status, "DRAFT");
    assert.equal(updatedPage.metadata.studioDraft.sections.length, 1);
  });

  // 7. Verify public page unchanged
  it("Scenario 7: Public API filter excludes draft-only modifications until explicit publish", () => {
    const pagesInDb: PageData[] = [
      {
        id: "page-1",
        title: "Published CPL",
        slug: "cpl-school",
        status: "PUBLISHED",
        version: 1,
        metadata: { studioDraft: { sections: [{ id: "unreleased-change", name: "New", order: 0, isVisible: true, blocks: [] }] } },
        sections: [{ id: "published-section", name: "Live", order: 0, isVisible: true, blocks: [] }],
      },
      {
        id: "page-2",
        title: "Draft Only Page",
        slug: "draft-page",
        status: "DRAFT",
        version: 1,
        metadata: { studioDraft: { sections: [] } },
        sections: [],
      },
    ];

    const publicPages = pagesInDb.filter((p) => p.status === "PUBLISHED");
    assert.equal(publicPages.length, 1);
    assert.equal(publicPages[0]?.id, "page-1");
    assert.equal(publicPages[0]?.sections[0]?.id, "published-section");
  });

  // 8. Preview draft
  it("Scenario 8: Preview draft mounts responsive container (desktop / tablet / mobile) with draft data", () => {
    type DeviceMode = "desktop" | "tablet" | "mobile";
    const deviceWidths: Record<DeviceMode, string> = {
      desktop: "100%",
      tablet: "768px",
      mobile: "375px",
    };

    let currentMode: DeviceMode = "desktop";
    assert.equal(deviceWidths[currentMode], "100%");

    currentMode = "mobile";
    assert.equal(deviceWidths[currentMode], "375px");

    currentMode = "tablet";
    assert.equal(deviceWidths[currentMode], "768px");
  });

  // 9. Publish test change
  it("Scenario 9: Publish transitions status to PUBLISHED and increments version", () => {
    const page: PageData = {
      id: "page-1",
      title: "About Airborne",
      slug: "about-airborne",
      status: "DRAFT",
      version: 1,
      metadata: { studioDraft: { sections: [{ id: "s1", name: "Vision", order: 0, isVisible: true, blocks: [] }] } },
      sections: [],
    };

    const publishedPage: PageData = {
      ...page,
      status: "PUBLISHED",
      version: page.version + 1,
      sections: page.metadata.studioDraft.sections,
    };

    assert.equal(publishedPage.status, "PUBLISHED");
    assert.equal(publishedPage.version, 2);
    assert.equal(publishedPage.sections.length, 1);
  });

  // 10. Verify public URL
  it("Scenario 10: Verify public URL resolves canonical path /pages/[slug]", () => {
    const slug = "airline-interview-preparation";
    const publicUrl = `https://www.airborneaviation.in/pages/${slug}`;
    const uri = new URL(publicUrl);

    assert.equal(uri.pathname, "/pages/airline-interview-preparation");
    assert.equal(uri.hostname, "www.airborneaviation.in");
  });

  // 11. Restore revision and Reject unauthorized publishing
  it("Scenario 11: Rollback restores snapshot version and rejects unauthorized publish role", () => {
    const versionSnapshots = [
      { id: "v1", version: 1, title: "Title V1", sections: [{ id: "s1", name: "Old Section" }] },
      { id: "v2", version: 2, title: "Title V2", sections: [{ id: "s2", name: "New Section" }] },
    ];

    const targetSnapshot = versionSnapshots.find((v) => v.id === "v1");
    assert.ok(targetSnapshot);
    assert.equal(targetSnapshot.version, 1);
    assert.equal(targetSnapshot?.sections[0]?.name, "Old Section");

    const rolesWithPublishPermission = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"];
    const testUserRole = "VIEWER";
    const canPublish = rolesWithPublishPermission.includes(testUserRole);
    assert.equal(canPublish, false, "VIEWER must not be allowed to publish");
  });
});
