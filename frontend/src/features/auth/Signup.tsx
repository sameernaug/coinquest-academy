/** @format */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";

const quizQuestions = [
  {
    q: "What does 'saving money' mean?",
    options: [
      { id: "a", text: "Keeping money safe for later", correct: true },
      { id: "b", text: "Spending all your money", correct: false },
      { id: "c", text: "Giving money to friends", correct: false },
    ],
  },
  {
    q: "If you have ₹100 and spend ₹30, how much is left?",
    options: [
      { id: "a", text: "₹130", correct: false },
      { id: "b", text: "₹70", correct: true },
      { id: "c", text: "₹30", correct: false },
    ],
  },
  {
    q: "What is a 'budget'?",
    options: [
      { id: "a", text: "A type of coin", correct: false },
      { id: "b", text: "A plan for spending money", correct: true },
      { id: "c", text: "A bank account", correct: false },
    ],
  },
  {
    q: "What does 'investing' mean?",
    options: [
      { id: "a", text: "Buying toys", correct: false },
      { id: "b", text: "Putting money somewhere to grow it", correct: true },
      { id: "c", text: "Hiding money under bed", correct: false },
    ],
  },
  {
    q: "What is a 'stock'?",
    options: [
      { id: "a", text: "A piece of ownership in a company", correct: true },
      { id: "b", text: "A type of food", correct: false },
      { id: "c", text: "A savings account", correct: false },
    ],
  },
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    grade: "",
    school: "",
  });
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const progress = (step / 4) * 100;

  const handleNext = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast.error("Please fill all fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }
    if (step === 2) {
      if (!formData.age || !formData.grade || !formData.school) {
        toast.error("Please fill all fields");
        return;
      }
    }
    if (step === 3) {
      if (quizAnswers.length < 5) {
        toast.error("Please answer all questions");
        return;
      }
    }
    if (step === 4) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const correctAnswers = quizAnswers.filter(
      (ans, i) => quizQuestions[i].options.find((o) => o.id === ans)?.correct
    ).length;

    let knowledgeLevel = "Beginner";
    if (correctAnswers >= 5) knowledgeLevel = "Advanced";
    else if (correctAnswers >= 3) knowledgeLevel = "Intermediate";

    signup(
      {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        grade: formData.grade,
        school: formData.school,
        knowledgeLevel,
      },
      formData.password
    );

    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl p-8 animate-scale-in">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Join MoneyMaster! 🎉</h1>
            <span className="text-sm text-muted-foreground">Step {step}/4</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">Tell Us About You</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="10"
                  max="25"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Your age"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade/Class</Label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select grade</option>
                  <option value="5th">5th Grade</option>
                  <option value="6th">6th Grade</option>
                  <option value="7th">7th Grade</option>
                  <option value="8th">8th Grade</option>
                  <option value="9th">9th Grade</option>
                  <option value="10th">10th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="12th">12th Grade</option>
                  <option value="college">College</option>
                </select>
              </div>
              <div>
                <Label htmlFor="school">School/College Name</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                  placeholder="Your school name"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">Quick Knowledge Check 🧠</h2>
            <p className="text-sm text-muted-foreground">
              Answer these 5 questions to help us understand your level
            </p>
            <div className="space-y-6">
              {quizQuestions.map((question, i) => (
                <div key={i} className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-3">
                    Q{i + 1}: {question.q}
                  </p>
                  <RadioGroup
                    value={quizAnswers[i]}
                    onValueChange={(val) => {
                      const newAnswers = [...quizAnswers];
                      newAnswers[i] = val;
                      setQuizAnswers(newAnswers);
                    }}
                  >
                    {question.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <RadioGroupItem value={opt.id} id={`q${i}-${opt.id}`} />
                        <Label
                          htmlFor={`q${i}-${opt.id}`}
                          className="cursor-pointer"
                        >
                          {opt.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">Welcome, {formData.name}!</h2>
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-lg mb-2">You're starting at:</p>
              <p className="text-3xl font-bold text-primary mb-4">
                {quizAnswers.filter(
                  (ans, i) =>
                    quizQuestions[i].options.find((o) => o.id === ans)?.correct
                ).length >= 5
                  ? "Advanced"
                  : quizAnswers.filter(
                      (ans, i) =>
                        quizQuestions[i].options.find((o) => o.id === ans)
                          ?.correct
                    ).length >= 3
                  ? "Intermediate"
                  : "Beginner"}{" "}
                Level
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">XP</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹500</p>
                  <p className="text-sm text-muted-foreground">
                    Starting Balance
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Let's Begin! <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2" /> Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Next <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
