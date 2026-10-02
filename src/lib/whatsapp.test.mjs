import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_WHATSAPP_NUMBER,
  WHATSAPP_HREF,
  formatWhatsAppDisplay,
  normalizeWhatsAppNumber,
  whatsappHref,
} from './whatsapp.js'

test('normalizeWhatsAppNumber accepts common Indian formats and rejects junk', () => {
  assert.equal(normalizeWhatsAppNumber('919953777320'), '919953777320')
  assert.equal(normalizeWhatsAppNumber('+91 99537 77320'), '919953777320')
  assert.equal(normalizeWhatsAppNumber('9953777320'), '919953777320')
  assert.equal(normalizeWhatsAppNumber('0091-9818282209'), '919818282209')
  assert.equal(normalizeWhatsAppNumber('+44 20 7946 0958'), '442079460958')
  assert.equal(normalizeWhatsAppNumber(''), null)
  assert.equal(normalizeWhatsAppNumber('12345'), null)
  assert.equal(normalizeWhatsAppNumber('99537abc20'), null)
  assert.equal(normalizeWhatsAppNumber(undefined), null)
})

test('wa.me links use digits only and encode the prefilled text', () => {
  assert.equal(whatsappHref(undefined, '919953777320'), 'https://wa.me/919953777320')
  assert.equal(whatsappHref('Hi, CPL & ATPL?', '919953777320'), 'https://wa.me/919953777320?text=Hi%2C%20CPL%20%26%20ATPL%3F')
  assert.match(WHATSAPP_HREF, /^https:\/\/wa\.me\/[1-9]\d{10,14}$/)
})

test('default number and display label stay in step', () => {
  if (!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) assert.equal(WHATSAPP_HREF, `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`)
  assert.equal(formatWhatsAppDisplay('919953777320'), '+91 9953 777 320')
  assert.equal(formatWhatsAppDisplay('442079460958'), '+442079460958')
})
