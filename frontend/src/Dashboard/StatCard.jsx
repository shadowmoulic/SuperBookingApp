
export default function StatCard({icon:Icon,title,value,sub}){
return(
<div className="bg-white rounded-3xl shadow p-5 hover:shadow-xl hover:-translate-y-1 transition duration-300">
<div className="flex justify-between">
<div>
<p className="text-gray-500">{title}</p>
<h2 className="text-3xl font-bold mt-2">{value}</h2>
<p className="text-sm text-gray-400 mt-1">{sub}</p>
</div>
<div className="bg-indigo-100 p-3 rounded-2xl"><Icon className="text-indigo-600"/></div>
</div>
</div>);
}
