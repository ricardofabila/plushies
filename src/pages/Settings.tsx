import React, { useRef, useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Percent, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import { validatePercentage, validateFile } from '@/lib/validation';
import { useValidation } from '@/hooks/useValidation';
import {
    useUserSettings,
    useUpdateUserSettings,
    useExportData,
    useImportData,
    useClearAllData,
    useGetStorageInfo
} from '@/store';
import {
    downloadJSON,
    generateJSONFilename,
    readJSONFile
} from '@/lib/export';

const Settings: React.FC = () => {
    const { success, error } = useToast();
    const userSettings = useUserSettings();
    const updateUserSettings = useUpdateUserSettings();
    const exportData = useExportData();
    const importData = useImportData();
    const clearAllData = useClearAllData();
    const getStorageInfo = useGetStorageInfo();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const [pendingImportData, setPendingImportData] = useState<any>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Validation for settings form
    const validation = useValidation({}, { validateOnChange: true, validateOnBlur: true });

    // Handle default commission percentage change
    const handleCommissionChange = (value: string) => {
        // Validate the input
        const validationResult = validatePercentage(value, 'Porcentaje de comisión por defecto');
        validation.setFieldValidation('defaultCommission', validationResult);

        if (validationResult.isValid) {
            const numValue = parseFloat(value);
            updateUserSettings({ defaultCommissionPercent: numValue });
            success('Configuración actualizada', 'Porcentaje de comisión por defecto guardado.');
        }
    };

    const handleCommissionBlur = (value: string) => {
        validation.touchField('defaultCommission');
        const validationResult = validatePercentage(value, 'Porcentaje de comisión por defecto');
        validation.setFieldValidation('defaultCommission', validationResult);
    };

    // Handle JSON export
    const handleExportJSON = () => {
        try {
            const data = exportData();
            const filename = generateJSONFilename();
            downloadJSON(data, filename);

            success('Datos exportados', 'Respaldo completo descargado exitosamente.');
        } catch (err) {
            console.error('JSON export error:', err);
            error('Error al exportar', 'No se pudo exportar el archivo de respaldo.');
        }
    };

    // Handle file selection for import
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    // Handle file input change
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input
        event.target.value = '';

        try {
            // Validate file with comprehensive validation
            const fileValidation = validateFile(file, {
                maxSizeMB: 10,
                allowedTypes: ['application/json'],
                allowedExtensions: ['.json']
            });

            if (!fileValidation.isValid) {
                error('Archivo inválido', fileValidation.error || 'El archivo seleccionado no es válido.');
                return;
            }

            setIsImporting(true);
            const importedData = await readJSONFile(file);

            // Store data for confirmation
            setPendingImportData(importedData);
            setShowImportConfirm(true);

        } catch (err) {
            console.error('File read error:', err);
            error('Error al leer archivo', err instanceof Error ? err.message : 'No se pudo leer el archivo.');
        } finally {
            setIsImporting(false);
        }
    };

    // Handle import confirmation
    const handleImportConfirm = () => {
        if (!pendingImportData) return;

        try {
            importData(pendingImportData);
            success('Datos importados', 'Respaldo restaurado exitosamente.');
            setShowImportConfirm(false);
            setPendingImportData(null);
        } catch (err) {
            console.error('Import error:', err);
            error('Error al importar', 'No se pudieron importar los datos.');
        }
    };

    // Handle clear all data
    const handleClearData = () => {
        try {
            clearAllData();
            success('Datos eliminados', 'Todos los datos han sido eliminados.');
            setShowClearConfirm(false);
        } catch (err) {
            console.error('Clear data error:', err);
            error('Error al eliminar', 'No se pudieron eliminar los datos.');
        }
    };

    // Get storage info
    const storageInfo = getStorageInfo();
    const storageUsedKB = Math.round(storageInfo.used / 1024);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary-800 flex items-center space-x-3">
                    <SettingsIcon className="h-8 w-8 text-cute-pink" />
                    <span>Configuración</span>
                </h1>
            </div>

            {/* Default Settings */}
            <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                        <Percent className="h-5 w-5 text-cute-pink" />
                        <span>Configuración por Defecto</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="defaultCommission">
                            Porcentaje de Comisión por Defecto (%)
                        </Label>
                        <Input
                            id="defaultCommission"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={userSettings.defaultCommissionPercent}
                            onChange={(e) => handleCommissionChange(e.target.value)}
                            onBlur={(e) => handleCommissionBlur(e.target.value)}
                            className={`max-w-xs ${validation.getFieldClasses('defaultCommission')}`}
                        />
                        {validation.shouldShowFieldError('defaultCommission') && (
                            <p className="text-sm text-error-red flex items-center mt-1">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {validation.getFieldError('defaultCommission')}
                            </p>
                        )}
                        <p className="text-sm text-neutral-600">
                            Este porcentaje se usará por defecto al crear nuevas tiendas.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                        <Download className="h-5 w-5 text-cute-pink" />
                        <span>Gestión de Datos</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Storage Info */}
                    <div className="bg-soft-gray/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-primary-800">Uso de Almacenamiento</h4>
                                <p className="text-sm text-neutral-600">
                                    {storageUsedKB} KB utilizados en el navegador
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-neutral-600">
                                    Estado: {storageInfo.available ? '✅ Disponible' : '❌ No disponible'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export/Import Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Export Section */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-primary-800">Exportar Datos</h4>
                            <p className="text-sm text-neutral-600">
                                Descarga un respaldo completo de todas tus tiendas y entradas.
                            </p>
                            <Button
                                onClick={handleExportJSON}
                                className="w-full bg-cute-pink hover:bg-warm-coral text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar Respaldo JSON
                            </Button>
                        </div>

                        {/* Import Section */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-primary-800">Importar Datos</h4>
                            <p className="text-sm text-neutral-600">
                                Restaura un respaldo previo. Esto reemplazará todos los datos actuales.
                            </p>
                            <Button
                                onClick={handleFileSelect}
                                disabled={isImporting}
                                variant="outline"
                                className="w-full border-cute-pink text-cute-pink hover:bg-cute-pink hover:text-white"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {isImporting ? 'Procesando...' : 'Seleccionar Archivo JSON'}
                            </Button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-neutral-200 pt-6">
                        <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-error-red mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-error-red">Zona de Peligro</h4>
                                    <p className="text-sm text-error-red/80 mt-1">
                                        Esta acción eliminará permanentemente todos los datos de la aplicación.
                                    </p>
                                    <Button
                                        onClick={() => setShowClearConfirm(true)}
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 border-error-red text-error-red hover:bg-error-red hover:text-white"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar Todos los Datos
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Import Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showImportConfirm}
                onClose={() => {
                    setShowImportConfirm(false);
                    setPendingImportData(null);
                }}
                onConfirm={handleImportConfirm}
                title="Confirmar Importación"
                message="¿Estás seguro de que quieres importar estos datos? Esto reemplazará todos los datos actuales de la aplicación."
                confirmText="Importar Datos"
                cancelText="Cancelar"
                variant="warning"
            />

            {/* Clear Data Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearData}
                title="Eliminar Todos los Datos"
                message="¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer. Te recomendamos exportar un respaldo antes de continuar."
                confirmText="Eliminar Todo"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default Settings;