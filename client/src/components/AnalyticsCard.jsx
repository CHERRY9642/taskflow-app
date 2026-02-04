import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsCard = ({ title, value, icon: Icon, trend, color }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-full ${color || 'bg-indigo-50 text-indigo-600'}`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend > 0 ? (
                        <ArrowUpRight size={16} className="text-green-500 mr-1" />
                    ) : (
                        <ArrowDownRight size={16} className="text-red-500 mr-1" />
                    )}
                    <span className={trend > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-gray-400 ml-2">from last month</span>
                </div>
            )}
        </div>
    );
};

export default AnalyticsCard;
