"use client"
import { useState, useEffect } from 'react';
import { getAllEmployeesAction } from '@/lib/server-actions';
import { Staff } from '@/types/admin/hrm/Staff';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalizer to map API records to Staff type (based on your API response structure)
  const normalizeEmployee = (emp: any): Staff => {
    const user = emp.user || {};
    const storeObj = (typeof emp.store === 'object' && emp.store) ? emp.store : (typeof emp.storeId === 'object' && emp.storeId ? emp.storeId : {});
    const storeId = typeof emp.storeId === 'string' ? emp.storeId : (storeObj._id || storeObj.id || '');
    const storeName = emp.storeName || storeObj.name || '';
    const isActive = emp.isActive === true || user.isActive === true || emp.status === 'Active' || emp.status === true;
    // Handle profilePicture from backend - check multiple possible locations
    const profilePicture = emp.profilePicture || user.profilePicture || emp.image || user.image || '';

    return {
      _id: emp._id || emp.id || user._id || '',
      id: emp._id || emp.id || user._id || '',
      name: user.name || emp.name || '',
      email: user.email || emp.email || '',
      phone: user.phone || emp.phone || '',
      designation: emp.designation || '',
      storeId,
      storeName,
      salary: Number(emp.salary ?? 0),
      joinDate: emp.joinDate || emp.joiningDate || emp.joinedAt || emp.createdAt || user.createdAt || '',
      status: isActive ? 'Active' as const : 'Inactive' as const,
      gender: emp.gender || user.gender || 'Male',
      image: profilePicture,
      address: emp.address || user.address,
      emergencyContact: emp.emergencyContact || user.emergencyContact,
      password: emp.password || user.password,
      confirmPassword: emp.confirmPassword || user.confirmPassword,
      createdAt: emp.createdAt || user.createdAt || '',
      updatedAt: emp.updatedAt || user.updatedAt || '',
      isActive: emp.isActive || user.isActive || false,
    };
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllEmployeesAction();

      if (result.success && result.data) {
        const employeesData = result.data?.data?.employees ||
          result.data?.data?.data ||
          result.data?.data ||
          result.data ||
          [];

        const normalizedEmployees = Array.isArray(employeesData)
          ? employeesData.map((emp: any) => normalizeEmployee(emp))
          : [];

        setEmployees(normalizedEmployees);
      } else {
        setError(result.error || 'Failed to fetch employees');
        setEmployees([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching employees:', err);
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const refreshEmployees = () => {
    fetchEmployees();
  };

  // Get active employees only
  const getActiveEmployees = () => {
    return employees.filter(employee => employee.status === 'Active');
  };

  // Get employees by store
  const getEmployeesByStore = (storeName: string) => {
    return employees.filter(employee =>
      employee.storeName === storeName ||
      employee.storeId === storeName ||
      storeName === '' // Return all if no store specified
    );
  };

  // Get active employees by store
  const getActiveEmployeesByStore = (storeName: string) => {
    return getEmployeesByStore(storeName).filter(employee => employee.status === 'Active');
  };

  // Get employees by designation
  const getEmployeesByDesignation = (designation: string) => {
    return employees.filter(employee =>
      employee.designation.toLowerCase().includes(designation.toLowerCase())
    );
  };

  // Search employees by name
  const searchEmployeesByName = (searchTerm: string) => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    employees,
    loading,
    error,
    refreshEmployees,
    getActiveEmployees,
    getEmployeesByStore,
    getActiveEmployeesByStore,
    getEmployeesByDesignation,
    searchEmployeesByName
  };
};
