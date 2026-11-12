'use client';

const AdminError = ({ reset }: { error: Error; reset: () => void }) => (
    <div className='admin-notice'>
        <h1>Er ging iets mis</h1>
        <p>De pagina kon niet worden geladen door een fout in de database. Probeer het opnieuw.</p>
        <button type='button' className='brand-button' onClick={reset}>
            Opnieuw proberen
        </button>
    </div>
);

export default AdminError;
