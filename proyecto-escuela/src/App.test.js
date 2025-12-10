import { render, screen } from '@testing-library/react';
import App from './App';

test('muestra la pantalla de login por defecto', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
});
