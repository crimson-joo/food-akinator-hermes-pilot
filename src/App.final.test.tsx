import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('final service UI flow', () => {
  it('renders the complete service frame: modes, case progress, candidate board, and final CTA area', () => {
    render(<App />);
    expect(screen.getByText(/오늘 뭐 먹지 심리전/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /내 음식 맞히기/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /상대 음식 맞히기/ })).toBeInTheDocument();
    expect(screen.getByTestId('service-progress')).toBeInTheDocument();
    expect(screen.getByTestId('candidate-board')).toBeInTheDocument();
    expect(screen.getByText(/최종 서비스/)).toBeInTheDocument();
  });

  it('reveals with confidence details, then supports wrong-answer recovery and actual-answer note', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /탐정 시작/ }));
    for (let i = 0; i < 12 && !screen.queryByText(/혹시…/); i += 1) {
      await userEvent.click(screen.getAllByTestId('answer-button')[i % 5]);
    }
    expect(screen.getByText(/혹시…/)).toBeInTheDocument();
    expect(screen.getByTestId('confidence-breakdown')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /아니야, 더 물어봐/ }));
    expect(screen.getByText(/오답도 단서입니다/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/정답을 남기고 다음 판/)).toBeInTheDocument();
  });
});
