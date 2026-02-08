import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ValidationError from '@/components/ui/ValidationError';
import { useAddEntry, useUpdateEntry, useStoreById } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { useValidation } from '@/hooks/useValidation';
import { useKeyboardNavigation, useFocusManagement } from '@/hooks/useKeyboardNavigation';
import { validateEntry } from '@/lib/validation';
import {
    calculateEntryMetrics,
    formatCurrency,
    formatDate,
    convertToInputDate,
    convertFromInputDate
} from '@/utils';
import type { Entry } from '@/types';
import {
    X,
    DollarSign,
    Package,
    FileText,
    Calculator,
    TrendingUp,
    Percent,
    Wallet
} from 'lucide-react';

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    entry?: Entry | null; // If provided, we're editing; if null/undefined, we're adding
}

interface FormData {
    date: string;
    recaudado: string;
    costoPeluches: string;
    notes: string;
}

interface FormErrors {
    date?: string;
    recaudado?: string;
    costoPeluches?: string;
    notes?: string;
}

const EntryModal: React.FC<EntryModalProps> = ({
    isOpen,
    onClose,
    storeId,
    entry
}) => {
    const addEntry = useAddEntry();
    const updateEntry = useUpdateEntry();
    const store = useStoreById(storeId);
    const { success, error, warning } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    const { trapFocus, focusFirstFocusableElement } = useFocusManagement();

    const isEditing = !!entry;

    const [formData, setFormData] = useState<FormData>({
        date: formatDate(new Date()),
        recaudado: '',
        costoPeluches: '',
        notes: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Enhanced validation using the new validation system
    const validation = useValidation({}, {
        validateOnChange: false,
        validateOnBlur: true,
        showErrorsImmediately: false
    });

    // Initialize form data when modal opens or entry changes
    useEffect(() => {
        if (isOpen) {
            if (entry) {
                // Editing existing entry - convert DD/MM/YYYY to YYYY-MM-DD for input
                setFormData({
                    date: convertToInputDate(entry.date),
                    recaudado: entry.recaudado.toString(),
                    costoPeluches: entry.costoPeluches.toString(),
                    notes: entry.notes || '',
                });
            } else {
                // Adding new entry - use today's date in YYYY-MM-DD format
                setFormData({
                    date: convertToInputDate(formatDate(new Date())),
                    recaudado: '',
                    costoPeluches: '',
                    notes: '',
                });
            }
            setErrors({});
            validation.clearValidations();

            // Focus management and keyboard trap
            setTimeout(() => {
                if (modalRef.current) {
                    focusFirstFocusableElement(modalRef.current);
                    const cleanup = trapFocus(modalRef.current);
                    return cleanup;
                }
            }, 100);
        }
    }, [isOpen, entry, focusFirstFocusableElement, trapFocus]);

    // Calculate metrics in real-time
    const calculatedMetrics = useMemo(() => {
        const recaudado = parseFloat(formData.recaudado) || 0;
        const costoPeluches = parseFloat(formData.costoPeluches) || 0;

        if (!store) return null;

        // Convert YYYY-MM-DD to DD/MM/YYYY for calculations
        const dateInAppFormat = convertFromInputDate(formData.date);

        return calculateEntryMetrics(
            {
                id: '',
                date: dateInAppFormat,
                recaudado,
                costoPeluches,
                notes: formData.notes
            },
            store.commissionPercent
        );
    }, [formData.recaudado, formData.costoPeluches, formData.date, store]);

    const handleClose = () => {
        setFormData({
            date: convertToInputDate(formatDate(new Date())),
            recaudado: '',
            costoPeluches: '',
            notes: '',
        });
        setErrors({});
        validation.clearValidations();
        onClose();
    };

    // Keyboard navigation
    useKeyboardNavigation({
        onEscape: handleClose,
        enabled: isOpen,
    });

    if (!isOpen || !store) return null;

    const validateForm = (): boolean => {
        // Convert YYYY-MM-DD back to DD/MM/YYYY for validation
        const dateInAppFormat = convertFromInputDate(formData.date);

        // Use the comprehensive validation system
        const entryValidation = validateEntry({
            date: dateInAppFormat,
            recaudado: formData.recaudado,
            costoPeluches: formData.costoPeluches,
            notes: formData.notes
        });

        // Set validation results
        validation.setValidations({
            date: entryValidation.date,
            recaudado: entryValidation.recaudado,
            costoPeluches: entryValidation.costoPeluches,
            notes: entryValidation.notes,
            crossField: entryValidation.crossField
        });

        // Enable error display and mark all fields as touched
        validation.enableErrorDisplay();
        validation.touchFields(['date', 'recaudado', 'costoPeluches', 'notes', 'crossField']);

        // Check if all validations pass
        const isValid = entryValidation.date.isValid &&
            entryValidation.recaudado.isValid &&
            entryValidation.costoPeluches.isValid &&
            entryValidation.notes.isValid &&
            entryValidation.crossField.isValid;

        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Convert YYYY-MM-DD back to DD/MM/YYYY for storage
            const dateInAppFormat = convertFromInputDate(formData.date);

            const entryData = {
                date: dateInAppFormat,
                recaudado: parseFloat(formData.recaudado),
                costoPeluches: parseFloat(formData.costoPeluches),
                notes: formData.notes.trim() || undefined,
            };

            if (isEditing && entry) {
                updateEntry(storeId, entry.id, entryData);
                success(
                    '¡Entrada actualizada!',
                    `La entrada del ${dateInAppFormat} ha sido actualizada exitosamente.`
                );
            } else {
                addEntry(storeId, entryData);
                success(
                    '¡Entrada agregada!',
                    `La entrada del ${dateInAppFormat} ha sido agregada exitosamente.`
                );
            }

            // Show warning if cost exceeds revenue
            if (entryData.costoPeluches > entryData.recaudado) {
                warning(
                    'Costo alto detectado',
                    'El costo de peluches es mayor al monto recaudado. Verifica los datos.'
                );
            }

            handleClose();
        } catch (err) {
            error(
                isEditing ? 'Error al actualizar' : 'Error al agregar',
                'No se pudo guardar la entrada. Por favor, intenta de nuevo.'
            );
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Clear validation error when user starts typing
        if (validation.shouldShowFieldError(field)) {
            validation.clearFieldValidation(field);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-modal-title"
            aria-describedby="entry-modal-description"
        >
            <Card
                ref={modalRef}
                className="w-full max-w-2xl shadow-cozy max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle
                        id="entry-modal-title"
                        className="text-xl font-semibold text-primary-800 flex items-center"
                    >
                        <Calculator className="w-5 h-5 mr-2" aria-hidden="true" />
                        {isEditing ? 'Editar Entrada' : 'Agregar Nueva Entrada'}
                        <span className="text-sm font-normal text-neutral-600 ml-2">
                            - {store.name}
                        </span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 w-8 p-0"
                        aria-label="Cerrar modal"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <div
                        id="entry-modal-description"
                        className="sr-only"
                    >
                        Formulario para {isEditing ? 'editar una entrada existente' : 'agregar una nueva entrada'} de ingresos para la tienda {store.name}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Date Field */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-sm font-medium text-neutral-700">
                                    Fecha
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className={`text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('date', errors.date ? 'border-error-500 focus:border-error-500' : '')}`}
                                    aria-describedby={validation.shouldShowFieldError('date') ? 'date-error' : undefined}
                                    aria-invalid={validation.shouldShowFieldError('date')}
                                    required
                                />
                                <ValidationError
                                    error={validation.getFieldError('date') || errors.date}
                                    id="date-error"
                                />

                            </div>

                            {/* Recaudado Field */}
                            <div className="space-y-2">
                                <Label htmlFor="recaudado" className="text-sm font-medium text-neutral-700">
                                    Monto Recaudado
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="recaudado"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.recaudado}
                                        onChange={(e) => handleInputChange('recaudado', e.target.value)}
                                        className={`pl-10 text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('recaudado', errors.recaudado ? 'border-error-500 focus:border-error-500' : '')}`}
                                        aria-describedby={validation.shouldShowFieldError('recaudado') ? 'recaudado-error' : undefined}
                                        aria-invalid={validation.shouldShowFieldError('recaudado')}
                                        required
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
                                </div>
                                <ValidationError
                                    error={validation.getFieldError('recaudado') || errors.recaudado}
                                    id="recaudado-error"
                                />

                            </div>

                            {/* Costo Peluches Field */}
                            <div className="space-y-2">
                                <Label htmlFor="costoPeluches" className="text-sm font-medium text-neutral-700">
                                    Costo de Peluches
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="costoPeluches"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.costoPeluches}
                                        onChange={(e) => handleInputChange('costoPeluches', e.target.value)}
                                        className={`pl-10 text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('costoPeluches', errors.costoPeluches ? 'border-error-500 focus:border-error-500' : '')}`}
                                        aria-describedby={validation.shouldShowFieldError('costoPeluches') ? 'costoPeluches-error' : undefined}
                                        aria-invalid={validation.shouldShowFieldError('costoPeluches')}
                                        required
                                    />
                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
                                </div>
                                <ValidationError
                                    error={validation.getFieldError('costoPeluches') || errors.costoPeluches}
                                    id="costoPeluches-error"
                                />

                            </div>

                            {/* Notes Field */}
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium text-neutral-700">
                                    Notas (Opcional)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="notes"
                                        type="text"
                                        placeholder="Notas adicionales..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className={`pl-10 text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('notes', errors.notes ? 'border-error-500 focus:border-error-500' : '')}`}
                                        aria-describedby={validation.shouldShowFieldError('notes') ? 'notes-error' : 'notes-help'}
                                        aria-invalid={validation.shouldShowFieldError('notes')}
                                    />
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
                                </div>
                                <ValidationError
                                    error={validation.getFieldError('notes') || errors.notes}
                                    id="notes-error"
                                />
                                <p id="notes-help" className="text-xs text-neutral-500">
                                    {formData.notes.length}/500 caracteres
                                </p>
                            </div>
                        </div>

                        {/* Cross-field validation errors */}
                        {validation.shouldShowFieldError('crossField') && (
                            <div className="bg-warning-orange/10 border border-warning-orange/20 rounded-lg p-3">
                                <ValidationError
                                    error={validation.getFieldError('crossField')}
                                    type="warning"
                                />
                            </div>
                        )}

                        {/* Real-time Calculations Preview */}
                        {calculatedMetrics && (formData.recaudado || formData.costoPeluches) && (
                            <div className="bg-soft-gray rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-neutral-700 flex items-center">
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Vista Previa de Cálculos
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-success-600" />
                                        <div>
                                            <p className="text-xs text-neutral-600">Ganancia</p>
                                            <p className="text-sm font-semibold text-success-700">
                                                {formatCurrency(calculatedMetrics.ganancia)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Percent className="w-4 h-4 text-warning-600" />
                                        <div>
                                            <p className="text-xs text-neutral-600">
                                                Comisión ({store.commissionPercent}%)
                                            </p>
                                            <p className="text-sm font-semibold text-warning-700">
                                                {formatCurrency(calculatedMetrics.comision)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Wallet className="w-4 h-4 text-primary-600" />
                                        <div>
                                            <p className="text-xs text-neutral-600">Restante</p>
                                            <p className="text-sm font-semibold text-primary-700">
                                                {formatCurrency(calculatedMetrics.restante)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 min-h-[44px] sm:min-h-[36px]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-primary-500 hover:bg-primary-600 min-h-[44px] sm:min-h-[36px]"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Agregar Entrada'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EntryModal;