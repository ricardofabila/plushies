import { describe, it, expect } from 'vitest'
import {
    calculateGanancia,
    calculateComision,
    calculateRestante,
    calculateEntryMetrics,
    roundToDecimals
} from '../index'

describe('Business Logic Calculations', () => {
    describe('calculateGanancia', () => {
        it('should calculate ganancia correctly for positive values', () => {
            expect(calculateGanancia(1000, 300)).toBe(700)
            expect(calculateGanancia(500, 200)).toBe(300)
            expect(calculateGanancia(1500.50, 450.25)).toBe(1050.25)
        })

        it('should handle zero values', () => {
            expect(calculateGanancia(1000, 0)).toBe(1000)
            expect(calculateGanancia(0, 0)).toBe(0)
        })

        it('should handle negative ganancia when costs exceed revenue', () => {
            expect(calculateGanancia(300, 500)).toBe(-200)
        })

        it('should round to 2 decimal places', () => {
            expect(calculateGanancia(100.333, 50.666)).toBe(49.67)
            expect(calculateGanancia(1000.999, 500.001)).toBe(501)
        })
    })

    describe('calculateComision', () => {
        it('should calculate commission correctly for various percentages', () => {
            expect(calculateComision(1000, 10)).toBe(100)
            expect(calculateComision(500, 15)).toBe(75)
            expect(calculateComision(750, 20)).toBe(150)
        })

        it('should handle zero commission percentage', () => {
            expect(calculateComision(1000, 0)).toBe(0)
        })

        it('should handle zero ganancia', () => {
            expect(calculateComision(0, 15)).toBe(0)
        })

        it('should handle negative ganancia', () => {
            expect(calculateComision(-200, 15)).toBe(-30)
        })

        it('should round to 2 decimal places', () => {
            expect(calculateComision(333.33, 15)).toBe(50)
            expect(calculateComision(100, 33.33)).toBe(33.33)
        })

        it('should handle high commission percentages', () => {
            expect(calculateComision(1000, 100)).toBe(1000)
            expect(calculateComision(500, 50)).toBe(250)
        })
    })

    describe('calculateRestante', () => {
        it('should calculate restante correctly', () => {
            expect(calculateRestante(1000, 150)).toBe(850)
            expect(calculateRestante(500, 75)).toBe(425)
            expect(calculateRestante(300, 60)).toBe(240)
        })

        it('should handle zero commission', () => {
            expect(calculateRestante(1000, 0)).toBe(1000)
        })

        it('should handle zero ganancia', () => {
            expect(calculateRestante(0, 50)).toBe(-50)
        })

        it('should handle negative values', () => {
            expect(calculateRestante(-200, 30)).toBe(-230)
            expect(calculateRestante(100, -20)).toBe(120)
        })

        it('should round to 2 decimal places', () => {
            expect(calculateRestante(333.333, 50.666)).toBe(282.67)
        })
    })

    describe('calculateEntryMetrics', () => {
        it('should calculate all metrics correctly for a complete entry', () => {
            const entry = {
                id: '1',
                date: '15/01/2024',
                recaudado: 1000,
                costoPeluches: 300
            }
            const commissionPercent = 15

            const metrics = calculateEntryMetrics(entry, commissionPercent)

            expect(metrics.ganancia).toBe(700)
            expect(metrics.comision).toBe(105)
            expect(metrics.restante).toBe(595)
        })

        it('should handle edge case with zero revenue', () => {
            const entry = {
                id: '1',
                date: '15/01/2024',
                recaudado: 0,
                costoPeluches: 0
            }
            const commissionPercent = 15

            const metrics = calculateEntryMetrics(entry, commissionPercent)

            expect(metrics.ganancia).toBe(0)
            expect(metrics.comision).toBe(0)
            expect(metrics.restante).toBe(0)
        })

        it('should handle negative ganancia scenario', () => {
            const entry = {
                id: '1',
                date: '15/01/2024',
                recaudado: 200,
                costoPeluches: 500
            }
            const commissionPercent = 10

            const metrics = calculateEntryMetrics(entry, commissionPercent)

            expect(metrics.ganancia).toBe(-300)
            expect(metrics.comision).toBe(-30)
            expect(metrics.restante).toBe(-270)
        })
    })

    describe('roundToDecimals', () => {
        it('should round to 2 decimal places by default', () => {
            expect(roundToDecimals(123.456)).toBe(123.46)
            expect(roundToDecimals(123.454)).toBe(123.45)
            expect(roundToDecimals(123.999)).toBe(124)
        })

        it('should round to specified decimal places', () => {
            expect(roundToDecimals(123.456, 1)).toBe(123.5)
            expect(roundToDecimals(123.456, 3)).toBe(123.456)
            expect(roundToDecimals(123.456, 0)).toBe(123)
        })

        it('should handle negative numbers', () => {
            expect(roundToDecimals(-123.456)).toBe(-123.46)
            expect(roundToDecimals(-123.454)).toBe(-123.45)
        })

        it('should handle zero', () => {
            expect(roundToDecimals(0)).toBe(0)
            expect(roundToDecimals(0.001)).toBe(0)
        })
    })
})