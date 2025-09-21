import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

const EEGPatternVisualizer = () => {
  const [brainwaveData, setBrainwaveData] = useState([]);
  const [controlCommands, setControlCommands] = useState({
    forward: 0,
    left_right: 0,
    height: 0
  });
  const [activeControl, setActiveControl] = useState(null);

  useEffect(() => {
    // Generate simulated EEG data
    generateData();
    
    // Update data and commands periodically
    const interval = setInterval(() => {
      generateData();
      updateCommands();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const generateData = () => {
    const newData = [];
    const now = Date.now();
    
    // Generate 50 data points with decreasing timestamps
    for (let i = 49; i >= 0; i--) {
      const time = now - (i * 200); // 200ms between points
      
      // Generate realistic-looking EEG waves
      const delta = Math.sin(time * 0.001) * 10 + Math.random() * 5;
      const theta = Math.sin(time * 0.002) * 8 + Math.random() * 4;
      const alpha = Math.sin(time * 0.01) * 15 + Math.random() * 3;
      const beta = Math.sin(time * 0.02) * 7 + Math.random() * 6;
      const gamma = Math.sin(time * 0.03) * 4 + Math.random() * 2;
      
      newData.push({
        time,
        delta,
        theta,
        alpha,
        beta,
        gamma
      });
    }
    
    setBrainwaveData(newData);
  };

  const updateCommands = () => {
    // Randomly select an active control to simulate
    const controlTypes = ['forward', 'reverse', 'left', 'right', 'up', 'none'];
    const newActiveControl = controlTypes[Math.floor(Math.random() * controlTypes.length)];
    setActiveControl(newActiveControl);
    
    // Update control values based on active control
    let forward = 0;
    let leftRight = 0;
    let height = 0;
    
    switch (newActiveControl) {
      case 'forward':
        forward = 0.7 + Math.random() * 0.3;
        break;
      case 'reverse':
        forward = -0.7 - Math.random() * 0.3;
        break;
      case 'left':
        leftRight = -0.7 - Math.random() * 0.3;
        break;
      case 'right':
        leftRight = 0.7 + Math.random() * 0.3;
        break;
      case 'up':
        height = 0.7 + Math.random() * 0.3;
        break;
      default:
        // Random small values for 'none'
        forward = (Math.random() - 0.5) * 0.2;
        leftRight = (Math.random() - 0.5) * 0.2;
        height = Math.random() * 0.1;
    }
    
    setControlCommands({
      forward,
      left_right: leftRight,
      height
    });
  };

  const renderBrainwavePatterns = () => {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={brainwaveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={false} label="Time" />
            <YAxis domain={[-20, 20]} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)} μV`, '']}
              labelFormatter={() => 'EEG'}
            />
            <Legend />
            <Line type="monotone" dataKey="delta" stroke="#8884d8" name="Delta (0.5-4Hz)" dot={false} />
            <Line type="monotone" dataKey="theta" stroke="#82ca9d" name="Theta (4-8Hz)" dot={false} />
            <Line type="monotone" dataKey="alpha" stroke="#ff7300" name="Alpha (8-13Hz)" dot={false} />
            <Line type="monotone" dataKey="beta" stroke="#0088fe" name="Beta (13-30Hz)" dot={false} />
            <Line type="monotone" dataKey="gamma" stroke="#ff3399" name="Gamma (30-100Hz)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderBrainIcon = () => {
    return (
      <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg w-32">
        <Brain className="w-16 h-16 text-purple-600" />
        <Activity className="w-12 h-12 mt-2 text-green-500" />
        <span className="mt-2 text-gray-700 font-medium">Active Mental State:</span>
        <span className="font-bold text-blue-600">{activeControl || "None"}</span>
      </div>
    );
  };

  const renderControlVisualizer = () => {
    // Calculate fill percentages for the bars
    const forwardFill = Math.abs(controlCommands.forward) * 100;
    const leftRightFill = Math.abs(controlCommands.left_right) * 100;
    const heightFill = controlCommands.height * 100;
    
    // Determine colors and directions
    const forwardColor = controlCommands.forward >= 0 ? "bg-green-500" : "bg-red-500";
    const leftRightColor = controlCommands.left_right >= 0 ? "bg-blue-500" : "bg-yellow-500";
    const forwardLabel = controlCommands.forward >= 0 ? "Forward" : "Reverse";
    const leftRightLabel = controlCommands.left_right >= 0 ? "Right" : "Left";
    
    return (
      <div className="w-full max-w-md p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Control Commands</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{forwardLabel}</span>
              <span>{(forwardFill).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`${forwardColor} h-4 rounded-full`}
                style={{ width: `${forwardFill}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{leftRightLabel}</span>
              <span>{(leftRightFill).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`${leftRightColor} h-4 rounded-full`}
                style={{ width: `${leftRightFill}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Height</span>
              <span>{(heightFill).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-purple-500 h-4 rounded-full"
                style={{ width: `${heightFill}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="relative w-32 h-32">
            {/* Direction arrows */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <ArrowUp 
                size={32} 
                className={controlCommands.forward > 0.3 ? "text-green-600" : "text-gray-400"}
              />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <ArrowDown 
                size={32}
                className={controlCommands.forward < -0.3 ? "text-red-600" : "text-gray-400"}
              />
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
              <ArrowLeft 
                size={32}
                className={controlCommands.left_right < -0.3 ? "text-yellow-600" : "text-gray-400"}
              />
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <ArrowRight 
                size={32}
                className={controlCommands.left_right > 0.3 ? "text-blue-600" : "text-gray-400"}
              />
            </div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">EEG Brainwave Patterns to RC Control</h2>
      
      <div className="mb-6">
        {renderBrainwavePatterns()}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {renderBrainIcon()}
        {renderControlVisualizer()}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800">How It Works</h3>
        <p className="text-blue-900">
          This visualization demonstrates how EEG brainwave patterns are translated into RC control commands.
          Different brainwave frequencies (delta, theta, alpha, beta, gamma) are mapped to specific control functions.
          For example, alpha waves might control forward movement, while beta waves control turning. | SAAAM LLC | saaam-intelligence.com
        </p>
      </div>
    </div>
  );
};

export default EEGPatternVisualizer;
