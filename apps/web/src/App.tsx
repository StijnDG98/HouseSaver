import { formatEuro } from '@housesaver/core';

// Phase 0 placeholder. The real screens follow docs/mockup/index.html.
export function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>HouseSaver</h1>
      <p>Nog niets te zien. Voorbeeld van een bedrag: {formatEuro(125000)}</p>
    </main>
  );
}
