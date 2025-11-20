import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '@/services/collabService';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

export default function InvitationAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    // Check if user is logged in (you should get this from your auth context)
    const currentUserEmail = localStorage.getItem('userEmail'); // TODO: Get from auth context
    
    if (!currentUserEmail) {
      setShowEmailInput(true);
      setStatus('loading');
      setMessage('Please enter your email to accept the invitation');
      return;
    }

    handleAcceptInvitation(currentUserEmail);
  }, [token]);

  const handleAcceptInvitation = async (email: string) => {
    if (!token) return;

    try {
      setStatus('loading');
      setMessage('Accepting invitation...');

      const response = await acceptInvitation(token, email);

      setStatus('success');
      setMessage('Invitation accepted! Redirecting to document...');
      setNoteId(response.noteId);

      // Redirect to document after 2 seconds
      setTimeout(() => {
        navigate(`/notes/${response.noteId}`);
      }, 2000);

    } catch (error) {
      console.error('Failed to accept invitation:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to accept invitation');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      localStorage.setItem('userEmail', userEmail.trim()); // TODO: Use proper auth
      handleAcceptInvitation(userEmail.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6
            bg-gradient-to-br from-blue-500 to-indigo-600">
            <Mail size={40} className="text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Collaboration Invitation
          </h1>

          {/* Status Content */}
          {showEmailInput && status === 'loading' ? (
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                      dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg
                    hover:bg-blue-700 transition-colors font-medium"
                >
                  Accept Invitation
                </button>
              </form>
            </div>
          ) : status === 'loading' ? (
            <div className="mt-6">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          ) : status === 'success' ? (
            <div className="mt-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600 mb-2">
                Success!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600 mb-2">
                Error
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 
                  dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
                  transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}