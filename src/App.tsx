import { useMemo, useState } from 'react';
import { Brain, ClipboardList, Fingerprint, RotateCcw, Search, Share2, Sparkles } from 'lucide-react';
import './styles.css';
import { CharacterController } from './character/CharacterController';
import { FOODS } from './data/foods';
import { QUESTIONS } from './data/questions';
import { topCandidates } from './engine/score';
import { answerCurrentQuestion, createSession, markGuessCorrect, markGuessWrong, restartSession, revealReadiness, startSession, type Session } from './game/session';
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
  const [mode, setMode] = useState<'mine' | 'theirs'>('mine');
  const [actualAnswer, setActualAnswer] = useState('');
  const topName = session.guess?.food.name;
  const readiness = revealReadiness(session);
  const suspects = useMemo(() => topCandidates(session.posterior, 3), [session.posterior]);
  const evidenceWidth = Math.min(100, Math.max(8, session.answered.length * 9));
  const startLabel = mode === 'mine' ? '마음속 음식' : '상대의 아무거나';

  function recover() {
    setSession(markGuessWrong(session, actualAnswer));
    setActualAnswer('');
  }

  return (
    <main className="app-shell" data-testid="app-shell" data-visual-tier="premium-detective-board">
      <section className="hero-panel">
        <div className="brand-pill">아무거나 탐정단 · 최종 서비스</div>
        <div className="case-board" data-testid="case-board">
          <span>사건명: 아무거나 실종 사건</span>
          <span>용의 메뉴 {FOODS.length}</span>
          <span>질문 카드 {QUESTIONS.length}</span>
        </div>
        <h1>오늘 뭐 먹지 심리전, 제가 끝까지 수사합니다.</h1>
        <p className="subcopy">마음속으로 음식 하나를 정해 주세요. {startLabel} 수사를 시작하면 저는 한 번에 한 질문씩 던지고, 6~12턴 안에 가장 그럴듯한 메뉴를 공개합니다.</p>
        <div className="mode-switch" aria-label="게임 모드 선택">
          <button className={mode === 'mine' ? 'selected' : ''} onClick={() => setMode('mine')}>내 음식 맞히기</button>
          <button className={mode === 'theirs' ? 'selected' : ''} onClick={() => setMode('theirs')}>상대 음식 맞히기</button>
        </div>
        <CharacterController session={session} />
      </section>

      <section className="game-panel">
        <div className="notebook-tab">미식 탐정의 사건 수첩</div>
        <div className="service-progress" data-testid="service-progress">
          <span>수사 {session.answered.length}/12</span>
          <span>확신 {(readiness.confidence * 100).toFixed(0)}%</span>
          <span>격차 {(readiness.gap * 100).toFixed(0)}%</span>
        </div>
        <aside className="candidate-board" data-testid="candidate-board" aria-label="상위 용의 메뉴">
          <strong><ClipboardList size={16} /> 용의 메뉴 TOP 3</strong>
          {suspects.map((item) => <span key={item.food.id}>{item.food.name} · {(item.probability * 100).toFixed(0)}%</span>)}
        </aside>

        {session.phase === 'entry' && (
          <div className="card entry-card">
            <Sparkles />
            <span className="case-stamp">비밀 목표</span>
            <h2>정답을 말하지 말고 떠올리기만 하세요</h2>
            <p>배달, 외식, 집밥, 야식, 디저트까지. 예/아마 예/모름/아마 아니오/아니오로만 대답하면 됩니다.</p>
            <button className="primary" onClick={() => setSession(startSession(session))}>탐정 시작</button>
          </div>
        )}

        {['asking', 'thinking', 'wrongRecovery', 'guessAnticipation'].includes(session.phase) && session.currentQuestion && (
          <div className="card question-card" data-testid="question-card">
            {session.phase === 'wrongRecovery' && (
              <>
                <span className="case-stamp danger">오답도 단서입니다</span>
                <label className="actual-answer-note">
                  <span>정답을 알면 남겨도 돼요</span>
                  <input value={actualAnswer} onChange={(event) => setActualAnswer(event.target.value)} placeholder="정답을 남기고 다음 판 단서로 쓰기" />
                </label>
              </>
            )}
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
            <div className="confidence-breakdown" data-testid="confidence-breakdown">
              <span>질문 {session.answered.length}개</span>
              <span>1·2위 격차 {(readiness.gap * 100).toFixed(0)}%</span>
              <span>{readiness.reason === 'max-turns' ? '최대 질문 도달' : '충분한 확신'}</span>
            </div>
            <label className="actual-answer-note">
              <span>틀렸다면 정답 메모</span>
              <input value={actualAnswer} onChange={(event) => setActualAnswer(event.target.value)} placeholder="정답을 남기고 다음 판 단서로 쓰기" />
            </label>
            <div className="answer-grid two">
              <button className="primary" onClick={() => setSession(markGuessCorrect(session))}>맞혔어</button>
              <button onClick={recover}>아니야, 더 물어봐</button>
            </div>
          </div>
        )}

        {session.phase === 'correct' && (
          <div className="card success-card">
            <Fingerprint />
            <h2>맛의 단서 수사 완료!</h2>
            <p>친구에게 “아무거나” 수사를 넘겨도 됩니다. 다음 판도 바로 시작할 수 있어요.</p>
            <div className="answer-grid two">
              <button className="primary" onClick={() => setSession(restartSession(session))}><RotateCcw size={18}/> 다시 시작</button>
              <button onClick={() => navigator.clipboard?.writeText(location.href)}><Share2 size={18}/> 링크 복사</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
