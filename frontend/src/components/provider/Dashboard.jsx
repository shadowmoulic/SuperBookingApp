import { BarChart3, Building2, Calendar, IndianRupee, MapPinned, Package, Ticket, Users } from "lucide-react";
import StatCard from "./StatCard";
import BookingTable from "./BookingTable";

export default function Dashboard({data}) {
  const a=data.analytics;
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">{data.provider.name}</h1>
              <p className="opacity-90 mt-2">{data.provider.description}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-sm">Status</p>
              <p className="font-semibold">{data.provider.is_active?"Active":"Inactive"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Package} title="Experiences" value={a.experiences.total} sub={`${a.experiences.active} Active`} />
          <StatCard icon={Users} title="Bookings" value={a.bookings.total} sub={`${a.bookings.pending} Pending`} />
          <StatCard icon={IndianRupee} title="Revenue" value={`₹${a.bookings.total_revenue}`} sub="Total Revenue"/>
          <StatCard icon={Ticket} title="Ticket Types" value={a.ticket_types.total} sub={`${a.ticket_types.active} Active`} />
          <StatCard icon={Calendar} title="Schedules" value={a.schedules.total} sub={`${a.schedules.active} Active`} />
          <StatCard icon={Building2} title="Features" value={a.features.total} sub="Experience Features"/>
          <StatCard icon={MapPinned} title="Capacity" value={a.inventory.total_capacity} sub="Daily Capacity"/>
          <StatCard icon={BarChart3} title="Tickets" value={a.tickets.total_issued} sub="Issued"/>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow">
            <h2 className="text-2xl font-bold mb-4">Experiences</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.experiences.map(exp=>(
                <div key={exp.public_id} className="border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition">
                  <img src={(exp.image_url||"https://placehold.co/600x300").split(",")[0]} className="h-40 w-full object-cover"/>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{exp.name}</h3>
                    <p className="text-sm text-gray-500">{exp.city_name} • {exp.category_name}</p>
                    <div className="flex justify-between mt-4 text-sm">
                      <span>{exp.is_open?"🟢 Open":"🔴 Closed"}</span>
                      <span>₹{exp.entry_fee_base}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exp.ticket_types.map(t=>(
                        <span key={t.public_id} className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">{t.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <h2 className="font-bold text-2xl mb-4">Provider</h2>
            <div className="space-y-3 text-sm">
              <p><b>Email:</b> {data.provider.contact_email}</p>
              <p><b>Phone:</b> {data.provider.contact_phone}</p>
              <p><b>Website:</b> {data.provider.website_url}</p>
              <hr/>
              <p>Confirmed: {a.bookings.confirmed}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{width:`${a.bookings.confirmed/a.bookings.total*100}%`}}/>
              </div>
              <p>Pending: {a.bookings.pending}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{width:`${a.bookings.pending/a.bookings.total*100}%`}}/>
              </div>
            </div>
          </div>
        </div>

        <BookingTable bookings={data.recent_bookings}/>
      </div>
    </div>
  );
}
