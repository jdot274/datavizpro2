#!/usr/bin/env python3
"""
Enhanced Data Service for Data Visualization
This service provides advanced data processing capabilities for the visualization platform
using libraries like pandas, numpy, scipy, and matplotlib.
"""
import sys
import json
import os
from typing import Dict, List, Any, Tuple, Optional

import pandas as pd
import numpy as np
from scipy import stats
from scipy import signal
from scipy import ndimage
from scipy.optimize import curve_fit
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import statsmodels.api as sm

class EnhancedDataService:
    """
    Provides advanced data processing and analysis functions for the visualization platform.
    """
    
    @staticmethod
    def process_excel_data(file_content: bytes, sheet_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Process Excel file data with advanced pandas functionality
        
        Args:
            file_content: The binary content of the Excel file
            sheet_name: The name of the sheet to process (optional)
            
        Returns:
            Dictionary with processed data and metadata
        """
        try:
            # Read Excel file into pandas DataFrame
            if sheet_name and sheet_name.strip():
                df = pd.read_excel(file_content, sheet_name=sheet_name)
            else:
                df = pd.read_excel(file_content)
                
            # Analyze the dataframe and return processed data
            return EnhancedDataService._analyze_dataframe(df)
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing Excel file: {str(e)}"
            }
    
    @staticmethod
    def _analyze_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze a pandas DataFrame and determine the best visualization
        
        Args:
            df: The pandas DataFrame to analyze
            
        Returns:
            Dictionary with processed data and visualization recommendations
        """
        # Check if dataframe contains numeric data
        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        
        if len(numeric_cols) < 2:
            return {
                "success": False,
                "error": "Not enough numeric columns for visualization"
            }
        
        # Determine if we have a grid dataset or a tabular dataset
        if EnhancedDataService._is_grid_data(df):
            return EnhancedDataService._process_grid_data(df)
        else:
            return EnhancedDataService._process_tabular_data(df)
    
    @staticmethod
    def _is_grid_data(df: pd.DataFrame) -> bool:
        """Check if data appears to be in a grid format suitable for surface plots"""
        # Grid data typically has a first column of unique values (y-axis)
        # and headers representing the x-axis values
        if len(df.columns) < 3:
            return False
            
        # Check if first column values are unique and numeric
        first_col = df.iloc[:, 0]
        if not pd.api.types.is_numeric_dtype(first_col):
            return False
            
        if len(first_col) != len(first_col.unique()):
            return False
            
        # Check if the rest of the data is numeric
        data_cols = df.iloc[:, 1:]
        return data_cols.dtypes.apply(lambda x: pd.api.types.is_numeric_dtype(x)).all()
    
    @staticmethod
    def _process_grid_data(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Process data that appears to be in a grid format (good for surface plots)
        
        Args:
            df: The pandas DataFrame with numeric data
            
        Returns:
            Dictionary with processed data for visualization
        """
        try:
            # Get x-axis values from column headers
            if pd.api.types.is_numeric_dtype(df.columns[1:]):
                x_values = df.columns[1:].astype(float)
            else:
                x_values = np.arange(len(df.columns[1:]))
                
            # Get y-axis values from first column
            y_values = df.iloc[:, 0].values
            
            # Convert to numpy array for z values (the grid data)
            z_values = df.iloc[:, 1:].values
            
            # Create a dense grid using interpolation
            x_dense = np.linspace(min(x_values), max(x_values), 100)
            y_dense = np.linspace(min(y_values), max(y_values), 100)
            x_grid, y_grid = np.meshgrid(x_dense, y_dense)
            
            # Apply smoothing to the data
            z_smooth = ndimage.gaussian_filter(z_values, sigma=1)
            
            # Get dimensions for visualization
            x_range = [float(min(x_values)), float(max(x_values))]
            y_range = [float(min(y_values)), float(max(y_values))]
            z_range = [float(np.nanmin(z_values)), float(np.nanmax(z_values))]
            
            # Create 2D array output format [[x, y, z], ...] for visualization
            result_data = []
            for i in range(len(y_values)):
                for j in range(len(x_values)):
                    result_data.append([float(x_values[j]), float(y_values[i]), float(z_values[i, j])])
            
            # Enhanced statistical analysis
            mean_value = float(np.nanmean(z_values))
            median_value = float(np.nanmedian(z_values))
            std_dev = float(np.nanstd(z_values))
            
            # Determine appropriate column labels
            x_label = df.columns[1] if isinstance(df.columns[1], str) else "X"
            y_label = df.columns[0] if isinstance(df.columns[0], str) else "Y"
            z_label = "Value"
            
            return {
                "data": result_data,
                "dimensions": {
                    "xRange": x_range,
                    "yRange": y_range,
                    "zRange": z_range
                },
                "metadata": {
                    "title": "Enhanced Surface Visualization",
                    "xLabel": x_label,
                    "yLabel": y_label,
                    "zLabel": z_label
                },
                "stats": {
                    "mean": mean_value,
                    "median": median_value,
                    "std": std_dev
                },
                "recommendations": {
                    "visualizationType": "surface",
                    "useSmoothing": True,
                    "enhancedLighting": True
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing grid data: {str(e)}"
            }
    
    @staticmethod
    def _process_tabular_data(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Process data that appears to be in a tabular format with headers
        
        Args:
            df: The pandas DataFrame
            
        Returns:
            Dictionary with processed data for visualization
        """
        try:
            # Get numeric columns only
            numeric_df = df.select_dtypes(include=np.number)
            
            if numeric_df.shape[1] < 2:
                return {
                    "success": False,
                    "error": "Not enough numeric columns for visualization (at least 2 required)"
                }
                
            # Determine if we have time series data
            has_date_col = any(pd.api.types.is_datetime64_dtype(df[col]) for col in df.columns)
            
            # Select appropriate columns for visualization based on data types
            if has_date_col:
                # Get the date column
                date_col = next(col for col in df.columns if pd.api.types.is_datetime64_dtype(df[col]))
                
                # Sort by date
                df = df.sort_values(by=date_col)
                
                # Time series with first numeric column
                numeric_col = numeric_df.columns[0]
                
                # Create data points format [[x, y], [x, y], ...]
                x_values = np.arange(len(df))
                y_values = df[numeric_col].values
                result_data = [[float(x), float(y)] for x, y in zip(x_values, y_values)]
                
                # Get range for the numeric column
                y_range = [float(df[numeric_col].min()), float(df[numeric_col].max())]
                
                # Set metadata
                title = f"{numeric_col} over time"
                x_label = date_col
                y_label = numeric_col
                
                recommendations = {
                    "visualizationType": "line",
                    "useSmoothing": True,
                    "connectNulls": True
                }
                
            else:
                # Use first two numeric columns for x and y
                x_col = numeric_df.columns[0]
                y_col = numeric_df.columns[1]
                
                # Create data points format [[x, y], [x, y], ...]
                result_data = [[float(x), float(y)] for x, y in zip(df[x_col], df[y_col])]
                
                # Get ranges
                x_range = [float(df[x_col].min()), float(df[x_col].max())]
                y_range = [float(df[y_col].min()), float(df[y_col].max())]
                
                # Set metadata
                title = f"{y_col} vs {x_col}"
                x_label = x_col
                y_label = y_col
                
                # Check correlation to recommend visualization type
                correlation = df[x_col].corr(df[y_col])
                if abs(correlation) > 0.7:
                    recommendations = {
                        "visualizationType": "scatter",
                        "showTrendline": True,
                        "showConfidenceInterval": True
                    }
                else:
                    recommendations = {
                        "visualizationType": "scatter",
                        "showTrendline": False
                    }
            
            return {
                "data": result_data,
                "dimensions": {
                    "xRange": x_range if 'x_range' in locals() else [0, len(result_data) - 1],
                    "yRange": y_range,
                    "zRange": [0, 0]  # Not applicable for 2D data
                },
                "metadata": {
                    "title": title,
                    "xLabel": x_label,
                    "yLabel": y_label
                },
                "recommendations": recommendations
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing tabular data: {str(e)}"
            }
    
    @staticmethod
    def perform_statistical_analysis(data: List[List[float]]) -> Dict[str, Any]:
        """
        Perform statistical analysis on the provided data
        
        Args:
            data: 2D array of data points
            
        Returns:
            Dictionary with statistical analysis results
        """
        try:
            # Convert data to numpy arrays
            data_np = np.array(data)
            
            # Check data shape to determine what kind of analysis to perform
            if len(data_np.shape) == 2:
                # 2D data - each row is a data point with multiple dimensions
                if data_np.shape[1] == 2:
                    # Scatter plot data (x, y) pairs
                    x = data_np[:, 0]
                    y = data_np[:, 1]
                    
                    # Basic statistics for both columns
                    result = {
                        "column_0": {
                            "mean": float(np.mean(x)),
                            "median": float(np.median(x)),
                            "std": float(np.std(x)),
                            "min": float(np.min(x)),
                            "max": float(np.max(x)),
                            "variance": float(np.var(x)),
                            "percentiles": {
                                "25": float(np.percentile(x, 25)),
                                "50": float(np.percentile(x, 50)),
                                "75": float(np.percentile(x, 75)),
                                "90": float(np.percentile(x, 90))
                            }
                        },
                        "column_1": {
                            "mean": float(np.mean(y)),
                            "median": float(np.median(y)),
                            "std": float(np.std(y)),
                            "min": float(np.min(y)),
                            "max": float(np.max(y)),
                            "variance": float(np.var(y)),
                            "percentiles": {
                                "25": float(np.percentile(y, 25)),
                                "50": float(np.percentile(y, 50)),
                                "75": float(np.percentile(y, 75)),
                                "90": float(np.percentile(y, 90))
                            }
                        },
                        # Relationship statistics
                        "correlation": {
                            "pearson": float(np.corrcoef(x, y)[0, 1]),
                            "spearman": float(stats.spearmanr(x, y)[0])
                        }
                    }
                    
                elif data_np.shape[1] > 2:
                    # Multi-column data - perform analysis on each column
                    result = {}
                    for i in range(data_np.shape[1]):
                        col_data = data_np[:, i]
                        result[f"column_{i}"] = {
                            "mean": float(np.mean(col_data)),
                            "median": float(np.median(col_data)),
                            "std": float(np.std(col_data)),
                            "min": float(np.min(col_data)),
                            "max": float(np.max(col_data)),
                            "variance": float(np.var(col_data)),
                            "percentiles": {
                                "25": float(np.percentile(col_data, 25)),
                                "50": float(np.percentile(col_data, 50)),
                                "75": float(np.percentile(col_data, 75)),
                                "90": float(np.percentile(col_data, 90))
                            }
                        }
                    
                    # Add correlation matrix
                    corr_matrix = np.corrcoef(data_np.T)
                    result["correlation_matrix"] = corr_matrix.tolist()
                
                else:  # data_np.shape[1] == 1 - Single column
                    col_data = data_np[:, 0]
                    result = {
                        "mean": float(np.mean(col_data)),
                        "median": float(np.median(col_data)),
                        "std": float(np.std(col_data)),
                        "min": float(np.min(col_data)),
                        "max": float(np.max(col_data)),
                        "variance": float(np.var(col_data)),
                        "percentiles": {
                            "25": float(np.percentile(col_data, 25)),
                            "50": float(np.percentile(col_data, 50)),
                            "75": float(np.percentile(col_data, 75)),
                            "90": float(np.percentile(col_data, 90))
                        }
                    }
            
            # Surface plot data - 3D data points
            elif len(data_np.shape) == 3 and data_np.shape[2] == 3:
                # Extract z values (third component of each point)
                z_values = data_np[:, :, 2]
                
                # Flatten the array for statistical analysis
                flat_z = z_values.flatten()
                
                result = {
                    "mean": float(np.mean(flat_z)),
                    "median": float(np.median(flat_z)),
                    "std": float(np.std(flat_z)),
                    "min": float(np.min(flat_z)),
                    "max": float(np.max(flat_z)),
                    "variance": float(np.var(flat_z)),
                    "percentiles": {
                        "25": float(np.percentile(flat_z, 25)),
                        "50": float(np.percentile(flat_z, 50)),
                        "75": float(np.percentile(flat_z, 75)),
                        "90": float(np.percentile(flat_z, 90))
                    }
                }
                
            else:
                # 1D array of data
                flat_data = np.array(data).flatten()
                result = {
                    "mean": float(np.mean(flat_data)),
                    "median": float(np.median(flat_data)),
                    "std": float(np.std(flat_data)),
                    "min": float(np.min(flat_data)),
                    "max": float(np.max(flat_data)),
                    "variance": float(np.var(flat_data)),
                    "percentiles": {
                        "25": float(np.percentile(flat_data, 25)),
                        "50": float(np.percentile(flat_data, 50)),
                        "75": float(np.percentile(flat_data, 75)),
                        "90": float(np.percentile(flat_data, 90))
                    }
                }
                
            return {
                "results": result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error performing statistical analysis: {str(e)}"
            }
    
    @staticmethod
    def generate_trend_analysis(data: List[List[float]]) -> Dict[str, Any]:
        """
        Generate trend analysis with curve fitting for the provided data
        
        Args:
            data: 2D array of data points (x, y coordinates)
            
        Returns:
            Dictionary with trend analysis results and fitted curves
        """
        try:
            # Ensure data is correctly formatted
            if not data or len(data[0]) != 2:
                return {
                    "success": False,
                    "error": "Data must be in format [[x1, y1], [x2, y2], ...]"
                }
                
            # Convert to numpy arrays
            data_np = np.array(data)
            x = data_np[:, 0]
            y = data_np[:, 1]
            
            # Sort by x values
            idx = np.argsort(x)
            x = x[idx]
            y = y[idx]
            
            # Linear regression
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            # Generate points for linear fit
            x_fit = np.linspace(min(x), max(x), 100)
            y_fit_linear = slope * x_fit + intercept
            
            # Determine trend direction
            if slope > 0.05:
                trend = "Strong positive trend" if r_value > 0.7 else "Positive trend"
            elif slope < -0.05:
                trend = "Strong negative trend" if r_value < -0.7 else "Negative trend"
            else:
                trend = "No clear trend"
                
            # Prepare result data
            fitted_curves = {
                "linear": [[float(x), float(y)] for x, y in zip(x_fit, y_fit_linear)]
            }
            
            # Try exponential fit if data allows (all y values must be positive)
            if all(y_val > 0 for y_val in y):
                try:
                    # Define exponential function
                    def exp_func(x, a, b):
                        return a * np.exp(b * x)
                        
                    popt, pcov = curve_fit(exp_func, x, y, p0=(1, 0.001))
                    y_fit_exp = exp_func(x_fit, *popt)
                    
                    # Add to fitted curves
                    fitted_curves["exponential"] = [[float(x), float(y)] for x, y in zip(x_fit, y_fit_exp)]
                except:
                    # Exponential fit failed, ignore
                    pass
            
            # Try polynomial fit
            try:
                poly_coeffs = np.polyfit(x, y, 3)
                poly_func = np.poly1d(poly_coeffs)
                y_fit_poly = poly_func(x_fit)
                
                # Add to fitted curves
                fitted_curves["polynomial"] = [[float(x), float(y)] for x, y in zip(x_fit, y_fit_poly)]
            except:
                # Polynomial fit failed, ignore
                pass
                
            # LOWESS smoothing for non-parametric trend
            try:
                lowess = sm.nonparametric.lowess(y, x, frac=0.3)
                
                # Add to fitted curves
                fitted_curves["lowess"] = [[float(x), float(y)] for x, y in lowess]
            except:
                # LOWESS fit failed, ignore
                pass
            
            # Return result
            return {
                "stats": {
                    "trend": trend,
                    "slope": float(slope),
                    "intercept": float(intercept),
                    "r_squared": float(r_value ** 2),
                    "p_value": float(p_value),
                    "std_error": float(std_err)
                },
                "fitted_curves": fitted_curves,
                "original_data": {
                    "x": x.tolist(),
                    "y": y.tolist()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating trend analysis: {str(e)}"
            }
    
    @staticmethod
    def generate_heatmap_data(data: List[List[float]]) -> Dict[str, Any]:
        """
        Generate heatmap data from the input matrix
        
        Args:
            data: 2D array of data points
            
        Returns:
            Dictionary with processed heatmap data
        """
        try:
            # Convert to numpy array
            data_np = np.array(data)
            
            # Apply smoothing to the data for better visualization
            data_smooth = ndimage.gaussian_filter(data_np, sigma=1.0)
            
            # Get dimensions
            if len(data_np.shape) == 2:
                rows, cols = data_np.shape
                # Create coordinate grids
                x = np.linspace(0, 1, cols)
                y = np.linspace(0, 1, rows)
                
                # Get range information
                z_min = float(np.min(data_np))
                z_max = float(np.max(data_np))
                
                # Create output data
                heatmap_data = []
                for i in range(rows):
                    for j in range(cols):
                        heatmap_data.append([float(x[j]), float(y[i]), float(data_smooth[i, j])])
                
                return {
                    "data": heatmap_data,
                    "dimensions": {
                        "xRange": [0, 1],
                        "yRange": [0, 1],
                        "zRange": [z_min, z_max]
                    },
                    "metadata": {
                        "title": "Enhanced Heatmap Visualization",
                        "xLabel": "X",
                        "yLabel": "Y",
                        "zLabel": "Value"
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Data is not a 2D matrix"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating heatmap data: {str(e)}"
            }
    
    @staticmethod
    def generate_surface_plot(data: List[List[float]]) -> Dict[str, Any]:
        """
        Generate enhanced surface plot data with interpolation
        
        Args:
            data: 2D array of data points
            
        Returns:
            Dictionary with processed surface data
        """
        try:
            from scipy.interpolate import griddata
            
            # If we have 3D points [x, y, z]
            if len(data) > 0 and len(data[0]) == 3:
                data_np = np.array(data)
                
                # Extract components
                x_orig = data_np[:, 0]
                y_orig = data_np[:, 1]
                z_orig = data_np[:, 2]
                
                # Create a regular grid for interpolation
                x_min, x_max = np.min(x_orig), np.max(x_orig)
                y_min, y_max = np.min(y_orig), np.max(y_orig)
                
                # Create meshgrid with more points for smoother surface
                grid_size = 50
                x_grid = np.linspace(x_min, x_max, grid_size)
                y_grid = np.linspace(y_min, y_max, grid_size)
                X, Y = np.meshgrid(x_grid, y_grid)
                
                # Interpolate Z values on the regular grid
                points = np.column_stack((x_orig, y_orig))
                Z = griddata(points, z_orig, (X, Y), method='cubic', fill_value=np.nan)
                
                # Apply smoothing
                Z_smooth = ndimage.gaussian_filter(Z, sigma=1.0)
                
                # Create output data
                enhanced_data = []
                for i in range(grid_size):
                    for j in range(grid_size):
                        if not np.isnan(Z_smooth[i, j]):
                            enhanced_data.append([float(X[i, j]), float(Y[i, j]), float(Z_smooth[i, j])])
                
                # Get range information
                z_min = float(np.nanmin(Z_smooth))
                z_max = float(np.nanmax(Z_smooth))
                
                return {
                    "data": enhanced_data,
                    "dimensions": {
                        "xRange": [float(x_min), float(x_max)],
                        "yRange": [float(y_min), float(y_max)],
                        "zRange": [z_min, z_max]
                    },
                    "metadata": {
                        "title": "Enhanced Surface Visualization",
                        "xLabel": "X",
                        "yLabel": "Y",
                        "zLabel": "Z"
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Data must contain [x, y, z] points"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating surface plot: {str(e)}"
            }


def main():
    """
    Process command line arguments and call the appropriate function
    """
    # Add debug logging for command line arguments
    print(json.dumps({"debug": True, "args": sys.argv}), flush=True)
    
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command specified"}))
        return
        
    command = sys.argv[1]
    
    if command == "process_excel":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No file path specified"}))
            return
            
        file_path = sys.argv[2]
        sheet_name = sys.argv[3] if len(sys.argv) > 3 else None
        
        with open(file_path, "rb") as f:
            file_content = f.read()
            result = EnhancedDataService.process_excel_data(file_content, sheet_name)
            print(json.dumps(result))
    
    elif command == "stats":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No data file specified"}))
            return
            
        data_file = sys.argv[2]
        
        with open(data_file, "r") as f:
            data = json.load(f)
            result = EnhancedDataService.perform_statistical_analysis(data)
            print(json.dumps(result))
    
    elif command == "trend":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No data file specified"}))
            return
            
        data_file = sys.argv[2]
        
        with open(data_file, "r") as f:
            data = json.load(f)
            result = EnhancedDataService.generate_trend_analysis(data)
            print(json.dumps(result))
    
    elif command == "heatmap":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No data file specified"}))
            return
            
        data_file = sys.argv[2]
        
        with open(data_file, "r") as f:
            data = json.load(f)
            result = EnhancedDataService.generate_heatmap_data(data)
            print(json.dumps(result))
    
    elif command == "surface":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No data file specified"}))
            return
            
        data_file = sys.argv[2]
        
        with open(data_file, "r") as f:
            data = json.load(f)
            result = EnhancedDataService.generate_surface_plot(data)
            print(json.dumps(result))
    
    else:
        print(json.dumps({
            "success": False,
            "error": f"Unknown command: {command}"
        }))


if __name__ == "__main__":
    main()