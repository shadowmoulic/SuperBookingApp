
export default function BookingTable({bookings}){
const color=s=>s==="confirmed"?"bg-green-100 text-green-700":s==="pending"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700";
return(
<div className="bg-white rounded-3xl shadow p-6 overflow-auto">
<h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
<table className="w-full min-w-[700px]">
<thead className="border-b">
<tr className="text-left">
<th className="py-3">Reference</th>
<th>User</th>
<th>Experience</th>
<th>Date</th>
<th>Amount</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{bookings.map(b=>(
<tr key={b.reference} className="border-b hover:bg-slate-50 transition">
<td className="py-4">{b.reference}</td>
<td>{b.user_name}<div className="text-xs text-gray-400">{b.user_email}</div></td>
<td>{b.experience_name}</td>
<td>{b.booking_date}</td>
<td>₹{b.total_amount}</td>
<td><span className={`px-3 py-1 rounded-full text-xs font-semibold ${color(b.status)}`}>{b.status}</span></td>
</tr>
))}
</tbody>
</table>
</div>);
}
