// Define the Employee type without any MongoDB dependencies
export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'EMPLOYEE' | 'INVESTOR';
  createdAt: Date;
  updatedAt: Date;
};