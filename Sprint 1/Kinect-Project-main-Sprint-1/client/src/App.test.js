// FileName: App.test.js
// Description: Default test file for the App.

// Importing testing functions.
import { render, screen } from '@testing-library/react';
import App from './App';

// Defines test.
test('renders learn react link', () => {
  // Displays App component.
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
