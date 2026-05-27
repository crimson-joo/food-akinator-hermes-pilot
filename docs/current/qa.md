# QA acceptance

## Final service acceptance

- First screen communicates: secretly choose a food and the app guesses it.
- UI is a game with a character opponent/host, not a tag-filter survey.
- The service frame includes mode switch, case progress, candidate board, and final-service label.
- Catalogue coverage: at least 42 foods and 45 questions; current target is 46/46.
- One question and five answers are visible at a time during questioning.
- Answer click changes the visible character state and progress/candidate evidence.
- Reveal occurs in 6–12 answered questions.
- Reveal includes confidence, question count, and top-candidate gap evidence.
- Wrong guess suppresses the guessed food and continues recovery.
- Wrong recovery shows “오답도 단서입니다” and an optional actual-answer memo input.
- Mobile 390px has no horizontal overflow.
- Character is an original Korean food detective chef, not an Akinator-style genie.
- Browser console has no app errors.
- Live Pages canary must verify the cache-busted public URL, not only local build.
