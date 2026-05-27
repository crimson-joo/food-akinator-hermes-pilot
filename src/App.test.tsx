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

  it('renders a premium detective game scene instead of a plain questionnaire', () => {
    render(<App />);
    expect(screen.getByTestId('app-shell')).toHaveAttribute('data-visual-tier', 'premium-detective-board');
    expect(screen.getByTestId('case-board')).toBeInTheDocument();
    expect(screen.getByText(/사건명: 아무거나 실종 사건/)).toBeInTheDocument();
    expect(screen.getByText(/미식 탐정의 사건 수첩/)).toBeInTheDocument();
    expect(screen.getByText(/비밀 목표/)).toBeInTheDocument();
  });

  it('shows one short question and exactly five answer controls', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /탐정 시작/ }));
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getAllByTestId('answer-button')).toHaveLength(5);
    expect(screen.getByTestId('evidence-meter')).toBeInTheDocument();
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
