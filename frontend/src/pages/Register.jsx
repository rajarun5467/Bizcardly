import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    let message = '';
    if (score === 0) message = 'Very weak';
    else if (score <= 2) message = 'Weak';
    else if (score <= 3) message = 'Fair';
    else if (score <= 4) message = 'Good';
    else message = 'Strong';

    return { score, message, checks };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      setPasswordStrength(checkPasswordStrength(e.target.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation with helpful messages
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    
    const strength = checkPasswordStrength(formData.password);
    if (strength.score < 3) {
      const missingRequirements = [];
      if (!strength.checks.length) missingRequirements.push('at least 8 characters');
      if (!strength.checks.uppercase) missingRequirements.push('uppercase letter');
      if (!strength.checks.lowercase) missingRequirements.push('lowercase letter');
      if (!strength.checks.number) missingRequirements.push('number');
      if (!strength.checks.special) missingRequirements.push('special character (!@#$%^&*)');
      
      return toast.error(`Password is too weak. Please include: ${missingRequirements.join(', ')}`);
    }
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      await login(data.token, data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 hover-lift animate-scale-in">
        <div className="text-center mb-8 animate-slide-in-down">
          <h1 className="text-3xl font-bold text-gray-800">Bizcardly</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 animate-staggered">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative group">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="••••••••"
              />
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        passwordStrength.score <= 4 ? 'bg-green-400' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.score <= 2 ? 'text-red-500' :
                    passwordStrength.score <= 3 ? 'text-yellow-500' :
                    passwordStrength.score <= 4 ? 'text-green-400' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                    ✓ At least 8 characters
                  </p>
                  <p className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Uppercase letter (A-Z)
                  </p>
                  <p className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Lowercase letter (a-z)
                  </p>
                  <p className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Number (0-9)
                  </p>
                  <p className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Special character (!@#$%^&*)
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2 hover-lift shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <FaArrowRight />
              </>
            )}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 animate-fade-in">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover-color-change transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
