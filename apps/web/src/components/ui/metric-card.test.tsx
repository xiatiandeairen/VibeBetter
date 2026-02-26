import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MetricCard } from './metric-card';

afterEach(cleanup);

describe('MetricCard', () => {
  it('renders title', () => {
    render(<MetricCard title="AI Success Rate" value="85.0%" />);
    expect(screen.getByText('AI Success Rate')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<MetricCard title="Total PRs" value="142" />);
    expect(screen.getByText('142')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<MetricCard title="PSRI Score" value="0.35" subtitle="Good range" />);
    expect(screen.getByText('Good range')).toBeInTheDocument();
  });

  it('renders positive delta indicator', () => {
    render(<MetricCard title="Rate" value="90%" delta={5.2} />);
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('renders negative delta indicator', () => {
    render(<MetricCard title="Rate" value="70%" delta={-3.1} />);
    expect(screen.getByText('3.1%')).toBeInTheDocument();
  });

  it('does not render delta when null', () => {
    const { container } = render(<MetricCard title="Rate" value="70%" delta={null} />);
    const deltaSpan = container.querySelector('.text-emerald-400, .text-red-400');
    expect(deltaSpan).toBeNull();
  });

  it('applies color border', () => {
    const { container } = render(<MetricCard title="Test" value="1" color="green" />);
    const card = container.firstElementChild;
    expect(card?.className).toContain('emerald');
  });
});
