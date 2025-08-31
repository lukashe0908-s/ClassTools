# Class Tools

Class Tools 是一款基于 Electron 与 Next‑React 的班级课表管理工具，帮助快速查看、编辑与分享班级课表。

> [!WARNING]
> 本项目目前开发与功能不稳定，如需要稳定使用，推荐使用 [ClassIsland](https://github.com/ClassIsland/ClassIsland)

---

## 界面预览

<img src="assets/image main.png" alt="Main" style="max-height:300px" />
<img src="assets/image settings display.png" alt="Display Settings" style="max-height:300px"  />

---

## 功能概览

| 功能           | 说明                                  |
| -------------- | ------------------------------------- |
| **课程表管理** | 查看、添加、修改、删除课程            |
| **设置**       | 显示设置、调试实验室                  |
| **在线模式**   | 在有网络时无需更新使用最新的 Web 版本 |
| **更新**       | 自动检查 Github 上的软件更新          |

---

## 常见问题

- **设置自启动**  
  进入 `设置 > Labs > 开机自启动` ，点击`开启 自启动`按钮
- **更新失败**  
  检查您是否可以访问 Github 的下载服务器。

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/lukashe0908-s/ClassTools.git
cd ClassTools
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

> 运行后会在 `http://localhost:3000` 打开预览窗口。

### 4. 打包发布

```bash
npm run build
```

> 打包后可在 `build/dist` 目录下找到生成的安装包。
