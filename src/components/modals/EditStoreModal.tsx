import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateStore, useStores } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { X, Store, Percent } from 'lucide-react';


interface EditStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string | null;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, storeId }) => {
    const updateStore = useUpdateStore();
    const stores = useStores();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        commissionPercent: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Find the store to edit
    const storeToEdit = storeId ? stores.find(store => store.id === storeId) : null;

    // Initialize form data when modal opens or store changes
    useEffect(() => {
        if (isOpen && storeToEdit) {
            setFormData({
                name: storeToEdit.name,
                commissionPercent: storeToEdit.commissionPercent,
            });
            setErrors({});
        }
    }, [isOpen, storeToEdit]);

    if (!isOpen || !storeToEdit) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre de la tienda es requerido';
        }

        // Check for duplicate names (excluding current store)
        const duplicateName = stores.find(
            store => store.id !== storeId &&
                store.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        );
        if (duplicateName) {
            newErrors.name = 'Ya existe una tienda con este nombre';
        }

        if (formData.commissionPercent < 0 || formData.commissionPercent > 100) {
            newErrors.commissionPercent = 'El porcentaje de comisión debe estar entre 0 y 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !storeId) {
            return;
        }

        try {
            updateStore(storeId, {
                name: formData.name.trim(),
                commissionPercent: formData.commissionPercent,
            });

            // Show success toast
            success(
                '¡Tienda actualizada!',
                `La tienda "${formData.name.trim()}" ha sido actualizada exitosamente.`
            );

            // Close modal
            onClose();
        } catch (err) {
            error(
                'Error al actualizar',
                'No se pudo actualizar la tienda. Por favor, intenta de nuevo.'
            );
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-cozy bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-primary-800 flex items-center">
                        <Store className="w-5 h-5 mr-2" />
                        Editar Tienda
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={errors.name ? 'border-error-500 focus:border-error-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-error-600">{errors.name}</p>
                            )}
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
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        commissionPercent: parseFloat(e.target.value) || 0
                                    })}
                                    className={`pr-8 ${errors.commissionPercent ? 'border-error-500 focus:border-error-500' : ''}`}
                                />
                                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            </div>
                            {errors.commissionPercent && (
                                <p className="text-sm text-error-600">{errors.commissionPercent}</p>
                            )}
                            <p className="text-xs text-neutral-500">
                                Este porcentaje se aplicará a las ganancias de esta tienda
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-primary-500 hover:bg-primary-600"
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditStoreModal;