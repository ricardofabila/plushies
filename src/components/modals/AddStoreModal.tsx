import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ValidationError from '@/components/ui/ValidationError';
import { useAddStore, useUserSettings, useStores } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { useValidation } from '@/hooks/useValidation';
import { useKeyboardNavigation, useFocusManagement } from '@/hooks/useKeyboardNavigation';
import { validateStore } from '@/lib/validation';
import { X, Store, Percent } from 'lucide-react';

interface AddStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose }) => {
    const addStore = useAddStore();
    const userSettings = useUserSettings();
    const stores = useStores();
    const { success, error } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    const { trapFocus, focusFirstFocusableElement } = useFocusManagement();

    const [formData, setFormData] = useState({
        name: '',
        commissionPercent: userSettings.defaultCommissionPercent,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Enhanced validation using the new validation system
    const validation = useValidation({}, {
        validateOnChange: false,
        validateOnBlur: true,
        showErrorsImmediately: false
    });

    const handleClose = () => {
        setFormData({
            name: '',
            commissionPercent: userSettings.defaultCommissionPercent,
        });
        setErrors({});
        validation.clearValidations();
        onClose();
    };

    // Focus management and keyboard navigation
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (modalRef.current) {
                    focusFirstFocusableElement(modalRef.current);
                    const cleanup = trapFocus(modalRef.current);
                    return cleanup;
                }
            }, 100);
        }
    }, [isOpen, focusFirstFocusableElement, trapFocus]);

    useKeyboardNavigation({
        onEscape: handleClose,
        enabled: isOpen,
    });

    if (!isOpen) return null;

    const validateForm = () => {
        // Get existing store names for duplicate checking
        const existingNames = stores.map(store => store.name);

        // Use the comprehensive validation system
        const storeValidation = validateStore({
            name: formData.name,
            commissionPercent: formData.commissionPercent
        }, existingNames);

        // Set validation results
        validation.setValidations({
            name: storeValidation.name,
            commissionPercent: storeValidation.commissionPercent
        });

        // Enable error display and mark all fields as touched
        validation.enableErrorDisplay();
        validation.touchFields(['name', 'commissionPercent']);

        // Check if all validations pass
        const isValid = storeValidation.name.isValid && storeValidation.commissionPercent.isValid;

        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            addStore({
                name: formData.name.trim(),
                commissionPercent: formData.commissionPercent,
            });

            // Show success toast
            success(
                '¡Tienda creada!',
                `La tienda "${formData.name.trim()}" ha sido agregada exitosamente.`
            );

            // Reset form and close modal
            setFormData({
                name: '',
                commissionPercent: userSettings.defaultCommissionPercent,
            });
            setErrors({});
            validation.clearValidations();
            onClose();
        } catch (err) {
            error(
                'Error al crear tienda',
                'No se pudo crear la tienda. Por favor, intenta de nuevo.'
            );
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-store-modal-title"
            aria-describedby="add-store-modal-description"
        >
            <Card
                ref={modalRef}
                className="w-full max-w-md shadow-cozy max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle
                        id="add-store-modal-title"
                        className="text-xl font-semibold text-primary-800 flex items-center"
                    >
                        <Store className="w-5 h-5 mr-2" aria-hidden="true" />
                        Agregar Nueva Tienda
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
                        id="add-store-modal-description"
                        className="sr-only"
                    >
                        Formulario para crear una nueva tienda con nombre y porcentaje de comisión
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="storeName" className="text-sm font-medium text-neutral-700">
                                Nombre de la Tienda
                            </Label>
                            <Input
                                id="storeName"
                                type="text"
                                placeholder="Ej: Plaza Central"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    // Clear validation error when user starts typing
                                    if (validation.shouldShowFieldError('name')) {
                                        validation.clearFieldValidation('name');
                                    }
                                }}
                                className={`text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('name', errors.name ? 'border-error-500 focus:border-error-500' : '')}`}
                                aria-describedby={validation.shouldShowFieldError('name') ? 'name-error' : undefined}
                                aria-invalid={validation.shouldShowFieldError('name')}
                                required
                            />
                            <ValidationError
                                error={validation.getFieldError('name') || errors.name}
                                id="name-error"
                            />
                        </div>

                        {/* Commission Percentage */}
                        <div className="space-y-2">
                            <Label htmlFor="commission" className="text-sm font-medium text-neutral-700">
                                Porcentaje de Comisión
                            </Label>
                            <div className="relative">
                                <Input
                                    id="commission"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="20"
                                    value={formData.commissionPercent}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            commissionPercent: parseFloat(e.target.value) || 0
                                        });
                                        // Clear validation error when user starts typing
                                        if (validation.shouldShowFieldError('commissionPercent')) {
                                            validation.clearFieldValidation('commissionPercent');
                                        }
                                    }}
                                    className={`pr-8 text-base sm:text-sm min-h-[44px] sm:min-h-[36px] ${validation.getFieldClasses('commissionPercent', errors.commissionPercent ? 'border-error-500 focus:border-error-500' : '')}`}
                                    aria-describedby={validation.shouldShowFieldError('commissionPercent') ? 'commission-error' : 'commission-help'}
                                    aria-invalid={validation.shouldShowFieldError('commissionPercent')}
                                    required
                                />
                                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
                            </div>
                            <ValidationError
                                error={validation.getFieldError('commissionPercent') || errors.commissionPercent}
                                id="commission-error"
                            />
                            <p id="commission-help" className="text-xs text-neutral-500">
                                Este porcentaje se aplicará a las ganancias de esta tienda
                            </p>
                        </div>

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
                                Crear Tienda
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStoreModal;