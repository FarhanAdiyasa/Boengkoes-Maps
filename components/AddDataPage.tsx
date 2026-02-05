import React from 'react';
import SubmitForm from './SubmitForm';

const AddDataPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">🍔 Boengkoes Data Entry</h1>
                    <p className="text-gray-400 text-sm">Internal use only - Add new restaurant spots</p>
                </div>
                <SubmitForm onClose={() => window.location.href = '/'} />
            </div>
        </div>
    );
};

export default AddDataPage;
