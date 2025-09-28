import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogIn,
  UserPlus,
  Star,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';

const AuthenticationMenu = ({ onLogin, onSignup, isVisible, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      // Demo login - always succeed
      onLogin({
        name: 'Marketing Pro',
        email: formData.email || 'demo@marketingpro.com',
        avatar: 'MP',
        subscription: 'Professional',
        campaigns: 24,
        totalROI: 324.5,
        isAuthenticated: true
      });
    } else {
      // Demo signup
      onSignup({
        name: formData.name || 'New User',
        email: formData.email,
        avatar: formData.name ? formData.name.charAt(0).toUpperCase() : 'NU',
        subscription: 'Professional',
        campaigns: 0,
        totalROI: 0,
        isAuthenticated: true
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Platform'}
                </h2>
                <p className="text-white/80 text-sm">
                  {mode === 'login' ? 'Sign in to your account' : 'Create your professional account'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Company (Optional)
                  </Label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={mode === 'login' ? 'demo@marketingpro.com' : 'Enter your email'}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={mode === 'login' ? 'demo123' : 'Create a secure password'}
                  className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            )}

            {/* Professional Benefits for Signup */}
            {mode === 'signup' && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-800">Professional Features Included</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Unlimited AI Intelligence Generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Advanced Performance Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Multi-Platform Campaign Creation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Platform
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Professional Account
                </>
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-slate-600 mb-3">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="outline"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {mode === 'login' ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In Instead
                </>
              )}
            </Button>
          </div>

          {/* Demo Credentials */}
          {mode === 'login' && (
            <Card className="mt-6 bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
                  <div className="text-xs text-slate-600">
                    <div>Email: demo@marketingpro.com</div>
                    <div>Password: demo123</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationMenu;