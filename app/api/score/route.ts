import { NextResponse } from "next/server";

type Answer = { id: string; type: "yn"|"yn_good"|"likert"; value: string|number };
type Body = { answers: Answer[]; notes?: Record<string,string> };

const CAT = {
  work: ["w1","w2","w3","w4"],
  defense: ["d1","d2","d3"],
  mind: ["m1","m2","m3"],
  cognition: ["c1","c2","c3"],
} as const;

function normScore(vals: number[], cat: keyof typeof CAT) {
  if (cat === "work")    return +((vals.reduce((a,b)=>a+b,0)/4) * 10).toFixed(1);
  if (cat === "defense") return +((vals.reduce((a,b)=>a+b,0)/3) * 10).toFixed(1);
  const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0; // 1-5
  return +(((avg-1)/4)*10).toFixed(1);
}
function toNum(a: Answer) {
  if (a.type==="yn")      return a.value==="yes" ? 1 : 0;
  if (a.type==="yn_good") return a.value==="yes" ? 0 : 1;
  if (a.type==="likert")  return Number(a.value||0);
  return 0;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const byId: Record<string,Answer> = {};
  for (const a of (body.answers||[])) byId[a.id]=a;

  const scores: Record<string,number> = {
    "労働環境":   normScore(CAT.work.map(id=> toNum(byId[id] || {id, type:"yn", value:"no"} as any)), "work"),
    "防衛行動":   normScore(CAT.defense.map(id=> toNum(byId[id] || {id, type:"yn_good", value:"no"} as any)), "defense"),
    "心理疲弊":   normScore(CAT.mind.map(id=> toNum(byId[id] || {id, type:"likert", value:1} as any)), "mind"),
    "認知ゆがみ": normScore(CAT.cognition.map(id=> toNum(byId[id] || {id, type:"likert", value:1} as any)), "cognition"),
  };
  const total = +((scores["労働環境"] + scores["防衛行動"] + scores["心理疲弊"] + scores["認知ゆがみ"]) / 4).toFixed(1);
  const level = total>=6 ? "ブラック濃厚" : total>=3 ? "グレー" : "ホワイト寄り";
  return NextResponse.json({ scores, total, level });
}

