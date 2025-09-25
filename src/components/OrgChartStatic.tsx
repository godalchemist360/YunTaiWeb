'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';

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
  employee_no?: string;
  name: string;
  rank?: '鑽石' | '白金' | '金' | '銀' | '銅';
  active?: boolean;
  sales_total?: number;
  sales_month?: number;
  team_sales_month?: number;
  hasChildren?: boolean;
  _loadedChildren?: boolean;
  collapsed?: boolean;
  children?: TreeNode[];
};

/**
 * Chart orientation types
 */
type Orientation = 'LR' | 'TB' | 'RADIAL';

/**
 * API response types
 */
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type MemberData = {
  id: string;
  employee_no?: string;
  name: string;
  rank: '鑽石' | '白金' | '金' | '銀' | '銅';
  active: boolean;
  sales_total: number;
  sales_month?: number;
  team_sales_month?: number;
  hasChildren: boolean;
};


/**
 * Rank colors configuration
 */
export const RANK_COLORS = {
  '鑽石': { fill: '#B9F2FF', stroke: '#7ECFE3' },
  '白金': { fill: '#FAF6EA', stroke: '#D5C79B' },
  '金':   { fill: '#FFD700', stroke: '#B8860B' },
  '銀':   { fill: '#8FA0B2', stroke: '#657383' },
  '銅':   { fill: '#CD7F32', stroke: '#99501D' },
} as const;

/**
 * Add color property to tree nodes based on rank
 */
const addColorToNode = (node: TreeNode): TreeNode => {
  const nodeWithColor = {
    ...node,
    itemStyle: {
      color: node.rank ? RANK_COLORS[node.rank].fill : '#6B7280',
      borderColor: node.rank ? RANK_COLORS[node.rank].stroke : '#4B5563',
      borderWidth: 2,
    }
  };

  if (node.children) {
    nodeWithColor.children = node.children.map(addColorToNode);
  }

  return nodeWithColor;
};

/**
 * Convert API member data to tree node
 */
const memberToTreeNode = (member: MemberData): TreeNode => {
  return {
    id: member.id,
    employee_no: member.employee_no,
    name: member.name,
    rank: member.rank,
    active: member.active,
    sales_total: member.sales_total,
    sales_month: member.sales_month,
    team_sales_month: member.team_sales_month,
    hasChildren: member.hasChildren,
    _loadedChildren: false,
    collapsed: false,
    children: []
  };
};

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
 * Build ECharts tree option based on orientation
 */
const buildTreeOption = (root: TreeNode, orientation: Orientation): any => {
  const commonSeries = {
    type: 'tree',
    data: [root],
    symbolSize: 16,
    symbol: 'circle',
    roam: true,
    initialTreeDepth: 3,
    animationDuration: 300,
    animationEasing: 'cubicOut',
    // 水平標籤（保持原本的 formatter）
    label: {
      rotate: 0,
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
        rotate: 0,
        position: 'right',
        align: 'left'
      }
    },
    labelLayout: () => ({ rotate: 0 }),
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
  } as const;

  if (orientation === 'RADIAL') {
    return {
      grid: {
        top: '5%',
        right: '20%',
        bottom: '5%',
        left: '5%',
      },
      series: [{
        ...commonSeries,
        layout: 'radial',                 // 徑向
        // orient 不要設
        top: '5%', left: '5%', right: '5%', bottom: '5%',
      }],
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
  }

  if (orientation === 'LR') {
    return {
      grid: {
        top: '5%',
        right: '20%',
        bottom: '5%',
        left: '5%',
      },
      series: [{
        ...commonSeries,
        orient: 'LR',                     // 左→右
        top: '5%', left: '5%', right: '20%', bottom: '5%',
      }],
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
  }

  // orientation === 'TB'
  return {
    grid: {
      top: '5%',
      right: '20%',
      bottom: '5%',
      left: '5%',
    },
    series: [{
      ...commonSeries,
      orient: 'TB',                       // 上→下
      top: '10%', left: '8%', right: '8%', bottom: '10%',
    }],
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
};

/**
 * Dynamic Organization Chart Component
 * Displays a tree chart using ECharts with API data
 */
export default function OrgChartStatic(): React.JSX.Element {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('RADIAL');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch roots on component mount
  useEffect(() => {
    const fetchRoots = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/org/roots');
        const result: ApiResponse<MemberData[]> = await response.json();

        if (result.success && result.data) {
          const roots = result.data.map(memberToTreeNode);

          // 載入每個根節點的子節點
          const rootsWithChildren = await Promise.all(
            roots.map(async (root) => {
              if (root.hasChildren) {
                try {
                  const childrenResponse = await fetch(`/api/org/children?parent=${root.id}`);
                  const childrenResult: ApiResponse<MemberData[]> = await childrenResponse.json();
                  if (childrenResult.success && childrenResult.data) {
                    const children = childrenResult.data.map(memberToTreeNode);
                    return { ...root, children, _loadedChildren: true };
                  }
                } catch (err) {
                  console.error('Error loading children for root:', root.id, err);
                }
              }
              return root;
            })
          );

          const virtualRoot: TreeNode = {
            id: 'ROOT',
            name: '全部組織',
            active: true,
            hasChildren: rootsWithChildren.length > 0,
            _loadedChildren: true,
            collapsed: false,
            children: rootsWithChildren
          };
          setRoot(addColorToNode(virtualRoot));
        } else {
          setError(result.error || 'Failed to load organization data');
        }
      } catch (err) {
        setError('Network error while loading organization data');
        console.error('Error fetching roots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoots();
  }, []);

  // Load children for a specific node
  const loadChildren = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/org/children?parent=${nodeId}`);
      const result: ApiResponse<MemberData[]> = await response.json();

      if (result.success && result.data) {
        const children = result.data.map(memberToTreeNode);

        // Update the tree structure
        const updateNode = (node: TreeNode): TreeNode => {
          if (node.id === nodeId) {
            return {
              ...node,
              children: children,
              _loadedChildren: true
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(updateNode)
            };
          }
          return node;
        };

        if (root) {
          setRoot(addColorToNode(updateNode(root)));
        }
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    }
  };

  // Handle node click
  const handleNodeClick = (params: any) => {
    const data = params.data;

    // 設定選中的節點
    setSelectedNode(data);

    if (data.hasChildren && !data._loadedChildren) {
      loadChildren(data.id);
    } else if (data._loadedChildren) {
      // Toggle collapse/expand
      const updateNode = (node: TreeNode): TreeNode => {
        if (node.id === data.id) {
          return {
            ...node,
            collapsed: !node.collapsed
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNode)
          };
        }
        return node;
      };

      if (root) {
        setRoot(addColorToNode(updateNode(root)));
      }
    }
  };

  // ECharts configuration
  const chartOption = useMemo(() => {
    if (!root) return {};
    return buildTreeOption(root, orientation);
  }, [root, orientation]);

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

          {/* Direction Toggle Buttons */}
          <div className="flex gap-2">
            {(['LR','TB','RADIAL'] as Orientation[]).map(o => (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                className={orientation === o
                  ? 'px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium transition-colors'
                  : 'px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors'}
                aria-pressed={orientation === o}
              >
                {o === 'LR' ? 'Left-to-Right' : o === 'TB' ? 'Top-to-Bottom' : 'Radial'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        {/* Left: Tree Chart */}
        <div className="mb-6 lg:mb-0">
          <div className="h-[70vh] sm:h-[60vh] lg:h-[70vh] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">載入組織資料中...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 text-lg mb-2">載入失敗</div>
                  <div className="text-gray-600">{error}</div>
                </div>
              </div>
            ) : (
              <ReactECharts
                option={chartOption}
                notMerge={true}
                style={{ width: '100%', height: '100%' }}
                opts={{ renderer: 'canvas' }}
                onEvents={{
                  click: handleNodeClick
                }}
              />
            )}
          </div>
        </div>

        {/* Right: Info Sidebar */}
        <div className="hidden lg:flex">
          <div className="w-full">
            {selectedNode ? (
              <div className={`rounded-xl p-4 border-2 shadow-lg transition-all duration-300 ${
                selectedNode.rank === '鑽石' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' :
                selectedNode.rank === '白金' ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' :
                selectedNode.rank === '金' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                selectedNode.rank === '銀' ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' :
                selectedNode.rank === '銅' ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
                'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              }`}>
                {/* 頭貼 + 右側資訊 */}
                <div className="flex items-start gap-3">
                  {/* 大頭貼 */}
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* 右側資訊 */}
                  <div className="flex-1 min-w-0">
                    {/* 第一行：姓名#員工編號 */}
                    <div className="text-lg font-bold text-gray-900 mb-2 text-center">
                      {selectedNode.name}#{selectedNode.employee_no || '未設定'}
                    </div>

                    {/* 第二行：職階 */}
                    <div className="flex justify-center mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        selectedNode.rank === '鑽石' ? 'bg-blue-500 text-white' :
                        selectedNode.rank === '白金' ? 'bg-purple-500 text-white' :
                        selectedNode.rank === '金' ? 'bg-yellow-500 text-white' :
                        selectedNode.rank === '銀' ? 'bg-gray-500 text-white' :
                        selectedNode.rank === '銅' ? 'bg-orange-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {selectedNode.rank || '無階級'}
                      </span>
                    </div>

                    {/* 第三行：點擊查看詳情 */}
                    <div className="text-right">
                      <button
                        onClick={() => setShowDetailModal(true)}
                        className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        點擊查看詳情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    點擊名稱查看詳細資訊
                  </div>
                </div>
              </div>
            )}
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
              {Object.entries(RANK_COLORS).map(([rank, colors]) => (
                <div key={rank} className="flex items-center gap-1" aria-label={`${rank}等級`}>
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                  ></div>
                  <span className="text-sm text-gray-700">{rank}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細資訊對話框 */}
      {showDetailModal && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* 對話框標題 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">詳細資訊</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 詳細資訊內容 */}
            <div className="space-y-4">
              {/* 姓名 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">姓名</span>
                <span className="text-sm text-gray-900">{selectedNode.name}</span>
              </div>

              {/* 員工編號 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">員工編號</span>
                <span className="text-sm text-gray-900">#{selectedNode.employee_no || '未設定'}</span>
              </div>

              {/* 職階 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">職階</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                  selectedNode.rank === '鑽石' ? 'bg-blue-500 text-white' :
                  selectedNode.rank === '白金' ? 'bg-purple-500 text-white' :
                  selectedNode.rank === '金' ? 'bg-yellow-500 text-white' :
                  selectedNode.rank === '銀' ? 'bg-gray-500 text-white' :
                  selectedNode.rank === '銅' ? 'bg-orange-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {selectedNode.rank || '無階級'}
                </span>
              </div>

              {/* 當月業績 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">當月業績</span>
                <span className="text-sm text-green-600 font-semibold">
                  ${selectedNode.sales_month?.toLocaleString() || '0'}
                </span>
              </div>

              {/* 團隊累計業績 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">團隊累計業績</span>
                <span className="text-sm text-green-600 font-semibold">
                  ${selectedNode.team_sales_month?.toLocaleString() || '0'}
                </span>
              </div>

              {/* 介紹人 */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">介紹人</span>
                <span className="text-sm text-gray-900">待實作</span>
              </div>
            </div>

            {/* 關閉按鈕 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
