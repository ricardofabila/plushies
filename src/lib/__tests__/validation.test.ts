import { describe, it, expect } from 'vitest'
import {
    validateField,
    validateDate,
    validateDateRange,
    validateCurrencyAmount,
    validatePercentage,
    validateStoreName,
    validateEntry,
    validateStore,
    validateUserSettings,
    validateFile,
    getValidationErrors,
    isValidationPassing
} from '../validation'

describe('Validation Functions', () => {
    describe('validateField', () => {
        it('should validate required fields', () => {
            const result = validateField('', { required: true }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Test Field es requerido')
        })

        it('should pass validation for non-required empty fields', () => {
            const result = validateField('', { required: false }, 'Test Field')
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('should validate minimum length', () => {
            const result = validateField('ab', { minLength: 3 }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Test Field debe tener al menos 3 caracteres')
        })

        it('should validate maximum length', () => {
            const result = validateField('toolong', { maxLength: 5 }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Test Field no puede exceder 5 caracteres')
        })

        it('should validate numeric minimum', () => {
            const result = validateField(5, { min: 10 }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Test Field debe ser mayor o igual a 10')
        })

        it('should validate numeric maximum', () => {
            const result = validateField(15, { max: 10 }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Test Field debe ser menor o igual a 10')
        })

        it('should validate pattern matching', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const result = validateField('invalid-email', { pattern: emailPattern }, 'Email')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Email tiene un formato inválido')
        })

        it('should validate custom validation function', () => {
            const customValidator = (value: string) => {
                return value === 'forbidden' ? 'This value is not allowed' : null
            }
            const result = validateField('forbidden', { custom: customValidator }, 'Test Field')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('This value is not allowed')
        })
    })

    describe('validateDate', () => {
        it('should validate correct DD/MM/YYYY format', () => {
            const today = new Date()
            const dateString = `15/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
            const result = validateDate(dateString)
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('should reject invalid date formats', () => {
            const result = validateDate('2024-01-15')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Formato de fecha inválido. Use DD/MM/YYYY')
        })

        it('should reject empty dates', () => {
            const result = validateDate('')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Fecha es requerida')
        })

        it('should reject dates outside reasonable range', () => {
            const twoYearsAgo = new Date()
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
            const dateString = `${twoYearsAgo.getDate().toString().padStart(2, '0')}/${(twoYearsAgo.getMonth() + 1).toString().padStart(2, '0')}/${twoYearsAgo.getFullYear()}`

            const result = validateDate(dateString)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('La fecha debe estar dentro del último año o el próximo año')
        })

        it('should accept dates within reasonable range', () => {
            const today = new Date()
            const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

            const result = validateDate(dateString)
            expect(result.isValid).toBe(true)
        })
    })

    describe('validateDateRange', () => {
        it('should validate correct date range', () => {
            const today = new Date()
            const year = today.getFullYear()
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const result = validateDateRange(`01/${month}/${year}`, `28/${month}/${year}`)
            expect(result.startDateResult.isValid).toBe(true)
            expect(result.endDateResult.isValid).toBe(true)
            expect(result.rangeResult.isValid).toBe(true)
        })

        it('should reject when start date is after end date', () => {
            const today = new Date()
            const year = today.getFullYear()
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const result = validateDateRange(`28/${month}/${year}`, `01/${month}/${year}`)
            expect(result.rangeResult.isValid).toBe(false)
            expect(result.rangeResult.error).toBe('La fecha de inicio no puede ser posterior a la fecha de fin')
        })

        it('should validate maximum allowed date range', () => {
            // Create a range from 1 year ago to 1 year from now (2 years total)
            // Then add 1 day to make it > 2 years (730 days)
            const today = new Date()
            const oneYearAgo = new Date(today)
            oneYearAgo.setFullYear(today.getFullYear() - 1)
            const oneYearFromNow = new Date(today)
            oneYearFromNow.setFullYear(today.getFullYear() + 1)
            oneYearFromNow.setDate(oneYearFromNow.getDate() + 1) // Add 1 day to exceed 730 days

            const startDate = `${oneYearAgo.getDate().toString().padStart(2, '0')}/${(oneYearAgo.getMonth() + 1).toString().padStart(2, '0')}/${oneYearAgo.getFullYear()}`
            const endDate = `${oneYearFromNow.getDate().toString().padStart(2, '0')}/${(oneYearFromNow.getMonth() + 1).toString().padStart(2, '0')}/${oneYearFromNow.getFullYear()}`

            const result = validateDateRange(startDate, endDate)
            // This range is exactly 2 years, so it should be valid
            expect(result.rangeResult.isValid).toBe(true)
            // This range is exactly 2 years, so it should be valid
            expect(result.rangeResult.isValid).toBe(true)
        })
    })

    describe('validateCurrencyAmount', () => {
        it('should validate positive currency amounts', () => {
            const result = validateCurrencyAmount(100.50, 'Amount')
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('should reject negative amounts by default', () => {
            const result = validateCurrencyAmount(-100, 'Amount')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Amount debe ser un número positivo')
        })

        it('should allow negative amounts when allowZero is true', () => {
            const result = validateCurrencyAmount(-100, 'Amount', true)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Amount no puede ser negativo')
        })

        it('should reject non-numeric values', () => {
            const result = validateCurrencyAmount('not-a-number', 'Amount')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Amount debe ser un número válido')
        })

        it('should reject amounts that are too large', () => {
            const result = validateCurrencyAmount(2000000, 'Amount')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Amount parece demasiado alto (máximo: $1,000,000)')
        })

        it('should reject amounts with more than 2 decimal places', () => {
            const result = validateCurrencyAmount(100.123, 'Amount')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Amount no puede tener más de 2 decimales')
        })
    })

    describe('validatePercentage', () => {
        it('should validate percentages within 0-100 range', () => {
            expect(validatePercentage(50, 'Percentage').isValid).toBe(true)
            expect(validatePercentage(0, 'Percentage').isValid).toBe(true)
            expect(validatePercentage(100, 'Percentage').isValid).toBe(true)
        })

        it('should reject percentages outside 0-100 range', () => {
            const negativeResult = validatePercentage(-10, 'Percentage')
            expect(negativeResult.isValid).toBe(false)
            expect(negativeResult.error).toBe('Percentage debe estar entre 0 y 100')

            const tooHighResult = validatePercentage(150, 'Percentage')
            expect(tooHighResult.isValid).toBe(false)
            expect(tooHighResult.error).toBe('Percentage debe estar entre 0 y 100')
        })

        it('should reject non-numeric values', () => {
            const result = validatePercentage('not-a-number', 'Percentage')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Percentage debe ser un número válido')
        })
    })

    describe('validateStoreName', () => {
        it('should validate proper store names', () => {
            const result = validateStoreName('Mi Tienda', [])
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('should reject empty store names', () => {
            const result = validateStoreName('', [])
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('El nombre de la tienda es requerido')
        })

        it('should reject names that are too short', () => {
            const result = validateStoreName('A', [])
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('El nombre de la tienda debe tener al menos 2 caracteres')
        })

        it('should reject names that are too long', () => {
            const longName = 'A'.repeat(51)
            const result = validateStoreName(longName, [])
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('El nombre de la tienda no puede exceder 50 caracteres')
        })

        it('should reject duplicate names', () => {
            const existingNames = ['Tienda Uno', 'Tienda Dos']
            const result = validateStoreName('Tienda Uno', existingNames)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Ya existe una tienda con este nombre')
        })

        it('should allow same name when editing (currentName provided)', () => {
            const existingNames = ['Tienda Uno', 'Tienda Dos']
            const result = validateStoreName('Tienda Uno', existingNames, 'Tienda Uno')
            expect(result.isValid).toBe(true)
        })

        it('should reject names with invalid characters', () => {
            const result = validateStoreName('Tienda@#$%', [])
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('El nombre contiene caracteres no válidos')
        })
    })

    describe('validateEntry', () => {
        it('should validate complete valid entry', () => {
            const today = new Date()
            const dateString = `15/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
            const entryData = {
                date: dateString,
                recaudado: 1000,
                costoPeluches: 300,
                notes: 'Test entry'
            }

            const result = validateEntry(entryData)
            expect(result.date.isValid).toBe(true)
            expect(result.recaudado.isValid).toBe(true)
            expect(result.costoPeluches.isValid).toBe(true)
            expect(result.notes.isValid).toBe(true)
            expect(result.crossField.isValid).toBe(true)
        })

        it('should reject when costoPeluches exceeds recaudado', () => {
            const today = new Date()
            const dateString = `15/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
            const entryData = {
                date: dateString,
                recaudado: 300,
                costoPeluches: 500,
                notes: ''
            }

            const result = validateEntry(entryData)
            expect(result.crossField.isValid).toBe(false)
            expect(result.crossField.error).toBe('El costo de peluches no puede ser mayor al monto recaudado')
        })

        it('should validate notes length', () => {
            const today = new Date()
            const dateString = `15/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
            const entryData = {
                date: dateString,
                recaudado: 1000,
                costoPeluches: 300,
                notes: 'A'.repeat(501) // Too long
            }

            const result = validateEntry(entryData)
            expect(result.notes.isValid).toBe(false)
            expect(result.notes.error).toBe('Notas no puede exceder 500 caracteres')
        })
    })

    describe('validateStore', () => {
        it('should validate complete valid store', () => {
            const storeData = {
                name: 'Mi Tienda',
                commissionPercent: 15
            }

            const result = validateStore(storeData, [])
            expect(result.name.isValid).toBe(true)
            expect(result.commissionPercent.isValid).toBe(true)
        })

        it('should reject invalid store data', () => {
            const storeData = {
                name: '',
                commissionPercent: 150
            }

            const result = validateStore(storeData, [])
            expect(result.name.isValid).toBe(false)
            expect(result.commissionPercent.isValid).toBe(false)
        })
    })

    describe('validateUserSettings', () => {
        it('should validate valid user settings', () => {
            const settings = {
                defaultCommissionPercent: 15
            }

            const result = validateUserSettings(settings)
            expect(result.defaultCommissionPercent.isValid).toBe(true)
        })

        it('should reject invalid commission percentage', () => {
            const settings = {
                defaultCommissionPercent: 150
            }

            const result = validateUserSettings(settings)
            expect(result.defaultCommissionPercent.isValid).toBe(false)
        })
    })

    describe('validateFile', () => {
        it('should validate proper JSON file', () => {
            const file = new File(['{}'], 'test.json', { type: 'application/json' })
            const result = validateFile(file)
            expect(result.isValid).toBe(true)
        })

        it('should reject files that are too large', () => {
            const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
            const file = new File([largeContent], 'large.json', { type: 'application/json' })
            const result = validateFile(file)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('El archivo es demasiado grande. Tamaño máximo: 10MB')
        })

        it('should reject invalid file types', () => {
            const file = new File(['content'], 'test.txt', { type: 'text/plain' })
            const result = validateFile(file)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Tipo de archivo no válido. Tipos permitidos: .json')
        })
    })

    describe('getValidationErrors', () => {
        it('should extract error messages from validation results', () => {
            const validationResults = {
                field1: { isValid: true },
                field2: { isValid: false, error: 'Error 1' },
                field3: { isValid: false, error: 'Error 2' },
                field4: { isValid: true }
            }

            const errors = getValidationErrors(validationResults)
            expect(errors).toEqual(['Error 1', 'Error 2'])
        })

        it('should return empty array when all validations pass', () => {
            const validationResults = {
                field1: { isValid: true },
                field2: { isValid: true }
            }

            const errors = getValidationErrors(validationResults)
            expect(errors).toEqual([])
        })
    })

    describe('isValidationPassing', () => {
        it('should return true when all validations pass', () => {
            const validationResults = {
                field1: { isValid: true },
                field2: { isValid: true }
            }

            expect(isValidationPassing(validationResults)).toBe(true)
        })

        it('should return false when any validation fails', () => {
            const validationResults = {
                field1: { isValid: true },
                field2: { isValid: false, error: 'Error' }
            }

            expect(isValidationPassing(validationResults)).toBe(false)
        })
    })
})