import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_CHART_COLORS } from '../utils/constants.js';

// Donut chart of applications per status. `data` is [{ name: 'Applied', value: 2 }, ...] from the API.
export default function StatusChart({ data, emptyText = 'No data to show yet.' }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="grid h-56 place-items-center px-4 text-center text-sm text-muted">{emptyText}</div>;
  }

  const visible = data.filter((item) => item.value > 0);
  const summary = visible.map((item) => `${item.name}: ${item.value}`).join(', ');

  return (
    <div className="h-64 w-full" role="img" aria-label={`Applications by status. ${summary}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={visible} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3} stroke="none">
            {visible.map((item) => (
              <Cell key={item.name} fill={STATUS_CHART_COLORS[item.name] || '#64748B'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend iconType="circle" formatter={(value) => <span style={{ color: '#CBD5E1', fontSize: 13 }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
