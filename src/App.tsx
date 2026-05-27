import { useState } from 'react';
import { Brain, RotateCcw, Sparkles } from 'lucide-react';
import './styles.css';
import { CharacterController } from './character/CharacterController';
import { answerCurrentQuestion, createSession, markGuessCorrect, markGuessWrong, restartSession, startSession, type Session } from './game/session';
import type { Answer } from './engine/score';

const ANSWERS: Array<{ key: Answer; label: string }> = [
  { key: 'yes', label: '응, 맞아' },
  { key: 'probably', label: '아마 맞아' },
  { key: 'unknown', label: '잘 모르겠어' },
  { key: 'probablyNot', label: '아마 아니야' },
  { key: 'no', label: '아니야' },
];

export default function App() {
  const [session, setSession] = useState<Session>(() => createSession());
  const topName = session.guess?.food.name;
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="brand-pill">아무거나 탐정단 · Korean Food Guessing Game</div>
        <h1>“아무거나” 뒤에 숨은 진짜 메뉴를 맞혀볼게요.</h1>
        <p className="subcopy">마음속으로 음식 하나를 정해 주세요. 저는 질문 하나씩 던지며 6~12턴 안에 추리합니다.</p>
        <CharacterController session={session} />
      </section>

      <section className="game-panel">
        {session.phase === 'entry' && (
          <div className="card entry-card">
            <Sparkles />
            <h2>정답을 말하지 말고 떠올리기만 하세요</h2>
            <p>배달, 외식, 집밥, 야식까지. 예/아마 예/모름/아마 아니오/아니오로만 대답하면 됩니다.</p>
            <button className="primary" onClick={() => setSession(startSession(session))}>탐정 시작</button>
          </div>
        )}

        {['asking', 'thinking', 'wrongRecovery'].includes(session.phase) && session.currentQuestion && (
          <div className="card question-card" data-testid="question-card">
            <div className="turn">단서 {session.answered.length + 1}</div>
            <h2>{session.currentQuestion.text}</h2>
            <div className="answer-grid">
              {ANSWERS.map((answer) => (
                <button key={answer.key} data-testid="answer-button" onClick={() => setSession(answerCurrentQuestion(session, answer.key))}>
                  {answer.label}
                </button>
              ))}
            </div>
            <p className="hint">한 화면에는 질문 하나만. 내부 태그를 고르는 설문지가 아니라 캐릭터와 하는 추리 게임입니다.</p>
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
            <h2>맛의 단서 수사 완료!</h2>
            <p>다음 “아무거나”도 제가 다시 추리해볼게요.</p>
            <button className="primary" onClick={() => setSession(restartSession(session))}><RotateCcw size={18}/> 다시 시작</button>
          </div>
        )}
      </section>
    </main>
  );
}
