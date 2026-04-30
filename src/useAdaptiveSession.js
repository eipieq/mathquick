import { useState, useEffect, useRef, useCallback } from "react";
import { useLearner } from "./adaptive/useLearner.js";
import { selectNext } from "./adaptive/selector.js";
import { generateQuestion } from "./adaptive/questionGenerator.js";

export function useAdaptiveSession(mode, apiKey) {
  const { learner, recordAttempt, resetLearner } = useLearner();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionCount = useRef(0);
  const seenTexts = useRef(new Set());

  // generate a question for the given learner state
  async function generate(learnerState) {
    const { skillKey, level } = selectNext(learnerState);
    return generateQuestion({ skillKey, level, mode, apiKey, seenTexts: seenTexts.current });
  }

  // load first question on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    generate(learner)
      .then((q) => {
        if (!cancelled) {
          seenTexts.current.add(q.text);
          setCurrentQuestion(q);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []); // only on mount

  // pre-generate next question in the background
  async function prefetchNext(updatedLearner) {
    try {
      const q = await generate(updatedLearner);
      // only store if not already seen (race condition guard)
      if (!seenTexts.current.has(q.text)) {
        setNextQuestion(q);
      }
    } catch {
      // prefetch failure is silent — advance() will try again
    }
  }

  // called by GameScreen when a question resolves
  const advance = useCallback(
    (correct, responseMs) => {
      if (!currentQuestion) return;

      // record result and get updated learner
      recordAttempt(currentQuestion.skillKey, correct, responseMs);
      sessionCount.current += 1;

      // if we pre-fetched a next question, use it immediately
      if (nextQuestion) {
        seenTexts.current.add(nextQuestion.text);
        setCurrentQuestion(nextQuestion);
        setNextQuestion(null);
        prefetchNext(learner);
      } else {
        setIsLoading(true);
        generate(learner)
          .then((q) => {
            seenTexts.current.add(q.text);
            setCurrentQuestion(q);
            setIsLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setIsLoading(false);
          });
      }
    },
    [currentQuestion, nextQuestion, learner, recordAttempt]
  );

  return {
    currentQuestion,
    isLoading,
    error,
    advance,
    learner,
    resetLearner,
    sessionCount: sessionCount.current,
  };
}
