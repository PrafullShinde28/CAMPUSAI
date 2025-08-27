import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyPlanItem {
  title: string;
  description: string;
  duration: number;
  difficulty: "Low" | "Medium" | "High";
  priority: number;
}

export async function generateQuiz(subject: string, difficulty: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
  try {
    const prompt = `Generate ${numQuestions} multiple choice questions for ${subject} at ${difficulty} difficulty level. 
    Each question should have 4 options with only one correct answer.
    
    Respond with JSON in this exact format:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation of why this is correct"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctAnswer: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.questions;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to generate quiz: ${error}`);
  }
}

export async function generateStudyPlan(subjects: string[], availableHours: number, goals: string[]): Promise<StudyPlanItem[]> {
  try {
    const prompt = `Create a personalized study plan for the following subjects: ${subjects.join(", ")}.
    Available study time: ${availableHours} hours per week.
    Learning goals: ${goals.join(", ")}.
    
    Generate a structured study plan with specific tasks.
    
    Respond with JSON in this format:
    {
      "studyPlan": [
        {
          "title": "Task title",
          "description": "Detailed description of what to study",
          "duration": 60,
          "difficulty": "Medium",
          "priority": 1
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            studyPlan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration: { type: "number" },
                  difficulty: { type: "string" },
                  priority: { type: "number" }
                },
                required: ["title", "description", "duration", "difficulty", "priority"]
              }
            }
          },
          required: ["studyPlan"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.studyPlan;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to generate study plan: ${error}`);
  }
}

export async function explainConcept(concept: string, context: string = ""): Promise<string> {
  try {
    const prompt = `Explain the concept "${concept}" in a clear, educational way. 
    ${context ? `Context: ${context}` : ""}
    
    Make the explanation:
    - Easy to understand for students
    - Include relevant examples
    - Break down complex ideas into simpler parts
    - Highlight key points`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate explanation";
  } catch (error) {
    throw new Error(`Failed to explain concept: ${error}`);
  }
}

export async function analyzeStudyPerformance(quizResults: any[], studyHours: number): Promise<string> {
  try {
    const prompt = `Analyze this student's performance and provide recommendations:
    
    Quiz Results: ${JSON.stringify(quizResults)}
    Weekly Study Hours: ${studyHours}
    
    Provide:
    1. Performance analysis
    2. Areas for improvement
    3. Study strategies
    4. Motivation tips`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || "Unable to analyze performance";
  } catch (error) {
    throw new Error(`Failed to analyze performance: ${error}`);
  }
}
