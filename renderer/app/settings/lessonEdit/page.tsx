export default function App() {
  return (
    <>
      <div className="ml-4 mb-4">
        <span className="text-2xl font-bold [box-shadow:inset_0_-8px_#f73246] border-b-2 border-[#f73246]">
          总览
        </span>
      </div>

      {/* 公告 */}
      <div className="mx-4 mb-4 rounded-xl border border-red-300 bg-red-50 p-4">
        <div className="mb-2 text-base font-semibold text-red-700">
          停止维护公告
        </div>

        <div className="text-sm text-red-600">
          本软件已停止维护。
          <br />
          2026/06/05
        </div>

        <div className="mt-3 border-t border-red-200 pt-3 text-sm text-red-600">
          <div className="font-medium">最后更新</div>
          <div>2026/04/16</div>
          <div>修复无网络状态下天气组件更新时报错的问题。</div>
        </div>
      </div>

      {/* 帮助 */}
      <div className="mx-4 mb-4 rounded-xl border border-zinc-200 p-4">
        <div className="mb-3 text-base font-semibold">
          课程设置帮助
        </div>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            前往 <code>课程管理 → 时间</code> 设置学期开始日期。
          </li>

          <li>
            在 <code>课程管理 → 时间</code> 中填写课程时间。
          </li>

          <li>
            在 <code>课程管理 → 名称</code> 中填写课程名称。
          </li>
        </ol>

        <div className="mt-4 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700">
          <div className="mb-2 font-medium">单双周规则</div>

          <ul className="list-disc space-y-1 pl-5">
            <li>仅填写 1 行时，同时适用于单周与双周。</li>
            <li>填写 2 行及以上时，第一行为单周，第二行为双周。</li>
            <li>
              使用 <code>\n</code> 可在课程名称中换行。
            </li>
          </ul>
        </div>

        <div className="mt-3 text-sm text-zinc-600">
          课程名称与课程时间均填写后才会显示课程。
          <br />
          仅填写时间而未填写课程名称时不会显示。
        </div>
      </div>

      {/* 说明 */}
      <div className="mx-4 mb-4 rounded-xl border border-zinc-200 p-4">
        <div className="mb-3 text-base font-semibold">
          功能说明
        </div>

        <div className="space-y-4 text-sm text-zinc-700">
          <div>
            <div className="font-medium">分割线</div>
            <div>用于分隔不同时间段的课程组。</div>
          </div>

          <div>
            <div className="font-medium">全部列</div>
            <div>
              可一次性设置整周的课程时间或课程名称。
              <br />
              若具体星期已设置内容，则优先使用具体星期的配置覆盖全部列内容。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
