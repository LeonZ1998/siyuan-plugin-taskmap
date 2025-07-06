import {
  Plugin,
  getFrontend,
} from "siyuan";
import "@/index.scss";
// 导入 Element Plus 暗黑模式 CSS
import 'element-plus/theme-chalk/dark/css-vars.css'
// 导入自定义暗黑模式样式
import '@/styles/dark.css'
import PluginInfoString from '@/../plugin.json'
import { ICONS_SVG, ICON_IDS } from './icons'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import TaskMapSidebar from './components/TaskMapSidebar.vue'
import { useTheme } from './composables/useTheme'

let PluginInfo = {
  version: '',
}
try {
  PluginInfo = PluginInfoString
} catch (err) {
  console.log('Plugin info parse error: ', err)
}
const {
  version,
} = PluginInfo

export default class TaskMapPlugin extends Plugin {
  // Run as mobile
  public isMobile: boolean
  // Run in browser
  public isBrowser: boolean
  // Run as local
  public isLocal: boolean
  // Run in Electron
  public isElectron: boolean
  // Run in window
  public isInWindow: boolean
  public platform: SyFrontendTypes
  public readonly version = version

  async onload() {
    const frontEnd = getFrontend();
    this.platform = frontEnd as SyFrontendTypes
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile"
    this.isBrowser = frontEnd.includes('browser')
    this.isLocal =
      location.href.includes('127.0.0.1')
      || location.href.includes('localhost')
    this.isInWindow = location.href.includes('window.html')

    try {
      require("@electron/remote")
        .require("@electron/remote/main")
      this.isElectron = true
    } catch (err) {
      this.isElectron = false
    }

    console.log('TaskMap Plugin loaded')

    // 注册自定义图标
    this.addIcons(ICONS_SVG);

    // 添加顶栏按钮
    this.addTopBar({
      icon: ICON_IDS.TASKMAP,
      title: 'TaskMap',
      callback: () => {
        this.showMenu();
      },
    })
  }

  onLayoutReady() {
    // 初始化主题检测
    const { initTheme } = useTheme()
    initTheme()
    
    // 添加侧边栏
    this.addDock({
      config: {
        position: "LeftTop",
        size: { width: 300, height: 0 },
        icon: ICON_IDS.TASKMAP_DOCK,
        title: "TaskMap",
        hotkey: ""
      },
      data: {
        text: "TaskMap 侧边栏"
      },
      resize() {
        // 侧边栏大小调整时的处理
        console.log('TaskMap 侧边栏大小已调整');
      },
      update() {
        // 侧边栏更新时的处理
        console.log('TaskMap 侧边栏已更新');
      },
      type: "taskmap_dock",
      init: (dock) => {
        // 侧边栏初始化时的处理
        console.log('TaskMap 侧边栏已初始化');
        
        // 创建Vue应用并挂载到侧边栏
        const app = createApp(TaskMapSidebar)
        app.use(ElementPlus)
        app.mount(dock.element)
        
        // 保存app实例以便后续清理
        ;(dock as any).app = app
      }
    });
  }

  onunload() {
    console.log('TaskMap Plugin unloaded')
    
    // 清理所有Vue应用实例
    const docks = document.querySelectorAll('[data-type="taskmap_dock"]')
    docks.forEach((dockElement) => {
      const dock = (dockElement as any).__vue_app__
      if (dock && dock.unmount) {
        dock.unmount()
      }
    })
  }

  // 显示菜单
  showMenu() {
    const { Menu } = require('siyuan');
    const menu = new Menu();
    
    // 项目管理
    menu.addItem({
      icon: ICON_IDS.PROJECT,
      label: '项目管理',
      click: () => {
        console.log('项目管理被点击');
        this.openProjectManagement();
      }
    });
    
    // 任务管理
    menu.addItem({
      icon: ICON_IDS.TASK,
      label: '任务管理',
      click: () => {
        console.log('任务管理被点击');
        this.openTaskManagement();
      }
    });
    
    // 任务计时
    menu.addItem({
      icon: ICON_IDS.TIMER,
      label: '任务计时',
      click: () => {
        console.log('任务计时被点击');
        this.openTaskTimer();
      }
    });
    
    // 数据统计
    menu.addItem({
      icon: ICON_IDS.STATS,
      label: '数据统计',
      click: () => {
        console.log('数据统计被点击');
        this.openDataStatistics();
      }
    });
    
    // 分隔线
    menu.addSeparator();
    
    // 插件设置
    menu.addItem({
      icon: ICON_IDS.SETTINGS,
      label: '插件设置',
      click: () => {
        console.log('插件设置被点击');
        this.openPluginSettings();
      }
    });
    
    // 打开菜单
    menu.open({
      x: globalThis.siyuan?.coordinates?.pageX ?? 0,
      y: globalThis.siyuan?.coordinates?.pageY ?? 0,
      isLeft: true,
    });
  }

  // 项目管理
  openProjectManagement() {
    console.log('打开项目管理功能');
    // TODO: 实现项目管理功能
  }

  // 任务管理
  openTaskManagement() {
    console.log('打开任务管理功能');
    // TODO: 实现任务管理功能
  }

  // 任务计时
  openTaskTimer() {
    console.log('打开任务计时功能');
    // TODO: 实现任务计时功能
  }

  // 数据统计
  openDataStatistics() {
    console.log('打开数据统计功能');
    // TODO: 实现数据统计功能
  }

  // 插件设置
  openPluginSettings() {
    console.log('打开插件设置功能');
    // TODO: 实现插件设置功能
  }
}
