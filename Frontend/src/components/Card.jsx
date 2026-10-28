function Card({ icon: Icon, label, value, subtext, iconBg, iconColor }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
      <div className={`${iconBg} w-10 h-10 rounded-full flex items-center justify-center`}>
        {Icon ? (
          <Icon className={iconColor} size={20} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-300" />
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{subtext}</p>
      </div>
    </div>
  );
}

export default Card;