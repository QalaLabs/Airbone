import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

test('Cadet Preparation Page - Content & Structure Alignment with Revised Mock PDF', async (t) => {
  const filePath = join(process.cwd(), 'src/app/courses/cadet-preparation/page.jsx')
  const content = readFileSync(filePath, 'utf8')

  await t.test('1. Hero tagline and heading match revised PDF', () => {
    assert.match(content, /A DIRECT ROUTE TO THE AIRLINE COCKPIT/)
    assert.match(content, /Cadet Pilot Program Preparation - IndiGo, Air India &amp; Akasa/)
    assert.doesNotMatch(content, /This is the Quickest Entry in aviation/i)
  })

  await t.test('2. "What Is a Cadet Pilot Program?" paragraph matches revised PDF', () => {
    assert.match(content, /What Is a Cadet Pilot Program\?/)
    assert.match(content, /A cadet pilot program is an airline-guided pathway/)
    assert.match(content, /Letter of Intent/)
  })

  await t.test('3. Airline cards list IndiGo, Air India, and Akasa with correct programme titles', () => {
    assert.match(content, /IndiGo Cadet Pilot Programme/)
    assert.match(content, /Air India Cadet Pilot Programme/)
    assert.match(content, /Akasa SkyCadet Pilot Training Programme/)
    assert.match(content, /deepak@airborneaviation\.in/)
    assert.doesNotMatch(content, /JFO Cadet Program/i)
    assert.doesNotMatch(content, /iFLY \/ Cadet Scheme/i)
  })

  await t.test('4. Selection Stages table has 6 stages without legacy names', () => {
    assert.match(content, /Cadet Program Selection Stages - What Airborne Prepares You For/)
    assert.match(content, /Online Application/)
    assert.match(content, /Aptitude Test/)
    assert.match(content, /Psychometric Evaluation/)
    assert.match(content, /Simulator Assessment/)
    assert.match(content, /GD \+ PI Round/)
    assert.match(content, /Medical/)
    assert.doesNotMatch(content, /in FNPT or FFS/i)
  })

  await t.test('5. "LEARN FROM AIRLINE PILOTS" section is placed with 2-attempt warning', () => {
    assert.match(content, /LEARN FROM AIRLINE PILOTS/)
    assert.match(content, /WHY SETTLE FOR AN ORDINARY INSTRUCTOR WHEN AN AIRLINE PILOT CAN PREPARE YOU\?/)
    assert.match(content, /Selected through an airline cadet program\. Now your instructor\./)
    assert.match(content, /only two attempts/)
  })

  await t.test('6. "Cadet Pilot Screening & Aptitude Prep" subtitle uses "guidance"', () => {
    assert.match(content, /Cadet Pilot Screening &amp; Aptitude Prep/)
    assert.match(content, /ADAPT test preparation, psychomotor screening drills, and airline cadet intake guidance\./)
  })

  await t.test('7. "Our Cadet Selections" replaces YouTube Shorts with 6 cadets and demo card', () => {
    assert.match(content, /Our Cadet Selections/)
    assert.match(content, /Last batch selections: 3 of our 6 selected cadets cleared selection through Chimes Aviation Academy\./)
    assert.match(content, /Nayonika Dhagat/)
    assert.match(content, /Daksh Jangra/)
    assert.match(content, /Krresh Taneja/)
    assert.match(content, /Bhaawee Arora/)
    assert.match(content, /Daksh Yadav/)
    assert.match(content, /Akshat Gupta/)
    assert.match(content, /YOU CAN BE<br \/>THE NEXT\./)
    assert.match(content, /BOOK A FREE DEMO/)
    // Old YouTube Shorts components must be removed
    assert.doesNotMatch(content, /CourseVideoTabs/)
    assert.doesNotMatch(content, /GPWS/i)
    assert.doesNotMatch(content, /Pilot Incapacitation/i)
  })

  await t.test('8. Exactly 3 updated FAQs are rendered', () => {
    assert.match(content, /What is the eligibility for airline cadet pilot programmes\?/)
    assert.match(content, /Does Airborne guarantee cadet selection\?/)
    assert.match(content, /What should you expect from your instructor\?/)
  })

  await t.test('9. Recommended Next learning path removes instructor name', () => {
    assert.match(content, /Airline Interview Preparation/)
    assert.match(content, /Advanced GD\/PI coaching/)
    assert.doesNotMatch(content, /Rajeet Khalsa/)
  })

  await t.test('10. Preserves core components: LeadForm, CourseReviews, NextBatchBadge', () => {
    assert.match(content, /<LeadForm/)
    assert.match(content, /<CourseReviews \/>/)
    assert.match(content, /<NextBatchBadge/)
    assert.match(content, /<CoursePageFooter/)
  })
})
