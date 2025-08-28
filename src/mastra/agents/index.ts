import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools";
import { weatherWorkflow } from "../workflows/step1";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: openai("gpt-4o"),
  tools: { weatherTool },
});

export const synthesizeAgent = new Agent({
  name: "synthesizeAgent",
  model: openai("gpt-4o"),
  instructions: `
  You are given two different blocks of text, one about indoor activities and one about outdoor activities.
  Make this into a full report about the day and the possibilities depending on whether it rains or not.
  `,
});

export const activityPlannerAgent = new Agent({
  name: "activityPlannerAgent",
  model: openai("gpt-4o"),
  instructions: `
  You are an activity planner. You have access to a tool that will help you get weather-specific activities for any city. The tool uses agents to plan the activities, you just need to provide the city. Whatever information you get back, return it as is and add your own thoughts on top of it.
  `,
  workflows: {
    weatherWorkflow,
  },
});

export const weatherReporterAgent = new Agent({
  name: "weatherExplainerAgent",
  model: openai("gpt-4o"),
  instructions: `
  You are an weather explainer. You have access to input that will help you get weather-specific activities for any city. The tool uses agents to plan the activities, you just need to provide the city. Explain the weather report like a weather reporter.
  `,
});
