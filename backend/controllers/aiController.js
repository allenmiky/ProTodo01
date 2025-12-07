import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new InferenceClient(process.env.HF_API_KEY);
const model = process.env.HF_MODEL_ID || "meta-llama/Llama-3.1-8B-Instruct";

export const generateTaskAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: "Prompt is required" 
      });
    }

    console.log("📥 AI Request:", prompt);

    // Detailed structured prompt
    const aiPrompt = `
Create a detailed, well-structured task plan based on: "${prompt}"

Return a COMPLETE JSON object with the following structure:

{
  "title": "Clear and concise task title (max 6-8 words)",
  "description": "Detailed description explaining the task objectives, requirements, and expected outcomes (3-4 sentences)",
  "subtasks": [
    "Step 1: Specific actionable subtask with clear objective",
    "Step 2: Specific actionable subtask with clear objective", 
    "Step 3: Specific actionable subtask with clear objective",
    "Step 4: Specific actionable subtask with clear objective"
  ],
  "due_in_days": 7,
  "priority": "medium",
  "category": "appropriate category"
}

Make sure:
- Title is short and descriptive
- Description is comprehensive and actionable  
- Subtasks are specific, sequential and achievable
- Provide realistic due_in_days (3-14 days)
- Priority can be "low", "medium", or "high"
- Category should match the task type

Task idea: ${prompt}
    `;

    const result = await hf.chatCompletion({
      model,
      messages: [
        { 
          role: "system", 
          content: `You are an expert project manager and task planner. 
          Always return detailed, structured, and actionable task plans.
          Provide comprehensive descriptions and specific subtasks.
          Return ONLY valid JSON format, no other text.` 
        },
        { 
          role: "user", 
          content: aiPrompt
        }
      ],
      max_tokens: 500, // Increased for detailed response
      temperature: 0.7,
    });

    const aiResponse = result?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return res.status(500).json({ 
        success: false, 
        message: "AI generation failed" 
      });
    }

    console.log("🤖 AI Raw Response:", aiResponse);

    // Parse JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn("AI didn't return proper JSON, using enhanced fallback");
      
      // Enhanced fallback with better structure
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const firstLine = lines[0] || `Task: ${prompt.slice(0, 40)}`;
      
      parsedData = {
        title: firstLine.length > 60 ? firstLine.substring(0, 60) : firstLine.replace(/["']/g, ''),
        description: `Detailed task: ${prompt}. This involves planning, execution, and review phases to ensure successful completion.`,
        subtasks: [
          "Research and gather all necessary information",
          "Create a detailed implementation plan", 
          "Execute the main task components",
          "Review work and make improvements",
          "Finalize and complete the task"
        ],
        due_in_days: 7,
        priority: "medium",
        category: "General"
      };
    }

    // Clean and validate data
    const cleanTitle = parsedData.title
      .split('.')[0]
      .replace(/["']/g, '')
      .substring(0, 80)
      .trim();

    const cleanDescription = parsedData.description || 
      `Comprehensive task plan for: ${prompt}. This includes detailed steps and requirements for successful completion.`;

    const cleanSubtasks = (parsedData.subtasks || [])
      .map((subtask, index) => {
        if (typeof subtask === 'string') {
          return { 
            title: subtask.length > 100 ? subtask.substring(0, 100) + '...' : subtask 
          };
        }
        return { 
          title: subtask.title || `Step ${index + 1}` 
        };
      })
      .slice(0, 6); // Max 6 subtasks

    // If no subtasks from AI, add meaningful ones
    if (cleanSubtasks.length === 0) {
      cleanSubtasks.push(
        { title: "Research and information gathering" },
        { title: "Planning and strategy development" },
        { title: "Execution of main task components" },
        { title: "Quality review and improvements" },
        { title: "Finalization and completion" }
      );
    }

    const response = {
      success: true,
      result: aiResponse,
      task: {
        title: cleanTitle,
        description: cleanDescription,
        subtasks: cleanSubtasks,
        due_in_days: parsedData.due_in_days || 7,
        priority: parsedData.priority || "medium",
        category: parsedData.category || "Planning"
      }
    };

    console.log("✅ Final Structured Response:", response.task);
    res.json(response);

  } catch (err) {
    console.error("❌ AI Controller Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};