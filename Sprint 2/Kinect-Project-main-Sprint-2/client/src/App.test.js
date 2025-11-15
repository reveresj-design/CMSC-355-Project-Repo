// FileName: App.test.js
// Description: Default test file for the App.

// Importing testing functions.
import { render, screen } from '@testing-library/react';
// Importing App.
import App from './App';

// Test.
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
