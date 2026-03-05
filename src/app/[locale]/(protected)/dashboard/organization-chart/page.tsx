'use client';

import OrgChartStatic from '@/components/OrgChartStatic';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Award,
  Calendar,
  Crown,
  Mail,
  Network,
  Phone,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

// 模擬人員資料
const mockPeople = [
  {
    id: '1',
    name: '張總裁',
    position: '總裁',
    level: 1,
    avatar: '👑',
    phone: '0912-345-678',
    email: 'ceo@company.com',
    joinDate: '2020-01-15',
    downlines: ['2', '3'],
    status: 'active',
    rank: '鑽石級',
    teamSize: 156,
  },
  {
    id: '2',
    name: '李經理',
    position: '區域經理',
    level: 2,
    avatar: '⭐',
    phone: '0923-456-789',
    email: 'manager1@company.com',
    joinDate: '2020-06-20',
    upline: '1',
    downlines: ['4', '5', '6'],
    status: 'active',
    rank: '白金級',
    teamSize: 78,
  },
  {
    id: '3',
    name: '王總監',
    position: '區域總監',
    level: 2,
    avatar: '🏆',
    phone: '0934-567-890',
    email: 'manager2@company.com',
    joinDate: '2020-08-10',
    upline: '1',
    downlines: ['7', '8'],
    status: 'active',
    rank: '白金級',
    teamSize: 45,
  },
  {
    id: '4',
    name: '陳主管',
    position: '團隊主管',
    level: 3,
    avatar: '💼',
    phone: '0945-678-901',
    email: 'supervisor1@company.com',
    joinDate: '2021-03-15',
    upline: '2',
    downlines: ['9', '10', '11'],
    status: 'active',
    rank: '黃金級',
    teamSize: 25,
  },
  {
    id: '5',
    name: '林專員',
    position: '資深專員',
    level: 3,
    avatar: '👨‍💼',
    phone: '0956-789-012',
    email: 'specialist1@company.com',
    joinDate: '2021-05-20',
    upline: '2',
    downlines: ['12', '13'],
    status: 'active',
    rank: '白銀級',
    teamSize: 15,
  },
  {
    id: '6',
    name: '黃顧問',
    position: '高級顧問',
    level: 3,
    avatar: '👩‍💼',
    phone: '0967-890-123',
    email: 'advisor1@company.com',
    joinDate: '2021-07-10',
    upline: '2',
    downlines: ['14'],
    status: 'active',
    rank: '白銀級',
    teamSize: 8,
  },
  {
    id: '7',
    name: '吳經理',
    position: '部門經理',
    level: 3,
    avatar: '👨‍💻',
    phone: '0978-901-234',
    email: 'manager3@company.com',
    joinDate: '2021-09-05',
    upline: '3',
    downlines: ['15', '16', '17'],
    status: 'active',
    rank: '黃金級',
    teamSize: 20,
  },
  {
    id: '8',
    name: '鄭專員',
    position: '專員',
    level: 3,
    avatar: '👩‍💻',
    phone: '0989-012-345',
    email: 'specialist2@company.com',
    joinDate: '2021-11-15',
    upline: '3',
    downlines: ['18'],
    status: 'active',
    rank: '青銅級',
    teamSize: 5,
  },
  // 第四層
  {
    id: '9',
    name: '劉助理',
    position: '助理',
    level: 4,
    avatar: '👨‍🎓',
    phone: '0901-123-456',
    email: 'assistant1@company.com',
    joinDate: '2022-01-10',
    upline: '4',
    downlines: [],
    status: 'active',
    rank: '青銅級',
    teamSize: 0,
  },
  {
    id: '10',
    name: '蔡專員',
    position: '專員',
    level: 4,
    avatar: '👩‍🎓',
    phone: '0902-234-567',
    email: 'specialist3@company.com',
    joinDate: '2022-03-20',
    upline: '4',
    downlines: [],
    status: 'active',
    rank: '青銅級',
    teamSize: 0,
  },
  {
    id: '11',
    name: '許顧問',
    position: '顧問',
    level: 4,
    avatar: '👨‍🏫',
    phone: '0903-345-678',
    email: 'advisor2@company.com',
    joinDate: '2022-05-15',
    upline: '4',
    downlines: [],
    status: 'active',
    rank: '青銅級',
    teamSize: 0,
  },
];

export default function OrganizationChartPage() {
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  const breadcrumbs = [
    {
      label: '組織圖',
      isCurrentPage: true,
    },
  ];

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300';
      case 2:
        return 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300';
      case 3:
        return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300';
      case 4:
        return 'bg-gradient-to-br from-green-400 to-green-600 border-green-300';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300';
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Crown className="h-4 w-4" />;
      case 2:
        return <Star className="h-4 w-4" />;
      case 3:
        return <Award className="h-4 w-4" />;
      case 4:
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                    <Network className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">組織圖</h1>
                    <p className="text-gray-600">傳銷組織結構與人員管理</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                        <Crown className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          總人數
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockPeople.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          管理層級
                        </p>
                        <p className="text-2xl font-bold text-gray-900">4</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          活躍成員
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {
                            mockPeople.filter((p) => p.status === 'active')
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          本月新增
                        </p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Chart */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      組織結構圖
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      點擊人員節點查看詳細資料
                    </p>
                  </div>

                  <div className="p-6">
                    {/* ECharts Tree Chart */}
                    <OrgChartStatic />
                  </div>
                </div>

                {/* Person Detail Modal */}
                {selectedPerson && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            人員詳細資料
                          </h3>
                          <button
                            onClick={() => setSelectedPerson(null)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">
                              {selectedPerson.avatar}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                {selectedPerson.name}
                              </h4>
                              <p className="text-gray-600">
                                {selectedPerson.position}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(selectedPerson.level)} text-white`}
                              >
                                {getLevelIcon(selectedPerson.level)}
                                {selectedPerson.rank}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{selectedPerson.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{selectedPerson.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{selectedPerson.joinDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>團隊 {selectedPerson.teamSize} 人</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              組織關係
                            </h5>
                            <div className="space-y-2 text-sm">
                              {selectedPerson.upline && (
                                <div>
                                  <span className="text-gray-600">上線：</span>
                                  <span className="font-medium">
                                    {
                                      mockPeople.find(
                                        (p) => p.id === selectedPerson.upline
                                      )?.name
                                    }
                                  </span>
                                </div>
                              )}
                              {selectedPerson.downlines.length > 0 && (
                                <div>
                                  <span className="text-gray-600">下線：</span>
                                  <div className="mt-1">
                                    {selectedPerson.downlines.map(
                                      (downlineId) => {
                                        const downline = mockPeople.find(
                                          (p) => p.id === downlineId
                                        );
                                        return downline ? (
                                          <span
                                            key={downlineId}
                                            className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1"
                                          >
                                            {downline.name}
                                          </span>
                                        ) : null;
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
