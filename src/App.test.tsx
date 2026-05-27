import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Korean food oracle game UI', () => {
  it('communicates secret-target guessing within the first screen', () => {
    render(<App />);
    expect(screen.getByText(/마음속으로 음식 하나를 정해/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /탐정 시작/ })).toBeInTheDocument();
    expect(screen.getByAltText(/아무거나 탐정단 캐릭터/)).toBeInTheDocument();
  });

  it('shows one short question and exactly five answer controls', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /탐정 시작/ }));
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getAllByTestId('answer-button')).toHaveLength(5);
  });

  it('changes character state immediately after an answer', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /탐정 시작/ }));
    const before = screen.getByTestId('character-stage').getAttribute('data-silhouette');
    await userEvent.click(screen.getAllByTestId('answer-button')[0]);
    const after = screen.getByTestId('character-stage').getAttribute('data-silhouette');
    expect(after).not.toBe(before);
  });
});
