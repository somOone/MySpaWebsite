import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AdminLogin from '../AdminLogin';

// Mock axios
jest.mock('axios');

describe('AdminLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnLoginSuccess = jest.fn();

  const renderAdminLogin = () => {
    return render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
  };

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderAdminLogin();

      expect(screen.getByText('Admin Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderAdminLogin();

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('Form Interaction', () => {
    it('should update username input value', () => {
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput.value).toBe('testuser');
    });

    it('should update password input value', () => {
      renderAdminLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      expect(passwordInput.value).toBe('testpass');
    });

    it('should show loading state during submission', async () => {
      axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty username', async () => {
      renderAdminLogin();

      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error for both empty fields', async () => {
      renderAdminLogin();

      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      // Submit empty form to show errors
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      // Start typing to clear errors
      fireEvent.change(usernameInput, { target: { value: 't' } });
      fireEvent.change(passwordInput, { target: { value: 'p' } });

      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          username: 'testuser'
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5001/api/admin/auth/login',
          {
            username: 'testuser',
            password: 'testpass'
          },
          { withCredentials: true }
        );
      });

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalledWith('testuser');
      });
    });

    it('should handle successful login response', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          username: 'admin'
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalledWith('admin');
      });
    });

    it('should handle login failure with error message', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };

      axios.post.mockRejectedValue(mockError);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Button should be re-enabled
      expect(loginButton).not.toBeDisabled();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      axios.post.mockRejectedValue(mockError);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });

      // Button should be re-enabled
      expect(loginButton).not.toBeDisabled();
    });

    it('should handle unexpected response format', async () => {
      const mockResponse = {
        data: {
          // Missing success field
          message: 'Unexpected response'
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error when user starts typing', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };

      axios.post.mockRejectedValue(mockError);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      // Submit to trigger error
      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Start typing to clear error
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple consecutive errors', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };

      axios.post.mockRejectedValue(mockError);

      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      // First failed attempt
      fireEvent.change(usernameInput, { target: { value: 'wrong1' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong1' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Second failed attempt
      fireEvent.change(usernameInput, { target: { value: 'wrong2' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong2' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(usernameInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
    });

    it('should have proper button states', () => {
      renderAdminLogin();

      const loginButton = screen.getByRole('button', { name: 'Login' });
      expect(loginButton).not.toBeDisabled();
      expect(loginButton).toHaveAttribute('type', 'submit');
    });

    it('should show loading state with proper accessibility', async () => {
      axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long username and password', () => {
      renderAdminLogin();

      const longString = 'a'.repeat(1000);
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(usernameInput, { target: { value: longString } });
      fireEvent.change(passwordInput, { target: { value: longString } });

      expect(usernameInput.value).toBe(longString);
      expect(passwordInput.value).toBe(longString);
    });

    it('should handle special characters in input', () => {
      renderAdminLogin();

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(usernameInput, { target: { value: specialChars } });
      fireEvent.change(passwordInput, { target: { value: specialChars } });

      expect(usernameInput.value).toBe(specialChars);
      expect(passwordInput.value).toBe(specialChars);
    });

    it('should handle rapid form submission attempts', async () => {
      axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderAdminLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      // Multiple rapid clicks
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);

      // Should only make one API call
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1);
      });
    });
  });
});
