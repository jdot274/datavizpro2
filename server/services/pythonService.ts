import { spawn } from 'child_process';
import { PythonResult } from '../../client/src/types';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Execute Python code and return the result
 * This service uses a child process to run Python code
 */
export async function executePythonCode(code: string): Promise<PythonResult> {
  try {
    // Validate the Python code
    if (!code || code.trim() === '') {
      return {
        success: false,
        error: 'No Python code provided'
      };
    }

    // Create a temporary file with the Python code
    const tempDir = os.tmpdir();
    const scriptId = randomUUID();
    const scriptPath = path.join(tempDir, `viz_script_${scriptId}.py`);
    
    // Format the Python code to ensure it returns JSON result
    const formattedCode = formatPythonCode(code);
    
    // Write code to temporary file
    await fs.promises.writeFile(scriptPath, formattedCode);

    // Run the Python script
    const result = await runPythonScript(scriptPath);
    
    // Clean up the temporary file
    try {
      await fs.promises.unlink(scriptPath);
    } catch (error) {
      console.error('Error cleaning up temporary Python script:', error);
    }
    
    return result;
  } catch (error) {
    console.error('Error executing Python code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error executing Python code'
    };
  }
}

/**
 * Format the Python code to ensure it returns the expected output format
 */
function formatPythonCode(code: string): string {
  // Add necessary imports if they don't exist
  let formattedCode = '';
  
  if (!code.includes('import numpy')) {
    formattedCode += 'import numpy as np\n';
  }
  
  if (!code.includes('import json')) {
    formattedCode += 'import json\n';
  }
  
  formattedCode += code;
  
  // Add output formatting code at the end
  const outputCode = `

# Ensure data is properly formatted for visualization
try:
    data_array = np.array(data)
    data_shape = data_array.shape
    
    # Output data in JSON format
    result = {
        'success': True,
        'data': data_array.tolist() if hasattr(data_array, 'tolist') else data,
    }
    
    # Calculate dimensions
    if len(data_shape) == 2:  # 2D array (matrix/grid)
        result['dimensions'] = {
            'xRange': [0, data_shape[0] - 1],
            'yRange': [0, data_shape[1] - 1],
            'zRange': [float(np.min(data_array)), float(np.max(data_array))]
        }
    elif len(data_shape) == 1:  # 1D array
        result['dimensions'] = {
            'xRange': [0, data_shape[0] - 1],
            'yRange': [0, 0],
            'zRange': [float(np.min(data_array)), float(np.max(data_array))]
        }
    else:  # Other shapes (3D, etc.)
        result['dimensions'] = {
            'xRange': [0, data_shape[0] - 1],
            'yRange': [0, data_shape[1] - 1 if len(data_shape) > 1 else 0],
            'zRange': [float(np.min(data_array)), float(np.max(data_array))]
        }
    
    # Include metadata if available
    metadata = {}
    try:
        metadata['title'] = title
    except NameError:
        metadata['title'] = 'Python Data Visualization'
        
    try:
        metadata['xLabel'] = x_label
    except NameError:
        metadata['xLabel'] = 'X'
        
    try:
        metadata['yLabel'] = y_label
    except NameError:
        metadata['yLabel'] = 'Y'
        
    try:
        metadata['zLabel'] = z_label
    except NameError:
        metadata['zLabel'] = 'Z'
    
    result['metadata'] = metadata
    
    print(json.dumps(result))
except Exception as e:
    error_result = {
        'success': False,
        'error': str(e)
    }
    print(json.dumps(error_result))
`;

  return formattedCode + outputCode;
}

/**
 * Run a Python script as a child process and capture the output
 */
async function runPythonScript(scriptPath: string): Promise<PythonResult> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python', [scriptPath]);
    
    let outputData = '';
    let errorData = '';
    
    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        // Process exited with error
        resolve({
          success: false,
          error: `Python process exited with code ${code}: ${errorData}`
        });
        return;
      }
      
      if (errorData) {
        // There was error output
        resolve({
          success: false,
          error: errorData
        });
        return;
      }
      
      try {
        // Try to parse the output as JSON
        const result = JSON.parse(outputData);
        resolve(result);
      } catch (error) {
        // Failed to parse JSON output
        resolve({
          success: false,
          error: `Failed to parse Python output: ${outputData.substring(0, 200)}${outputData.length > 200 ? '...' : ''}`
        });
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

/**
 * Validate Python code before execution
 */
export function validatePythonCode(code: string): { isValid: boolean; error?: string } {
  // Check if the code is empty
  if (!code.trim()) {
    return { isValid: false, error: "Python code cannot be empty" };
  }
  
  // Basic security checks
  const dangerousPatterns = [
    'os.system(',
    'subprocess',
    '__import__("os")',
    'exec(',
    'eval(',
    'importlib',
    'open(',
    'write(',
    'shutil.rmtree',
    'unlink'
  ];
  
  for (const pattern of dangerousPatterns) {
    if (code.includes(pattern)) {
      return { 
        isValid: false, 
        error: `Code contains potentially unsafe operations: ${pattern}` 
      };
    }
  }
  
  // Check for a data variable
  if (!code.includes("data")) {
    return { 
      isValid: false, 
      error: "Code should define a 'data' variable containing the visualization data" 
    };
  }
  
  return { isValid: true };
}
