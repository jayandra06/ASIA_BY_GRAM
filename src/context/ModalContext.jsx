'use client';

import { createContext, useContext, useState } from 'react';
import ReservationModal from '../components/ui/ReservationModal';
import EventRegistrationModal from '../components/ui/EventRegistrationModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

    const openReservation = () => setIsReservationOpen(true);
    const closeReservation = () => setIsReservationOpen(false);

    const openRegistration = () => setIsRegistrationOpen(true);
    const closeRegistration = () => setIsRegistrationOpen(false);

    return (
        <ModalContext.Provider value={{ openReservation, closeReservation, openRegistration, closeRegistration }}>
            {children}
            <ReservationModal isOpen={isReservationOpen} onClose={closeReservation} />
            <EventRegistrationModal isOpen={isRegistrationOpen} onClose={closeRegistration} />
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
