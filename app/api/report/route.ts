import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const scores = body?.scores || { "労働環境":0,"防衛行動":0,"心理疲弊":0,"認知ゆがみ":0 };
  const total  = body?.total ?? 0;
  const level  = body?.level ?? "ホワイト寄り";

  const markdown = `# ブラック職場・心理セルフ診断レポート
**総合**: ${total}/10（${level}）

## カテゴリ別
- 労働環境: ${scores["労働環境"]}/10
- 防衛行動: ${scores["防衛行動"]}/10
- 心理疲弊: ${scores["心理疲弊"]}/10
- 認知ゆがみ: ${scores["認知ゆがみ"]}/10

## 今すぐの防衛策（例）
- 日々の勤務実績・指示を記録
- 相談先を2つ確保（社内/社外）
- 睡眠優先の生活へ

*（APIキー未設定のためテンプレ生成）*`;

  // まずはフォールバックのみ（OpenAIキー連携は後で拡張）
  return NextResponse.json({ markdown });
}

