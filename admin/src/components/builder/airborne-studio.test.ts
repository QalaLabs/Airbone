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
