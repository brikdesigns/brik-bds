import { describe, it, expect } from 'vitest';

import {
  getIndustryServices,
  getIndustryPaymentTypes,
  getIndustryInsuranceProviders,
} from './getters';

// ── getIndustryServices ──────────────────────────────────────────────────────

describe('getIndustryServices', () => {
  it('returns dental services for the dental slug', () => {
    const services = getIndustryServices('dental');
    expect(services.length).toBeGreaterThanOrEqual(15);
    expect(services).toContain('Dental Implants');
    expect(services).toContain('Root Canal Therapy');
    expect(services).toContain('Invisalign / Clear Aligners');
  });

  it('returns real-estate-rv-mhc services for the rv/mhc slug', () => {
    const services = getIndustryServices('real-estate-rv-mhc');
    expect(services.length).toBeGreaterThanOrEqual(15);
    expect(services).toContain('Nightly RV Sites');
    expect(services).toContain('Manufactured Home Lot Rental');
  });

  it('returns small-business services for the small-business slug', () => {
    const services = getIndustryServices('small-business');
    expect(services.length).toBeGreaterThanOrEqual(5);
    expect(services).toContain('Consulting');
  });

  it('falls back to small-business services for null', () => {
    expect(getIndustryServices(null)).toEqual(getIndustryServices('small-business'));
  });

  it('falls back to small-business services for undefined', () => {
    expect(getIndustryServices(undefined)).toEqual(getIndustryServices('small-business'));
  });

  it('returns a mutable copy — mutations do not affect the source pack', () => {
    const services = getIndustryServices('dental');
    const original = getIndustryServices('dental');
    services.push('__mutation_test__');
    expect(getIndustryServices('dental')).toEqual(original);
  });
});

// ── getIndustryPaymentTypes ──────────────────────────────────────────────────

describe('getIndustryPaymentTypes', () => {
  it('returns dental payment types including CareCredit and Sunbit', () => {
    const types = getIndustryPaymentTypes('dental');
    expect(types).toContain('CareCredit');
    expect(types).toContain('Sunbit');
    expect(types).toContain('HSA (Health Savings Account)');
    expect(types).toContain('In-House Membership Plan');
  });

  it('returns real-estate-rv-mhc payment types', () => {
    const types = getIndustryPaymentTypes('real-estate-rv-mhc');
    expect(types).toContain('Cash');
    expect(types).toContain('ACH / Bank Transfer');
    expect(types).toContain('Online Rent Payment Portal');
    expect(types).toContain('Chattel Loan (through lender)');
  });

  it('returns small-business payment types', () => {
    const types = getIndustryPaymentTypes('small-business');
    expect(types).toContain('Credit Card');
    expect(types).toContain('ACH / Bank Transfer');
  });

  it('falls back to small-business for null / undefined', () => {
    expect(getIndustryPaymentTypes(null)).toEqual(getIndustryPaymentTypes('small-business'));
    expect(getIndustryPaymentTypes(undefined)).toEqual(getIndustryPaymentTypes('small-business'));
  });
});

// ── getIndustryInsuranceProviders ────────────────────────────────────────────

describe('getIndustryInsuranceProviders', () => {
  it('returns a populated list for dental', () => {
    const providers = getIndustryInsuranceProviders('dental');
    expect(providers.length).toBeGreaterThanOrEqual(10);
    expect(providers).toContain('Delta Dental');
    expect(providers).toContain('Aetna Dental');
    expect(providers).toContain('MetLife Dental');
    expect(providers).toContain('Cigna Dental');
    expect(providers).toContain('Blue Cross Blue Shield');
  });

  it('returns empty array for real-estate-rv-mhc (insurance not applicable)', () => {
    expect(getIndustryInsuranceProviders('real-estate-rv-mhc')).toEqual([]);
  });

  it('returns empty array for small-business (catch-all — no specific insurance)', () => {
    expect(getIndustryInsuranceProviders('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty array) for null / undefined', () => {
    expect(getIndustryInsuranceProviders(null)).toEqual([]);
    expect(getIndustryInsuranceProviders(undefined)).toEqual([]);
  });

  it('returns a mutable copy — mutations do not affect the source pack', () => {
    const providers = getIndustryInsuranceProviders('dental');
    const original = getIndustryInsuranceProviders('dental');
    providers.push('__mutation_test__');
    expect(getIndustryInsuranceProviders('dental')).toEqual(original);
  });
});
