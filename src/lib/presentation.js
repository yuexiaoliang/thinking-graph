// Display labels belong to the publishing layer; graph identifiers stay stable.
const categories = {
  "ai-future": ["AI 未来", "var(--future)"],
  talent: ["人才与能力", "var(--talent)"],
  employment: ["就业与职业", "var(--employment)"],
  "creator-economy": ["创作者经济", "var(--creator)"],
  data: ["数据与信息", "var(--data)"],
  meta: ["思考方法", "var(--meta)"]
};

export const categoryLabel = (category) => categories[category]?.[0] || category;
export const categoryColor = (category) => categories[category]?.[1] || "var(--accent)";
export const statusLabel = (status) => ({
  active: "持续探索", draft: "形成中", superseded: "已有新进展", archived: "已归档"
})[status] || status;
