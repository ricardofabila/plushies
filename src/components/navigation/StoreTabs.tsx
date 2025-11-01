import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStores, useDeleteStore } from '@/store';
import { Plus, Store, MoreHorizontal, Edit, Trash2, BarChart3 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddStoreModal from '@/components/modals/AddStoreModal';
import EditStoreModal from '@/components/modals/EditStoreModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import { useModal, useModalWithData } from '@/hooks/useModal';

const StoreTabs: React.FC = () => {
    const location = useLocation();
    const { storeId } = useParams();
    const stores = useStores();
    const deleteStore = useDeleteStore();
    const { success } = useToast();

    // Modal state management using custom hooks
    const addStoreModal = useModal();
    const editStoreModal = useModalWithData<string>();
    const deleteConfirmModal = useModalWithData<{ id: string; name: string }>();

    // Don't show store tabs on settings page
    if (location.pathname === '/settings') {
        return null;
    }

    const handleEditStore = (id: string) => {
        editStoreModal.openModal(id);
    };

    const handleDeleteStore = (id: string, name: string) => {
        deleteConfirmModal.openModal({ id, name });
    };

    const confirmDeleteStore = () => {
        if (deleteConfirmModal.data) {
            deleteStore(deleteConfirmModal.data.id);
            success(
                '¡Tienda eliminada!',
                `La tienda "${deleteConfirmModal.data.name}" ha sido eliminada exitosamente.`
            );
        }
    };

    return (
        <>
            <div className="bg-white/60 backdrop-blur-sm border-b border-primary-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Store Tabs Container */}
                    <nav
                        className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2"
                        role="navigation"
                        aria-label="Navegación de tiendas"
                    >
                        {/* Dashboard Tab */}
                        <Button
                            variant={location.pathname === '/' ? 'default' : 'ghost'}
                            size="sm"
                            asChild
                            className="flex-shrink-0 rounded-full"
                        >
                            <Link
                                to="/"
                                aria-label="Ver dashboard general"
                                aria-current={location.pathname === '/' ? 'page' : undefined}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden" aria-hidden="true">📊</span>
                            </Link>
                        </Button>

                        {/* Store Tabs */}
                        {stores.map((store) => (
                            <div key={store.id} className="flex items-center flex-shrink-0">
                                <Button
                                    variant={storeId === store.id ? 'default' : 'ghost'}
                                    size="sm"
                                    asChild
                                    className="rounded-l-full rounded-r-none pr-1"
                                >
                                    <Link
                                        to={`/store/${store.id}`}
                                        aria-label={`Ver detalles de la tienda ${store.name}`}
                                        aria-current={storeId === store.id ? 'page' : undefined}
                                    >
                                        <Store className="w-4 h-4 mr-2" aria-hidden="true" />
                                        <span className="max-w-[120px] truncate">
                                            {store.name}
                                        </span>
                                    </Link>
                                </Button>

                                {/* Store Actions Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant={storeId === store.id ? 'default' : 'ghost'}
                                            size="sm"
                                            className="rounded-r-full rounded-l-none pl-1 pr-2 min-w-0"
                                            aria-label={`Opciones para la tienda ${store.name}`}
                                        >
                                            <MoreHorizontal className="w-3 h-3" aria-hidden="true" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-white border border-neutral-200 shadow-lg">
                                        <DropdownMenuItem
                                            onClick={() => handleEditStore(store.id)}
                                            role="menuitem"
                                        >
                                            <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                                            Editar tienda
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteStore(store.id, store.name)}
                                            className="text-error-600 focus:text-error-600"
                                            role="menuitem"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                            Eliminar tienda
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}

                        {/* Add Store Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addStoreModal.openModal}
                            className="flex-shrink-0 rounded-full border-dashed border-primary-300 text-primary-600 hover:bg-primary-50"
                            aria-label="Agregar nueva tienda"
                        >
                            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                            <span className="hidden sm:inline">Agregar Tienda</span>
                            <span className="sm:hidden" aria-hidden="true">+</span>
                        </Button>
                    </nav>

                    {/* Empty State */}
                    {stores.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">🏪</div>
                            <p className="text-neutral-600 mb-4">
                                No tienes tiendas registradas aún
                            </p>
                            <Button
                                onClick={addStoreModal.openModal}
                                className="bg-primary-500 hover:bg-primary-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear tu primera tienda
                            </Button>
                        </div>
                    )}
                </div>
            </div >

            {/* Add Store Modal */}
            < AddStoreModal
                isOpen={addStoreModal.isOpen}
                onClose={addStoreModal.closeModal}
            />

            {/* Edit Store Modal */}
            < EditStoreModal
                isOpen={editStoreModal.isOpen}
                onClose={editStoreModal.closeModal}
                storeId={editStoreModal.data}
            />

            {/* Delete Confirmation Dialog */}
            < ConfirmDialog
                isOpen={deleteConfirmModal.isOpen}
                onClose={deleteConfirmModal.closeModal}
                onConfirm={confirmDeleteStore}
                title="Eliminar Tienda"
                message={
                    deleteConfirmModal.data
                        ? `¿Estás seguro de que quieres eliminar la tienda "${deleteConfirmModal.data.name}"? Esta acción eliminará todos los registros de ventas asociados y no se puede deshacer.`
                        : ''
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    );
};

export default StoreTabs;