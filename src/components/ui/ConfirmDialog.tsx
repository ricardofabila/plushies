import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning',
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-error-500',
                    confirmButtonClass: 'bg-error-500 hover:bg-error-600 text-white',
                    titleColor: 'text-error-700',
                };
            case 'warning':
                return {
                    iconColor: 'text-warning-500',
                    confirmButtonClass: 'bg-warning-500 hover:bg-warning-600 text-white',
                    titleColor: 'text-warning-700',
                };
            case 'info':
                return {
                    iconColor: 'text-primary-500',
                    confirmButtonClass: 'bg-primary-500 hover:bg-primary-600 text-white',
                    titleColor: 'text-primary-700',
                };
            default:
                return {
                    iconColor: 'text-warning-500',
                    confirmButtonClass: 'bg-warning-500 hover:bg-warning-600 text-white',
                    titleColor: 'text-warning-700',
                };
        }
    };

    const styles = getVariantStyles();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-cozy bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className={`text-lg font-semibold flex items-center ${styles.titleColor}`}>
                        <AlertTriangle className={`w-5 h-5 mr-2 ${styles.iconColor}`} />
                        {title}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <p className="text-neutral-600 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex space-x-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className={`flex-1 ${styles.confirmButtonClass}`}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfirmDialog;