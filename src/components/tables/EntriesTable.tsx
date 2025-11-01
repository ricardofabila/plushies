import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteEntry, useStoreById } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { useModal, useModalWithData } from '@/hooks/useModal';
import EntryModal from '@/components/modals/EntryModal';
import {
    calculateEntryMetrics,
    formatCurrency,
    formatDateForDisplay,
    sortBy,
} from '@/utils';
import type { Entry, SortField, SortDirection } from '@/types';
import {
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Search,
    Plus,
    Calendar,
    DollarSign,
    Package,
    TrendingUp,
    Percent,
    Wallet,
    FileText,
} from 'lucide-react';

interface EntriesTableProps {
    storeId: string;
    entries: Entry[];
    className?: string;
}

interface TableEntry extends Entry {
    ganancia: number;
    comision: number;
    restante: number;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
    storeId,
    entries,
    className = '',
}) => {
    const store = useStoreById(storeId);
    const deleteEntry = useDeleteEntry();
    const { success, error } = useToast();

    // Modal states
    const addEntryModal = useModal();
    const editEntryModal = useModalWithData<Entry>();
    const deleteConfirmModal = useModalWithData<Entry>();

    // Table state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Calculate metrics for all entries
    const entriesWithMetrics = useMemo((): TableEntry[] => {
        if (!store) return [];

        return entries.map(entry => {
            const metrics = calculateEntryMetrics(entry, store.commissionPercent);
            return {
                ...entry,
                ...metrics,
            };
        });
    }, [entries, store]);

    // Filter and sort entries
    const filteredAndSortedEntries = useMemo(() => {
        let filtered = entriesWithMetrics;

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(entry =>
                entry.date.includes(searchTerm) ||
                entry.notes?.toLowerCase().includes(searchLower) ||
                entry.recaudado.toString().includes(searchTerm) ||
                entry.costoPeluches.toString().includes(searchTerm)
            );
        }

        // Apply sorting
        return sortBy(filtered, sortField as keyof TableEntry, sortDirection);
    }, [entriesWithMetrics, searchTerm, sortField, sortDirection]);

    if (!store) {
        return (
            <Card className={`bg-white ${className}`}>
                <CardContent className="p-6">
                    <p className="text-center text-neutral-500">Tienda no encontrada</p>
                </CardContent>
            </Card>
        );
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDeleteEntry = (entry: Entry) => {
        try {
            deleteEntry(storeId, entry.id);
            success(
                '¡Entrada eliminada!',
                `La entrada del ${formatDateForDisplay(entry.date)} ha sido eliminada exitosamente.`
            );
        } catch (err) {
            error(
                'Error al eliminar',
                'No se pudo eliminar la entrada. Por favor, intenta de nuevo.'
            );
        }
    };

    const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({
        field,
        children,
    }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center space-x-1 text-left font-medium text-neutral-700 hover:text-primary-600 transition-colors"
        >
            <span>{children}</span>
            {sortField === field && (
                sortDirection === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                ) : (
                    <ChevronDown className="w-4 h-4" />
                )
            )}
        </button>
    );

    const ActionMenu: React.FC<{ entry: TableEntry }> = ({ entry }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => editEntryModal.openModal(entry)}
                    className="cursor-pointer"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => deleteConfirmModal.openModal(entry)}
                    className="cursor-pointer text-error-600 focus:text-error-600"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            <Card className={`bg-white ${className}`}>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <CardTitle className="text-lg font-semibold text-primary-800 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Entradas de {store.name}
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            {/* Search Input */}
                            <div className="relative">
                                <Input
                                    placeholder="Buscar entradas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            </div>
                            {/* Add Entry Button */}
                            <Button
                                onClick={addEntryModal.openModal}
                                className="bg-primary-500 hover:bg-primary-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Entrada
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredAndSortedEntries.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-600 mb-2">
                                {searchTerm ? 'No se encontraron entradas' : 'No hay entradas registradas'}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                                {searchTerm
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza agregando tu primera entrada de ingresos'
                                }
                            </p>
                            {!searchTerm && (
                                <Button
                                    onClick={addEntryModal.openModal}
                                    className="bg-primary-500 hover:bg-primary-600"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Primera Entrada
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-200">
                                            <th className="text-left py-3 px-2">
                                                <SortButton field="date">Fecha</SortButton>
                                            </th>
                                            <th className="text-right py-3 px-2">
                                                <SortButton field="recaudado">Recaudado</SortButton>
                                            </th>
                                            <th className="text-right py-3 px-2">
                                                <SortButton field="ganancia">Costo Peluches</SortButton>
                                            </th>
                                            <th className="text-right py-3 px-2">
                                                <SortButton field="ganancia">Ganancia</SortButton>
                                            </th>
                                            <th className="text-right py-3 px-2">
                                                <SortButton field="comision">Comisión</SortButton>
                                            </th>
                                            <th className="text-right py-3 px-2">
                                                <SortButton field="restante">Restante</SortButton>
                                            </th>
                                            <th className="text-left py-3 px-2">Notas</th>
                                            <th className="text-center py-3 px-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedEntries.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="border-b border-neutral-100 hover:bg-soft-gray transition-colors"
                                            >
                                                <td className="py-3 px-2 font-medium text-neutral-800">
                                                    {formatDateForDisplay(entry.date)}
                                                </td>
                                                <td className="py-3 px-2 text-right font-semibold text-primary-700">
                                                    {formatCurrency(entry.recaudado)}
                                                </td>
                                                <td className="py-3 px-2 text-right text-neutral-600">
                                                    {formatCurrency(entry.costoPeluches)}
                                                </td>
                                                <td className="py-3 px-2 text-right font-semibold text-success-700">
                                                    {formatCurrency(entry.ganancia)}
                                                </td>
                                                <td className="py-3 px-2 text-right text-warning-700">
                                                    {formatCurrency(entry.comision)}
                                                </td>
                                                <td className="py-3 px-2 text-right font-semibold text-primary-700">
                                                    {formatCurrency(entry.restante)}
                                                </td>
                                                <td className="py-3 px-2 text-neutral-600 max-w-32 truncate">
                                                    {entry.notes || '-'}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <ActionMenu entry={entry} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4">
                                {filteredAndSortedEntries.map((entry) => (
                                    <Card key={entry.id} className="shadow-sm bg-white">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-neutral-500" />
                                                    <span className="font-semibold text-neutral-800">
                                                        {formatDateForDisplay(entry.date)}
                                                    </span>
                                                </div>
                                                <ActionMenu entry={entry} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="w-4 h-4 text-primary-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-600">Recaudado</p>
                                                        <p className="font-semibold text-primary-700">
                                                            {formatCurrency(entry.recaudado)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Package className="w-4 h-4 text-neutral-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-600">Costo Peluches</p>
                                                        <p className="font-medium text-neutral-700">
                                                            {formatCurrency(entry.costoPeluches)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="w-4 h-4 text-success-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-600">Ganancia</p>
                                                        <p className="font-semibold text-success-700">
                                                            {formatCurrency(entry.ganancia)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Percent className="w-4 h-4 text-warning-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-600">Comisión</p>
                                                        <p className="font-medium text-warning-700">
                                                            {formatCurrency(entry.comision)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                                <div className="flex items-center space-x-2">
                                                    <Wallet className="w-4 h-4 text-primary-600" />
                                                    <div>
                                                        <p className="text-xs text-neutral-600">Restante</p>
                                                        <p className="font-bold text-primary-700">
                                                            {formatCurrency(entry.restante)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {entry.notes && (
                                                    <div className="flex items-center space-x-1 max-w-32">
                                                        <FileText className="w-3 h-3 text-neutral-400" />
                                                        <p className="text-xs text-neutral-600 truncate">
                                                            {entry.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Results Summary */}
                            <div className="mt-4 text-sm text-neutral-600 text-center">
                                Mostrando {filteredAndSortedEntries.length} de {entriesWithMetrics.length} entradas
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <EntryModal
                isOpen={addEntryModal.isOpen}
                onClose={addEntryModal.closeModal}
                storeId={storeId}
            />

            <EntryModal
                isOpen={editEntryModal.isOpen}
                onClose={editEntryModal.closeModal}
                storeId={storeId}
                entry={editEntryModal.data}
            />

            <ConfirmDialog
                isOpen={deleteConfirmModal.isOpen}
                onClose={deleteConfirmModal.closeModal}
                onConfirm={() => deleteConfirmModal.data && handleDeleteEntry(deleteConfirmModal.data)}
                title="Eliminar Entrada"
                message={`¿Estás seguro de que deseas eliminar la entrada del ${deleteConfirmModal.data ? formatDateForDisplay(deleteConfirmModal.data.date) : ''}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    );
};

export default EntriesTable;