import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI-Powered Medical Notes Generator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/AI-Powered Medical Notes Generator/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders input field', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Type your input here/i);
  expect(inputElement).toBeInTheDocument();
});
