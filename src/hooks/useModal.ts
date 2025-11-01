import { useState, useCallback } from 'react';

interface UseModalReturn {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
}

interface UseModalWithDataReturn<T> {
    isOpen: boolean;
    data: T | null;
    openModal: (data?: T) => void;
    closeModal: () => void;
    toggleModal: (data?: T) => void;
}

/**
 * Custom hook for managing modal state
 * Provides clean API for opening, closing, and toggling modals
 */
export const useModal = (initialState: boolean = false): UseModalReturn => {
    const [isOpen, setIsOpen] = useState(initialState);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
    };
};

/**
 * Enhanced modal hook that can also manage associated data
 * Useful for edit modals, confirmation dialogs, etc.
 */
export const useModalWithData = <T>(initialState: boolean = false): UseModalWithDataReturn<T> => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [data, setData] = useState<T | null>(null);

    const openModal = useCallback((modalData?: T) => {
        if (modalData !== undefined) {
            setData(modalData);
        }
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    const toggleModal = useCallback((modalData?: T) => {
        if (!isOpen && modalData !== undefined) {
            setData(modalData);
        }
        setIsOpen(prev => {
            if (prev) {
                setData(null);
            }
            return !prev;
        });
    }, [isOpen]);

    return {
        isOpen,
        data,
        openModal,
        closeModal,
        toggleModal,
    };
};

export default useModal;
/**
 *
 Usage Examples:
 * 
 * // Basic modal
 * const modal = useModal();
 * <Modal isOpen={modal.isOpen} onClose={modal.closeModal} />
 * <Button onClick={modal.openModal}>Open Modal</Button>
 * 
 * // Modal with data (e.g., edit modal)
 * const editModal = useModalWithData<User>();
 * <EditModal 
 *   isOpen={editModal.isOpen} 
 *   onClose={editModal.closeModal}
 *   user={editModal.data}
 * />
 * <Button onClick={() => editModal.openModal(user)}>Edit User</Button>
 * 
 * // Confirmation dialog with data
 * const deleteModal = useModalWithData<{id: string, name: string}>();
 * <ConfirmDialog
 *   isOpen={deleteModal.isOpen}
 *   onClose={deleteModal.closeModal}
 *   message={`Delete ${deleteModal.data?.name}?`}
 * />
 * <Button onClick={() => deleteModal.openModal({id: '1', name: 'Item'})}>
 *   Delete Item
 * </Button>
 */