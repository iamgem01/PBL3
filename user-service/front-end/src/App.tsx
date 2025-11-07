

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import LandingPage from '@/pages/Landing/LandingPage'
// import LoginPage from  '@/pages/Login/LoginPage'
// import SignUpPage from '@/pages/SignUp/SignUpPage'
import HomePage from '@/pages/Homepage/HomePage'
import DocumentPage from '@/pages/DocumentPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/*<Route path="/" element={<LandingPage />} />*/}
                {/*<Route path="/login" element={<LoginPage />} />*/}
                {/*<Route path="/signup" element={<SignUpPage />} />*/}
                <Route path="/" element={<HomePage/>} />
                <Route path="/document/:id" element={<DocumentPage/>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;