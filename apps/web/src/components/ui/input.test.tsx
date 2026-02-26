import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Input } from './input';

afterEach(cleanup);

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Type..." />);
    expect(screen.getByPlaceholderText('Type...')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const { container } = render(<Input error="Invalid" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('red');
  });

  it('renders as the correct type', () => {
    const { container } = render(<Input type="password" placeholder="secret" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).not.toBeNull();
  });
});
