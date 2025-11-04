

import { BrowserRouter, Routes, Route } from 'react-router-dom';


import LandingPage from '@/pages/Landing/LandingPage';

 import SignUpPage from '@/pages/SignUp/SignUpPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LandingPage />} />


                <Route path="/signup" element={<SignUpPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;