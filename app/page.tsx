"use client"

import React, { useState, useEffect } from 'react';

interface NetworkParams {
  numNodes: number;
  proximityThreshold: number;
  maxConnections: number;
  resourceCapacity: number;
}

interface FogNode {
  id: number;
  x: number;
  y: number;
  resources: number;
  connections: number[];
  color: string;
  calculateProximity: (otherNode: FogNode) => number;
  generateRandomColor: () => string;
}

interface Edge {
  from: number;
  to: number;
  length: number;
}

const FogNetworkSimulation: React.FC = () => {
  const [nodes, setNodes] = useState<FogNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [networkParams, setNetworkParams] = useState<NetworkParams>({
    numNodes: 20,
    proximityThreshold: 50,
    maxConnections: 5,
    resourceCapacity: 100
  });

  // Node class for fog network simulation
  class FogNodeImpl implements FogNode {
    id: number;
    x: number;
    y: number;
    resources: number;
    connections: number[] = [];
    color: string;

    constructor(id: number, x: number, y: number) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.resources = Math.random() * networkParams.resourceCapacity;
      this.color = this.generateRandomColor();
    }

    generateRandomColor(): string {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      return `rgb(${r}, ${g}, ${b})`;
    }

    calculateProximity(otherNode: FogNode): number {
      return Math.sqrt(
        Math.pow(this.x - otherNode.x, 2) +
        Math.pow(this.y - otherNode.y, 2)
      );
    }
  }

  // Initialize network simulation
  const initializeNetwork = () => {
    const newNodes: FogNode[] = Array.from({ length: networkParams.numNodes }, (_, i) => 
      new FogNodeImpl(i, Math.random() * 400, Math.random() * 300)
    );

    const newEdges: Edge[] = [];

    // Create connections based on proximity
    newNodes.forEach((node, index) => {
      const potentialConnections = newNodes
        .filter(
          otherNode => 
            otherNode.id !== node.id && 
            node.calculateProximity(otherNode) <= networkParams.proximityThreshold &&
            node.connections.length < networkParams.maxConnections
        )
        .slice(0, networkParams.maxConnections);

      potentialConnections.forEach(connectedNode => {
        newEdges.push({
          from: node.id,
          to: connectedNode.id,
          length: node.calculateProximity(connectedNode)
        });
        node.connections.push(connectedNode.id);
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Initialize network on component mount
  useEffect(() => {
    initializeNetwork();
  }, [networkParams.numNodes, networkParams.proximityThreshold]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Self-Organizing Fog Network Simulation</h1>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Nodes
          </label>
          <input 
            type="number" 
            value={networkParams.numNodes}
            onChange={(e) => setNetworkParams(prev => ({
              ...prev, 
              numNodes: Math.max(1, parseInt(e.target.value))
            }))}
            min="1"
            max="50"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Proximity Threshold
          </label>
          <input 
            type="number" 
            value={networkParams.proximityThreshold}
            onChange={(e) => setNetworkParams(prev => ({
              ...prev, 
              proximityThreshold: Math.max(10, parseFloat(e.target.value))
            }))}
            min="10"
            max="200"
            step="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Connections
          </label>
          <input 
            type="number" 
            value={networkParams.maxConnections}
            onChange={(e) => setNetworkParams(prev => ({
              ...prev, 
              maxConnections: Math.max(1, parseInt(e.target.value))
            }))}
            min="1"
            max="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="mb-4">
        <button 
          onClick={initializeNetwork} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          Regenerate Network
        </button>
      </div>

      {/* Network Visualization */}
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-md p-4"
        style={{ 
          width: '600px', 
          height: '400px', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {nodes.map(node => (
          <div 
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: node.color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '10px'
            }}
            title={`Node ${node.id}\nResources: ${node.resources.toFixed(2)}`}
          >
            {node.id}
          </div>
        ))}
        {edges.map((edge, index) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          return (
            <svg 
              key={index} 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              <line
                x1={fromNode!.x + 10}
                y1={fromNode!.y + 10}
                x2={toNode!.x + 10}
                y2={toNode!.y + 10}
                stroke="#81C784"
                strokeWidth="2"
              />
            </svg>
          );
        })}
      </div>

      <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Network Statistics</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Total Nodes:</strong> {nodes.length}
          </div>
          <div>
            <strong>Total Connections:</strong> {edges.length}
          </div>
          <div>
            <strong>Total Network Resources:</strong> {
              nodes.reduce((sum, node) => sum + node.resources, 0).toFixed(2)
            }
          </div>
          <div>
            <strong>Avg Node Connections:</strong> {
              (edges.length / nodes.length).toFixed(2)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default FogNetworkSimulation;
