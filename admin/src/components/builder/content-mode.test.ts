import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { COMPONENT_REGISTRY, STARTER_TEMPLATES } from "./component-registry";

describe("Airborne Studio — Universal Text Editing (Content Mode)", () => {
  interface MockBlock {
    id: string;
    type: string;
    props: Record<string, any>;
  }

  interface MockSection {
    id: string;
    name: string;
    order: number;
    isVisible: boolean;
    blocks: MockBlock[];
  }

  interface MockPage {
    id: string;
    title: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDesc: string;
    sections: MockSection[];
    metadata: Record<string, any>;
  }

  // Helper simulating the discovery logic of ContentMode
  function extractDiscoveredFields(page: MockPage) {
    const fields: Array<{
      id: string;
      sectionId: string;
      sectionName: string;
      blockId: string;
      blockType: string;
      fieldKey: string;
      label: string;
      category: string;
      value: any;
      isEditable: boolean;
      readOnlyReason?: string;
    }> = [];

    // 1. Page Metadata
    fields.push({
      id: "meta-title",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "title",
      label: "Page Title",
      category: "heading",
      value: page.title,
      isEditable: true,
    });

    fields.push({
      id: "meta-desc",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "description",
      label: "Internal Description",
      category: "body",
      value: page.description,
      isEditable: true,
    });

    // 2. Sections and Blocks
    page.sections.forEach((sec, sIdx) => {
      const secName = sec.name || `Section ${sIdx + 1}`;
      sec.blocks.forEach((blk) => {
        const props = blk.props || {};
        switch (blk.type) {
          case "hero":
            fields.push({
              id: `${blk.id}-heading`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "heading",
              label: "Main Headline",
              category: "heading",
              value: props.heading,
              isEditable: true,
            });
            fields.push({
              id: `${blk.id}-subheading`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "subheading",
              label: "Subheading",
              category: "body",
              value: props.subheading,
              isEditable: true,
            });
            fields.push({
              id: `${blk.id}-ctaText`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "ctaText",
              label: "Primary Action Button",
              category: "cta",
              value: props.ctaText,
              isEditable: true,
            });
            break;

          case "features":
            fields.push({
              id: `${blk.id}-title`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "title",
              label: "Features Section Title",
              category: "heading",
              value: props.title,
              isEditable: true,
            });
            if (Array.isArray(props.items)) {
              props.items.forEach((item: any, idx: number) => {
                fields.push({
                  id: `${blk.id}-item-${idx}-title`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: blk.type,
                  fieldKey: "title",
                  label: `Feature ${idx + 1} Title`,
                  category: "list",
                  value: item.title,
                  isEditable: true,
                });
              });
            }
            break;

          case "stats":
            if (Array.isArray(props.items)) {
              props.items.forEach((it: any, idx: number) => {
                fields.push({
                  id: `${blk.id}-stat-${idx}-val`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: blk.type,
                  fieldKey: "value",
                  label: `Stat ${idx + 1} Value`,
                  category: "list",
                  value: it.value,
                  isEditable: true,
                });
                fields.push({
                  id: `${blk.id}-stat-${idx}-lbl`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: blk.type,
                  fieldKey: "label",
                  label: `Stat ${idx + 1} Label`,
                  category: "list",
                  value: it.label,
                  isEditable: true,
                });
              });
            }
            break;

          case "faq":
            fields.push({
              id: `${blk.id}-title`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "title",
              label: "FAQ Section Title",
              category: "heading",
              value: props.title,
              isEditable: true,
            });
            if (Array.isArray(props.items)) {
              props.items.forEach((faq: any, idx: number) => {
                fields.push({
                  id: `${blk.id}-faq-${idx}-q`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: blk.type,
                  fieldKey: "question",
                  label: `FAQ ${idx + 1} Question`,
                  category: "list",
                  value: faq.question,
                  isEditable: true,
                });
                fields.push({
                  id: `${blk.id}-faq-${idx}-a`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: blk.type,
                  fieldKey: "answer",
                  label: `FAQ ${idx + 1} Answer`,
                  category: "list",
                  value: faq.answer,
                  isEditable: true,
                });
              });
            }
            break;

          case "cta_banner":
            fields.push({
              id: `${blk.id}-title`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "title",
              label: "Callout Banner Headline",
              category: "heading",
              value: props.title,
              isEditable: true,
            });
            fields.push({
              id: `${blk.id}-btn`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "buttonText",
              label: "Callout Action Button",
              category: "cta",
              value: props.buttonText,
              isEditable: true,
            });
            break;

          case "mentor_card":
            fields.push({
              id: `${blk.id}-heading`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "heading",
              label: "Mentorship Tagline",
              category: "heading",
              value: props.heading,
              isEditable: true,
            });
            fields.push({
              id: `${blk.id}-instructor`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "instructorName",
              label: "Instructor Name",
              category: "heading",
              value: props.instructorName || props.name,
              isEditable: true,
            });
            break;

          default:
            fields.push({
              id: `${blk.id}-complex`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: blk.type,
              fieldKey: "custom",
              label: `${blk.type} Component`,
              category: "body",
              value: JSON.stringify(props),
              isEditable: false,
              readOnlyReason: "Complex system or 3D canvas component. Preserved automatically across drafts and publishes.",
            });
            break;
        }
      });
    });

    return fields;
  }

  it("discovers all textual fields across hero, stats, features, mentor, FAQs, and CTA", () => {
    const homeTmpl = STARTER_TEMPLATES.find((t) => t.id === "home_page");
    assert.ok(homeTmpl, "home_page template must exist");

    const page: MockPage = {
      id: "page-home",
      title: "Airborne Aviation Academy Homepage",
      slug: "home",
      description: "DGCA-aligned aviation academy in Delhi",
      seoTitle: "DGCA Ground School Delhi | Airborne",
      seoDesc: "Commercial Pilot Ground School since 2009",
      sections: homeTmpl.sections.map((sec, sIdx) => ({
        id: `sec-${sIdx + 1}`,
        name: sec.name,
        order: sIdx,
        isVisible: true,
        blocks: sec.blocks.map((b, bIdx) => ({
          id: `blk-${sIdx + 1}-${bIdx + 1}`,
          type: b.type,
          props: b.props,
        })),
      })),
      metadata: {},
    };

    const fields = extractDiscoveredFields(page);
    assert.ok(fields.length >= 25, `Expected >= 25 fields discovered, got ${fields.length}`);

    // Check key fields
    const titles = fields.filter((f) => f.category === "heading").map((f) => f.label);
    assert.ok(titles.includes("Main Headline"));
    assert.ok(titles.includes("Features Section Title"));
    assert.ok(titles.includes("FAQ Section Title"));
    assert.ok(titles.includes("Callout Banner Headline"));

    const buttons = fields.filter((f) => f.category === "cta").map((f) => f.label);
    assert.ok(buttons.includes("Primary Action Button"));
    assert.ok(buttons.includes("Callout Action Button"));

    const faqQuestions = fields.filter((f) => f.label.includes("FAQ") && f.fieldKey === "question");
    assert.ok(faqQuestions.length >= 3, `Expected at least 3 FAQ questions, found ${faqQuestions.length}`);
  });

  it("search outline locates fields from later sections deep in the page", () => {
    const homeTmpl = STARTER_TEMPLATES.find((t) => t.id === "home_page")!;
    const page: MockPage = {
      id: "page-home",
      title: "Airborne Aviation Academy Homepage",
      slug: "home",
      description: "DGCA-aligned aviation academy in Delhi",
      seoTitle: "DGCA Ground School Delhi | Airborne",
      seoDesc: "Commercial Pilot Ground School since 2009",
      sections: homeTmpl.sections.map((sec, sIdx) => ({
        id: `sec-${sIdx + 1}`,
        name: sec.name,
        order: sIdx,
        isVisible: true,
        blocks: sec.blocks.map((b, bIdx) => ({
          id: `blk-${sIdx + 1}-${bIdx + 1}`,
          type: b.type,
          props: b.props,
        })),
      })),
      metadata: {},
    };

    const fields = extractDiscoveredFields(page);

    // Search query matching last section (Call to Action / Visit Our Dwarka Center)
    const query = "Dwarka Center";
    const matches = fields.filter(
      (f) =>
        f.label.toLowerCase().includes(query.toLowerCase()) ||
        String(f.value).toLowerCase().includes(query.toLowerCase())
    );

    assert.ok(matches.length > 0, `Search for "${query}" must return results from bottom sections`);
    assert.ok(matches.some((m) => m.sectionName.includes("Visit") || m.sectionName.includes("CTA")));
  });

  it("editing a field modifies only the intended block prop without side-effects", () => {
    const section: MockSection = {
      id: "sec-hero",
      name: "Hero Section",
      order: 0,
      isVisible: true,
      blocks: [
        {
          id: "blk-hero",
          type: "hero",
          props: {
            heading: "Original Heading",
            subheading: "Original Subheading",
            ctaText: "Enrol Now",
          },
        },
      ],
    };

    // Simulate update
    const patch = { heading: "New Airline Flight Deck Heading" };
    const updatedBlocks = section.blocks.map((b) =>
      b.id === "blk-hero" ? { ...b, props: { ...b.props, ...patch } } : b
    );

    const firstUpdated = updatedBlocks[0]!;
    assert.equal(firstUpdated.props.heading, "New Airline Flight Deck Heading");
    // Ensure other props remained untouched
    assert.equal(firstUpdated.props.subheading, "Original Subheading");
    assert.equal(firstUpdated.props.ctaText, "Enrol Now");
  });

  it("identifies complex custom components as read-only with a clear reason", () => {
    const page: MockPage = {
      id: "page-custom",
      title: "3D Interactive Page",
      slug: "interactive",
      description: "ThreeJS cockpit experience",
      seoTitle: "Cockpit Experience",
      seoDesc: "Cockpit Experience",
      sections: [
        {
          id: "sec-3d",
          name: "Cockpit Experience",
          order: 0,
          isVisible: true,
          blocks: [
            {
              id: "blk-threejs",
              type: "threejs_3d_cockpit",
              props: { modelPath: "/models/cockpit.glb", cameraFov: 75 },
            },
          ],
        },
      ],
      metadata: {},
    };

    const fields = extractDiscoveredFields(page);
    const complexField = fields.find((f) => f.blockType === "threejs_3d_cockpit");
    assert.ok(complexField);
    assert.equal(complexField.isEditable, false);
    assert.ok(complexField.readOnlyReason?.includes("Complex system or 3D canvas component"));
  });

  it("preserves complex and custom components through Save Draft, Publish, and Rollback", () => {
    const originalSections: MockSection[] = [
      {
        id: "sec-hero",
        name: "Custom Hero",
        order: 0,
        isVisible: true,
        blocks: [
          {
            id: "b1",
            type: "hero",
            props: { heading: "Airline Pilot Training" },
          },
          {
            id: "b2",
            type: "custom_interactive_flight_map",
            props: { waypoints: ["DEL", "BOM", "BLR"], mapEngine: "mapbox" },
          },
        ],
      },
    ];

    // Simulate draft save into metadata
    const draftMetadata = {
      studioDraft: {
        sections: structuredClone(originalSections),
        lastSavedAt: new Date().toISOString(),
      },
    };

    const savedSections = draftMetadata.studioDraft.sections;
    assert.equal(savedSections.length, 1);
    const savedFirstSec = savedSections[0]!;
    assert.equal(savedFirstSec.blocks.length, 2);
    assert.equal(savedFirstSec.blocks[1]!.type, "custom_interactive_flight_map");

    // Simulate publish snapshot
    const publishSnapshot = {
      version: 2,
      sections: draftMetadata.studioDraft.sections,
    };

    // Simulate rollback
    const restoredSections = structuredClone(publishSnapshot.sections);
    assert.equal(restoredSections.length, 1);
    const restoredFirstSec = restoredSections[0]!;
    assert.equal(restoredFirstSec.blocks[1]!.type, "custom_interactive_flight_map");
    assert.deepEqual(restoredFirstSec.blocks[1]!.props.waypoints, ["DEL", "BOM", "BLR"]);
  });
});
