# Siyuan Plugin Template - Vite & Vue3

[简体中文](./README_zh_CN.md)

> Consistent with [siyuan/plugin-sample](https://github.com/siyuan-note/plugin-sample).

1. Use Vite for packaging
2. Use Vue3 for development
3. Provides a github action template to automatically generate package.zip and upload to new release
4. Provides a script to auto create tag and release. [link](#release-script)

> [!NOTE]
>
> Before your start, you need install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation) first.

## Get started

1. Use the `Use the template` button to make a copy of this repo as template.  
> [!WARNING]
>
> That the repository name should match the plugin name, and the default branch must be `main`.


2. Use `git clone` to clone the copied repo to your computer.
3. Use `pnpm i` to install the dependencies.

4. Copy the `.env.example` file as `.env`, set the `VITE_SIYUAN_WORKSPACE_PATH` to your SiYuan workspace.


> [!TIP]
>
> If you don't like build the project into your workspace, you can use `Symbolic Link` to link the folder.
>
> Set `VITE_DEV_DIST_DIR` to any folder, and use `Symbolic Link` to link `siyuan_workspace/data/plugins/your_plugin_name` to `VITE_DEV_DIST_DIR`.


5. Use `pnpm dev` to run the project.
   If successed, you will find the plugin in `Siyuan - Settings - Marketplace`, named as `plugin-sample-vite-vue`.
6. Enable the plugin, and check the `App.vue` file to start your development.
   
   This file contains some example codes.


> [!TIP]
>
> More plugin code examples, please check [siyuan/plugin-sample/src/index.ts](https://github.com/siyuan-note/plugin-sample/blob/main/src/index.ts)



## List on the Marketplace

### Use Github Action

1. You can create a new tag, use your new version number as the `Tag version` in your local.
2. Then push the tag to Github. The Github Action will create a new Release for you.

> [!TIP]
>
> <div id="release-script"></div>This template provided a script to auto create tag and release. You can use `pnpm release` to create a patch version.
>
> You can add `--mode=manual|patch|minor|major` arg to set release mode, or run with arg like `pnpm release:manual`. 
> 
> All the scripts please see the `package.json` file.

The github action is included in this sample, you can use it to publish your new realse to marketplace automatically:

1. In your repo setting page `https://github.com/OWNER/REPO/settings/actions`, down to Workflow Permissions and open the configuration like this:

![img](./asset/action.png)

2. Push a tag in the format `v*` and github will automatically create a new release with new bulit package.zip
3. By default, it will only publish a pre-release, if you don't think this is necessary, change the settings in release.yml

```yaml
- name: Release
    uses: ncipollo/release-action@v1
    with.
        allowUpdates: true
        artifactErrorsFailBuild: true
        artifacts: 'package.zip'
        token: ${{ secrets.GITHUB_TOKEN }}
        prerelease: true # change this to false
```

### Manual

1. Use `pnpm build` to generate `package.zip`
2. Create a new Github release using your new version number as the "Tag version". See here for an example: https://github.com/siyuan-note/plugin-sample/releases
3. Upload the file package.zip as binary attachments
4. Publish the release

> [!NOTE]
> If it is the first release, please create a pull request to the [Community Bazaar](https://github.com/siyuan-note/bazaar) repository and modify the plugins.json file in it. This file is the index of all community plugin repositories, the format is:

```json
{
  "repos": [
    "username/reponame"
  ]
}
```

---

More other plugin info, please check in [siyuan/plugin-sample](https://github.com/siyuan-note/plugin-sample).

# TaskMap Plugin for Siyuan

一个基于 Vue 3 和 Element Plus 的思源笔记任务管理插件。

## 功能特性

- 📋 **项目管理**: 创建、编辑和管理项目
- ✅ **任务管理**: 任务创建、状态跟踪和优先级管理
- ⏱️ **任务计时**: 时间跟踪和统计
- 📊 **数据统计**: 项目进度和完成情况分析
- 🎨 **主题同步**: 自动跟随思源笔记主题切换

## 主题同步功能

TaskMap 插件支持自动跟随思源笔记的主题设置：

### 自动主题检测
- 插件启动时自动检测思源笔记的当前主题
- 支持思源的三种主题模式：明亮、暗黑、跟随系统
- 实时监听思源主题变化并自动同步

### 检测方式
插件使用多种方式检测思源主题：
1. **API 方式**: 通过思源 API 获取外观设置
2. **配置方式**: 从 `window.siyuan.config` 读取主题配置
3. **属性方式**: 检查 HTML 的 `data-theme` 属性
4. **事件监听**: 监听思源主题变化事件

### Element Plus 集成
- 自动应用 Element Plus 的暗黑模式 CSS 变量
- 所有 UI 组件自动适配主题变化
- 平滑的主题切换动画

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 技术栈

- Vue 3 (Composition API)
- Element Plus
- TypeScript
- IndexedDB (数据存储)
- VueUse (工具库)

## 许可证

MIT License