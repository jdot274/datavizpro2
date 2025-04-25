// This is a client-side wrapper around the server Python execution API
// The actual Python execution will be done on the server

// Helper to validate Python code before sending to server
export function validatePythonCode(code: string): { isValid: boolean; error?: string } {
  // Check if the code is empty
  if (!code.trim()) {
    return { isValid: false, error: "Python code cannot be empty" };
  }
  
  // Basic sanity checks
  if (!code.includes("import numpy") && !code.includes("import pandas")) {
    return { 
      isValid: false, 
      error: "Code should import numpy or pandas for data visualization" 
    };
  }
  
  // Check for a data variable
  if (!code.includes("data =")) {
    return { 
      isValid: false, 
      error: "Code should define a 'data' variable containing the visualization data" 
    };
  }
  
  return { isValid: true };
}

// Format Python code with expected output structure
export function formatPythonCode(code: string): string {
  // Add imports if they don't exist
  let formattedCode = code;
  
  if (!formattedCode.includes("import numpy")) {
    formattedCode = "import numpy as np\n" + formattedCode;
  }
  
  if (!formattedCode.includes("import json")) {
    formattedCode = "import json\n" + formattedCode;
  }
  
  // Add output formatting code
  const outputCode = `
# Output data in JSON format
result = {
    'data': data.tolist() if hasattr(data, 'tolist') else data,
    'dimensions': {
        'xRange': [float(np.min(data, axis=(0, 1))[0]) if len(np.array(data).shape) > 2 else float(np.min(data)),
                  float(np.max(data, axis=(0, 1))[0]) if len(np.array(data).shape) > 2 else float(np.max(data))],
        'yRange': [float(np.min(data, axis=(0, 1))[1]) if len(np.array(data).shape) > 2 else 0.0,
                  float(np.max(data, axis=(0, 1))[1]) if len(np.array(data).shape) > 2 else float(len(data))],
        'zRange': [float(np.min(data)) if len(np.array(data).shape) > 1 else 0.0,
                  float(np.max(data)) if len(np.array(data).shape) > 1 else float(np.max(data))]
    }
}

# If variables exist, add them to metadata
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
`;

  return formattedCode + "\n\n" + outputCode;
}
