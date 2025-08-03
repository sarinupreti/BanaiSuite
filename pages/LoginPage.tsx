import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuth } from '../App';
import { Icons } from '../components/Icons';
import { Button } from '../components/ui';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      let user;
      if (isSignUp) {
        if (!name) {
            setError('Please enter your full name.');
            setIsLoading(false);
            return;
        }
        user = await authService.signUp(email, password, name);
        setMessage('Sign up successful! Please check your email to confirm your account.');
      } else {
        const authUser = await authService.signIn(email, password);
        // The onAuthStateChange listener in App.tsx will handle setting the user
        // and navigating to the dashboard. We just need to wait for it.
      }
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
        if(!isSignUp) {
            // navigate('/'); // This might be too fast, onAuthStateChange handles it.
        }
    }
  };

  const toggleForm = () => {
      setIsSignUp(!isSignUp);
      setError('');
      setMessage('');
      setEmail('');
      setPassword('');
      setName('');
  };
  
  const InputField = ({ id, type, placeholder, value, onChange }) => (
     <div>
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
            id={id}
            name={id}
            type={type}
            required
            autoComplete={type === 'password' ? (isSignUp ? 'new-password' : 'current-password') : 'email'}
            className={`relative block w-full appearance-none rounded-2xl border border-outline bg-surface-variant px-4 py-3 text-on-surface placeholder-on-surface-variant focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-2xl shadow-2xl border border-outline">
        <div className="text-center">
            <Icons.Project className="mx-auto h-12 w-12 text-primary-400" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-on-surface">
                {isSignUp ? 'Create an Account' : 'Welcome to BanaiSuite'}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant h-4">
              { !isSignUp ? 'Sign in to continue' : 'Enter your details to sign up'}
            </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <InputField id="name" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <InputField id="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputField id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div className="text-sm text-red-300 text-center p-2 bg-red-900/20 rounded-lg">{error}</div>}
          {message && <div className="text-sm text-green-300 text-center p-2 bg-green-900/20 rounded-lg">{message}</div>}


          <div>
            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-on-surface-variant">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={toggleForm} className="font-medium text-primary-400 hover:text-primary-300 focus:outline-none">
                {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
