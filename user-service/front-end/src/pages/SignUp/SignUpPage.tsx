import React from 'react';

import { FcGoogle } from 'react-icons/fc';

const SignUpPage: React.FC = () => {

    const handleGoogleLogin = () => {
        console.log('Bắt đầu quá trình "Continue with Google" ...');
    };

    return (
        <section className="relative py-50 overflow-hidden">

        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm rounded-lg bg-white p-10 shadow-lg">

                <h2 className="mb-8 text-center text-3xl font-bold text-black-600">
                    Create Account
                </h2>

                <div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >

                        <FcGoogle className="h-5 w-5" />

                        <span className="ml-2">Continue with Google</span>
                    </button>
                </div>


                <p className="mt-8 text-center text-xs text-gray-500">
                    By continuing, you acknowledge that you understand and agree to the Terms & Conditions and Privacy Policy
                </p>

            </div>

        </div>
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
        </section>
    );
};

export default SignUpPage;