/** @format */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "./ProgressContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Sample lesson content for Module 1, Lesson 1
const lessonContent: Record<string, any> = {
  "1.1": {
    title: "What is Money?",
    slides: [
      {
        type: "intro",
        content: {
          image: "🪙",
          text: "Hi! I'm Coinsworth 🪙. Let me tell you about MONEY!",
        },
      },
      {
        type: "content",
        content: {
          image: "💱",
          text: "Money is something we use to buy things we need and want. People trade money for toys, food, clothes, and more!",
        },
      },
      {
        type: "question",
        content: {
          question: "What can you buy with money?",
          options: [
            { id: "a", text: "🍎 Apple", correct: true },
            { id: "b", text: "☁️ Cloud", correct: false },
            { id: "c", text: "🎮 Video Game", correct: true },
          ],
          multiSelect: true,
        },
      },
      {
        type: "content",
        content: {
          image: "🏺",
          text: "Long ago, people traded shells, beads, and stones! Then they invented coins and paper money. Now we also have digital money!",
        },
      },
      {
        type: "content",
        content: {
          image: "💳",
          text: "Money comes in different forms: coins, notes, credit cards, and even digital payments on your phone!",
        },
      },
      {
        type: "question",
        content: {
          question: "Which of these is a type of money?",
          options: [
            { id: "a", text: "Coins", correct: true },
            { id: "b", text: "Rocks", correct: false },
            { id: "c", text: "Credit Card", correct: true },
            { id: "d", text: "Leaves", correct: false },
          ],
          multiSelect: true,
        },
      },
      {
        type: "story",
        content: {
          image: "🚲",
          story:
            "Raj wanted a bicycle. It cost ₹2000. He saved ₹200 every month from his pocket money. After 10 months, he had enough!",
          lesson: "Saving regularly helps you buy what you want!",
        },
      },
      {
        type: "completion",
        content: {
          message: "🎉 Lesson Complete!",
          xp: 50,
          badge: null,
        },
      },
    ],
  },
};

// Generate similar content for other lessons
const generateLessonContent = (moduleId: string, lessonId: string) => {
  const key = `${moduleId}.${lessonId}`;
  if (lessonContent[key]) return lessonContent[key];

  // Default lesson structure
  return {
    title: `Lesson ${key}`,
    slides: [
      {
        type: "intro",
        content: {
          image: "📚",
          text: `Welcome to Lesson ${key}! Let's learn something new!`,
        },
      },
      {
        type: "content",
        content: {
          image: "💡",
          text: "This is a sample lesson. In a full version, each lesson would have rich, educational content!",
        },
      },
      {
        type: "question",
        content: {
          question: "Sample question: What did we learn?",
          options: [
            { id: "a", text: "Important financial concepts", correct: true },
            { id: "b", text: "Nothing", correct: false },
          ],
        },
      },
      {
        type: "completion",
        content: {
          message: "🎉 Lesson Complete!",
          xp: 50,
        },
      },
    ],
  };
};

const Lesson = () => {
  const { moduleId, lessonId } = useParams();
  const { completeLesson } = useProgress();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [xpEarned, setXpEarned] = useState(0);

  const lesson = generateLessonContent(moduleId!, lessonId!);
  const progress = ((currentSlide + 1) / lesson.slides.length) * 100;
  const currentSlideData = lesson.slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Lesson complete
      completeLesson(parseInt(moduleId!), lessonId!);
      navigate("/learning");
    }
  };

  const handleAnswer = (
    slideIndex: number,
    answerId: string,
    multiSelect: boolean
  ) => {
    if (multiSelect) {
      const current = answers[slideIndex] || [];
      const newAnswers = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
      setAnswers({ ...answers, [slideIndex]: newAnswers });
    } else {
      setAnswers({ ...answers, [slideIndex]: [answerId] });

      // Auto-advance after feedback
      const slide = lesson.slides[slideIndex];
      const option = slide.content.options.find((o: any) => o.id === answerId);

      if (option?.correct) {
        setXpEarned(xpEarned + 10);
        toast.success("Correct! +10 XP");
        setTimeout(() => handleNext(), 1500);
      } else {
        toast.error("Not quite! Try again.");
      }
    }
  };

  const handleExit = () => {
    if (
      confirm("Are you sure you want to exit? Your progress will be saved.")
    ) {
      navigate("/learning");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{lesson.title}</h2>
            <Button variant="ghost" size="icon" onClick={handleExit}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Slide Content */}
        <Card className="p-8 min-h-[500px] flex flex-col items-center justify-center text-center animate-fade-in">
          {currentSlideData.type === "intro" && (
            <div className="space-y-6">
              <div className="text-8xl mb-4">
                {currentSlideData.content.image}
              </div>
              <p className="text-2xl font-medium">
                {currentSlideData.content.text}
              </p>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary hover:bg-primary/90 mt-8"
              >
                Continue
              </Button>
            </div>
          )}

          {currentSlideData.type === "content" && (
            <div className="space-y-6 max-w-2xl">
              <div className="text-7xl mb-6">
                {currentSlideData.content.image}
              </div>
              <p className="text-xl leading-relaxed">
                {currentSlideData.content.text}
              </p>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary hover:bg-primary/90 mt-8"
              >
                Next <ArrowRight className="ml-2" />
              </Button>
            </div>
          )}

          {currentSlideData.type === "question" && (
            <div className="space-y-6 w-full max-w-2xl">
              <p className="text-2xl font-semibold mb-6">
                {currentSlideData.content.question}
              </p>
              <div className="space-y-3">
                {currentSlideData.content.options.map((option: any) => {
                  const isSelected = answers[currentSlide]?.includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={`w-full p-6 text-lg justify-start ${
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      }`}
                      onClick={() =>
                        handleAnswer(
                          currentSlide,
                          option.id,
                          currentSlideData.content.multiSelect
                        )
                      }
                    >
                      {option.text}
                    </Button>
                  );
                })}
              </div>
              {currentSlideData.content.multiSelect &&
                answers[currentSlide]?.length > 0 && (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 mt-4"
                  >
                    Submit
                  </Button>
                )}
            </div>
          )}

          {currentSlideData.type === "story" && (
            <div className="space-y-6 max-w-2xl">
              <div className="text-7xl mb-6">
                {currentSlideData.content.image}
              </div>
              <p className="text-xl leading-relaxed mb-4">
                {currentSlideData.content.story}
              </p>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-semibold">
                  {currentSlideData.content.lesson}
                </p>
              </div>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary hover:bg-primary/90 mt-8"
              >
                Cool! <ArrowRight className="ml-2" />
              </Button>
            </div>
          )}

          {currentSlideData.type === "completion" && (
            <div className="space-y-6 animate-bounce-in">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold">
                {currentSlideData.content.message}
              </h2>
              <p className="text-2xl">
                You earned{" "}
                <span className="font-bold text-accent">
                  {currentSlideData.content.xp} XP
                </span>
                !
              </p>
              {currentSlideData.content.badge && (
                <div className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border-2 border-primary/30">
                  <p className="text-xl font-semibold mb-2">Badge Unlocked!</p>
                  <p className="text-3xl">{currentSlideData.content.badge}</p>
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/learning")}
                  variant="outline"
                  size="lg"
                >
                  Back to Path
                </Button>
                <Button
                  onClick={() => navigate(`/learning`)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Lesson;
