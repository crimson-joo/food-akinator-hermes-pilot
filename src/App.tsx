import { useState } from 'react';
import { Brain, Fingerprint, RotateCcw, Search, Sparkles } from 'lucide-react';
import './styles.css';
import { CharacterController } from './character/CharacterController';
import { answerCurrentQuestion, createSession, markGuessCorrect, markGuessWrong, restartSession, startSession, type Session } from './game/session';
import type { Answer } from './engine/score';

const ANSWERS: Array<{ key: Answer; label: string; cue: string }> = [
  { key: 'yes', label: '응, 맞아', cue: '확실한 단서' },
  { key: 'probably', label: '아마 맞아', cue: '기울어진 단서' },
  { key: 'unknown', label: '잘 모르겠어', cue: '보류' },
  { key: 'probablyNot', label: '아마 아니야', cue: '약한 반증' },
  { key: 'no', label: '아니야', cue: '강한 반증' },
];

export default function App() {
  const [session, setSession] = useState<Session>(() => createSession());
  const topName = session.guess?.food.name;
  const evidenceWidth = Math.min(100, Math.max(8, session.answered.length * 12));

  return (
    <main className="app-shell" data-testid="app-shell" data-visual-tier="premium-detective-board">
      <section className="hero-panel">
        <div className="brand-pill">아무거나 탐정단 · Korean Food Guessing Game</div>
        <div className="case-board" data-testid="case-board">
          <span>사건명: 아무거나 실종 사건</span>
          <span>용의 메뉴 26</span>
          <span>질문 카드 30</span>
        </div>
        <h1>“아무거나”라는 말 속 진짜 메뉴를 수사합니다.</h1>
        <p className="subcopy">마음속으로 음식 하나를 정해 주세요. 저는 사건 수첩과 맛의 단서를 따라 6~12턴 안에 추리합니다.</p>
        <CharacterController session={session} />
      </section>

      <section className="game-panel">
        <div className="notebook-tab">미식 탐정의 사건 수첩</div>
        {session.phase === 'entry' && (
          <div className="card entry-card">
            <Sparkles />
            <span className="case-stamp">비밀 목표</span>
            <h2>정답을 말하지 말고 떠올리기만 하세요</h2>
            <p>배달, 외식, 집밥, 야식까지. 예/아마 예/모름/아마 아니오/아니오로만 대답하면 됩니다.</p>
            <button className="primary" onClick={() => setSession(startSession(session))}>탐정 시작</button>
          </div>
        )}

        {['asking', 'thinking', 'wrongRecovery'].includes(session.phase) && session.currentQuestion && (
          <div className="card question-card" data-testid="question-card">
            <div className="evidence-meter" data-testid="evidence-meter" aria-label="수사 진행도">
              <span>단서 {session.answered.length + 1}</span>
              <div><i style={{ width: `${evidenceWidth}%` }} /></div>
            </div>
            <h2>{session.currentQuestion.text}</h2>
            <div className="answer-grid">
              {ANSWERS.map((answer) => (
                <button key={answer.key} data-testid="answer-button" onClick={() => setSession(answerCurrentQuestion(session, answer.key))}>
                  <b>{answer.label}</b>
                  <small>{answer.cue}</small>
                </button>
              ))}
            </div>
            <p className="hint"><Search size={15} /> 한 화면에는 질문 하나만. 내부 태그를 고르는 설문지가 아니라 캐릭터와 하는 추리 게임입니다.</p>
          </div>
        )}

        {session.phase === 'reveal' && session.guess && (
          <div className="card reveal-card">
            <Brain />
            <span className="confidence">확률 {(session.guess.probability * 100).toFixed(0)}%</span>
            <h2>혹시… {topName}?</h2>
            <p>{session.guess.food.reason}</p>
            <div className="answer-grid two">
              <button className="primary" onClick={() => setSession(markGuessCorrect(session))}>맞혔어</button>
              <button onClick={() => setSession(markGuessWrong(session))}>아니야, 더 물어봐</button>
            </div>
          </div>
        )}

        {session.phase === 'correct' && (
          <div className="card success-card">
            <Fingerprint />
            <h2>맛의 단서 수사 완료!</h2>
            <p>다음 “아무거나”도 제가 다시 추리해볼게요.</p>
            <button className="primary" onClick={() => setSession(restartSession(session))}><RotateCcw size={18}/> 다시 시작</button>
          </div>
        )}
      </section>
    </main>
  );
}
