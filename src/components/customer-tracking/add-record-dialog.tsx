'use client';

import { useState } from 'react';
import { X, Calendar, User, Building, Target, DollarSign, FileText, Clock, MessageSquare } from 'lucide-react';

interface AddRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddRecordDialog({ isOpen, onClose, onSubmit }: AddRecordDialogProps) {
  const [formData, setFormData] = useState({
    salesperson: '',
    customerName: '',
    leadSource: '',
    leadSourceOther: '',
    consultationMotives: [] as string[],
    consultationMotivesOther: '',
    nextActionDate: '',
    nextActionText: '',
    meetingRecord: '第一次'
  });

  const leadSourceOptions = ['原顧', '客戶轉介', '公司名單', '其他'];
  const consultationMotiveOptions = [
    '想買自住房',
    '貸款問題',
    '了解不動產投資',
    '了解現金流規劃',
    '了解全案資產配置',
    '稅務規劃',
    '資產傳承',
    '企業相關',
    '其他'
  ];
  const meetingRecordOptions = ['第一次', '第二次', '第三次'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsultationMotiveChange = (motive: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consultationMotives: checked
        ? [...prev.consultationMotives, motive]
        : prev.consultationMotives.filter(m => m !== motive)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // 重置表單
    setFormData({
      salesperson: '',
      customerName: '',
      leadSource: '',
      leadSourceOther: '',
      consultationMotives: [],
      consultationMotivesOther: '',
      nextActionDate: '',
      nextActionText: '',
      meetingRecord: '第一次'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">新增客戶互動記錄</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                業務員姓名 *
              </label>
              <input
                type="text"
                required
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入業務員姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                客戶名稱 *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入客戶姓名"
              />
            </div>
          </div>

          {/* 名單來源 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              名單來源 *
            </label>
            <select
              required
              value={formData.leadSource}
              onChange={(e) => handleInputChange('leadSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">請選擇名單來源</option>
              {leadSourceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            {formData.leadSource === '其他' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.leadSourceOther}
                  onChange={(e) => handleInputChange('leadSourceOther', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入其他名單來源"
                />
              </div>
            )}
          </div>

          {/* 諮詢動機 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="h-4 w-4 inline mr-1" />
              諮詢動機 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {consultationMotiveOptions.map(motive => (
                <label key={motive} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.consultationMotives.includes(motive)}
                    onChange={(e) => handleConsultationMotiveChange(motive, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{motive}</span>
                </label>
              ))}
            </div>

            {formData.consultationMotives.includes('其他') && (
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.consultationMotivesOther}
                  onChange={(e) => handleInputChange('consultationMotivesOther', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入其他諮詢動機"
                />
              </div>
            )}
          </div>

          {/* 下一步行動及日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              下一步行動及日期 *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  required
                  value={formData.nextActionDate}
                  onChange={(e) => handleInputChange('nextActionDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={formData.nextActionText}
                  onChange={(e) => handleInputChange('nextActionText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入下一步行動內容"
                />
              </div>
            </div>
          </div>

          {/* 會面紀錄 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              會面紀錄 *
            </label>
            <select
              required
              value={formData.meetingRecord}
              onChange={(e) => handleInputChange('meetingRecord', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {meetingRecordOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* 按鈕 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新增記錄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
