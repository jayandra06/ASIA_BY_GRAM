'use client';

import { createContext, useContext, useState } from 'react';
import ReservationModal from '../components/ui/ReservationModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    const openReservation = () => setIsReservationOpen(true);
    const closeReservation = () => setIsReservationOpen(false);

    return (
        <ModalContext.Provider value={{ openReservation, closeReservation }}>
            {children}
            <ReservationModal isOpen={isReservationOpen} onClose={closeReservation} />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
