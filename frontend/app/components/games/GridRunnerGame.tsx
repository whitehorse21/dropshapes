"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Play } from "lucide-react";
import {
  GameContainer,
  GameCard,
  GameButton,
  StatBadge,
  BackButton,
  GameOverModal,
} from "@/app/components/GameUI";
import { useRouter } from "next/navigation";

interface Gate {
  id: number;
  question: string;
  correctAnswer: number;
  y: number;
  /** Answer values per lane (order fixed when gate is created so they don't blink) */
  laneAnswers: number[];
}

export default function GridRunnerGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameOver">(
    "idle",
  );
  const [playerLane, setPlayerLane] = useState(1);
  const [score, setScore] = useState(0);
  const [gates, setGates] = useState<Gate[]>([]);
  const [speed, setSpeed] = useState(0.9);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const gateIdCounter = useRef(0);

  const generateQuestion = () => {
    const operations = ["+", "-", "×"];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;

    if (op === "+") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      answer = a * b;
    }

    return { question: `${a} ${op} ${b}`, correctAnswer: answer };
  };

  const shuffleLaneAnswers = (correctAnswer: number): number[] => {
    const answers = [correctAnswer - 2, correctAnswer, correctAnswer + 3];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  };

  const generateGate = (): Gate => {
    const { question, correctAnswer } = generateQuestion();
    return {
      id: gateIdCounter.current++,
      question,
      correctAnswer,
      y: -100,
      laneAnswers: shuffleLaneAnswers(correctAnswer),
    };
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setPlayerLane(1);
    setSpeed(1.2);
    setGates([generateGate()]);
    gateIdCounter.current = 0;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowLeft" && playerLane > 0)
        setPlayerLane((prev) => prev - 1);
      else if (e.key === "ArrowRight" && playerLane < 2)
        setPlayerLane((prev) => prev + 1);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, playerLane]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      setGates((prevGates) => {
        const newGates = prevGates.map((gate) => ({
          ...gate,
          y: gate.y + speed,
        }));
        const playerY = 400;

        newGates.forEach((gate) => {
          if (gate.y >= playerY - 30 && gate.y <= playerY + 30) {
            if (gate.laneAnswers[playerLane] === gate.correctAnswer) {
              setScore((prev) => prev + 10);
              setSpeed((prev) => Math.min(prev + 0.04, 2.2));
            } else {
              setGameState("gameOver");
            }
          }
        });

        const filtered = newGates.filter((gate) => gate.y < 500);
        if (filtered.length === 0 || filtered[filtered.length - 1].y > 100) {
          filtered.push(generateGate());
        }
        return filtered;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, speed, playerLane]);

  return (
    <GameContainer>
      <BackButton onClick={() => router.back()} />

      {gameState === "idle" && (
        <GameCard title="Grid Runner" icon={<Zap className="w-6 h-6" />}>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500/25 to-cyan-500/25 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border border-blue-400/20 shadow-lg shadow-blue-500/20">
              🏃‍♂️
            </div>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Solve math problems while running! Use{" "}
              <kbd className="px-2 py-1 bg-slate-800/80 rounded-lg border border-white/10 text-sm font-mono">
                ←
              </kbd>{" "}
              and{" "}
              <kbd className="px-2 py-1 bg-slate-800/80 rounded-lg border border-white/10 text-sm font-mono">
                →
              </kbd>{" "}
              to pick the right lane.
            </p>
            <GameButton variant="primary" onClick={startGame}>
              <Play className="w-5 h-5" /> Start Game
            </GameButton>
          </div>
        </GameCard>
      )}

      {gameState === "playing" && (
        <>
          <div className="flex gap-4 mb-6">
            <StatBadge label="Score" value={score} />
          </div>

          <GameCard>
            <div className="relative w-full min-h-[280px] h-[50vmin] sm:min-h-[360px] sm:h-[400px] md:h-[500px] max-h-[90vw] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex">
                {[0, 1, 2].map((lane) => (
                  <div
                    key={lane}
                    className="flex-1 border-r border-slate-800 last:border-r-0"
                  />
                ))}
              </div>

              <div
                className="absolute bottom-16 sm:bottom-20 w-1/3 h-12 sm:h-16 flex items-center justify-center transition-all duration-200"
                style={{ left: `${playerLane * 33.33}%` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/50 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🏃</span>
                </div>
              </div>

              {gates.map((gate) => (
                <div
                  key={gate.id}
                  className="absolute w-full flex"
                  style={{ top: `${gate.y}px` }}
                >
                  <div className="absolute -top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-600 max-w-[95%]">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {gate.question} = ?
                    </span>
                  </div>
                  {gate.laneAnswers.map((answer, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-12 sm:h-16 flex items-center justify-center border-2 ${
                        answer === gate.correctAnswer
                          ? "bg-green-900/30 border-green-500"
                          : "bg-red-900/30 border-red-500"
                      }`}
                    >
                      <span className="text-lg sm:text-2xl font-bold text-white">
                        {answer}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </GameCard>
        </>
      )}

      {gameState === "gameOver" && (
        <GameOverModal score={score} onRestart={startGame} />
      )}
    </GameContainer>
  );
}
