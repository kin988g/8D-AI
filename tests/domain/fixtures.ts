import {
  createEmptyCase,
  type EightDCase,
  userField,
} from "@/domain/case-schema";

export function baseCase(): EightDCase {
  const c = createEmptyCase("case-test", "2026-08-30T00:00:00.000Z");
  c.customer = userField("客户A");
  c.partNumber = userField("P-100");
  c.partName = userField("左外侧支架");
  c.defect = userField("焊缘内弯");
  c.problem.what = userField("左外侧支架焊缘内弯 1.5–2.0°");
  c.problem.where = userField("客户A 3线4工位来料检");
  c.problem.when = userField("2026-04-01 14:00");
  c.problem.howMany = userField("18/240（7.5%）");
  return c;
}

export function humanCauseCase(): EightDCase {
  const c = baseCase();
  c.containment = [
    {
      id: "c1",
      location: "customer",
      action: "客户处 100% 分选",
      plannedOnly: false,
      completedOn: "2026-04-01",
      quantity: "240",
      verification: "分出18件",
    },
  ];
  c.occurrenceRca.statement = "操作工未按SOP作业，质量意识不足";
  c.escapeRca.statement = "检验员漏检";
  c.pca = [
    {
      id: "p1",
      target: "occurrence",
      action: "加强员工质量意识培训",
      strength: "training",
      owner: "QE",
      dueOn: "2026-04-10",
    },
  ];
  return c;
}

export function noEscapeCase(): EightDCase {
  const c = baseCase();
  c.containment = [
    {
      id: "c1",
      location: "finished_goods",
      action: "成品仓隔离并全检",
      plannedOnly: false,
      completedOn: "2026-04-01",
      quantity: "120",
      verification: "0件",
    },
  ];
  c.occurrenceRca.statement = "上模弹簧超过寿命未更换";
  c.occurrenceRca.verified = true;
  c.escapeRca.statement = "";
  return c;
}

export function plannedContainmentCase(): EightDCase {
  const c = baseCase();
  c.containment = [
    {
      id: "c1",
      location: "customer",
      action: "将于4月3日前完成客户处分选",
      plannedOnly: true,
      completedOn: "",
      quantity: "",
      verification: "",
    },
  ];
  return c;
}

export function missingHowManyCase(): EightDCase {
  const c = baseCase();
  c.problem.howMany = { value: "", source: "unknown" };
  return c;
}

export function closableCase(): EightDCase {
  const c = baseCase();
  c.containment = [
    {
      id: "c1",
      location: "customer",
      action: "第三方分选",
      plannedOnly: false,
      completedOn: "2026-04-02",
      quantity: "240",
      verification: "拦截18件",
    },
  ];
  c.occurrenceRca = {
    statement: "模具弹簧寿命未纳入预防维护标准",
    whys: [
      { question: "为什么弯曲？", answer: "合模力偏高" },
      { question: "为什么合模力偏高？", answer: "弹簧疲劳" },
      { question: "为什么弹簧疲劳未更换？", answer: "PM计划不含易损件" },
    ],
    verified: true,
    evidence: "拆模后弹簧自由高低出规格；换簧后角度恢复",
  };
  c.escapeRca = {
    statement: "终检检具只测高度不测弯角，对该失效模式盲视",
    whys: [{ question: "为什么流出？", answer: "检具测不到弯角" }],
    verified: true,
    evidence: "量具R&R与漏检复盘",
  };
  c.pca = [
    {
      id: "p1",
      target: "occurrence",
      action: "弹簧按80万次纳入PM",
      strength: "system",
      owner: "设备",
      dueOn: "2026-04-08",
    },
    {
      id: "p2",
      target: "escape",
      action: "终检增加弯角检测并完成量具R&R",
      strength: "poka_yoke",
      owner: "质量",
      dueOn: "2026-04-08",
    },
  ];
  c.validation = {
    metric: "弯角不良件数",
    before: "18/240",
    after: "0/3600",
    period: "30天",
  };
  c.prevention = [
    { id: "v1", artifact: "PFMEA 修订 REV C", done: true },
  ];
  return c;
}
