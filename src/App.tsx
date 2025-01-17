import { StrictMode } from 'react';
import { BrowserRouter, StaticRouter } from 'react-router-dom';
import { isServer } from '@/utils/environment';
import { useState } from 'react';

type Props = {
    ssr: boolean;
} & ({ ssr: true; location: string } | { ssr: false; location?: never });

function App({ ssr, location }: Props) {
    const [counter, setCounter] = useState(0);
    const increment = () => setCounter((prevCount) => prevCount + 1);

    return (
        <StrictMode>
            {ssr && isServer ? (
                <StaticRouter location={location}>
                    <button onClick={increment}>{counter}</button>
                </StaticRouter>
            ) : (
                <BrowserRouter>
                    <button onClick={increment}>{counter}</button>
                </BrowserRouter>
            )}
        </StrictMode>
    );
}

export default App;
