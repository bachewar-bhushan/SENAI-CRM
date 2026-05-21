import { FiMail, FiBriefcase, FiCheckCircle, FiDollarSign, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import { useCrmStore } from '../../store/crmStore';

export const ContactCard = () => {
  const { contact } = useCrmStore();

  if (!contact) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg text-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">Search for a contact to view details</p>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score > 0.7) return { bg: 'bg-red-100', text: 'text-red-700', icon: FiAlertCircle };
    if (score > 0.4) return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FiTrendingDown };
    return { bg: 'bg-green-100', text: 'text-green-700', icon: FiCheckCircle };
  };

  const riskConfig = contact.churn_risk_score !== undefined ? getRiskColor(contact.churn_risk_score) : null;
  const RiskIcon = riskConfig?.icon;

  return (
    <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">{contact.name}</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
            <FiMail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-900 font-medium break-all">{contact.email}</p>
            </div>
          </div>

          {contact.company && (
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              <FiBriefcase size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
                <p className="text-sm text-gray-900 font-medium">{contact.company}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
            <FiCheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                  contact.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {contact.status}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
            <FiDollarSign size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Value</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${(Number(contact.account_value) || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {contact.churn_risk_score !== undefined && (
            <div className="flex items-start gap-3">
              <RiskIcon size={20} className={`${riskConfig.text} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Churn Risk</p>
                <p className={`text-lg font-bold mt-1 ${riskConfig.text}`}>
                  {(contact.churn_risk_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
