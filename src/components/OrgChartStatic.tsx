'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, Download, ChevronDown } from 'lucide-react';

// Dynamic import for ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

/**
 * Tree node data structure for organization chart
 */
type TreeNode = {
  id: string;
  name: string;
  rank?: '鑽石' | '白金' | '金' | '銀' | '銅';
  active?: boolean;
  children?: TreeNode[];
};


/**
 * Add color property to tree nodes based on rank
 */
const addColorToNode = (node: TreeNode): TreeNode => {
  const nodeWithColor = {
    ...node,
    itemStyle: {
      color: (() => {
        switch (node.rank) {
          case '鑽石': return '#B9F2FF'; // Diamond fill
          case '白金': return '#FAF6EA'; // Platinum fill
          case '金': return '#FFD700';   // Gold fill
          case '銀': return '#8FA0B2';   // Silver fill
          case '銅': return '#CD7F32';   // Bronze fill
          default: return '#6B7280';    // Default node color
        }
      })(),
      borderColor: (() => {
        switch (node.rank) {
          case '鑽石': return '#7ECFE3'; // Diamond stroke
          case '白金': return '#D5C79B'; // Platinum stroke
          case '金': return '#B8860B';   // Gold stroke
          case '銀': return '#657383';   // Silver stroke
          case '銅': return '#99501D';   // Bronze stroke
          default: return '#4B5563';    // Default stroke color
        }
      })(),
      borderWidth: 2,
    }
  };

  if (node.children) {
    nodeWithColor.children = node.children.map(addColorToNode);
  }

  return nodeWithColor;
};

/**
 * Mock data for organization chart - represents a forest of trees
 */
const mockForest: TreeNode[] = [
  {
    id: 'A1',
    name: 'Alice',
    rank: '鑽石',
    active: true,
    children: [
      {
        id: 'A2',
        name: 'Amy',
        rank: '金',
        active: true,
        children: [
          { id: 'A3', name: 'Ann', rank: '銀', active: true },
          { id: 'A4', name: 'Alex', rank: '銅', active: false },
          { id: 'A5', name: 'Andy', rank: '銀', active: true },
        ],
      },
      {
        id: 'A6',
        name: 'Aron',
        rank: '銀',
        active: false,
        children: [
          { id: 'A7', name: 'Anna', rank: '銅', active: true },
        ],
      },
      {
        id: 'A8',
        name: 'Alan',
        rank: '金',
        active: true,
      },
    ],
  },
  {
    id: 'B1',
    name: 'Bob',
    rank: '白金',
    active: true,
    children: [
      {
        id: 'B2',
        name: 'Ben',
        rank: '金',
        active: true,
        children: [
          { id: 'B3', name: 'Bea', rank: '銅', active: true },
          { id: 'B4', name: 'Bill', rank: '銀', active: false },
          { id: 'B5', name: 'Bella', rank: '銅', active: true },
        ],
      },
      {
        id: 'B6',
        name: 'Bryan',
        rank: '金',
        active: true,
        children: [
          { id: 'B7', name: 'Betty', rank: '銀', active: true },
        ],
      },
    ],
  },
  {
    id: 'C1',
    name: 'Carol',
    rank: '白金',
    active: true,
    children: [
      {
        id: 'C2',
        name: 'Chris',
        rank: '金',
        active: false,
        children: [
          { id: 'C3', name: 'Cathy', rank: '銀', active: true },
        ],
      },
      {
        id: 'C4',
        name: 'Carl',
        rank: '銀',
        active: true,
      },
    ],
  },
].map(addColorToNode);

/**
 * Root node that combines all trees into a single forest
 */
const root: TreeNode = addColorToNode({
  id: 'ROOT',
  name: '全部組織',
  active: true,
  children: mockForest,
});

/**
 * Get color for rank
 */
const getRankColor = (rank?: string): string => {
  switch (rank) {
    case '鑽石':
      return '#FFD700';
    case '白金':
      return '#C0C0C0';
    case '金':
      return '#FFA500';
    case '銀':
      return '#C0C0C0';
    case '銅':
      return '#CD7F32';
    default:
      return '#6B7280';
  }
};

/**
 * Get node color based on active status and rank
 */
const getNodeColor = (node: TreeNode): string => {
  if (!node.active) return '#E5E7EB';
  return getRankColor(node.rank);
};

/**
 * Static Organization Chart Component
 * Displays a tree chart using ECharts with mock data
 */
export default function OrgChartStatic(): JSX.Element {
  // ECharts configuration
  const chartOption = useMemo(() => {
    return {
      grid: {
        top: '5%',
        right: '20%',
        bottom: '5%',
        left: '5%',
      },
      series: [
        {
          type: 'tree',
          data: [root],
          top: '5%',
          left: '5%',
          bottom: '5%',
          right: '20%',
          symbolSize: 16,
          symbol: 'circle',
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 12,
            fontWeight: 'normal',
            color: '#374151',
            formatter: (params: any) => {
              const data = params.data;
              const rank = data.rank ? `\n${data.rank}` : '';
              return `{name|${data.name}}{rank|${rank}}`;
            },
            rich: {
              name: {
                fontWeight: 'bold',
                fontSize: 12,
                color: '#374151',
              },
              rank: {
                fontSize: 10,
                color: '#6B7280',
                fontWeight: 'normal',
              },
            },
          },
          leaves: {
            label: {
              position: 'right',
              align: 'left',
            },
          },
          lineStyle: {
            width: 1,
            color: '#D1D5DB',
            curveness: 0.1,
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 4,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
          roam: true,
          initialTreeDepth: 2,
          animationDuration: 300,
          animationEasing: 'cubicOut',
        },
      ],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          const rank = data.rank || '無等級';
          return `
            <div class="p-2">
              <div class="font-semibold">${data.name}</div>
              <div class="text-sm text-gray-600">等級: ${rank}</div>
            </div>
          `;
        },
      },
    };
  }, []);

  return (
    <div className="rounded-2xl shadow-sm border bg-white p-4 md:p-6">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Left: Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">組織圖（靜態示意）</h2>
          <p className="text-sm text-gray-600">僅展示假資料</p>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋姓名/ID"
              disabled
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="搜尋組織成員"
            />
          </div>

          {/* Direction Dropdown */}
          <div className="relative">
            <select
              disabled
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="選擇圖表方向"
            >
              <option value="left-to-right">Left-to-Right</option>
              <option value="top-to-bottom">Top-to-Bottom</option>
              <option value="radial">Radial</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-60 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="匯出圖表為PNG"
          >
            <Download className="h-4 w-4" />
            匯出 PNG
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        {/* Left: Tree Chart */}
        <div className="mb-6 lg:mb-0">
          <div className="h-[70vh] sm:h-[60vh] lg:h-[70vh] w-full">
            <ReactECharts
              option={chartOption}
              style={{ width: '100%', height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* Right: Info Sidebar */}
        <div className="hidden lg:flex">
          <div className="w-full">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
                <h3 className="font-medium text-gray-900">節點資訊（預留）</h3>
              </div>

              {/* Skeleton Loading */}
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-6">
          {/* Rank Legend */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">等級：</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" aria-label="鑽石等級">
                <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#B9F2FF', borderColor: '#7ECFE3' }}></div>
                <span className="text-sm text-gray-700">鑽石</span>
              </div>
              <div className="flex items-center gap-1" aria-label="白金等級">
                <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#FAF6EA', borderColor: '#D5C79B' }}></div>
                <span className="text-sm text-gray-700">白金</span>
              </div>
              <div className="flex items-center gap-1" aria-label="金等級">
                <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#FFD700', borderColor: '#B8860B' }}></div>
                <span className="text-sm text-gray-700">金</span>
              </div>
              <div className="flex items-center gap-1" aria-label="銀等級">
                <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#8FA0B2', borderColor: '#657383' }}></div>
                <span className="text-sm text-gray-700">銀</span>
              </div>
              <div className="flex items-center gap-1" aria-label="銅等級">
                <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#CD7F32', borderColor: '#99501D' }}></div>
                <span className="text-sm text-gray-700">銅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
