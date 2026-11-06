import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ActivityChart({data}){
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:12,right:6,left:-26,bottom:0}}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7059e8" stopOpacity={0.18}/><stop offset="95%" stopColor="#7059e8" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0f4" strokeDasharray="3 5"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fill:'#9aa0ad',fontSize:11}} dy={10}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{fill:'#9aa0ad',fontSize:11}}/><Tooltip contentStyle={{border:'1px solid #eeeef2',borderRadius:10,fontSize:12}}/><Area type="monotone" dataKey="value" name="Applications" stroke="#725cff" strokeWidth={2.5} fill="url(#chartFill)" activeDot={{r:5,stroke:'#fff',strokeWidth:2}}/></AreaChart></ResponsiveContainer>;
}
