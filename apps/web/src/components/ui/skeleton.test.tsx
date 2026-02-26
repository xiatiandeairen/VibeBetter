import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Skeleton, MetricCardSkeleton, ChartSkeleton, TableSkeleton } from './skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstElementChild?.className).toContain('h-8');
    expect(container.firstElementChild?.className).toContain('w-32');
  });

  it('has animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild?.className).toContain('animate-pulse');
  });
});

describe('MetricCardSkeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<MetricCardSkeleton />);
    expect(container.firstElementChild).not.toBeNull();
  });
});

describe('ChartSkeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstElementChild).not.toBeNull();
  });
});

describe('TableSkeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it('renders correct number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const rowDivs = container.querySelectorAll('.flex.gap-4');
    expect(rowDivs).toHaveLength(3);
  });
});
