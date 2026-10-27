import psycopg2
import urllib.parse
import json
import uuid
from datetime import datetime

pw = urllib.parse.unquote('phQ%5B%5E%2B4IfLEO%5B%7Dx9U%7B%23%3FK*TLD%3EcB%23JkA')
conn = psycopg2.connect(host='34.93.180.179', port=5432, dbname='airbornedb', user='airborne_app_user', password=pw)
cur = conn.cursor()

# Get orgId and userId
cur.execute('SELECT id FROM organizations WHERE slug = %s', ('airborne-aviation',))
org_row = cur.fetchone()
if not org_row:
    cur.execute('SELECT id FROM organizations LIMIT 1')
    org_id = cur.fetchone()[0]
else:
    org_id = org_row[0]

cur.execute('SELECT id FROM users LIMIT 1')
user_id = cur.fetchone()[0]

print(f"Using orgId: {org_id}, userId: {user_id}")

pages_to_seed = [
    {
        "id": "a0000001-0000-0000-0000-000000000001",
        "title": "Cadet Pilot Program Preparation",
        "slug": "cadet-preparation",
        "description": "Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI & simulator prep since 2009. Enrol today.",
        "seoTitle": "Cadet Pilot Program Prep IndiGo, Air India, Akasa | Airborne",
        "seoDesc": "Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI & simulator prep since 2009. Enrol today.",
        "seoKeywords": ["cadet pilot program", "indigo cadet pilot", "air india cadet", "akasa skycadet", "pilot training dwarka"],
        "starterTemplate": "cadet_page",
        "sections": [
            {
                "name": "Hero",
                "settings": {"background": "navy", "padding": "spacious"},
                "blocks": [
                    {
                        "type": "hero",
                        "props": {
                            "badge": "✈️ DIRECT AIRLINE ROUTE",
                            "heading": "A DIRECT ROUTE TO THE AIRLINE COCKPIT",
                            "subheading": "Structured pilot cadet preparation for IndiGo, Air India, and Akasa Air entrance assessments.",
                            "ctaText": "Apply For Cadet Assessment",
                            "ctaLink": "#contact"
                        }
                    }
                ]
            },
            {
                "name": "Stats",
                "settings": {"background": "white", "padding": "compact"},
                "blocks": [
                    {
                        "type": "stats",
                        "props": {
                            "items": [
                                {"value": "2,500+", "label": "Pilots & Crew Trained"},
                                {"value": "95%+", "label": "Pass Rate"},
                                {"value": "37+", "label": "Years Experience"},
                                {"value": "100%", "label": "DGCA Aligned"}
                            ]
                        }
                    }
                ]
            },
            {
                "name": "Airline Pathways",
                "settings": {"background": "light", "padding": "normal"},
                "blocks": [
                    {
                        "type": "airline_logos",
                        "props": {
                            "heading": "Our Cadets Fly With Top Indian Carriers",
                            "airlines": [
                                {"name": "IndiGo", "code": "6E"},
                                {"name": "Air India", "code": "AI"},
                                {"name": "Akasa Air", "code": "QP"}
                            ]
                        }
                    }
                ]
            },
            {
                "name": "Selection Stages",
                "settings": {"background": "white", "padding": "normal"},
                "blocks": [
                    {
                        "type": "cadet_stages",
                        "props": {
                            "heading": "Six-Stage Airline Cadet Selection Pathway",
                            "stages": [
                                {"stage": "Stage 01", "name": "Online Application", "desc": "Resume crafting and document preparation"},
                                {"stage": "Stage 02", "name": "Aptitude Test", "desc": "Full mock test battery (ADAPT/Compass) with performance analysis"},
                                {"stage": "Stage 03", "name": "Psychometric Evaluation", "desc": "Psychometric familiarisation sessions"},
                                {"stage": "Stage 04", "name": "Simulator Assessment", "desc": "A320 simulator preparation at Airborne"},
                                {"stage": "Stage 05", "name": "GD + PI Round", "desc": "Mock GD/PI with feedback from airline pilots"},
                                {"stage": "Stage 06", "name": "Medical", "desc": "DGCA Class 1 Medical briefing and guidance"}
                            ]
                        }
                    }
                ]
            },
            {
                "name": "Instructors",
                "settings": {"background": "light", "padding": "normal"},
                "blocks": [
                    {
                        "type": "mentor_card",
                        "props": {
                            "heading": "LEARN FROM AIRLINE PILOTS",
                            "subheading": "WHY SETTLE FOR AN ORDINARY INSTRUCTOR WHEN AN AIRLINE PILOT CAN PREPARE YOU?",
                            "instructorName": "Capt. Navrang Singh",
                            "role": "Chief Flying Instructor & Founder",
                            "experience": "37+ Years Flight Operations"
                        }
                    }
                ]
            },
            {
                "name": "FAQs",
                "settings": {"background": "white", "padding": "normal"},
                "blocks": [
                    {
                        "type": "faq",
                        "props": {
                            "title": "Cadet Program FAQs",
                            "items": [
                                {
                                    "question": "What is the eligibility for airline cadet pilot programmes?",
                                    "answer": "The three programmes share the same core requirements: 10+2 with Physics, Mathematics and English, a minimum age of 18, and the ability to clear a DGCA Class 1 medical before training."
                                },
                                {
                                    "question": "Does Airborne guarantee cadet selection?",
                                    "answer": "No. Airline selection is entirely the airline's decision. Airborne prepares every candidate to perform at their best at each stage, with the aim of clearing selection in the first attempt."
                                },
                                {
                                    "question": "What should you expect from your instructor?",
                                    "answer": "Our instructors are airline pilots who cleared the cadet selection process themselves in their first attempt. They know every stage of cadet selection and airline training requirements in depth."
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "name": "Call to Action",
                "settings": {"background": "navy", "padding": "normal"},
                "blocks": [
                    {
                        "type": "cta_banner",
                        "props": {
                            "title": "Begin Your Cadet Pilot Journey Today",
                            "description": "Limited seats per batch to maintain 1:1 instructor attention. Book your counseling now.",
                            "buttonText": "Schedule Free Counseling",
                            "buttonLink": "#contact"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "a0000001-0000-0000-0000-000000000002",
        "title": "Cabin Crew Academy Overview",
        "slug": "cabin-crew-overview",
        "description": "Launch your cabin crew career with Airborne in Delhi. DGCA-compliant training, Batch 1 scholarship, grooming, safety & airline placement. Pre-register.",
        "seoTitle": "Cabin Crew Training Delhi | Scholarship Available | Airborne",
        "seoDesc": "Launch your cabin crew career with Airborne in Delhi. DGCA-compliant training, Batch 1 scholarship, grooming, safety & airline placement. Pre-register.",
        "seoKeywords": ["cabin crew training", "air hostess training delhi", "flight attendant academy", "cabin crew scholarship"],
        "starterTemplate": "lead_magnet_page",
        "sections": [
            {
                "name": "Hero",
                "settings": {"background": "navy", "padding": "spacious"},
                "blocks": [
                    {
                        "type": "hero",
                        "props": {
                            "badge": "✈️ BATCH 1 SCHOLARSHIPS OPEN",
                            "heading": "Become an International Airline Cabin Crew",
                            "subheading": "Industry-accredited airline hospitality, in-flight safety, and mock cabin simulator drills in Delhi.",
                            "ctaText": "Enquire For Batch 1",
                            "ctaLink": "#contact"
                        }
                    }
                ]
            },
            {
                "name": "Features",
                "settings": {"background": "white", "padding": "normal"},
                "blocks": [
                    {
                        "type": "features",
                        "props": {
                            "heading": "Why Choose Airborne Cabin Crew Academy",
                            "columns": 3,
                            "items": [
                                {"title": "Airline Veteran Trainers", "description": "Direct mentorship from retired airline AGMs and cabin examiners.", "icon": "🧑‍✈️"},
                                {"title": "Mock Cabin Simulator", "description": "Full safety procedures and service flow inside our simulated aircraft cabin.", "icon": "🛫"},
                                {"title": "Placement Grooming", "description": "Rigorous airline recruitment grooming, mock GDs, and interview drives.", "icon": "💼"}
                            ]
                        }
                    }
                ]
            },
            {
                "name": "Download Starter Kit",
                "settings": {"background": "light", "padding": "normal"},
                "blocks": [
                    {
                        "type": "lead_magnet",
                        "props": {
                            "heading": "Download: Cabin Crew Starter Kit 2026",
                            "description": "Free syllabus preview, phonetic alphabet guide, grooming standards, and airline interview questions.",
                            "buttonText": "Download Free PDF",
                            "downloadFile": "/media/cabin-crew-starter-kit.pdf"
                        }
                    }
                ]
            },
            {
                "name": "WhatsApp Quick Connect",
                "settings": {"background": "white", "padding": "compact"},
                "blocks": [
                    {
                        "type": "whatsapp_cta",
                        "props": {
                            "headline": "Questions regarding Cabin Crew eligibility?",
                            "subtext": "Chat directly with our admissions desk on WhatsApp.",
                            "buttonText": "Chat on WhatsApp",
                            "phone": "+919953777320"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "a0000001-0000-0000-0000-000000000003",
        "title": "Airborne Aviation Academy Homepage",
        "slug": "home",
        "description": "DGCA-aligned aviation training academy in Dwarka, New Delhi. Offers CPL and ATPL ground school, cadet preparation, cabin crew training, and A320 simulator familiarisation.",
        "seoTitle": "DGCA-Compliant Pilot Training in Delhi | Airborne Aviation",
        "seoDesc": "DGCA-compliant CPL & ATPL ground school in Dwarka, New Delhi, since 2009. CPL ground classes, airline cadet preparation, A320 simulator familiarisation.",
        "seoKeywords": ["pilot training delhi", "dgca ground school", "cpl classes dwarka", "cadet pilot preparation"],
        "starterTemplate": "lead_magnet_page",
        "sections": [
            {
                "name": "Hero Banner",
                "settings": {"background": "navy", "padding": "spacious"},
                "blocks": [
                    {
                        "type": "hero",
                        "props": {
                            "badge": "✈️ INDIA'S PREMIER GROUND SCHOOL",
                            "heading": "Your Direct Flight Path to the Airline Cockpit",
                            "subheading": "Mentorship by airline captains and DGCA ground school specialists in Dwarka, New Delhi.",
                            "ctaText": "Explore Training Programs",
                            "ctaLink": "/courses"
                        }
                    }
                ]
            },
            {
                "name": "Key Metrics",
                "settings": {"background": "white", "padding": "compact"},
                "blocks": [
                    {
                        "type": "stats",
                        "props": {
                            "items": [
                                {"value": "2,500+", "label": "Pilots & Crew Trained"},
                                {"value": "95%+", "label": "DGCA First Attempt Pass"},
                                {"value": "15+", "label": "Years in Aviation"},
                                {"value": "100%", "label": "Airline Cockpit Mentorship"}
                            ]
                        }
                    }
                ]
            }
        ]
    }
]

for p in pages_to_seed:
    metadata_obj = {
        "starterTemplate": p["starterTemplate"],
        "studioDraft": {
            "sections": p["sections"]
        }
    }
    now = datetime.utcnow()
    
    # Check if page exists
    cur.execute("SELECT id FROM pages WHERE slug = %s", (p["slug"],))
    existing = cur.fetchone()
    
    if existing:
        page_id = existing[0]
        cur.execute("""
            UPDATE pages
            SET title = %s, description = %s, "seoTitle" = %s, "seoDesc" = %s, "seoKeywords" = %s,
                metadata = %s, status = 'PUBLISHED', "publishedAt" = %s, "updatedAt" = %s
            WHERE id = %s
        """, (p["title"], p["description"], p["seoTitle"], p["seoDesc"], p["seoKeywords"], json.dumps(metadata_obj), now, now, page_id))
        print(f"Updated page {p['slug']} ({page_id})")
    else:
        page_id = p["id"]
        cur.execute("""
            INSERT INTO pages (
                id, "orgId", title, slug, description, status, "publishedAt", "publishedBy",
                "seoTitle", "seoDesc", "seoKeywords", metadata, version, "createdBy", "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, 'PUBLISHED', %s, %s,
                %s, %s, %s, %s, 1, %s, %s, %s
            )
        """, (
            page_id, org_id, p["title"], p["slug"], p["description"], now, user_id,
            p["seoTitle"], p["seoDesc"], p["seoKeywords"], json.dumps(metadata_obj), user_id, now, now
        ))
        print(f"Inserted page {p['slug']} ({page_id})")
        
    # Delete old relational sections and blocks for clean synchronization
    cur.execute("SELECT id FROM page_sections WHERE \"pageId\" = %s", (page_id,))
    sec_ids = [r[0] for r in cur.fetchall()]
    for s_id in sec_ids:
        cur.execute("DELETE FROM page_blocks WHERE \"sectionId\" = %s", (s_id,))
    cur.execute("DELETE FROM page_sections WHERE \"pageId\" = %s", (page_id,))
    
    # Insert sections and blocks
    for s_idx, sec in enumerate(p["sections"]):
        sec_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO page_sections (id, "orgId", "pageId", name, "order", "isVisible", settings, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, true, %s, %s, %s)
        """, (sec_id, org_id, page_id, sec["name"], s_idx, json.dumps(sec.get("settings", {})), now, now))
        
        for b_idx, blk in enumerate(sec.get("blocks", [])):
            blk_type = blk["type"]
            cur.execute("SELECT id FROM content_blocks WHERE type = %s AND \"orgId\" = %s", (blk_type, org_id))
            cb_row = cur.fetchone()
            if not cb_row:
                cb_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO content_blocks (id, "orgId", type, name, description, category, schema, "defaultProps", "isGlobal", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, 'Modular', '{}', '{}', false, %s, %s)
                """, (cb_id, org_id, blk_type, blk_type.replace('_', ' ').title(), f"Modular {blk_type} block", now, now))
            else:
                cb_id = cb_row[0]
                
            pb_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO page_blocks (id, "orgId", "sectionId", "blockTypeId", "order", props, "isVisible", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, true, %s, %s)
            """, (pb_id, org_id, sec_id, cb_id, b_idx, json.dumps(blk.get("props", {})), now, now))

    # Add initial page_version for rollback capability
    cur.execute("SELECT COUNT(*) FROM page_versions WHERE \"pageId\" = %s", (page_id,))
    v_count = cur.fetchone()[0]
    if v_count == 0:
        v_id = str(uuid.uuid4())
        snapshot_data = {
            "title": p["title"],
            "slug": p["slug"],
            "seo": {"title": p["seoTitle"], "desc": p["seoDesc"], "keywords": p["seoKeywords"]},
            "sections": p["sections"]
        }
        cur.execute("""
            INSERT INTO page_versions (id, "orgId", "pageId", version, title, snapshot, status, "publishedAt", "createdBy", "createdAt")
            VALUES (%s, %s, %s, 1, %s, %s, 'PUBLISHED', %s, %s, %s)
        """, (v_id, org_id, page_id, p["title"], json.dumps(snapshot_data), now, user_id, now))
        print(f"Created version 1 snapshot for {p['slug']}")

conn.commit()
print("All 3 core CMS pages successfully seeded and synchronized!")
conn.close()
