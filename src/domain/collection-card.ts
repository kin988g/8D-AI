import type { EightDCase } from "./case-schema";
import { LOCATION_LABELS } from "./case-schema";
import { collectGaps, type Finding } from "./review";

export type CollectionItem = {
  ask: string;
  shoot: string;
  count: string;
};

export function buildCollectionCard(c: EightDCase): CollectionItem[] {
  const items: CollectionItem[] = [];
  const gaps = collectGaps(c);
  const byHint = new Set(gaps.map((g) => g.fieldHint));

  if (byHint.has("客户名称")) {
    items.push({
      ask: "客诉邮件/门户里的客户全称和投诉单号是什么？",
      shoot: "截一张客诉原文（隐去无关个人信息即可）",
      count: "无",
    });
  }
  if (byHint.has("零件号或零件名")) {
    items.push({
      ask: "不良件的料号、零件名、图纸版本？",
      shoot: "铭牌/标签/图纸标题栏",
      count: "无",
    });
  }
  if (byHint.has("缺陷现象")) {
    items.push({
      ask: "用可测量的话描述缺陷（尺寸、位置、失效模式），不要写「质量不好」。",
      shoot: "不良照片，带参照物或量具读数",
      count: "无",
    });
  }
  if (byHint.has("发现位置")) {
    items.push({
      ask: "在客户哪条线、哪个工位发现？我司哪道工序做过同类件？",
      shoot: "工位铭牌或产线看板",
      count: "无",
    });
  }
  if (byHint.has("发现时间")) {
    items.push({
      ask: "首次发现日期、班次、对应生产日期？",
      shoot: "追溯标签或生产日报",
      count: "无",
    });
  }
  if (byHint.has("不良数量/比例")) {
    items.push({
      ask: "抽了多少、不良多少、涉及哪些批次？不知道就写「待查」，不要估。",
      shoot: "检验记录或分选表",
      count: "抽检数、不良数、批次号",
    });
  }

  const missingLocations = (
    ["customer", "in_transit", "finished_goods", "line_side"] as const
  ).filter((loc) => !c.containment.some((x) => x.location === loc));
  if (missingLocations.length > 0) {
    items.push({
      ask: `以下库存位置查过没有：${missingLocations.map((l) => LOCATION_LABELS[l]).join("、")}？`,
      shoot: "隔离区或标签照片",
      count: "各位置可疑数量、已隔离数量",
    });
  }

  if (!c.occurrenceRca.statement.trim()) {
    items.push({
      ask: "到产生工位问：和「没有不良」的件比，材料、工装、参数、班次有什么不同？",
      shoot: "工装、参数画面、首件记录",
      count: "相关参数实测值",
    });
  }
  if (!c.escapeRca.statement.trim()) {
    items.push({
      ask: "到检测工位问：现有检验能看见这个缺陷吗？标准、抽样、量具是否覆盖？",
      shoot: "检验指导书和量具",
      count: "抽样频率、漏检窗口",
    });
  }

  if (items.length === 0) {
    items.push({
      ask: "事实已较全。今晚只确认遏制是否还罩得住，以及根因验证实验怎么做。",
      shoot: "遏制现场与验证数据",
      count: "分选结果、复现实验数据",
    });
  }

  return items;
}

export function gapsForCard(c: EightDCase): Finding[] {
  return collectGaps(c);
}
