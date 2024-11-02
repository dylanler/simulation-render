import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Ensure the API key is set in your environment variables
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    const prompt = `Create a p5.js simulation that simulates: ${description}. 
    The simulation should be realistic with proper physics and motion.
    This simulation should be a short video with no user interaction.
    Make the simulation up to 30 seconds long.
    When possible, include realistic physics like gravity, friction, and elasticity.
    The simulation should be a complete p5.js program with setup() and draw() functions.
    The simulation should contain graphics that aims to explain and have clear visualization.
    Important: Return ONLY the JavaScript code without any markdown formatting or explanation.
    The code should be a valid p5.js simulation that can be directly executed.
    Include all necessary variable declarations and initialization.
    Do not include let simulation = function(p) { ... } at the beginning of the code.
    In javascript comments, comment about the explanation and step by step animation sequence of the simulation at the beginning of the code.
    Explain why the animation was chosen and how it relates to the description.
    When rendering text, use 'Courier New' font with p5.js text functions and set it using p.textFont('Courier New').
    The code must use the 'p' parameter in the simulation function, and start with:

    function(p) {
      p.setup = function() {
        p.createCanvas(800, 800);  // Set specific width and height
        p.textFont('Courier New'); // Set default font
        // additional setup code
      };
      p.draw = function() {
        // draw code
      };
    }`;

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!msg.content || msg.content.length === 0) {
      return NextResponse.json(
        { error: 'No content received from AI' },
        { status: 500 }
      );
    }

    // Get the first content block
    const content = Array.isArray(msg.content) ? msg.content[0] : msg.content;
    const sketch = content.text || content;

    // Validation prompt for the generated code
    const validationPrompt = `Review this p5.js code and verify that it:
    1. Properly implements the requested simulation: "${description}"
    2. Make sure the simulation and animation code is accurate and realistic.
    3. Add stylistic elements to make the simulation more visually appealing but make sure that the logic and accuracy of the simulation is not compromised.
    4. Make sure the simulation is between 10 to 30 seconds long without any user interaction.
    5. Is a complete, valid p5.js program
    6. Uses the 'p' parameter correctly
    7. Has proper setup() and draw() functions
    8. Ensure that all the objects drawn are at the right position, pay attention to the position of each object and make sure they are accurate.
    9. Contains all necessary variable declarations
    10. Uses 'Courier New' font for all text elements
    
    Here's the code to review:
    ${sketch}
    
    If there are any issues, explain them. and then make the necessary improvements.
    Return the full code with the improvements.
    Make sure all comments are in javascript comments and does not affect the code
    Important: Return ONLY the JavaScript code without any markdown formatting or explanation.
    The code should be a valid p5.js simulation that can be directly executed.
    Include all necessary variable declarations and initialization.
    Do not include let simulation = function(p) { ... } at the beginning of the code.
    The code must use the 'p' parameter in the simulation function, and start with:

    function(p) {
      p.setup = function() {
        p.createCanvas(800, 800);  // Set specific width and height
        p.textFont('Courier New'); // Set default font
        // additional setup code
      };
      p.draw = function() {
        // draw code
      };
    }
    `;

    const validation = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [{ role: 'user', content: validationPrompt }],
    });

    // Get the first content block
    const validationContent = Array.isArray(validation.content)
      ? validation.content[0]
      : validation.content; 
    const validationResponse = validationContent.text || validationContent;

    // Clean up the sketch code only after validation
    let cleanSketch = sketch
      .replace(/```javascript/g, '')
      .replace(/```js/g, '')
      .replace(/```/g, '')
      .trim();

    // Ensure the sketch is wrapped in a function(p) {...} if it isn't already
    if (!cleanSketch.includes('function(p)')) {
      cleanSketch = `function(p) {
        ${cleanSketch}
      }`;
    }

    if (!cleanSketch) {
      return NextResponse.json(
        { error: 'No valid sketch code generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sketch: cleanSketch });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate simulation' },
      { status: 500 }
    );
  }
}
