# sunday0612 的个人主页

这个仓库是个人主页和博客的源码，发布在 [https://sunday0612.github.io](https://sunday0612.github.io)。

站点用 Jekyll 写成，由 GitHub Pages 自动构建。你不需要在自己的电脑上安装任何工具，也不用在本地运行命令。改完文件，提交并推送到 `main` 分支，大约一分钟后页面就会更新。

也可以全程在 GitHub 网页上改：打开文件，点右上角的铅笔，改完后提交到 `main`。

## 修改简介、作品和联系方式

| 想改的内容 | 打开这个文件 |
| --- | --- |
| 自我介绍（名字、一句话、简介） | `_data/profile.yml` |
| 项目作品 | `_data/projects.yml` |
| 联系方式 | `_data/contact.yml` |
| 浏览器标签上的名字和简短介绍 | `_config.yml` 里的 `title`、`description` |

带有「占位」的文字都是示例，请换成你自己的。GitHub 链接已经指向 [sunday0612](https://github.com/sunday0612)。

`profile.yml` 里的简介可以用 Markdown：段落之间空一行，链接写成 `[文字](https://example.com)`。

新增一个项目：在 `projects.yml` 里复制一整段（从 `- name` 到 `tags` 结束），改掉名字、说明和链接。换成真实项目后，把 `placeholder: true` 改成 `false`，页面上的「占位」标记就会消失。

## 写一篇新文章

1. 在 `_posts` 目录新建文件。文件名必须是：

   `年-月-日-英文短标题.md`

   例如 `2026-11-02-evening-walk.md`。日期和短标题都用半角字符，不要用中文或空格。短标题会出现在网址里。

2. 文件开头写成这样，下面再写正文：

   ```yaml
   ---
   title: "文章标题"
   date: 2026-11-02 21:00:00 +0800
   categories: [随笔]
   excerpt: "一两句摘要，会出现在首页和文章列表。"
   ---
   ```

   正文用 Markdown。`#` 是标题，段落之间空一行，引用用 `>`。

3. 提交并推送到 `main`。

文章地址会是 `/blog/2026/11/02/evening-walk/`。日期不要写成未来，否则文章会暂时不显示。

两篇示例文章是：

- `_posts/2026-10-12-welcome.md`
- `_posts/2026-10-26-slow-sentences.md`

不需要的话，直接删掉对应文件即可。

## 如果网站打不开

仓库的 Pages 应从 `main` 分支的根目录发布。若 [https://sunday0612.github.io](https://sunday0612.github.io) 打不开，到仓库 **Settings → Pages**：

- Source 选 **Deploy from a branch**
- Branch 选 **main**，文件夹选 **/ (root)**
- 保存后再等一分钟

标题字体使用 [jsDelivr](https://cdn.jsdelivr.net) 上的 Noto Serif SC（国内一般可以访问）。若字体文件加载失败，标题会退回系统里的宋体，页面仍然完整。

## 静夜山湖视觉主题

首页背景为专门生成的原创山湖夜景，沿用墨黑、雾蓝、暖金与衬线字体。背景使用本地 WebP，不依赖外部图片服务。

山湖图作为全站固定背景铺满视口，首页向下滚动、文章归档与正文页均可看到。四周通过多层渐变融入墨黑；阅读区域自动加深遮罩，让文字保持清楚。背景组件在 `_layouts/default.html`，渐变与遮罩在 `assets/css/nocturne.css` 的 `.site-background`、`.site-backdrop` 中。

- `assets/images/night-lake.webp`：桌面背景，1672 × 941。
- `assets/images/night-lake-mobile.webp`：移动设备背景，960 × 540，由浏览器按屏幕选择。
- `assets/css/nocturne.css`：在原样式上叠加的主题，含首屏、文章、作品及移动适配。
- `assets/js/site.js`：可选的导航高亮增强；关闭 JavaScript 仍可阅读与跳转。
- 首页诗句在 `index.html` 的 `hero-verse` 中，一句话介绍仍在 `_data/profile.yml` 的 `tagline` 中。

首屏图片提前加载，使用固定宽高避免布局跳动。动效尊重系统的「减少动态效果」设置；文章地址、订阅源与原有数据文件结构保持一致。
