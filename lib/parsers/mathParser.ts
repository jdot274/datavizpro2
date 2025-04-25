import { FormulaInput } from "../../types";

// We'll use a simple math expression evaluator
// In a real app, you might want to use a library like math.js
function evaluateExpression(expression: string, x: number, y: number): number {
  // Replace variables with their values
  const preparedExpression = expression
    .replace(/x/g, x.toString())
    .replace(/y/g, y.toString());

  try {
    // Use Function constructor to evaluate the expression safely
    // This avoids using eval() directly
    const func = new Function(`return ${preparedExpression}`);
    return func();
  } catch (error) {
    console.error("Error evaluating expression:", error);
    throw new Error(`Could not evaluate expression: ${expression}`);
  }
}

// Generate 3D data points from a mathematical formula
export async function evaluateFormula(input: FormulaInput) {
  try {
    const { expression, variables } = input;
    const { x: xVar, y: yVar } = variables;

    // Create data grid
    const data: number[][] = [];
    const xValues: number[] = [];
    const yValues: number[] = [];
    const zValues: number[] = [];

    // Calculate step sizes
    const xStep = (xVar.max - xVar.min) / (xVar.steps - 1);
    const yStep = (yVar.max - yVar.min) / (yVar.steps - 1);

    // Generate x, y grid and evaluate z values
    for (let i = 0; i < xVar.steps; i++) {
      const x = xVar.min + i * xStep;
      xValues.push(x);
      
      const row: number[] = [];
      for (let j = 0; j < yVar.steps; j++) {
        const y = yVar.min + j * yStep;
        if (i === 0) yValues.push(y);
        
        const z = evaluateExpression(expression, x, y);
        row.push(z);
        zValues.push(z);
      }
      data.push(row);
    }

    // Calculate ranges for visualization
    const xRange: [number, number] = [Math.min(...xValues), Math.max(...xValues)];
    const yRange: [number, number] = [Math.min(...yValues), Math.max(...yValues)];
    const zRange: [number, number] = [Math.min(...zValues), Math.max(...zValues)];

    return {
      success: true,
      data,
      dimensions: {
        xRange,
        yRange,
        zRange
      }
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error evaluating formula"
    };
  }
}

// Parse LaTeX format (simplified)
export function parseLatex(latex: string): string {
  // This is a very simplified LaTeX parser
  // In a real application, you'd want a more robust parser
  
  // Replace common LaTeX math operations
  return latex
    .replace(/\\sin/g, 'Math.sin')
    .replace(/\\cos/g, 'Math.cos')
    .replace(/\\tan/g, 'Math.tan')
    .replace(/\\exp/g, 'Math.exp')
    .replace(/\\log/g, 'Math.log')
    .replace(/\\sqrt/g, 'Math.sqrt')
    .replace(/\\pi/g, 'Math.PI')
    .replace(/\^/g, '**');  // Exponentiation
}
