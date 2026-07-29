# Feedback Sprint Checklist — FULL AUDIT (updated 2026-07-25 evening)

Source: `Airborne Aviation Website Feedback _ 24_7.md`  
Code HEAD baseline: `31d9308` + this pass uncommitted deltas  

Legend: `IMPLEMENTED_VALIDATED` | `ALREADY` | `CLIENT_DEP` | `N/A` | `PARTIAL`

## General Website
| ID | Issue | Status |
|----|-------|--------|
| G1 | Entire site light theme | PARTIAL — content shells light; homepage 3D/FAQ still dark by design |
| G2 | More images all pages | CLIENT_DEP |
| G3 | Map each breadcrumb | PARTIAL — Breadcrumb on /courses + /blog; course details use trail links |
| G4 | Month timeline unit | ALREADY |
| G5 | Header Glass Morphosis | ALREADY |
| G6 | DGCA Approved → Complied | ALREADY / reinforced |
| G7 | Remove "" | N/A |

## Course Specific
| ID | Issue | Status |
|----|-------|--------|
| C1 | CPL 12–18 months | ALREADY |
| C2 | CPL GS 3–6 months | ALREADY |
| C3 | CPL box padding | IMPLEMENTED — program-card-padded CSS |
| C4 | ATPL 21y / 2–3 mo | IMPLEMENTED — page/schema/listing aligned |
| C5 | PPL 10th / 3–6 | ALREADY |
| C6 | Sequence = homepage | ALREADY |

## Content
| ID | Issue | Status |
|----|-------|--------|
| W1 | Module content every course | PARTIAL — major courses covered; thin pages remain |
| W2 | Interlinking logic | N/A (doc) |
| W3 | 1–3 reviews every course | IMPLEMENTED — CourseReviews on major course pages |
| W4 | Parent testimonials | IMPLEMENTED — PARENT_TESTIMONIALS rendered |

## Homepage
| ID | Issue | Status |
|----|-------|--------|
| H1–H2, H5–H8 | Pricing / FAQ / alumni / footer | ALREADY |
| H3 | Airline Prep WhatsApp layout | CLIENT_DEP / page exists as premium product |
| H4 | Parent Centric page | IMPLEMENTED — H1/meta/breadcrumb |

## About / Contact / Policy
| ID | Issue | Status |
|----|-------|--------|
| A1 | Logo | CLIENT_DEP |
| A2–A3, CT1, P1 | Bios / mentors / contact / privacy | ALREADY |

## Jobs / Resources / Blog
| ID | Issue | Status |
|----|-------|--------|
| J1 | Jobs lead magnet | IMPLEMENTED — weekly brief CTA |
| J2 | Scrape 100 jobs | CLIENT_DEP |
| R1 | Resource assets | CLIENT_DEP |
| B1 | Blog 404 | ALREADY |

## Listing L1–L14
| ID | Issue | Status |
|----|-------|--------|
| L1–L4, L6–L9, L11–L14 | Mostly | ALREADY |
| L5 | Remove eligibility | IMPLEMENTED — cards + dynamic slug; remaining pages retitled Requirements |
| L10 | Remove IR (+A320 conflict with L11) | PARTIAL — IR off table; A320 kept as FBS per L11 |

## ATPL / CPL / Cabin / Cadet / A320 / GD
| ID | Issue | Status |
|----|-------|--------|
| AT* | Duration/H1/FAQ schema | IMPLEMENTED |
| CP* | Subjects no EASA codes; Issuance; recommendations | IMPLEMENTED |
| CP1 URL rename | CLIENT_DEP (target blank) |
| CP6 emoji→icons | PARTIAL — key CPL sidebar cleaned |
| CP7 images | CLIENT_DEP |
| CC1 | ₹59k / 100%* | IMPLEMENTED — pathways/FAQ/schema synced |
| CD1 | Institutes lists | CLIENT_DEP placeholders |
| A320 row remove | CLIENT_DEP (image-only ask) |
| GD1 | Two-product model | ALREADY (ship blockers) |
