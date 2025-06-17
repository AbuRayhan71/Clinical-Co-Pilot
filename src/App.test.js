import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Clinical Co-Pilot title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to Clinical Co-Pilot/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders input field', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Type your input here/i);
  expect(inputElement).toBeInTheDocument();
});
