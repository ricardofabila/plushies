import { describe, it, expect } from 'vitest'
import {
    formatDate,
    formatDateForDisplay,
    parseDate,
    isValidDateFormat,
    formatCurrency,
    formatNumber
} from '../index'

describe('Date and Currency Formatting Utilities', () => {
    describe('formatDate', () => {
        it('should format dates to DD/MM/YYYY format', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            expect(formatDate(date)).toBe('15/01/2024')
        })

        it('should handle different months correctly', () => {
            const march = new Date(2024, 2, 5) // March 5, 2024
            const december = new Date(2024, 11, 25) // December 25, 2024

            expect(formatDate(march)).toBe('05/03/2024')
            expect(formatDate(december)).toBe('25/12/2024')
        })

        it('should pad single digits with zeros', () => {
            const date = new Date(2024, 0, 1) // January 1, 2024
            expect(formatDate(date)).toBe('01/01/2024')
        })
    })

    describe('formatDateForDisplay', () => {
        it('should format valid date strings to display format', () => {
            expect(formatDateForDisplay('15/01/2024')).toBe('15/ene/2024')
            expect(formatDateForDisplay('05/03/2024')).toBe('05/mar/2024')
            expect(formatDateForDisplay('25/12/2024')).toBe('25/dic/2024')
        })

        it('should return original string for invalid dates', () => {
            expect(formatDateForDisplay('invalid-date')).toBe('invalid-date')
            expect(formatDateForDisplay('32/13/2024')).toBe('32/13/2024')
            expect(formatDateForDisplay('')).toBe('')
        })
    })

    describe('parseDate', () => {
        it('should parse valid DD/MM/YYYY date strings', () => {
            const parsed = parseDate('15/01/2024')
            expect(parsed.getDate()).toBe(15)
            expect(parsed.getMonth()).toBe(0) // January is 0
            expect(parsed.getFullYear()).toBe(2024)
        })

        it('should handle different valid dates', () => {
            const march = parseDate('05/03/2024')
            const december = parseDate('25/12/2024')

            expect(march.getMonth()).toBe(2) // March is 2
            expect(december.getMonth()).toBe(11) // December is 11
        })

        it('should throw error for invalid date formats', () => {
            expect(() => parseDate('invalid-date')).toThrow()
            expect(() => parseDate('2024-01-15')).toThrow()
            expect(() => parseDate('15-01-2024')).toThrow()
            expect(() => parseDate('32/13/2024')).toThrow()
        })

        it('should throw error for empty or null strings', () => {
            expect(() => parseDate('')).toThrow()
        })
    })

    describe('isValidDateFormat', () => {
        it('should return true for valid DD/MM/YYYY dates', () => {
            expect(isValidDateFormat('15/01/2024')).toBe(true)
            expect(isValidDateFormat('01/01/2024')).toBe(true)
            expect(isValidDateFormat('31/12/2024')).toBe(true)
            expect(isValidDateFormat('29/02/2024')).toBe(true) // Leap year
        })

        it('should return false for invalid date formats', () => {
            expect(isValidDateFormat('invalid-date')).toBe(false)
            expect(isValidDateFormat('2024-01-15')).toBe(false)
            expect(isValidDateFormat('15-01-2024')).toBe(false)
            expect(isValidDateFormat('32/13/2024')).toBe(false) // Invalid day/month
            expect(isValidDateFormat('29/02/2023')).toBe(false) // Non-leap year
        })

        it('should return false for empty or null strings', () => {
            expect(isValidDateFormat('')).toBe(false)
        })
    })

    describe('formatCurrency', () => {
        it('should format amounts as Mexican Peso currency', () => {
            expect(formatCurrency(1000)).toBe('$1,000.00')
            expect(formatCurrency(1500.50)).toBe('$1,500.50')
            expect(formatCurrency(0)).toBe('$0.00')
        })

        it('should handle large amounts with proper thousands separators', () => {
            expect(formatCurrency(1000000)).toBe('$1,000,000.00')
            expect(formatCurrency(123456.78)).toBe('$123,456.78')
        })

        it('should handle negative amounts', () => {
            expect(formatCurrency(-500)).toBe('-$500.00')
            expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
        })

        it('should handle decimal amounts correctly', () => {
            expect(formatCurrency(99.99)).toBe('$99.99')
            expect(formatCurrency(0.01)).toBe('$0.01')
            expect(formatCurrency(1000.1)).toBe('$1,000.10')
        })
    })

    describe('formatNumber', () => {
        it('should format numbers with thousands separators and 2 decimal places', () => {
            expect(formatNumber(1000)).toBe('1,000.00')
            expect(formatNumber(1500.5)).toBe('1,500.50')
            expect(formatNumber(0)).toBe('0.00')
        })

        it('should handle large numbers', () => {
            expect(formatNumber(1000000)).toBe('1,000,000.00')
            expect(formatNumber(123456.789)).toBe('123,456.79') // Rounds to 2 decimals
        })

        it('should handle negative numbers', () => {
            expect(formatNumber(-500)).toBe('-500.00')
            expect(formatNumber(-1234.56)).toBe('-1,234.56')
        })

        it('should always show 2 decimal places', () => {
            expect(formatNumber(100)).toBe('100.00')
            expect(formatNumber(99.9)).toBe('99.90')
            expect(formatNumber(0.1)).toBe('0.10')
        })
    })
})