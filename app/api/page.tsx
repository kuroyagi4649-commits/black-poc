"use client";
import { useState, useEffect } from "react";

type Q = { id:string; cat:"work"|"defense"|"mind"|"cognition"; q:string; type:"yn"|"yn_good"|"likert" };

const QUESTIONS: Q[] = [
  {id:"w1",cat:"work",q:"定時退社がほとんどできない？",type:"yn"},
  {id:"w2",cat:"work",q:"サービス残業がある？",type:"yn"},
  {id:"w3",cat:"work",q:"ハラスメントが放置されている？",type:"yn"},
  {id:"w4",cat:"work",q:"休日出勤が常態化？",type:"yn"},
  {id:"d1",cat:"defense",q:"労働時間や指示を日々記録している？",type:"yn_good"},
  {id:"d2",cat:"defense",q:"相談できる人/窓口がある？",type:"yn_good"},
  {id:"d3",cat:"defense",q:"転職/異動など逃げ道の準備を進めている？",type:"yn_good"},
  {id:"m1",cat:"mind",q:"最近2週間、睡眠に問題が多い？（1-5）",type:"likert"},
  {id:"m2",cat:"mind",q:"仕事を考えると強い不安が出る？（1-5）",type:"likert"},
  {id:"m3",cat:"mind",q:"無力感が続く？（1-5）",type:"likert"},
  {id:"c1",cat:"cognition",q:"まず“自分が悪い”と考えがち？（1-5）",type:"likert"},
  {id:"c2",cat:"cognition",q:"完璧主義で自分を追い込みがち？（1-5）",type:"likert"},
  {id:"c3",cat:"cognition",q:"助けを求めるのは弱さだと感じる？（1-5）",type:"likert"},
];

export default function Page(){
  const [i,setI]=useState(0);
  const [ans,setAns]=useState<Record<string,any>>({});
  const [scores,setScores]=useState<any>(null);
  const [md,setMd]=useState<string>("");

  useEffect(()=>{ const s=localStorage.getItem("answers"); if(s) setAns(JSON.parse(s)); },[]);
  useEffect(()=>{ localStorage.setItem("answers", JSON.stringify(ans)); },[ans]);

  const q = QUESTIONS[i];

  async function recompute(){
    const body = { answers: Object.entries(ans).map(([id,v])=>{
      const meta = QUESTIONS.find(x=>x.id===id)!;
      return { id, type: meta.type, value: v };
    })};
    const res = await fetch("/api/score",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json();
    setScores(data);
    return data;
  }

  async function genReport(){
    const sc = scores || await recompute();
    const res = await fetch("/api/report",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(sc)});
    const data = await res.json();
    setMd(data.markdown);
  }

  return (
    <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">🛡️ ブラック職場 × 心理セルフ診断（PoC）</h1>
        {i < QUESTIONS.length ? (
          <div className="p-4 border rounded-xl">
            <p className="mb-3 font-medium">{i+1}. {q.q}</p>
            {q.type==="yn" || q.type==="yn_good" ? (
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded bg-black text-white" onClick={()=>{ setAns({...ans,[q.id]:"yes"}); setI(i+1); }}>はい</button>
                <button className="px-4 py-2 rounded border" onClick={()=>{ setAns({...ans,[q.id]:"no"}); setI(i+1); }}>いいえ</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={5} value={ans[q.id] ?? 3}
                       onChange={(e)=> setAns({...ans,[q.id]: Number(e.target.value)})}/>
                <button className="px-4 py-2 rounded bg-black text-white" onClick={()=> setI(i+1)}>回答する</button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button className="px-4 py-2 rounded bg-black text-white" onClick={recompute}>スコア計算</button>
            <button className="px-4 py-2 rounded border" onClick={genReport}>📝 レポート生成</button>
            {md && <pre className="whitespace-pre-wrap p-4 border rounded-xl">{md}</pre>}
            <button className="px-4 py-2 rounded" onClick={()=>{ setI(0); setAns({}); setScores(null); setMd(""); }}>最初からやり直す</button>
          </div>
        )}
      </section>

      <aside className="p-4 border rounded-xl">
        <h2 className="font-semibold mb-2">現在のスコア</h2>
        <pre className="text-sm whitespace-pre-wrap">{scores ? JSON.stringify(scores,null,2) : "未計算"}</pre>
      </aside>
    </main>
  );
}

