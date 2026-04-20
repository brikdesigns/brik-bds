import { describe, it, expect } from 'vitest';

import {
  getIndustryServices,
  getIndustryPaymentTypes,
  getIndustryInsuranceProviders,
  getIndustryConditions,
  getIndustryProcedures,
  getIndustryAmenities,
  getIndustriesForParent,
  getIndustryInsurancePlans,
  getIndustryFinancing,
} from './getters';
import { PAYMENT_METHOD_VALUES, isPaymentMethod } from '../vocabularies';

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
  it('returns exactly the 10 locked dental carriers', () => {
    const providers = getIndustryInsuranceProviders('dental');
    expect(providers).toHaveLength(10);
    expect(providers).toEqual([
      'Aetna',
      'Anthem',
      'Blue Cross Blue Shield',
      'Cigna',
      'Delta Dental',
      'Guardian',
      'Humana',
      'MetLife',
      'Principal',
      'UnitedHealthcare',
    ]);
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

// ── getIndustryConditions ────────────────────────────────────────────────────

describe('getIndustryConditions', () => {
  it('returns dental conditions', () => {
    const conditions = getIndustryConditions('dental');
    expect(conditions.length).toBeGreaterThanOrEqual(10);
    expect(conditions).toContain('Cavity');
    expect(conditions).toContain('Gum Disease');
    expect(conditions).toContain('TMJ Disorder');
  });

  it('returns empty array for real-estate-rv-mhc (no healthcare catalog)', () => {
    expect(getIndustryConditions('real-estate-rv-mhc')).toEqual([]);
  });

  it('returns empty array for small-business (no catalog)', () => {
    expect(getIndustryConditions('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty) for null / undefined', () => {
    expect(getIndustryConditions(null)).toEqual([]);
    expect(getIndustryConditions(undefined)).toEqual([]);
  });
});

// ── getIndustryProcedures ────────────────────────────────────────────────────

describe('getIndustryProcedures', () => {
  it('returns dental procedures', () => {
    const procedures = getIndustryProcedures('dental');
    expect(procedures.length).toBeGreaterThanOrEqual(15);
    expect(procedures).toContain('Composite Filling');
    expect(procedures).toContain('Single-Tooth Implant');
    expect(procedures).toContain('Root Canal (Molar)');
  });

  it('returns empty array for non-healthcare industries', () => {
    expect(getIndustryProcedures('real-estate-rv-mhc')).toEqual([]);
    expect(getIndustryProcedures('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty) for null / undefined', () => {
    expect(getIndustryProcedures(null)).toEqual([]);
    expect(getIndustryProcedures(undefined)).toEqual([]);
  });
});

// ── getIndustryAmenities ─────────────────────────────────────────────────────

describe('getIndustryAmenities', () => {
  it('returns amenities for real-estate-rv-mhc', () => {
    const amenities = getIndustryAmenities('real-estate-rv-mhc');
    expect(amenities.length).toBeGreaterThanOrEqual(30);
    expect(amenities).toContain('Pool');
    expect(amenities).toContain('Full Hookup (Electric + Water + Sewer)');
    expect(amenities).toContain('Gated Access');
  });

  it('returns empty array for non-hospitality industries', () => {
    expect(getIndustryAmenities('dental')).toEqual([]);
    expect(getIndustryAmenities('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty) for null / undefined', () => {
    expect(getIndustryAmenities(null)).toEqual([]);
    expect(getIndustryAmenities(undefined)).toEqual([]);
  });
});

// ── getIndustriesForParent ───────────────────────────────────────────────────

describe('getIndustriesForParent', () => {
  it('returns dental under the medical parent', () => {
    const packs = getIndustriesForParent('medical');
    expect(packs.map((p) => p.slug)).toContain('dental');
    expect(packs).toHaveLength(1);
  });

  it('returns real-estate-rv-mhc under the real-estate parent', () => {
    const packs = getIndustriesForParent('real-estate');
    expect(packs.map((p) => p.slug)).toContain('real-estate-rv-mhc');
    expect(packs).toHaveLength(1);
  });

  it('returns small-business under its self-named parent', () => {
    const packs = getIndustriesForParent('small-business');
    expect(packs.map((p) => p.slug)).toContain('small-business');
    expect(packs).toHaveLength(1);
  });

  it('returns empty array for the other parent (no graduated packs)', () => {
    expect(getIndustriesForParent('other')).toEqual([]);
  });
});

// ── getIndustryInsurancePlans ────────────────────────────────────────────────

describe('getIndustryInsurancePlans', () => {
  it('returns exactly the 4 locked dental plan types', () => {
    const plans = getIndustryInsurancePlans('dental');
    expect(plans).toEqual([
      'Out-of-Network PPO',
      'Fee-for-Service Only',
      'Medicaid',
      'Medicare',
    ]);
  });

  it('returns empty array when pack has no insurancePlans', () => {
    expect(getIndustryInsurancePlans('real-estate-rv-mhc')).toEqual([]);
    expect(getIndustryInsurancePlans('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty) for null / undefined', () => {
    expect(getIndustryInsurancePlans(null)).toEqual([]);
    expect(getIndustryInsurancePlans(undefined)).toEqual([]);
  });

  it('returns a mutable copy — mutations do not affect the source pack', () => {
    const plans = getIndustryInsurancePlans('dental');
    plans.push('__mutation_test__');
    expect(getIndustryInsurancePlans('dental')).not.toContain('__mutation_test__');
  });
});

// ── getIndustryFinancing ─────────────────────────────────────────────────────

describe('getIndustryFinancing', () => {
  it('returns exactly the 5 locked dental financing products', () => {
    const financing = getIndustryFinancing('dental');
    expect(financing).toEqual([
      'CareCredit',
      'Cherry Finance',
      'Sunbit',
      'LendingClub',
      'In-House Financing',
    ]);
  });

  it('returns empty array when pack has no financing catalog', () => {
    expect(getIndustryFinancing('real-estate-rv-mhc')).toEqual([]);
    expect(getIndustryFinancing('small-business')).toEqual([]);
  });

  it('falls back to small-business (empty) for null / undefined', () => {
    expect(getIndustryFinancing(null)).toEqual([]);
    expect(getIndustryFinancing(undefined)).toEqual([]);
  });
});

// ── PAYMENT_METHOD_VALUES (global vocabulary) ────────────────────────────────

describe('PAYMENT_METHOD_VALUES', () => {
  it('contains exactly the 14 locked global payment methods', () => {
    expect(PAYMENT_METHOD_VALUES).toEqual([
      'Cash',
      'Check',
      'Debit',
      'Visa',
      'Mastercard',
      'Amex',
      'Discover',
      'Apple Pay',
      'Google Pay',
      'ACH/Bank Transfer',
      'Venmo',
      'Zelle',
      'CareCredit',
      'HSA/FSA',
    ]);
  });

  it('isPaymentMethod guards membership correctly', () => {
    expect(isPaymentMethod('Cash')).toBe(true);
    expect(isPaymentMethod('CareCredit')).toBe(true);
    expect(isPaymentMethod('Bitcoin')).toBe(false);
    expect(isPaymentMethod('Delta Dental')).toBe(false);
  });
});
