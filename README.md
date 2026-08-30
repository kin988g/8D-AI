# 8D Agent

浏览器里的 8D 助手：小白走问答向导，熟手走整页工作台。一份结构化案件，规则门禁优先于模型。重复劳动（抽取、改写、预审、换皮导出）交给工具；现场事实、根因验证和对策拍板留给人。

## 第一期能做什么

- 粘贴客诉建案，向导补 D0–D3 缺口，生成现场采集卡
- 工作台整页编辑 D0–D8，实时红黄灯
- 禁区：人因根因、漏流出、培训/加检当唯一对策、遏制「将于」无完成日
- 中间版 / 终版 Word（中间版带待验证水印；终版被门禁拦住则不能下）
- 可选：OpenAI 兼容 API 做抽取 / 改写 / 解释红灯（数字必须能在原文找到，否则丢弃）
- **不配 Key 也能用**表单、门禁、采集卡、导出

不做：门户直连、自动改 FMEA、一键生成完整假 8D。

## 启动

```bash
npm install
cp .env.example .env.local   # 可选
npm test
npm run dev
```

打开 http://localhost:3000

设置页可填写 `API Key` / `Base URL` / 模型名，写入本机 `data/llm-settings.json`（已 gitignore）。也可只用环境变量 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`。

## 研究文档

- [8D 方法论与可行性](docs/research/2026-08-30-8d-agent-feasibility.md)
- [产品方向](docs/research/2026-08-30-8d-agent-product-direction.md)
- [痛点与二八收口](docs/research/2026-08-30-8d-practitioner-pain-points.md)

**底线：** 不替人编造未验证的根因和数字。方便来自少点废话，不是来自少点纪律。
