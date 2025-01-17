import { createRoot, hydrateRoot } from 'react-dom/client';
import { isClient } from '@/utils/environment';
import App from '@/App';

const container = document.getElementById('app');

if (isClient || !container?.innerText) {
    const root = createRoot(container!);
    root.render(<App ssr={false} />);
} else {
    hydrateRoot(container!, <App ssr={false} />);
}
