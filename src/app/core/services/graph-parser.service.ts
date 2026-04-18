import { Injectable } from '@angular/core';
import { GraphData, MethodNode } from '../models/graph.model';

@Injectable({
  providedIn: 'root'
})
export class GraphParserService {
  parseJson(jsonString: string): GraphData | null {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.methods)) {
        return null;
      }
      return data as GraphData;
    } catch (e) {
      return null;
    }
  }

  getNodesAndEdges(data: GraphData) {
    const nodes = data.methods.map(m => ({
      data: { 
        id: m.id, 
        name: m.name, 
        file: m.file, 
        code: m.code, 
        calls: m.calls || [],
        references: m.references,
        examples: m.examples
      }
    }));
    
    const edges: any[] = [];
    data.methods.forEach(m => {
      if (m.calls && Array.isArray(m.calls)) {
        m.calls.forEach(targetId => {
          edges.push({
            data: {
              id: `${m.id}-${targetId}`,
              source: m.id,
              target: targetId
            }
          });
        });
      }
    });

    return { nodes, edges };
  }
}
