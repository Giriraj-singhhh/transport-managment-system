import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, error: null, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { data: userData, isLoading, error } = useQuery(
    'currentUser',
    () => api.get('/auth/me').then(res => res.data.data.user),
    {
      retry: false,
      onError: (error) => {
        if (error.response?.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      },
    }
  );

  // Update state when user data changes
  useEffect(() => {
    if (userData) {
      dispatch({ type: 'SET_USER', payload: userData });
    } else if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else if (!isLoading) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userData, error, isLoading]);

  // Login mutation
  const loginMutation = useMutation(
    (credentials) => api.post('/auth/login', credentials),
    {
      onSuccess: (response) => {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        queryClient.setQueryData('currentUser', user);
        toast.success('Login successful!');
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/app/admin');
        } else if (user.role === 'driver') {
          navigate('/app/driver');
        } else {
          navigate('/app/dashboard');
        }
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        toast.error(message);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    (userData) => api.post('/auth/register', userData),
    {
      onSuccess: (response) => {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        queryClient.setQueryData('currentUser', user);
        toast.success('Registration successful!');
        navigate('/app/dashboard');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Registration failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        toast.error(message);
      },
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(
    () => api.post('/auth/logout'),
    {
      onSuccess: () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
        queryClient.clear();
        toast.success('Logged out successfully');
        navigate('/');
      },
      onError: () => {
        // Even if logout fails on server, clear local state
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
        queryClient.clear();
        navigate('/');
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (passwordData) => api.post('/auth/change-password', passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to change password';
        toast.error(message);
      },
    }
  );

  // Forgot password mutation
  const forgotPasswordMutation = useMutation(
    (email) => api.post('/auth/forgot-password', { email }),
    {
      onSuccess: () => {
        toast.success('Password reset link sent to your email');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to send reset link';
        toast.error(message);
      },
    }
  );

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    (data) => api.post('/auth/reset-password', data),
    {
      onSuccess: () => {
        toast.success('Password reset successfully');
        navigate('/login');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
      },
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => api.put(`/users/${state.user?._id}`, profileData),
    {
      onSuccess: (response) => {
        const updatedUser = response.data.data.user;
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        queryClient.setQueryData('currentUser', updatedUser);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      },
    }
  );

  // Helper functions
  const login = (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    loginMutation.mutate(credentials);
  };

  const register = (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    registerMutation.mutate(userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const changePassword = (passwordData) => {
    changePasswordMutation.mutate(passwordData);
  };

  const forgotPassword = (email) => {
    forgotPasswordMutation.mutate(email);
  };

  const resetPassword = (data) => {
    resetPasswordMutation.mutate(data);
  };

  const updateProfile = (profileData) => {
    updateProfileMutation.mutate(profileData);
  };

  const hasRole = (roles) => {
    if (!state.user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(state.user.role);
    }
    return state.user.role === roles;
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    // Define permissions based on roles
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_buses', 'manage_drivers', 'manage_routes', 'manage_schedules', 'view_reports'],
      driver: ['read', 'update_location', 'view_schedule'],
      staff: ['read', 'book'],
      student: ['read', 'book']
    };

    const userPermissions = permissions[state.user.role] || [];
    return userPermissions.includes(permission);
  };

  const value = {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    
    // Helpers
    hasRole,
    hasPermission,
    isAuthenticated: !!state.user,
    
    // Mutation states
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
    isUpdatingProfile: updateProfileMutation.isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
