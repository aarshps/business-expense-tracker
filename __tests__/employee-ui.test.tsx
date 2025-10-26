import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { employeeService } from '@/lib/employeeService';

// Mock the employee service
jest.mock('@/lib/employeeService', () => ({
  employeeService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock the logUserAction function
jest.mock('@/lib/middleware', () => ({
  logUserAction: jest.fn(),
}));

describe('Employee Management UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve([]),
      ok: true,
    }));
  });

  describe('Initial Load', () => {
    it('should load and display employees', async () => {
      const mockEmployees = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          type: 'EMPLOYEE',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      (employeeService.getAll as jest.Mock).mockResolvedValue(mockEmployees);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('EMPLOYEE')).toBeInTheDocument();
    });

    it('should show "No employees found" message when there are no employees', async () => {
      (employeeService.getAll as jest.Mock).mockResolvedValue([]);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No employees found')).toBeInTheDocument();
      });

      expect(screen.getByText('Add Your First Employee')).toBeInTheDocument();
    });
  });

  describe('Create Employee', () => {
    it('should allow creating a new employee', async () => {
      (employeeService.getAll as jest.Mock).mockResolvedValue([]);
      (employeeService.create as jest.Mock).mockResolvedValue({
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        type: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('No employees found')).toBeInTheDocument();
      });

      // Click add employee button
      fireEvent.click(screen.getByText('Add Your First Employee'));

      // Fill in form
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'Jane Doe' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'jane@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Phone *'), {
        target: { value: '0987654321' }
      });
      fireEvent.change(screen.getByLabelText('Type'), {
        target: { value: 'INVESTOR' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Employee'));

      // Wait for the employee to be created and reflected in the UI
      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });

      expect(employeeService.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        type: 'INVESTOR'
      });
    });
  });

  describe('Edit Employee', () => {
    it('should allow editing an existing employee', async () => {
      const mockEmployees = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          type: 'EMPLOYEE',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      (employeeService.getAll as jest.Mock).mockResolvedValue(mockEmployees);
      (employeeService.update as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'John Updated',
        email: 'johnupdated@example.com',
        phone: '0987654321',
        type: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      render(<Home />);

      // Wait for employees to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByText('Edit'));

      // Verify form is populated with existing data
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();

      // Update form fields
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Updated' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'johnupdated@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Phone *'), {
        target: { value: '0987654321' }
      });
      fireEvent.change(screen.getByLabelText('Type'), {
        target: { value: 'INVESTOR' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Update Employee'));

      // Wait for the employee to be updated and reflected in the UI
      await waitFor(() => {
        expect(screen.getByText('John Updated')).toBeInTheDocument();
      });

      expect(employeeService.update).toHaveBeenCalledWith('1', {
        name: 'John Updated',
        email: 'johnupdated@example.com',
        phone: '0987654321',
        type: 'INVESTOR'
      });
    });
  });

  describe('Delete Employee', () => {
    it('should allow deleting an employee', async () => {
      const mockEmployees = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          type: 'EMPLOYEE',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      (employeeService.getAll as jest.Mock).mockResolvedValue(mockEmployees);
      (employeeService.delete as jest.Mock).mockResolvedValue(true);

      render(<Home />);

      // Wait for employees to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Mock confirm dialog to return true
      window.confirm = jest.fn(() => true);

      // Click delete button
      fireEvent.click(screen.getByText('Delete'));

      // Wait for deletion to complete
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });

      expect(employeeService.delete).toHaveBeenCalledWith('1');
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this employee?');
    });
  });
});