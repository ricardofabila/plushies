import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useUIState, useSetDateRange } from '@/store';
import { Calendar, ChevronDown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRangePreset } from '@/types';

import { useToast } from '@/contexts/ToastContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DateRangeFilter: React.FC = () => {
    const { selectedDateRange, selectedDateRangePreset } = useUIState();
    const setDateRange = useSetDateRange();
    const { error } = useToast();
    const [showCustomRange, setShowCustomRange] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        start?: string;
        end?: string;
        range?: string;
    }>({});

    const presetOptions: { value: DateRangePreset; label: string }[] = [
        { value: 'este-mes', label: 'Este mes' },
        { value: 'ultimos-30-dias', label: 'Últimos 30 días' },
        { value: 'ano-actual', label: 'Año actual' },
        { value: 'custom', label: 'Rango personalizado' },
    ];

    const getCurrentPresetLabel = () => {
        const preset = presetOptions.find(p => p.value === selectedDateRangePreset);
        return preset?.label || 'Seleccionar período';
    };

    const handlePresetChange = (preset: DateRangePreset) => {
        if (preset === 'custom') {
            setShowCustomRange(true);
            setValidationErrors({});
            // Set initial values for custom range
            setCustomStart(format(selectedDateRange.start, 'yyyy-MM-dd'));
            setCustomEnd(format(selectedDateRange.end, 'yyyy-MM-dd'));
        } else {
            setShowCustomRange(false);
            setValidationErrors({});
            setDateRange(preset);
        }
    };

    const handleCustomRangeApply = () => {
        // Clear previous errors
        setValidationErrors({});

        if (!customStart || !customEnd) {
            setValidationErrors({
                start: !customStart ? 'Fecha de inicio requerida' : undefined,
                end: !customEnd ? 'Fecha de fin requerida' : undefined
            });
            return;
        }

        try {
            const startDate = new Date(customStart);
            const endDate = new Date(customEnd);

            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                setValidationErrors({
                    range: 'Fechas inválidas'
                });
                return;
            }

            if (startDate > endDate) {
                setValidationErrors({
                    range: 'La fecha de inicio no puede ser posterior a la fecha de fin'
                });
                return;
            }

            // Check if range is too large (more than 2 years)
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 730) {
                setValidationErrors({
                    range: 'El rango de fechas no puede ser mayor a 2 años'
                });
                return;
            }

            // Check if dates are too far in the past or future
            const today = new Date();
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(today.getFullYear() - 2);
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(today.getFullYear() + 1);

            if (startDate < twoYearsAgo || endDate > oneYearFromNow) {
                setValidationErrors({
                    range: 'Las fechas deben estar dentro de los últimos 2 años o el próximo año'
                });
                return;
            }

            // All validations passed
            setDateRange('custom', { start: startDate, end: endDate });
            setShowCustomRange(false);
            setValidationErrors({});
        } catch (err) {
            error('Error de validación', 'No se pudo aplicar el rango de fechas personalizado');
            setValidationErrors({
                range: 'Error al procesar las fechas'
            });
        }
    };

    const formatDateRange = () => {
        const start = format(selectedDateRange.start, 'dd MMM', { locale: es });
        const end = format(selectedDateRange.end, 'dd MMM yyyy', { locale: es });
        return `${start} - ${end}`;
    };

    return (
        <div className="space-y-4">
            {/* Date Range Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between min-w-[200px]">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{getCurrentPresetLabel()}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    {presetOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => handlePresetChange(option.value)}
                            className={selectedDateRangePreset === option.value ? 'bg-primary-50' : ''}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Current Date Range Display */}
            <div className="text-sm text-neutral-600">
                <span className="font-medium">Período actual:</span> {formatDateRange()}
            </div>

            {/* Custom Date Range Inputs */}
            {showCustomRange && (
                <Card className="p-4 border-primary-200">
                    <CardContent className="space-y-4 p-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-sm font-medium">
                                    Fecha de inicio
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => {
                                        setCustomStart(e.target.value);
                                        // Clear start date error when user types
                                        if (validationErrors.start) {
                                            setValidationErrors(prev => ({ ...prev, start: undefined }));
                                        }
                                    }}
                                    className={validationErrors.start ? 'border-error-red focus:border-error-red' : ''}
                                />
                                {validationErrors.start && (
                                    <p className="text-sm text-error-red flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {validationErrors.start}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-sm font-medium">
                                    Fecha de fin
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => {
                                        setCustomEnd(e.target.value);
                                        // Clear end date error when user types
                                        if (validationErrors.end) {
                                            setValidationErrors(prev => ({ ...prev, end: undefined }));
                                        }
                                    }}
                                    className={validationErrors.end ? 'border-error-red focus:border-error-red' : ''}
                                />
                                {validationErrors.end && (
                                    <p className="text-sm text-error-red flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {validationErrors.end}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Range validation error */}
                        {validationErrors.range && (
                            <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3">
                                <p className="text-sm text-error-red flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {validationErrors.range}
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCustomRange(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCustomRangeApply}
                                className="flex-1 bg-primary-500 hover:bg-primary-600"
                                disabled={!customStart || !customEnd}
                            >
                                Aplicar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DateRangeFilter;