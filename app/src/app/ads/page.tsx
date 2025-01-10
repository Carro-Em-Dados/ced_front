"use client";
import React, { useState } from 'react';
import AdsModal from '@/components/AdsModal';

const PromocoesModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='bg-black h-screen flex justify-center items-center'>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <AdsModal onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default PromocoesModal;
